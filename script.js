// Form handling
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Starting initialization...');

    // Check if MediaPipe is available
    if (typeof Pose === 'undefined') {
        console.error('MediaPipe Pose is not loaded!');
        alert('MediaPipe Pose is not loaded. Please check your internet connection and try again.');
        return;
    }

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            // Here you would typically send the data to a server
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Initialize any necessary components
    console.log('DOM loaded, initializing components...');

    // Handle pose card clicks
    document.querySelectorAll('.pose-card').forEach(card => {
        const tryPoseBtn = card.querySelector('.try-pose-btn');
        if (tryPoseBtn) {
            tryPoseBtn.addEventListener('click', async function(e) {
                e.stopPropagation();
                const poseName = this.getAttribute('data-pose');
                console.log('Starting pose:', poseName);
                
                document.getElementById('trainer').scrollIntoView({ behavior: 'smooth' });
                
                try {
                    // Stop any existing detection first
                    stopPoseEstimation();
                    
                    // Set target pose
                    setTargetPose(poseName);
                    
                    // Wait a moment for cleanup
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                    if (isMudra(poseName)) {
                        console.log('Initializing hand detection...');
                        await startHandEstimation();
                    } else {
                        console.log('Initializing pose detection...');
                        await startPoseEstimation();
                    }
                    console.log('Detection initialized successfully');
                } catch (error) {
                    console.error('Error starting detection:', error);
                    alert('Error starting camera. Please make sure your camera is connected and permissions are granted.');
                }
            });
        }
    });

    // Helper function to check if a pose is a mudra
    function isMudra(poseName) {
        return [
            'pranaMudra', 'vayuMudra', 'gyanMudra',
            'shunyaMudra', 'dhyanaMudra', 'anjaliMudra'
        ].includes(poseName);
    }

    // Handle camera permissions
    const video = document.getElementById('webcam');
    if (video) {
        video.addEventListener('error', function(e) {
            console.error('Error accessing webcam:', e);
            document.getElementById('pose-feedback').textContent = 'Error: Could not access camera. Please ensure camera permissions are granted.';
        });

        // Add additional error handling for camera
        video.addEventListener('loadedmetadata', function() {
            console.log('Video metadata loaded - width:', video.videoWidth, 'height:', video.videoHeight);
        });

        video.addEventListener('loadeddata', function() {
            console.log('Video data loaded');
        });

        video.addEventListener('canplay', function() {
            console.log('Video can play');
        });
    }

    // Handle pose estimation start/stop
    const startBtn = document.querySelector('.start-btn');
    const stopBtn = document.querySelector('.stop-btn');

    if (startBtn) {
        startBtn.addEventListener('click', async function() {
            try {
                console.log('Start button clicked - initializing pose estimation...');
                await startPoseEstimation();
            } catch (error) {
                console.error('Error starting pose estimation:', error);
                alert('Error starting pose estimation. Please try again.');
            }
        });
    }

    if (stopBtn) {
        stopBtn.addEventListener('click', stopPoseEstimation);
    }
});

// Pose estimation functionality
async function startPoseEstimation() {
    try {
        const feedbackElement = document.getElementById('pose-feedback');
        feedbackElement.textContent = "Initializing AI Yoga Trainer...";
        
        if (!isInitialized) {
            console.log('Initializing pose detection...');
            await initPoseDetection();
            console.log('Pose detection initialized successfully');
        }
        
        isRunning = true;
        console.log('Starting frame processing...');
        processFrames();
        feedbackElement.textContent = "AI Trainer is ready! Stand in front of the camera and follow the instructions.";
    } catch (error) {
        console.error('Error starting pose estimation:', error);
        alert('There was an error starting the AI Trainer. Please make sure your camera is connected and try again.');
        throw error;
    }
}

// Add loading state to buttons
function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = '<span class="loading">Loading...</span>';
    } else {
        button.disabled = false;
        button.innerHTML = button.getAttribute('data-original-text') || button.innerHTML;
    }
}

// Function to set target pose
function setTargetPose(poseName) {
    console.log('Setting target pose:', poseName);
    currentTargetPose = poseName;
    
    // Update feedback with pose instructions
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
}

// Function to provide feedback
function provideFeedback(message) {
    const feedbackElement = document.getElementById('pose-feedback');
    if (feedbackElement) {
        feedbackElement.textContent = message;
    }
}

// Add pose-specific checking functions
function checkMountainPose(landmarks) {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip || 
        !leftKnee || !rightKnee || !leftAnkle || !rightAnkle) {
        return '<p>Please ensure your full body is visible in the camera.</p>';
    }

    let feedback = '';
    const shoulderLevel = Math.abs(leftShoulder.y - rightShoulder.y);
    const hipLevel = Math.abs(leftHip.y - rightHip.y);
    const kneeLevel = Math.abs(leftKnee.y - rightKnee.y);
    const ankleLevel = Math.abs(leftAnkle.y - rightAnkle.y);

    // Check alignment
    if (shoulderLevel > 0.1) {
        feedback += '<p>Keep your shoulders level and aligned.</p>';
    }
    if (hipLevel > 0.1) {
        feedback += '<p>Keep your hips level and aligned.</p>';
    }
    if (kneeLevel > 0.1) {
        feedback += '<p>Keep your knees level and aligned.</p>';
    }
    if (ankleLevel > 0.1) {
        feedback += '<p>Keep your ankles level and aligned.</p>';
    }

    // Check posture
    const backAngle = calculateAngle(leftShoulder, leftHip, rightHip);
    if (backAngle < 150) {
        feedback += '<p>Keep your back straight and aligned.</p>';
    }

    if (!feedback) {
        feedback = '<p>Good Mountain Pose! Maintain your alignment and breathe deeply.</p>';
    }

    return feedback;
}

function checkWarriorPose(landmarks) {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip || 
        !leftKnee || !rightKnee || !leftAnkle || !rightAnkle) {
        return '<p>Please ensure your full body is visible in the camera.</p>';
    }

    let feedback = '';
    const shoulderLevel = Math.abs(leftShoulder.y - rightShoulder.y);
    const hipLevel = Math.abs(leftHip.y - rightHip.y);

    // Check alignment
    if (shoulderLevel > 0.1) {
        feedback += '<p>Keep your shoulders level and aligned.</p>';
    }
    if (hipLevel > 0.1) {
        feedback += '<p>Keep your hips squared to the front.</p>';
    }

    // Check knee angle
    const frontKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    if (frontKneeAngle < 80 || frontKneeAngle > 100) {
        feedback += '<p>Bend your front knee to 90 degrees.</p>';
    }

    // Check back leg
    const backLegAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
    if (backLegAngle < 150) {
        feedback += '<p>Keep your back leg straight.</p>';
    }

    if (!feedback) {
        feedback = '<p>Good Warrior Pose! Maintain your alignment and breathe deeply.</p>';
    }

    return feedback;
}

function checkTreePose(landmarks) {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip || 
        !leftKnee || !rightKnee || !leftAnkle || !rightAnkle) {
        return '<p>Please ensure your full body is visible in the camera.</p>';
    }

    let feedback = '';
    const shoulderLevel = Math.abs(leftShoulder.y - rightShoulder.y);
    const hipLevel = Math.abs(leftHip.y - rightHip.y);

    // Check alignment
    if (shoulderLevel > 0.1) {
        feedback += '<p>Keep your shoulders level and aligned.</p>';
    }
    if (hipLevel > 0.1) {
        feedback += '<p>Keep your hips level and aligned.</p>';
    }

    // Check standing leg
    const standingLegAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    if (standingLegAngle < 170) {
        feedback += '<p>Keep your standing leg straight and strong.</p>';
    }

    // Check raised foot position
    const raisedFootHeight = rightAnkle.y;
    const hipHeight = rightHip.y;
    if (raisedFootHeight > hipHeight + 0.1) {
        feedback += '<p>Place your raised foot higher on your standing leg.</p>';
    }

    if (!feedback) {
        feedback = '<p>Good Tree Pose! Maintain your balance and focus on your breath.</p>';
    }

    return feedback;
}

function checkDownwardDog(landmarks) {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip || 
        !leftKnee || !rightKnee || !leftAnkle || !rightAnkle) {
        return '<p>Please ensure your full body is visible in the camera.</p>';
    }

    let feedback = '';
    const shoulderLevel = Math.abs(leftShoulder.y - rightShoulder.y);
    const hipLevel = Math.abs(leftHip.y - rightHip.y);

    // Check alignment
    if (shoulderLevel > 0.1) {
        feedback += '<p>Keep your shoulders level and aligned.</p>';
    }
    if (hipLevel > 0.1) {
        feedback += '<p>Keep your hips level and aligned.</p>';
    }

    // Check arm position
    const armAngle = calculateAngle(leftShoulder, leftHip, rightHip);
    if (armAngle < 80 || armAngle > 100) {
        feedback += '<p>Keep your arms straight and strong.</p>';
    }

    // Check leg position
    const legAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    if (legAngle < 150) {
        feedback += '<p>Straighten your legs as much as possible.</p>';
    }

    if (!feedback) {
        feedback = '<p>Good Downward Dog! Maintain your alignment and breathe deeply.</p>';
    }

    return feedback;
}

function checkChildPose(landmarks) {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip || 
        !leftKnee || !rightKnee || !leftAnkle || !rightAnkle) {
        return '<p>Please ensure your full body is visible in the camera.</p>';
    }

    let feedback = '';
    const shoulderLevel = Math.abs(leftShoulder.y - rightShoulder.y);
    const hipLevel = Math.abs(leftHip.y - rightHip.y);

    // Check alignment
    if (shoulderLevel > 0.1) {
        feedback += '<p>Keep your shoulders level and aligned.</p>';
    }
    if (hipLevel > 0.1) {
        feedback += '<p>Keep your hips level and aligned.</p>';
    }

    // Check knee position
    const kneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    if (kneeAngle < 80 || kneeAngle > 100) {
        feedback += '<p>Keep your knees hip-width apart and sit back on your heels.</p>';
    }

    // Check forward fold
    const foldAngle = calculateAngle(leftShoulder, leftHip, rightHip);
    if (foldAngle > 30) {
        feedback += '<p>Fold forward more deeply, resting your torso between your thighs.</p>';
    }

    if (!feedback) {
        feedback = '<p>Good Child\'s Pose! Relax and breathe deeply.</p>';
    }

    return feedback;
}

function checkCobraPose(landmarks) {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip || 
        !leftKnee || !rightKnee || !leftAnkle || !rightAnkle) {
        return '<p>Please ensure your full body is visible in the camera.</p>';
    }

    let feedback = '';
    const shoulderLevel = Math.abs(leftShoulder.y - rightShoulder.y);
    const hipLevel = Math.abs(leftHip.y - rightHip.y);

    // Check alignment
    if (shoulderLevel > 0.1) {
        feedback += '<p>Keep your shoulders level and aligned.</p>';
    }
    if (hipLevel > 0.1) {
        feedback += '<p>Keep your hips level and aligned.</p>';
    }

    // Check back bend
    const backAngle = calculateAngle(leftShoulder, leftHip, rightHip);
    if (backAngle < 150) {
        feedback += '<p>Lift your chest higher, keeping your shoulders back and down.</p>';
    }

    // Check leg position
    const legAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    if (legAngle < 170) {
        feedback += '<p>Keep your legs straight and engaged.</p>';
    }

    if (!feedback) {
        feedback = '<p>Good Cobra Pose! Maintain your alignment and breathe deeply.</p>';
    }

    return feedback;
}