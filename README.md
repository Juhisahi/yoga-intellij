# Yoga IntelliJ Website

A browser-based yoga pose detection web app built with client-side JavaScript. The app captures webcam video, runs a pose-estimation model in the browser, visualizes detected keypoints and skeletons, and provides simple guidance for common yoga asanas.

## Purpose
- Provide an accessible, privacy-friendly way to experiment with real-time pose detection in the browser (no server-side video processing).
- Demonstrate how to integrate a pose-estimation model with a visualizer and simple interaction flow.
- Serve as a learning/demo project for computer-vision, Web APIs (MediaDevices, Canvas), and client-side ML (TensorFlow.js or compatible models).

## Benefits
- Privacy-first: video frames are processed locally in the browser and are not uploaded to a server.
- Lightweight and easy to run: static files only — no backend required.
- Educational: code is split into clear modules (`pose-estimation.js`, `poseDetector.js`, `poseVisualizer.js`) so you can learn or extend specific parts.
- Portable: can be hosted on GitHub Pages or any static hosting provider.

## What this project includes (files and roles)
- `index.html` — Main page, loads scripts and provides the UI elements (video, canvas, controls).
- `styles.css` — Styling for layout and controls.
- `script.js` — App initialization, camera permission flow, and wiring between UI and detection loop.
- `chatbot.js` — Optional chatbot or scripted guidance UI for interaction with the user.
- `pose_detection.js` — Frame loop and high-level detection orchestration.
- `pose-estimation.js` — Model setup and model-specific configuration (loading weights, runtime options).
- `poseDetector.js` — Utility wrapper that runs inference on a frame and returns keypoints and confidence scores.
- `poseVisualizer.js` — Drawing routines for keypoints, skeleton, bounding boxes and textual overlays.
- `images/` — Static images used by the site (example: `prithvimudra`).

## How it works (detailed)
1. The user opens the page and grants webcam access (via `navigator.mediaDevices.getUserMedia`).
2. `pose-estimation.js` loads the chosen pose model (for example, a TensorFlow.js or MediaPipe model) and prepares the inference pipeline.
3. The main loop in `pose_detection.js` captures frames from the video element and passes them to `poseDetector.js` for inference.
4. Inference returns a list of keypoints (x, y, confidence) and skeleton connections; `poseVisualizer.js` draws these on a canvas layered over the video.
5. The UI (in `script.js`) can compute simple metrics (e.g., body angles, confidence thresholds) and display feedback or highlight deviations from expected poses.

## How to use (step-by-step)
1. Open a terminal in the project root or use the system file explorer to locate the folder.
2. For best results serve the files over HTTP (some browsers block camera access for `file://` pages):

```powershell
# From project root
# Using Python 3 built-in server
python -m http.server 8000

# or, if you prefer Node.js
npx http-server -p 8000
```

3. Open `http://localhost:8000` in Chrome, Edge, or Firefox (modern browsers preferred).
4. Allow webcam access when the browser prompts.
5. You should see the live video and an overlay showing detected keypoints and lines connecting them. Use the UI controls (if present) to start/stop detection or change visualization options.

## Typical controls and UX
- Start/Stop: toggles the detection loop.
- Model options: if implemented, pick different model backends or quality/performance trade-offs.
- Confidence threshold: hide low-confidence keypoints.
- Take snapshot: capture the current canvas as an image.

## Troubleshooting
- No camera feed: make sure no other app is using the webcam, and that you granted permissions. Check browser camera permissions in site settings.
- Model fails to load: open DevTools Console (F12) to view network errors or missing CDN links. Ensure your internet connection works if loading models from CDN.
- Slow inference: try a smaller model or reduce input resolution in `pose-estimation.js`.

## Deploying (GitHub Pages)
1. Push code to a GitHub repository (the repo is already available at `https://github.com/Juhisahi/yoga-intellij`).
2. In the repository on GitHub: Settings → Pages → Choose branch `main` and folder `/ (root)` → Save.
3. After a few minutes the site will be available at `https://<username>.github.io/<repo>`.

## Security and Privacy
- No video frames are sent to any server by default — everything runs locally in the user’s browser.
- If you add server-side features later, document any data collection and obtain user consent.

## Extending the project
- Add pose classification to recognize specific asanas (train a small classifier using keypoint angles).
- Add audio guidance or feedback using Web Speech API.
- Add a recording system to save session statistics (requires a server or cloud storage).

## Contributing
- Feel free to open issues or pull requests. For code changes: fork → branch → PR. Describe the goal and include screenshots or short GIFs for UI changes.

## License
Add a LICENSE file if you want to publish under a specific open-source license (MIT, Apache-2.0, etc.).

## Contact / Next steps
- If you want, I can:
  - add a recommended `.gitignore` and commit it,
  - enable GitHub Pages for this repo and verify the site, or
  - help tune the detection pipeline (change model, resolution, or thresholds).

Open `README.md` in the project root for this document.
