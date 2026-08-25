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

// Pose instructions (now includes Surya Namaskar with step images)
const POSE_INSTRUCTIONS = {
    mountainPose: {
        name: "Mountain Pose",
        duration: "30-60 seconds",
        instructions: [
            "Stand with feet together",
            "Lift and spread your toes",
            "Engage your thigh muscles",
            "Draw your belly button in",
            "Lift your chest",
            "Roll your shoulders back and down",
            "Keep your arms at your sides",
            "Gaze straight ahead"
        ],
        benefits: "Improves posture, strengthens thighs and core"
    },
    warriorPose: {
        name: "Warrior Pose",
        duration: "30 seconds per side",
        instructions: [
            "Step your right foot back",
            "Turn your right foot out 90 degrees",
            "Bend your left knee to 90 degrees",
            "Keep your right leg straight",
            "Raise your arms to shoulder height",
            "Turn your head to look over your left hand",
            "Keep your hips squared to the front",
            "Engage your core"
        ],
        benefits: "Strengthens legs and arms, improves balance"
    },
    treePose: {
        name: "Tree Pose",
        duration: "30 seconds per side",
        instructions: [
            "Stand with feet together",
            "Shift weight to left foot",
            "Place right foot on left inner thigh",
            "Bring hands to prayer position",
            "Focus on a point in front of you",
            "Keep hips level",
            "Engage your core",
            "Breathe deeply"
        ],
        benefits: "Improves balance, strengthens legs"
    },
    downwardDog: {
        name: "Downward Dog",
        duration: "1-3 minutes",
        instructions: [
            "Start on hands and knees",
            "Tuck toes and lift hips up",
            "Straighten legs as much as possible",
            "Press hands firmly into the mat",
            "Draw shoulder blades down your back",
            "Keep head between arms",
            "Engage core muscles",
            "Press heels toward the floor"
        ],
        benefits: "Stretches hamstrings and calves, strengthens arms"
    },
    childPose: {
        name: "Child's Pose",
        duration: "30 seconds - 1 minute",
        instructions: [
            "Kneel on the floor",
            "Touch big toes together",
            "Sit on heels",
            "Separate knees hip-width apart",
            "Fold forward, resting torso between thighs",
            "Extend arms forward",
            "Rest forehead on the floor",
            "Breathe deeply"
        ],
        benefits: "Relieves back and neck pain, calms the mind"
    },
    cobraPose: {
        name: "Cobra Pose",
        duration: "15-30 seconds",
        instructions: [
            "Lie on your stomach",
            "Place hands under shoulders",
            "Press tops of feet into floor",
            "Engage leg muscles",
            "Press hands into floor",
            "Lift chest off floor",
            "Keep elbows close to body",
            "Look slightly upward"
        ],
        benefits: "Strengthens spine, opens chest and shoulders"
    },
    pranaMudra: {
        name: "Prana Mudra",
        duration: "15-30 minutes",
        instructions: [
            "Sit comfortably with your back straight.",
            "Touch the tips of the ring finger and little finger to the tip of the thumb.",
            "Keep the other two fingers straight.",
            "Place your hands on your knees, palms up.",
            "Close your eyes and focus on your breath."
        ],
        benefits: "Boosts vitality and immunity, reduces fatigue."
    },
    prithviMudra: {
        name: "Prithvi Mudra",
        duration: "15-30 minutes",
        instructions: [
            "Sit in a comfortable position.",
            "Touch the tip of the ring finger to the tip of the thumb.",
            "Keep the other fingers straight.",
            "Rest your hands on your knees, palms up.",
            "Breathe deeply and relax."
        ],
        benefits: "Increases strength and endurance, improves skin health."
    },
    anjaliMudra: {
        name: "Anjali Mudra",
        duration: "1-5 minutes",
        instructions: [
            "Sit or stand comfortably.",
            "Bring your palms together in front of your chest.",
            "Press the palms gently and evenly.",
            "Keep your fingers pointing upward.",
            "Close your eyes and focus on your breath."
        ],
        benefits: "Promotes inner peace, gratitude, and balance."
    },
    vayuMudra: {
        name: "Vayu Mudra",
        duration: "10-15 minutes",
        instructions: [
            "Sit in a comfortable position.",
            "Fold the index finger and press it with the base of the thumb.",
            "Keep the other fingers straight.",
            "Rest your hands on your knees.",
            "Breathe normally and relax."
        ],
        benefits: "Helps relieve joint pain and anxiety."
    },
    shunyaMudra: {
        name: "Shunya Mudra",
        duration: "10-15 minutes",
        instructions: [
            "Sit comfortably with your spine straight.",
            "Fold the middle finger and press it with the base of the thumb.",
            "Keep the other fingers straight.",
            "Rest your hands on your knees.",
            "Breathe deeply and relax."
        ],
        benefits: "Relieves ear pain and numbness, improves hearing."
    },
    dhyanaMudra: {
        name: "Dhyana Mudra",
        duration: "15-30 minutes",
        instructions: [
            "Sit in a comfortable meditative posture.",
            "Place your right hand over your left hand, both palms facing upward.",
            "Let the tips of the thumbs touch gently.",
            "Rest your hands on your lap.",
            "Close your eyes and meditate."
        ],
        benefits: "Enhances concentration, calms the mind, deepens meditation."
    },
    gyanMudra: {
        name: "Gyan Mudra",
        duration: "15-30 minutes",
        instructions: [
            "Sit comfortably with your spine straight.",
            "Touch the tip of the index finger to the tip of the thumb.",
            "Keep the other three fingers straight and relaxed.",
            "Rest your hands on your knees with palms facing upward.",
            "Close your eyes and breathe deeply."
        ],
        benefits: "Improves concentration and memory, reduces stress."
    }
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
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                video.play();
                resolve();
            };
        });
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

    // Always reset before anything
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw video and pose (mirrored)
    context.save();
    context.setTransform(-1, 0, 0, 1, canvas.width, 0); // mirror horizontally
    context.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    if (results.poseLandmarks) {
        drawConnections(results.poseLandmarks);
        drawLandmarks(results.poseLandmarks);
    }
    context.restore(); // back to default (not mirrored)

    // 2. Reset transform before drawing text/angles (this is the key line!)
    context.setTransform(1, 0, 0, 1, 0, 0);

    // 3. Draw text/angles (not mirrored, default context)
    if (results.poseLandmarks) {
        const angles = calculateAngles(results.poseLandmarks);
        displayAngles(angles); // This will now be readable!
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

// Display angles on canvas (not mirrored)
function displayAngles(angles) {
    if (!context || !canvas) return;
    // Move overlay further down
    const overlayTop = 40; // or 50 for even more space
    context.fillStyle = 'rgba(0, 0, 0, 0.75)';
    context.fillRect(10, overlayTop, 200, Object.keys(angles).length * 28 + 24);
    context.font = 'bold 16px Arial';
    context.textAlign = 'left';
    let yOffset = overlayTop + 22;
    for (const [angleName, angle] of Object.entries(angles)) {
        const formattedName = angleName.replace(/([A-Z])/g, ' $1').toLowerCase();
        const status = getAngleStatus(angleName, angle);
        const text = `${formattedName}: ${Math.round(angle)}°`;
        // White text with strong shadow for visibility
        context.fillStyle = '#FFFFFF';
        context.shadowColor = '#000';
        context.shadowBlur = 5;
        context.fillText(text, 18, yOffset);
        // Status text: green for correct, red for incorrect, both with strong shadow
        if (status === 'Correct') {
            context.fillStyle = '#00FF00';
            context.font = 'bold 16px Arial';
            context.shadowColor = '#000';
            context.shadowBlur = 5;
            context.fillText(`(${status})`, 150, yOffset);
        } else {
            context.fillStyle = '#FF0000';
            context.font = 'bold 18px Arial';
            context.shadowColor = '#fff';
            context.shadowBlur = 7;
            context.fillText(`(${status})`, 150, yOffset);
        }
        // Reset font for next line
        context.font = 'bold 16px Arial';
        yOffset += 28;
    }
    // Reset shadow
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

function analyzePose(landmarks, angles, targetPose) {
    let feedback = '';
    const confidence = calculateAverageConfidence(landmarks);
    if (confidence < 0.5) {
        return 'Please ensure you are fully visible in the camera and the lighting is adequate.';
    }
    const poseInfo = POSE_INSTRUCTIONS[targetPose];
    if (poseInfo) {
        feedback += `<h4>${poseInfo.name}</h4>`;
        feedback += `<p><strong>Duration:</strong> ${poseInfo.duration}</p>`;
        feedback += `<p><strong>Benefits:</strong> ${poseInfo.benefits}</p>`;
        feedback += '<h4>Instructions:</h4><ol>';
        poseInfo.instructions.forEach(instruction => {
            feedback += `<li>${instruction}</li>`;
        });
        feedback += '</ol>';
        // Show Surya Namaskar step images if present
        if (targetPose === 'suryaNamaskar' && poseInfo.stepImages) {
            feedback += '<div class="surya-steps-images" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;">';
            poseInfo.stepImages.forEach((img, idx) => {
                feedback += `<div style='text-align:center;'><img src='${img}' alt='Step ${idx+1}' style='width:80px;height:auto;border-radius:6px;'><div style='font-size:12px;'>Step ${idx+1}</div></div>`;
            });
            feedback += '</div>';
        }
    }
    switch (targetPose) {
        case 'mountainPose':
            feedback += checkMountainPose(landmarks);
            break;
        case 'warriorPose':
            feedback += checkWarriorPose(landmarks);
            break;
        case 'treePose':
            feedback += checkTreePose(landmarks);
            break;
        case 'downwardDog':
            feedback += checkDownwardDog(landmarks);
            break;
        case 'childPose':
            feedback += checkChildPose(landmarks);
            break;
        case 'cobraPose':
            feedback += checkCobraPose(landmarks);
            break;
        case 'suryaNamaskar':
            feedback += checkSuryaNamaskar(landmarks);
            break;
        default:
            feedback += 'Please select a valid pose to practice.';
    }
    return feedback;
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
    
    // Stop the video stream
    if (video && video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
    }
    
    // Clear the canvas
    if (context && canvas) {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // Reset the pose and hands objects
    pose = null;
    hands = null;
    
    document.getElementById('pose-feedback').textContent = 'Detection stopped.';
}

// --- Pose-specific feedback functions (add your own or use existing ones) ---
function checkMountainPose(landmarks) { return ''; }
function checkWarriorPose(landmarks) { return ''; }
function checkTreePose(landmarks) { return ''; }
function checkDownwardDog(landmarks) { return ''; }
function checkChildPose(landmarks) { return ''; }
function checkCobraPose(landmarks) { return ''; }
function checkSuryaNamaskar(landmarks) {
    // Basic check: ensure all main body points are visible
    const required = [11,12,13,14,15,16,23,24,25,26,27,28,29,30,31,32];
    for (let idx of required) {
        if (!landmarks[idx] || landmarks[idx].visibility < 0.5) {
            return '<p>Please ensure your full body is visible for Surya Namaskar.</p>';
        }
    }
    // You can add more detailed step-by-step checks here if desired
    return '<p>Good job! Continue flowing through the Surya Namaskar sequence.</p>';
}

function analyzeMudra(handLandmarks, mudraType, results = null) {
    let feedback = '';
    let correct = false;
    const DISTANCE_THRESHOLD = 0.05; // Adjusted threshold for better accuracy

    if (mudraType === 'pranaMudra') {
        const thumbTip = handLandmarks[4];
        const ringTip = handLandmarks[16];
        const littleTip = handLandmarks[20];
        const distRing = Math.hypot(thumbTip.x - ringTip.x, thumbTip.y - ringTip.y);
        const distLittle = Math.hypot(thumbTip.x - littleTip.x, thumbTip.y - littleTip.y);
        const indexStraight = isFingerStraight(handLandmarks, 8);
        const middleStraight = isFingerStraight(handLandmarks, 12);
        correct = distRing < DISTANCE_THRESHOLD && distLittle < DISTANCE_THRESHOLD && 
                 indexStraight && middleStraight;
        feedback = "Touch the tips of your ring and little fingers to the tip of your thumb. Keep other fingers straight.";
    }
    else if (mudraType === 'vayuMudra') {
        const indexTip = handLandmarks[8];
        const thumbBase = handLandmarks[2];
        const dist = Math.hypot(indexTip.x - thumbBase.x, indexTip.y - thumbBase.y);
        const otherFingersStraight = isFingerStraight(handLandmarks, 12) && 
                                   isFingerStraight(handLandmarks, 16) && 
                                   isFingerStraight(handLandmarks, 20);
        correct = dist < DISTANCE_THRESHOLD && otherFingersStraight;
        feedback = "Fold your index finger and press it with the base of your thumb. Keep other fingers straight.";
    }
    else if (mudraType === 'gyanMudra') {
        const indexTip = handLandmarks[8];
        const thumbTip = handLandmarks[4];
        const dist = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
        const otherFingersStraight = isFingerStraight(handLandmarks, 12) && 
                                   isFingerStraight(handLandmarks, 16) && 
                                   isFingerStraight(handLandmarks, 20);
        correct = dist < DISTANCE_THRESHOLD && otherFingersStraight;
        feedback = "Touch the tip of your index finger to the tip of your thumb. Keep other fingers straight.";
    }
    else if (mudraType === 'shunyaMudra') {
        const middleTip = handLandmarks[12];
        const thumbBase = handLandmarks[2];
        const dist = Math.hypot(middleTip.x - thumbBase.x, middleTip.y - thumbBase.y);
        const otherFingersStraight = isFingerStraight(handLandmarks, 8) && 
                                   isFingerStraight(handLandmarks, 16) && 
                                   isFingerStraight(handLandmarks, 20);
        correct = dist < DISTANCE_THRESHOLD && otherFingersStraight;
        feedback = "Fold your middle finger and press it with the base of your thumb. Keep other fingers straight.";
    }
    else if (mudraType === 'dhyanaMudra') {
        // For Dhyana Mudra, we need both hands
        if (results && results.multiHandLandmarks && results.multiHandLandmarks.length >= 2) {
            const rightHand = results.multiHandLandmarks[0];
            const leftHand = results.multiHandLandmarks[1];
            const thumbsTouching = areThumbsTouching(rightHand, leftHand);
            const handsOverlapping = areHandsOverlapping(rightHand, leftHand);
            correct = thumbsTouching && handsOverlapping;
            feedback = "Place your right hand over your left, both palms up, thumbs touching gently.";
        } else {
            feedback = "Please show both hands to the camera for Dhyana Mudra.";
        }
    }
    else if (mudraType === 'anjaliMudra') {
        // For Anjali Mudra, we need both hands
        if (results && results.multiHandLandmarks && results.multiHandLandmarks.length >= 2) {
            const rightHand = results.multiHandLandmarks[0];
            const leftHand = results.multiHandLandmarks[1];
            const palmsTogether = arePalmsTogether(rightHand, leftHand);
            correct = palmsTogether;
            feedback = "Bring your palms together in front of your chest, fingers pointing upward.";
        } else {
            feedback = "Please show both hands to the camera for Anjali Mudra.";
        }
    }
    return {feedback, correct};
}

// Helper functions for hand detection
function isFingerStraight(landmarks, fingerTipIndex) {
    const tip = landmarks[fingerTipIndex];
    const pip = landmarks[fingerTipIndex - 2];
    const mcp = landmarks[fingerTipIndex - 3];
    const angle = calculateAngle(tip, pip, mcp);
    return angle > 150; // Finger is considered straight if angle > 150 degrees
}

function areThumbsTouching(hand1, hand2) {
    const thumb1 = hand1[4];
    const thumb2 = hand2[4];
    const dist = Math.hypot(thumb1.x - thumb2.x, thumb1.y - thumb2.y);
    return dist < 0.05;
}

function areHandsOverlapping(hand1, hand2) {
    const palm1 = hand1[0];
    const palm2 = hand2[0];
    const dist = Math.hypot(palm1.x - palm2.x, palm1.y - palm2.y);
    return dist < 0.1;
}

function arePalmsTogether(hand1, hand2) {
    const palm1 = hand1[0];
    const palm2 = hand2[0];
    const dist = Math.hypot(palm1.x - palm2.x, palm1.y - palm2.y);
    const fingersAligned = areFingersAligned(hand1, hand2);
    return dist < 0.05 && fingersAligned;
}

function areFingersAligned(hand1, hand2) {
    const fingerTips1 = [8, 12, 16, 20]; // Index, middle, ring, little
    const fingerTips2 = [8, 12, 16, 20];
    let aligned = true;
    for (let i = 0; i < fingerTips1.length; i++) {
        const tip1 = hand1[fingerTips1[i]];
        const tip2 = hand2[fingerTips2[i]];
        const dist = Math.hypot(tip1.x - tip2.x, tip1.y - tip2.y);
        if (dist > 0.1) {
            aligned = false;
            break;
        }
    }
    return aligned;
}

function onHandResults(results) {
    if (!isRunning) return;
    if (currentTargetPose && isMudra(currentTargetPose)) {
        // Clear the canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw the video frame
        context.save();
        context.setTransform(-1, 0, 0, 1, canvas.width, 0);
        context.drawImage(results.image, 0, 0, canvas.width, canvas.height);
        context.restore();

        // Draw hand landmarks
        if (results.multiHandLandmarks) {
            for (const landmarks of results.multiHandLandmarks) {
                drawHandLandmarks(landmarks);
            }
        }

        // Analyze mudra
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const handLandmarks = results.multiHandLandmarks[0];
            const {feedback, correct} = analyzeMudra(handLandmarks, currentTargetPose, results);
            document.getElementById('pose-feedback').innerHTML = 
                `<span style="color:${correct ? 'limegreen' : 'red'};font-weight:bold;font-size:1.5em;">
                    ${correct ? '✔️ Correct!' : '❌ Incorrect!'}
                </span><br>${feedback}`;
        } else {
            document.getElementById('pose-feedback').innerHTML = 
                `<span style="color:red;font-weight:bold;">Show your hand(s) clearly to the camera.</span>`;
        }
    }
}

function drawHandLandmarks(landmarks) {
    // Draw connections
    context.strokeStyle = '#00FF00';
    context.lineWidth = 2;
    
    // Draw landmarks
    context.fillStyle = '#FF0000';
    landmarks.forEach((landmark, index) => {
        context.beginPath();
        context.arc(
            landmark.x * canvas.width,
            landmark.y * canvas.height,
            5,
            0,
            2 * Math.PI
        );
        context.fill();
    });
}

// Initialize MediaPipe Hands
async function initHandDetection() {
    if (isHandsInitialized) return;
    try {
        if (typeof Hands === 'undefined') {
            throw new Error('MediaPipe Hands is not loaded. Please check your internet connection and refresh the page.');
        }
        
        // Initialize video if not already initialized
        if (!video) {
            video = document.getElementById('webcam');
            if (!video) throw new Error('Video element not found');
            canvas = document.getElementById('outputCanvas');
            if (!canvas) throw new Error('Canvas element not found');
            context = canvas.getContext('2d');
            if (!context) throw new Error('Could not get canvas context');
        }
        
        // Get camera stream
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
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                video.play();
                resolve();
            };
        });
        
        // Initialize hands
        hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`
        });
        hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });
        hands.onResults(onHandResults);
        isHandsInitialized = true;
        console.log('Hand detection initialized successfully');
    } catch (error) {
        console.error('Error initializing hand detection:', error);
        document.getElementById('pose-feedback').innerHTML = 
            `<span style="color:red;font-weight:bold;">Error: ${error.message}</span>`;
        throw error;
    }
}

// Function to start hand estimation
async function startHandEstimation() {
    try {
        if (!isHandsInitialized) {
            await initHandDetection();
        }
        isRunning = true;
        processFrames();
        document.getElementById('pose-feedback').innerHTML = 
            `<span style="color:green;font-weight:bold;">AI Trainer is ready! Show your hands to the camera.</span>`;
    } catch (error) {
        console.error('Error starting hand estimation:', error);
        document.getElementById('pose-feedback').innerHTML = 
            `<span style="color:red;font-weight:bold;">Error: ${error.message}</span>`;
        throw error;
    }
}

// Helper function to check if a pose is a mudra
function isMudra(poseName) {
    return [
        'pranaMudra', 'vayuMudra', 'gyanMudra',
        'shunyaMudra', 'dhyanaMudra', 'anjaliMudra'
    ].includes(poseName);
}

document.querySelectorAll('.try-pose-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
        currentTargetPose = this.getAttribute('data-pose');
        if (isMudra(currentTargetPose)) {
            await startHandEstimation(); // Your function to start MediaPipe Hands
        } else {
            await startPoseEstimation(); // Your function to start MediaPipe Pose
        }
    });
});