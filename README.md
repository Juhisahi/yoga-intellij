# 🧘 Yoga IntelliJ — Real-Time Yoga Pose Detection

A browser-based **real-time yoga pose detection and guidance application** that uses the device's webcam and client-side pose-estimation technology to detect human body landmarks, visualize skeletal keypoints, and provide an interactive foundation for analyzing common yoga asanas.

The project is designed as a **privacy-conscious computer-vision and machine-learning web application**, with video processing performed directly in the user's browser rather than being uploaded to a remote server.

---

## 🌐 Project Overview

**Yoga IntelliJ** combines modern web technologies, browser APIs, computer vision, and client-side machine learning to create an interactive yoga assistance experience.

The application captures live webcam footage and processes it locally to identify body landmarks such as shoulders, elbows, hips, knees, and other key points. These landmarks can then be visualized on top of the live video feed, creating a real-time representation of the user's posture.

The project provides a foundation for developing features such as:

* Real-time yoga pose detection
* Body landmark and skeleton visualization
* Pose confidence analysis
* Posture feedback
* Asana classification
* Interactive yoga guidance
* Webcam-based fitness applications

---

## ✨ Key Features

### 🎥 Real-Time Webcam Processing

The application uses the browser's `MediaDevices` API to request webcam access and display a live video stream.

Users can interact with the application directly through their browser without requiring a dedicated desktop application.

### 🦴 Pose & Landmark Detection

A client-side pose-estimation model analyzes the webcam frames and identifies human body keypoints.

Detected landmarks can include:

* Head and facial reference points
* Shoulders
* Elbows
* Wrists
* Hips
* Knees
* Ankles

The detected points can be used to understand body position and movement.

### 📊 Skeleton Visualization

Detected landmarks are rendered onto a canvas to provide a visual representation of the user's body posture.

The visualization layer can display:

* Keypoints
* Skeleton connections
* Bounding areas
* Confidence-based information
* Visual posture overlays

### 🧘 Yoga Pose Analysis

The application provides the foundation for analyzing common yoga asanas using body landmarks and geometric relationships.

Possible analysis methods include:

* Joint-angle calculations
* Landmark positions
* Confidence thresholds
* Relative body proportions
* Pose-specific rules

### 💬 Interactive Guidance

The project includes an optional chatbot/guidance interface that can be used to provide instructions, explanations, or feedback to users while interacting with the application.

### 🔒 Privacy-Focused Architecture

The application is designed around **local browser-based processing**.

By default, webcam frames are processed within the user's browser and are not uploaded to a backend server.

This approach helps minimize unnecessary transmission of sensitive camera data.

### ⚡ Lightweight Architecture

The project is primarily composed of client-side web technologies and can be hosted using static hosting platforms such as GitHub Pages.

No dedicated backend is required for the core pose-detection workflow.

---

## 🛠️ Technology Stack

| Technology                            | Purpose                                   |
| ------------------------------------- | ----------------------------------------- |
| **HTML5**                             | Application structure and UI              |
| **CSS3**                              | Layout, styling, and responsive interface |
| **JavaScript**                        | Application logic and interaction         |
| **Web APIs**                          | Webcam access and browser capabilities    |
| **Canvas API**                        | Rendering pose landmarks and skeletons    |
| **Client-Side ML**                    | Real-time pose estimation                 |
| **TensorFlow.js / Compatible Models** | Pose-estimation model integration         |
| **Git & GitHub**                      | Version control and project hosting       |

> The exact model/runtime configuration may vary depending on the implementation in `pose-estimation.js`.

---

## 🏗️ Project Architecture

The application is organized into separate modules so that individual parts of the pose-detection pipeline can be developed and maintained independently.

```text
Yoga-IntelliJ/
│
├── index.html
│   └── Main application interface
│
├── styles.css
│   └── Application layout and styling
│
├── script.js
│   └── Application initialization and UI logic
│
├── chatbot.js
│   └── Optional chatbot / guidance functionality
│
├── pose_detection.js
│   └── Main real-time detection loop
│
├── pose-estimation.js
│   └── Pose model initialization and configuration
│
├── poseDetector.js
│   └── Pose inference and landmark extraction
│
├── poseVisualizer.js
│   └── Keypoint and skeleton rendering
│
├── images/
│   └── Static application images and assets
│
└── README.md
    └── Project documentation
```

---

## 🔄 How the Application Works

The core workflow can be summarized as follows:

```text
User
  │
  ▼
Webcam Permission
  │
  ▼
Live Video Stream
  │
  ▼
Pose Estimation Model
  │
  ▼
Body Keypoints
  │
  ├──────────────► Confidence Analysis
  │
  ├──────────────► Pose / Angle Analysis
  │
  ▼
Pose Visualization
  │
  ▼
User Feedback / Guidance
```

### Step 1 — Camera Access

The application requests permission to access the user's webcam using the browser's `MediaDevices` API.

### Step 2 — Video Capture

Once permission is granted, the webcam stream is displayed through the application's video element.

### Step 3 — Pose Estimation

The pose-estimation module initializes the selected machine-learning model and processes frames from the video stream.

### Step 4 — Landmark Extraction

The model returns body landmarks containing positional information and confidence values.

Conceptually:

```text
Keypoint
├── X coordinate
├── Y coordinate
└── Confidence score
```

### Step 5 — Visualization

The detected landmarks are passed to the visualization layer, which draws the body keypoints and skeleton connections on a canvas.

### Step 6 — Pose Analysis

The detected landmarks can be used to calculate body angles and compare the user's posture against predefined rules for specific yoga poses.

### Step 7 — Feedback

The resulting analysis can be presented to the user through visual indicators, instructions, or the optional guidance interface.

---

## 🚀 Getting Started

### Prerequisites

Before running the project, make sure you have:

* A modern web browser such as Chrome, Edge, or Firefox
* A working webcam
* Internet access if the application loads its ML model or dependencies from a CDN
* Python 3 **or** Node.js for running a local HTTP server

---

## 📥 Installation

Clone the repository:

```bash
git clone https://github.com/Juhisahi/yoga-intellij.git
```

Navigate into the project directory:

```bash
cd yoga-intellij
```

---

## ▶️ Running the Application

Because browser security restrictions may prevent webcam access from a `file://` URL, it is recommended to run the project through a local HTTP server.

### Option 1 — Python

If Python 3 is installed:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

### Option 2 — Node.js

If Node.js is installed:

```bash
npx http-server -p 8000
```

Then open the displayed local URL in your browser.

---

## 🎮 How to Use

1. Start the application using a local HTTP server.
2. Open the application in a supported browser.
3. Allow webcam access when prompted.
4. Position yourself so that your body is visible to the camera.
5. Start the pose-detection process if a Start/Stop control is available.
6. Observe the detected body landmarks and skeleton overlay.
7. Use the available controls to adjust visualization or detection settings.
8. Experiment with different yoga poses and observe the detected landmarks.

---

## 🎛️ Application Controls

Depending on the implemented version, the application may provide controls such as:

### Start / Stop Detection

Starts or stops the real-time pose-detection loop.

### Model Selection

Allows users to choose between available model configurations where supported.

### Confidence Threshold

Controls the minimum confidence required for a landmark to be displayed or considered during analysis.

### Snapshot

Captures the current visualized pose where the snapshot functionality is enabled.

---

## 🔐 Security & Privacy

Privacy is an important part of the application's architecture.

### Local Video Processing

The core application is designed to process webcam frames locally within the browser.

```text
Webcam
   │
   ▼
Browser
   │
   ▼
Pose Model
   │
   ▼
Local Analysis
   │
   ▼
Visualization
```

No video upload to a remote server is required for the core pose-detection workflow.

### Important Note

If future versions introduce server-side processing, cloud storage, analytics, authentication, or other external services, the application's privacy documentation should be updated accordingly and users should be informed about any collected data.

---

## 🧪 Troubleshooting

### Webcam Not Working

If the camera does not appear:

* Make sure your browser has camera permission.
* Check whether another application is currently using the webcam.
* Verify browser site permissions.
* Make sure the application is running through `localhost` or another secure context rather than directly from a `file://` URL.

### Pose Model Not Loading

Open the browser's Developer Tools:

```text
F12 → Console
```

Check for:

* Network errors
* Missing scripts
* Incorrect CDN URLs
* Model-loading errors
* JavaScript exceptions

### Detection Is Slow

Real-time pose estimation can be computationally demanding.

Possible improvements include:

* Reducing webcam resolution
* Using a lighter model
* Reducing inference frequency
* Optimizing canvas rendering
* Processing fewer frames per second

---

## 📦 Deployment

The project can be deployed using static hosting because the core application does not require a dedicated backend.

### GitHub Pages

The repository is available at:

```text
https://github.com/Juhisahi/yoga-intellij
```

To deploy using GitHub Pages:

1. Open the repository on GitHub.
2. Go to **Settings**.
3. Select **Pages**.
4. Under the deployment configuration, select:

   * Branch: `main`
   * Folder: `/ (root)`
5. Save the configuration.
6. Wait for GitHub to complete the deployment.

The application can then be accessed through the GitHub Pages URL associated with the repository.

> Webcam functionality may require an appropriate secure context depending on the browser and deployment configuration.

---

## 🔮 Future Enhancements

The current project provides a foundation that can be extended into a more comprehensive yoga and fitness platform.

### 🧘 Automated Asana Classification

Implement a classification system capable of recognizing specific yoga poses based on detected body landmarks.

### 📐 Advanced Posture Analysis

Calculate joint angles and compare them against expected ranges for individual asanas.

Example:

```text
Shoulder Angle
      +
Elbow Angle
      +
Hip Angle
      +
Knee Angle
      ↓
Pose Evaluation
```

### 🎯 Real-Time Correction

Provide personalized feedback such as:

* Adjust your knee position
* Straighten your back
* Raise your arm
* Improve your balance
* Maintain the current position

### 🔊 Voice Guidance

Integrate the Web Speech API to provide hands-free instructions and feedback.

### 📈 Session Analytics

Track information such as:

* Session duration
* Detected poses
* Pose confidence
* Repetition counts
* Accuracy trends

This feature would require appropriate storage and privacy considerations.

### 📱 Responsive Design

Improve the interface for smartphones and tablets so users can practice yoga using mobile cameras.

### 🤖 Advanced AI Guidance

Future versions could combine pose detection with an AI-powered assistant capable of explaining yoga poses and providing contextual guidance.

---

## 🎓 Learning Objectives

This project demonstrates practical implementation of several important software-development concepts:

* Browser-based computer vision
* Client-side machine learning
* Real-time video processing
* JavaScript modular architecture
* HTML5 Canvas rendering
* Webcam integration using browser APIs
* Pose landmark processing
* User-interface interaction
* Privacy-conscious application design
* Static web application deployment

---

## 💡 Use Cases

Yoga IntelliJ can serve as a foundation for:

* Personal yoga practice
* Computer-vision experiments
* Fitness applications
* Pose-estimation demonstrations
* Machine-learning learning projects
* Browser-based health and fitness tools
* Educational demonstrations of client-side AI

---


## 👨‍💻 Author

**Juhi Sahi**

GitHub:
https://github.com/Juhisahi

Project Repository:
https://github.com/Juhisahi/yoga-intellij

---

## ⭐ Project Highlights

> **Real-Time • Browser-Based • Privacy-Focused • Computer Vision • Client-Side ML**

Yoga IntelliJ demonstrates how modern browser capabilities and machine-learning techniques can be combined to build an interactive, privacy-conscious real-time pose-detection experience without requiring server-side video processing.

If you find the project useful or interesting, consider giving the repository a ⭐ on GitHub.
