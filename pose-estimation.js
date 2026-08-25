// Enhanced Pose Detection with MediaPipe
let video = null;
let canvas = null;
let context = null;
let pose = null;
let camera = null;
let isRunning = false;
let currentTargetPose = null;

// MediaPipe Pose connections (all 33 points)
const POSE_CONNECTIONS = [
    // Face (not typically used in yoga, but included for completeness)
    [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8], [9, 10],
    // Torso
    [11, 12], [11, 23], [12, 24], [23, 24],
    // Left arm
    [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
    // Right arm
    [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
    // Left leg
    [23, 25], [25, 27], [27, 29], [29, 31], [27, 31],
    // Right leg
    [24, 26], [26, 28], [28, 30], [30, 32], [28, 32]
];

// Key angles to monitor for yoga poses
const KEY_ANGLES = {
    leftShoulder: [11, 13, 15],    // Left shoulder angle
    rightShoulder: [12, 14, 16],   // Right shoulder angle
    leftElbow: [13, 15, 17],       // Left elbow angle
    rightElbow: [14, 16, 18],      // Right elbow angle
    leftHip: [23, 25, 27],         // Left hip angle
    rightHip: [24, 26, 28],        // Right hip angle
    leftKnee: [25, 27, 29],        // Left knee angle
    rightKnee: [26, 28, 30],       // Right knee angle
    spine: [11, 23, 25],           // Spine angle (left side)
    spineRight: [12, 24, 26]       // Spine angle (right side)
};

// Initialize pose detection
async function initPoseDetection() {
    if (isRunning) return;

    try {
        // Get video and canvas elements
        video = document.getElementById('webcam');
        canvas = document.getElementById('outputCanvas');
        context = canvas.getContext('2d');

        // Set canvas dimensions to match video
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720, facingMode: 'user' },
            audio: false
        });
        
        video.srcObject = stream;
        await new Promise((resolve) => {
            video.onloadedmetadata = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                resolve();
            };
        });

        // Initialize MediaPipe Pose with all 33 landmarks
        pose = new Pose({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1635988162/${file}`;
            }
        });

        pose.setOptions({
            modelComplexity: 2, // Use complex model for all 33 landmarks
            smoothLandmarks: true,
            enableSegmentation: false,
            smoothSegmentation: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        pose.onResults(onPoseResults);

        // Start processing frames
        isRunning = true;
        processFrame();
        
        document.getElementById('pose-feedback').textContent = 'Pose detection started. Stand in view of the camera.';
    } catch (error) {
        console.error('Error initializing pose detection:', error);
        document.getElementById('pose-feedback').textContent = 'Error: ' + error.message;
    }
}

// Process each frame
function processFrame() {
    if (!isRunning) return;
    
    pose.send({ image: video })
        .then(() => {
            requestAnimationFrame(processFrame);
        })
        .catch(error => {
            console.error('Error processing frame:', error);
        });
}

// Handle pose detection results with all 33 points
function onPoseResults(results) {
    if (!context || !canvas) return;

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw video frame
    context.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    // Draw all 33 landmarks if detected
    if (results.poseLandmarks) {
        drawLandmarks(results.poseLandmarks);
        drawConnections(results.poseLandmarks);
        provideFeedback(results.poseLandmarks);
    } else {
        document.getElementById('pose-feedback').textContent = 'No pose detected. Please ensure you are fully visible in the camera.';
    }
}

// Draw all 33 landmarks with numbers
function drawLandmarks(landmarks) {
    context.fillStyle = '#FF0000';
    landmarks.forEach((landmark, index) => {
        // Draw landmark point
        context.beginPath();
        context.arc(
            landmark.x * canvas.width, 
            landmark.y * canvas.height, 
            4, 0, 2 * Math.PI
        );
        context.fill();
        
        // Draw landmark number (0-32)
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 10px Arial';
        context.fillText(
            index.toString(), 
            landmark.x * canvas.width + 6, 
            landmark.y * canvas.height - 6
        );
        context.fillStyle = '#FF0000';
    });
}

// Draw connections between landmarks
function drawConnections(landmarks) {
    context.strokeStyle = '#00FF00';
    context.lineWidth = 2;
    
    POSE_CONNECTIONS.forEach(([from, to]) => {
        const fromPoint = landmarks[from];
        const toPoint = landmarks[to];
        
        if (fromPoint && toPoint) {
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

// Provide detailed feedback based on pose
function provideFeedback(landmarks) {
    const feedbackElement = document.getElementById('pose-feedback');
    if (!feedbackElement || !currentTargetPose) return;

    // Calculate all key angles
    const angles = {};
    for (const [angleName, points] of Object.entries(KEY_ANGLES)) {
        const [a, b, c] = points;
        if (landmarks[a] && landmarks[b] && landmarks[c]) {
            angles[angleName] = calculateAngle(landmarks[a], landmarks[b], landmarks[c]);
        }
    }

    // Generate pose-specific feedback
    let feedback = '';
    const poseInfo = POSE_INSTRUCTIONS[currentTargetPose];
    
    if (poseInfo) {
        feedback += `<h3>${poseInfo.name} Feedback</h3>`;
        feedback += `<p><strong>Target:</strong> ${poseInfo.duration}</p>`;
        
        // Check each key angle for correctness
        feedback += '<h4>Alignment Check:</h4><ul>';
        for (const [angleName, angle] of Object.entries(angles)) {
            const status = checkAngle(angleName, angle, currentTargetPose);
            const formattedName = angleName.replace(/([A-Z])/g, ' $1').toLowerCase();
            
            feedback += `<li>${formattedName}: ${Math.round(angle)}° - ${status.message}</li>`;
            
            if (!status.correct) {
                feedback += `<span style="color:red">${status.correction}</span>`;
            }
        }
        feedback += '</ul>';
        
        // Add pose-specific tips
        feedback += '<h4>Tips:</h4><ol>';
        poseInfo.instructions.forEach(instruction => {
            feedback += `<li>${instruction}</li>`;
        });
        feedback += '</ol>';
    }
    
    feedbackElement.innerHTML = feedback;
}

// Check if angle is correct for the current pose
function checkAngle(angleName, angle, poseName) {
    const poseStandards = {
        mountainPose: {
            leftShoulder: { min: 170, max: 190, correction: "Keep shoulders relaxed and level" },
            rightShoulder: { min: 170, max: 190, correction: "Keep shoulders relaxed and level" },
            leftHip: { min: 170, max: 190, correction: "Engage core to keep hips level" },
            rightHip: { min: 170, max: 190, correction: "Engage core to keep hips level" }
        },
        warriorPose: {
            leftKnee: { min: 85, max: 95, correction: "Bend front knee to 90° angle" },
            rightKnee: { min: 175, max: 185, correction: "Keep back leg straight" }
        },
        treePose: {
            leftHip: { min: 170, max: 190, correction: "Keep hips squared forward" },
            rightHip: { min: 170, max: 190, correction: "Press foot into inner thigh" }
        },
        downwardDog: {
            leftShoulder: { min: 160, max: 200, correction: "Press chest toward thighs" },
            leftHip: { min: 160, max: 200, correction: "Lift hips higher" }
        }
    };

    const standard = poseStandards[poseName]?.[angleName] || { min: 0, max: 360 };
    const isCorrect = angle >= standard.min && angle <= standard.max;
    
    return {
        correct: isCorrect,
        message: isCorrect ? "✓ Correct" : "✗ Needs adjustment",
        correction: standard.correction || "Adjust your posture"
    };
}

// Helper function to calculate angle between three points
function calculateAngle(a, b, c) {
    const ab = { x: b.x - a.x, y: b.y - a.y };
    const cb = { x: b.x - c.x, y: b.y - c.y };
    
    const dotProduct = (ab.x * cb.x) + (ab.y * cb.y);
    const magAB = Math.sqrt(ab.x * ab.x + ab.y * ab.y);
    const magCB = Math.sqrt(cb.x * cb.x + cb.y * cb.y);
    
    return Math.acos(dotProduct / (magAB * magCB)) * (180 / Math.PI);
}

// Start/stop functions
function startPoseEstimation() {
    if (!isRunning) {
        initPoseDetection();
    }
}

function stopPoseEstimation() {
    isRunning = false;
    if (video && video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }
    document.getElementById('pose-feedback').textContent = 'Pose detection stopped.';
}

// Set target pose when user clicks a pose button
function setTargetPose(poseName) {
    currentTargetPose = poseName;
    const poseInfo = POSE_INSTRUCTIONS[poseName];
    if (poseInfo) {
        let instructions = `<h3>${poseInfo.name}</h3>`;
        instructions += `<p><strong>Duration:</strong> ${poseInfo.duration}</p>`;
        instructions += `<p><strong>Benefits:</strong> ${poseInfo.benefits}</p>`;
        instructions += '<h4>Instructions:</h4><ol>';
        poseInfo.instructions.forEach(instruction => {
            instructions += `<li>${instruction}</li>`;
        });
        instructions += '</ol>';
        document.getElementById('pose-feedback').innerHTML = instructions;
    }
    
    // Start pose detection if not already running
    if (!isRunning) {
        startPoseEstimation();
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Set up pose buttons
    document.querySelectorAll('.try-pose-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            currentTargetPose = this.getAttribute('data-pose');
            if (isMudra(currentTargetPose)) {
                await startHandEstimation(); // <-- for mudras
            } else {
                await startPoseEstimation(); // <-- for yoga poses
            }
        });
    });
    
    // Set up start/stop buttons
    document.querySelector('.start-btn').addEventListener('click', startPoseEstimation);
    document.querySelector('.stop-btn').addEventListener('click', stopPoseEstimation);
});