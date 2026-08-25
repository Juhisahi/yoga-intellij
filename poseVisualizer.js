// Pose Visualization Component
class PoseVisualizer {
    constructor(canvas, video) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.video = video;
        this.landmarks = null;
        this.scale = 1;
        this.offset = { x: 0, y: 0 };
        this.angles = {};

        // Create angle display container
        this.createAngleDisplay();

        // Set initial canvas size to match video
        this.canvas.width = 1280;
        this.canvas.height = 720;
        
        // Set canvas CSS size to maintain aspect ratio
        this.canvas.style.width = '100%';
        this.canvas.style.height = 'auto';
        this.canvas.style.maxWidth = '1280px';
        this.canvas.style.maxHeight = '720px';

        // Handle window resize
        window.addEventListener('resize', () => {
            this.updateCanvasSize();
            this.updateAngleDisplay();
        });
        
        // Handle video loadedmetadata event
        video.addEventListener('loadedmetadata', () => {
            this.updateCanvasSize();
        });
    }

    createAngleDisplay() {
        // Remove existing angle container if it exists
        const existingContainer = document.getElementById('angle-display-container');
        if (existingContainer) {
            existingContainer.remove();
        }

        // Create container div
        this.angleContainer = document.createElement('div');
        this.angleContainer.id = 'angle-display-container';
        
        // Create style element for consistent styling
        const style = document.createElement('style');
        style.textContent = `
            #angle-display-container {
                position: absolute;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.85);
                padding: 15px;
                border-radius: 10px;
                color: white;
                font-family: Arial, sans-serif;
                font-size: 16px;
                line-height: 1.5;
                z-index: 9999;
                width: 300px;
                box-shadow: 0 0 10px rgba(0,0,0,0.5);
            }
            #angle-display-container .angle-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                padding: 4px;
            }
            #angle-display-container .angle-label {
                flex: 1;
                min-width: 120px;
            }
            #angle-display-container .angle-value {
                margin-right: 10px;
                min-width: 50px;
            }
            #angle-display-container .angle-status {
                color: #FF0000;
                min-width: 80px;
                text-align: right;
            }
            #angle-display-container .angle-status.correct {
                color: #00FF00;
            }
        `;
        document.head.appendChild(style);

        // Get the canvas parent and ensure it's properly positioned
        const parent = this.canvas.parentElement;
        if (!parent.style.position) {
            parent.style.position = 'relative';
        }
        if (!parent.style.width) {
            parent.style.width = '100%';
        }
        if (!parent.style.maxWidth) {
            parent.style.maxWidth = '1280px';
        }
        if (!parent.style.margin) {
            parent.style.margin = '0 auto';
        }
        if (!parent.style.overflow) {
            parent.style.overflow = 'visible';
        }

        // Add the container to the parent
        parent.appendChild(this.angleContainer);

        // Debug: Add a border to the parent to visualize its bounds
        parent.style.border = '2px solid red';
    }

    updateAngleDisplay() {
        if (!this.angles) return;

        const measurements = [
            { label: 'left shoulder', value: this.angles.leftShoulder },
            { label: 'right shoulder', value: this.angles.rightShoulder },
            { label: 'left elbow', value: this.angles.leftElbow },
            { label: 'right elbow', value: this.angles.rightElbow },
            { label: 'left hip', value: this.angles.leftHip },
            { label: 'right hip', value: this.angles.rightHip },
            { label: 'left knee', value: this.angles.leftKnee },
            { label: 'right knee', value: this.angles.rightKnee }
        ];

        let html = '';
        measurements.forEach(({ label, value }) => {
            if (value !== undefined) {
                const roundedAngle = Math.round(value);
                const isCorrect = this.isAngleCorrect(label.split(' ')[1], roundedAngle);
                
                html += `
                    <div class="angle-row">
                        <span class="angle-label">${label}</span>
                        <span class="angle-value">${roundedAngle}°</span>
                        <span class="angle-status ${isCorrect ? 'correct' : ''}">
                            ${isCorrect ? '(Correct)' : '(Incorrect)'}
                        </span>
                    </div>
                `;
            }
        });

        this.angleContainer.innerHTML = html;
    }

    updateCanvasSize() {
        if (!this.video || !this.canvas) return;

        // Get the parent container dimensions
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        // Calculate scale to fit container while maintaining aspect ratio
        const videoAspect = this.video.videoWidth / this.video.videoHeight;
        const containerAspect = containerWidth / containerHeight;

        if (videoAspect > containerAspect) {
            // Container is taller than video
            this.scale = containerWidth / this.video.videoWidth;
            this.offset.x = 0;
            this.offset.y = (containerHeight - (this.video.videoHeight * this.scale)) / 2;
        } else {
            // Container is wider than video
            this.scale = containerHeight / this.video.videoHeight;
            this.offset.x = (containerWidth - (this.video.videoWidth * this.scale)) / 2;
            this.offset.y = 0;
        }

        // Set canvas size to match video
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;

        // Scale the context
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(this.scale, this.scale);
        this.ctx.translate(this.offset.x / this.scale, this.offset.y / this.scale);

        // Redraw if we have landmarks
        if (this.landmarks) {
            this.drawLandmarks(this.landmarks, this.angles);
        }
    }

    // Draw landmarks on canvas
    drawLandmarks(landmarks, angles) {
        this.landmarks = landmarks;
        this.angles = angles || {};
        
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!landmarks) return;
        
        // Draw skeleton
        this.drawConnections();
        
        // Update angle display
        this.updateAngleDisplay();
    }

    // Draw angle measurements in a neat overlay
    drawAngleOverlay() {
        // Get canvas dimensions
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;

        // Calculate base font size based on canvas width
        const baseFontSize = Math.max(48, Math.min(72, canvasWidth / 20)); // Further increased font size range
        this.ctx.font = `bold ${baseFontSize}px Arial`;

        // Define measurements with left/right labels
        const measurements = [
            { label: 'left shoulder', value: this.angles.leftShoulder },
            { label: 'right shoulder', value: this.angles.rightShoulder },
            { label: 'left elbow', value: this.angles.leftElbow },
            { label: 'right elbow', value: this.angles.rightElbow },
            { label: 'left hip', value: this.angles.leftHip },
            { label: 'right hip', value: this.angles.rightHip },
            { label: 'left knee', value: this.angles.leftKnee },
            { label: 'right knee', value: this.angles.rightKnee }
        ];

        // Calculate text metrics and find maximum width
        let maxLabelWidth = 0;
        let maxValueWidth = 0;
        measurements.forEach(({ label, value }) => {
            if (value !== undefined) {
                const text = `${label}: ${Math.round(value)}°`;
                const metrics = this.ctx.measureText(text);
                maxLabelWidth = Math.max(maxLabelWidth, metrics.width);

                const statusText = '(Incorrect)';
                const statusMetrics = this.ctx.measureText(statusText);
                maxValueWidth = Math.max(maxValueWidth, statusMetrics.width);
            }
        });

        // Calculate dynamic spacing
        const lineHeight = baseFontSize * 2; // Adjusted line height for better spacing
        const verticalPadding = baseFontSize * 1;
        const horizontalPadding = baseFontSize * 1;
        const boxWidth = maxLabelWidth + maxValueWidth + (horizontalPadding * 4);
        const boxHeight = (measurements.length * lineHeight) + (verticalPadding * 2);

        // Calculate position to ensure visibility
        const currentX = canvasWidth - boxWidth - horizontalPadding;
        const currentY = verticalPadding;

        // Draw semi-transparent background with rounded corners
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.ctx.beginPath();
        const cornerRadius = baseFontSize * 0.5;
        this.ctx.moveTo(currentX + cornerRadius, currentY);
        this.ctx.lineTo(currentX + boxWidth - cornerRadius, currentY);
        this.ctx.quadraticCurveTo(currentX + boxWidth, currentY, currentX + boxWidth, currentY + cornerRadius);
        this.ctx.lineTo(currentX + boxWidth, currentY + boxHeight - cornerRadius);
        this.ctx.quadraticCurveTo(currentX + boxWidth, currentY + boxHeight, currentX + boxWidth - cornerRadius, currentY + boxHeight);
        this.ctx.lineTo(currentX + cornerRadius, currentY + boxHeight);
        this.ctx.quadraticCurveTo(currentX, currentY + boxHeight, currentX, currentY + boxHeight - cornerRadius);
        this.ctx.lineTo(currentX, currentY + cornerRadius);
        this.ctx.quadraticCurveTo(currentX, currentY, currentX + cornerRadius, currentY);
        this.ctx.closePath();
        this.ctx.fill();

        // Draw measurements with proper spacing
        let yOffset = currentY + verticalPadding + (lineHeight / 2);
        measurements.forEach(({ label, value }) => {
            if (value !== undefined) {
                const roundedAngle = Math.round(value);
                const isCorrect = this.isAngleCorrect(label.split(' ')[1], roundedAngle);

                // Draw label and angle (left-aligned)
                this.ctx.textAlign = 'left';
                this.ctx.fillStyle = '#FFFFFF';
                const text = `${label}: ${roundedAngle}°`;
                this.ctx.fillText(text, currentX + horizontalPadding, yOffset);

                // Draw status (right-aligned)
                this.ctx.textAlign = 'right';
                this.ctx.fillStyle = isCorrect ? '#00FF00' : '#FF0000';
                this.ctx.fillText(isCorrect ? '(Correct)' : '(Incorrect)', currentX + boxWidth - horizontalPadding, yOffset);

                yOffset += lineHeight;
            }
        });

        // Reset textAlign to default
        this.ctx.textAlign = 'left';
    }

    // Check if angle is within acceptable range for the pose
    isAngleCorrect(joint, angle) {
        // Define acceptable ranges for each joint
        const ranges = {
            'shoulder': { min: 75, max: 85 },
            'elbow': { min: 160, max: 180 },
            'hip': { min: 165, max: 175 },
            'knee': { min: 95, max: 105 }
        };

        const range = ranges[joint];
        if (!range) return true;

        return angle >= range.min && angle <= range.max;
    }

    // Draw connections between landmarks
    drawConnections() {
        const connections = [
            // Torso
            [11, 12], [11, 23], [12, 24], [23, 24],
            // Left arm
            [11, 13], [13, 15],
            // Right arm
            [12, 14], [14, 16],
            // Left leg
            [23, 25], [25, 27],
            // Right leg
            [24, 26], [26, 28]
        ];

        this.ctx.strokeStyle = '#00FF00';
        this.ctx.lineWidth = 2;

        connections.forEach(([start, end]) => {
            const startLandmark = this.landmarks[start];
            const endLandmark = this.landmarks[end];

            if (startLandmark && endLandmark) {
                const startX = startLandmark.x * this.video.videoWidth * this.scale + this.offset.x;
                const startY = startLandmark.y * this.video.videoHeight * this.scale + this.offset.y;
                const endX = endLandmark.x * this.video.videoWidth * this.scale + this.offset.x;
                const endY = endLandmark.y * this.video.videoHeight * this.scale + this.offset.y;

                this.ctx.beginPath();
                this.ctx.moveTo(startX, startY);
                this.ctx.lineTo(endX, endY);
                this.ctx.stroke();
            }
        });
    }

    // Get human-readable label for landmark index
    getLandmarkLabel(index) {
        const labels = {
            0: 'Nose',
            1: 'Left Eye Inner',
            2: 'Left Eye',
            3: 'Left Eye Outer',
            4: 'Right Eye Inner',
            5: 'Right Eye',
            6: 'Right Eye Outer',
            7: 'Left Ear',
            8: 'Right Ear',
            9: 'Mouth Left',
            10: 'Mouth Right',
            11: 'Left Shoulder',
            12: 'Right Shoulder',
            13: 'Left Elbow',
            14: 'Right Elbow',
            15: 'Left Wrist',
            16: 'Right Wrist',
            17: 'Left Pinky',
            18: 'Right Pinky',
            19: 'Left Index',
            20: 'Right Index',
            21: 'Left Thumb',
            22: 'Right Thumb',
            23: 'Left Hip',
            24: 'Right Hip',
            25: 'Left Knee',
            26: 'Right Knee',
            27: 'Left Ankle',
            28: 'Right Ankle',
            29: 'Left Heel',
            30: 'Right Heel',
            31: 'Left Foot Index',
            32: 'Right Foot Index'
        };

        return labels[index] || `Point ${index}`;
    }
}

// Export the PoseVisualizer class
export default PoseVisualizer;