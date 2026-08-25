// Global variables
let video = null;
let canvas = null;
let context = null;
let pose = null;
let hands = null;
let isRunning = false;
let isInitialized = false;
let isHandsInitialized = false;
let currentTargetPose = null;

// MediaPipe Pose connections
const POSE_CONNECTIONS = [
    [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
    [11, 23], [12, 24], [23, 24], [23, 25], [24, 26],
    [25, 27], [26, 28], [27, 29], [28, 30], [29, 31],
    [30, 32], [27, 31], [28, 32]
];

// Key angles to monitor
const KEY_ANGLES = {
    leftShoulder: [11, 13, 15],
    rightShoulder: [12, 14, 16],
    leftElbow: [13, 15, 17],
    rightElbow: [14, 16, 18],
    leftHip: [23, 25, 27],
    rightHip: [24, 26, 28],
    leftKnee: [25, 27, 29],
    rightKnee: [26, 28, 30]
};

// Initialize MediaPipe Pose and Webcam
async function initPoseDetection() {
    if (isInitialized) return;
    try {
        if (typeof Pose === 'undefined') throw new Error('MediaPipe Pose is not loaded.');
        video = document.getElementById('webcam');
        if (!video) throw new Error('Video element not found');
        canvas = document.getElementById('outputCanvas');
        if (!canvas) throw new Error('Canvas element not found');
        context = canvas.getContext('2d');
        if (!context) throw new Error('Could not get canvas context');
        
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user',
                frameRate: { ideal: 30 }
            },
            audio: false
        });
        
        video.srcObject = stream;
        await new Promise((resolve) => {
            video.onloadedmetadata = () => {
                const container = video.parentElement;
                const containerWidth = container.clientWidth;
                const containerHeight = container.clientHeight;
                const videoAspectRatio = video.videoWidth / video.videoHeight;
                
                // Calculate dimensions to maintain aspect ratio
                let canvasWidth, canvasHeight;
                if (containerWidth / containerHeight > videoAspectRatio) {
                    canvasHeight = containerHeight;
                    canvasWidth = containerHeight * videoAspectRatio;
                } else {
                    canvasWidth = containerWidth;
                    canvasHeight = containerWidth / videoAspectRatio;
                }
                
                // Set canvas dimensions
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;
                
                // Position canvas and video
                canvas.style.position = 'absolute';
                canvas.style.left = '50%';
                canvas.style.top = '50%';
                canvas.style.transform = 'translate(-50%, -50%)';
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style.objectFit = 'contain';
                
                video.style.position = 'absolute';
                video.style.left = '50%';
                video.style.top = '50%';
                video.style.transform = 'translate(-50%, -50%)';
                video.style.width = '100%';
                video.style.height = '100%';
                video.style.objectFit = 'contain';
                
                video.play();
                resolve();
            };
        });

        pose = new Pose({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1635988162/${file}`
        });
        
        pose.setOptions({
            modelComplexity: 2,
            smoothLandmarks: true,
            enableSegmentation: true,
            smoothSegmentation: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
            selfieMode: true
        });
        
        pose.onResults(onPoseResults);
        isInitialized = true;
        document.getElementById('pose-feedback').textContent = 'Camera initialized successfully. Click "Start Camera" to begin.';
    } catch (error) {
        document.getElementById('pose-feedback').textContent = 'Error: ' + error.message;
        throw error;
    }
}

// Process frames from the webcam
async function processFrames() {
    if (!isRunning) return;
    try {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            if (currentTargetPose && isMudra(currentTargetPose)) {
                if (!isHandsInitialized) {
                    await initHandDetection();
                }
                if (hands) {
                    await hands.send({ image: video });
                }
            } else {
                if (!isInitialized) {
                    await initPoseDetection();
                }
                if (pose) {
                    await pose.send({ image: video });
                }
            }
        }
    } catch (error) {
        console.error('Error processing frame:', error);
        document.getElementById('pose-feedback').textContent = 'Error processing frame. Please try again.';
    }
    requestAnimationFrame(processFrames);
}

// Handle pose detection results
function onPoseResults(results) {
    if (!isRunning || !context) return;

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw video frame
    context.save();
    // Mirror the video horizontally
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    
    if (results.poseLandmarks) {
        drawConnections(results.poseLandmarks);
        drawLandmarks(results.poseLandmarks);
    }
    context.restore();

    // Draw text/angles
    if (results.poseLandmarks) {
        const angles = calculateAngles(results.poseLandmarks);
        displayAngles(angles);
        updatePoseFeedback(results.poseLandmarks, angles);
        if (currentTargetPose) {
            analyzePose(results.poseLandmarks, angles, currentTargetPose);
        }
    } else {
        document.getElementById('pose-feedback').textContent = 'No pose detected. Please ensure you are fully visible in the camera.';
    }
}

function drawConnections(landmarks) {
    context.strokeStyle = '#00FF00';
    context.lineWidth = 2;
    POSE_CONNECTIONS.forEach(([from, to]) => {
        const fromPoint = landmarks[from];
        const toPoint = landmarks[to];
        if (fromPoint && toPoint && fromPoint.visibility > 0.5 && toPoint.visibility > 0.5) {
            context.beginPath();
            context.moveTo(
                fromPoint.x * canvas.width,
                fromPoint.y * canvas.height
            );
            context.lineTo(
                toPoint.x * canvas.width,
                toPoint.y * canvas.height
            );
            context.stroke();
        }
    });
}

function drawLandmarks(landmarks) {
    context.fillStyle = '#FF0000';
    landmarks.forEach((landmark, index) => {
        if (landmark.visibility > 0.5) {
            context.beginPath();
            context.arc(
                landmark.x * canvas.width,
                landmark.y * canvas.height,
                5,
                0,
                2 * Math.PI
            );
            context.fill();
        }
    });
}

function calculateAngles(landmarks) {
    const angles = {};
    for (const [angleName, points] of Object.entries(KEY_ANGLES)) {
        const [a, b, c] = points;
        if (landmarks[a] && landmarks[b] && landmarks[c]) {
            angles[angleName] = calculateAngle(landmarks[a], landmarks[b], landmarks[c]);
        }
    }
    return angles;
}

// Display angles on canvas
function displayAngles(angles) {
    if (!context || !canvas) return;
    
    const overlayWidth = 200;
    const overlayMargin = 10;
    const overlayLeft = Math.min(canvas.width - overlayWidth - overlayMargin, canvas.width - 210);
    const overlayTop = 40;
    
    context.fillStyle = 'rgba(0, 0, 0, 0.75)';
    context.fillRect(overlayLeft, overlayTop, overlayWidth, Object.keys(angles).length * 28 + 24);
    
    context.font = 'bold 16px Arial';
    context.textAlign = 'left';
    let yOffset = overlayTop + 22;
    
    for (const [angleName, angle] of Object.entries(angles)) {
        const formattedName = angleName.replace(/([A-Z])/g, ' $1').toLowerCase();
        const status = getAngleStatus(angleName, angle);
        const text = `${formattedName}: ${Math.round(angle)}°`;
        
        context.fillStyle = '#FFFFFF';
        context.shadowColor = '#000';
        context.shadowBlur = 5;
        context.fillText(text, overlayLeft + 18, yOffset);
        
        if (status === 'Correct') {
            context.fillStyle = '#00FF00';
            context.font = 'bold 16px Arial';
            context.shadowColor = '#000';
            context.shadowBlur = 5;
            context.fillText(`(${status})`, overlayLeft + 150, yOffset);
        } else {
            context.fillStyle = '#FF0000';
            context.font = 'bold 18px Arial';
            context.shadowColor = '#fff';
            context.shadowBlur = 7;
            context.fillText(`(${status})`, overlayLeft + 150, yOffset);
        }
        
        context.font = 'bold 16px Arial';
        yOffset += 28;
    }
    
    context.shadowBlur = 0;
}

function getAngleStatus(angleName, angle) {
    const targetAngles = {
        leftShoulder: { min: 80, max: 100 },
        rightShoulder: { min: 80, max: 100 },
        leftElbow: { min: 80, max: 100 },
        rightElbow: { min: 80, max: 100 },
        leftHip: { min: 80, max: 100 },
        rightHip: { min: 80, max: 100 },
        leftKnee: { min: 80, max: 100 },
        rightKnee: { min: 80, max: 100 }
    };
    if (angle >= targetAngles[angleName].min && angle <= targetAngles[angleName].max) {
        return 'Correct';
    } else {
        return 'Incorrect';
    }
}

function updatePoseFeedback(landmarks, angles) {
    if (!landmarks || landmarks.length === 0) {
        document.getElementById('pose-feedback').textContent = 'No pose detected. Please ensure you are fully visible in the camera.';
        document.getElementById('confidence-score').textContent = '0%';
        document.getElementById('detected-points').textContent = '0';
        return;
    }
    const confidence = calculateAverageConfidence(landmarks);
    const detectedPoints = landmarks.length;
    document.getElementById('confidence-score').textContent = `${Math.round(confidence * 100)}%`;
    document.getElementById('detected-points').textContent = detectedPoints;
    if (currentTargetPose) {
        const feedback = analyzePose(landmarks, angles, currentTargetPose);
        document.getElementById('pose-feedback').innerHTML = feedback;
    } else {
        document.getElementById('pose-feedback').textContent = 'Please select a pose to practice.';
    }
}

function calculateAverageConfidence(landmarks) {
    const confidences = landmarks.map(landmark => landmark.visibility);
    return confidences.reduce((a, b) => a + b, 0) / confidences.length;
}

function calculateAngle(a, b, c) {
    const ab = Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
    const bc = Math.sqrt(Math.pow(c.x - b.x, 2) + Math.pow(c.y - b.y, 2));
    const ac = Math.sqrt(Math.pow(c.x - a.x, 2) + Math.pow(c.y - a.y, 2));
    return Math.acos((ab * ab + bc * bc - ac * ac) / (2 * ab * bc)) * (180 / Math.PI);
}

async function startPoseEstimation() {
    try {
        if (!isInitialized) {
            await initPoseDetection();
        }
        isRunning = true;
        processFrames();
        document.getElementById('pose-feedback').textContent = 'AI Trainer is ready! Stand in front of the camera and follow the instructions.';
    } catch (error) {
        document.getElementById('pose-feedback').textContent = 'Error: ' + error.message;
    }
}

function stopPoseEstimation() {
    isRunning = false;
    isInitialized = false;
    isHandsInitialized = false;
    
    if (video && video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
    }
    
    if (context && canvas) {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    pose = null;
    hands = null;
    
    document.getElementById('pose-feedback').textContent = 'Detection stopped.';
}

// Add full screen button to the UI
function addFullScreenButton() {
    const fullScreenBtn = document.createElement('button');
    fullScreenBtn.className = 'full-screen-btn';
    fullScreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    fullScreenBtn.title = 'Press F for full screen';
    fullScreenBtn.onclick = toggleFullScreen;
    document.querySelector('.camera-container').appendChild(fullScreenBtn);
}

// Enhanced full screen functionality
function toggleFullScreen() {
    const cameraContainer = document.querySelector('.camera-container');
    if (!document.fullscreenElement) {
        if (cameraContainer.requestFullscreen) {
            cameraContainer.requestFullscreen();
        } else if (cameraContainer.webkitRequestFullscreen) {
            cameraContainer.webkitRequestFullscreen();
        } else if (cameraContainer.msRequestFullscreen) {
            cameraContainer.msRequestFullscreen();
        }
        document.querySelector('.full-screen-btn i').className = 'fas fa-compress';
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        document.querySelector('.full-screen-btn i').className = 'fas fa-expand';
    }
}

// Add keyboard shortcut for full screen
document.addEventListener('keydown', function(e) {
    if (e.key.toLowerCase() === 'f') {
        toggleFullScreen();
    }
    if (e.key === 'Escape' && document.fullscreenElement) {
        document.querySelector('.full-screen-btn i').className = 'fas fa-expand';
    }
});

// Update full screen button icon when full screen changes
document.addEventListener('fullscreenchange', function() {
    const icon = document.querySelector('.full-screen-btn i');
    if (document.fullscreenElement) {
        icon.className = 'fas fa-compress';
    } else {
        icon.className = 'fas fa-expand';
    }
});

// Call this function after camera initialization
addFullScreenButton();

async function fetchAIResponse(userMessage) {
    // Replace with your actual API endpoint and key
    const apiKey = 'YOUR_OPENAI_API_KEY';
    const endpoint = 'https://api.openai.com/v1/chat/completions';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    };
    const body = JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "You are a professional, friendly yoga and wellness assistant. Answer all questions clearly, accurately, and with encouragement." },
            { role: "user", content: userMessage }
        ],
        max_tokens: 300,
        temperature: 0.7
    });

    try {
        const response = await fetch(endpoint, { method: 'POST', headers, body });
        const data = await response.json();
        return data.choices?.[0]?.message?.content?.trim() || "I'm sorry, I couldn't find an answer. Could you please rephrase?";
    } catch (error) {
        return null; // fallback to knowledge base
    }
}

async function sendMessage() {
    const userInputElem = document.getElementById("user-input");
    const userInput = userInputElem.value.trim();
    if (!userInput) return;
    addMessage(userInput, true);

    // Try AI API first
    let response = await fetchAIResponse(userInput);
    if (!response) {
        // Fallback to smart response generator
        response = generateResponse(userInput);
    }
    addMessage(response, false);

    userInputElem.value = "";
}

// Add event listeners for send button and user input
const sendButton = document.getElementById("send-button");
const userInput = document.getElementById("user-input");
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});