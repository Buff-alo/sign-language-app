"use strict";

import * as tasks_vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/+esm";

const demosSection = document.getElementById("demos");
const videoElement = document.getElementById("input_video");
const canvasElement = document.getElementById("output_canvas");
const textArea = document.getElementById("gesture_output");
const DEBOUNCE_INTERVAL = 2000;      // ms
const debounceProgress = document.getElementById('debounceProgress');


document.getElementById("status").textContent = "Model loaded. Ready!";
let sentence = "";
let lastGesture = ""; // Track the last gesture to avoid duplicates

document.getElementById("clearButton").addEventListener("click", () => {
    sentence = "";
    lastGesture = "";
    textArea.textContent = "Sentence: ";
});

let gestureRecognizer;
let runningMode = "VIDEO";
let canvasCtx = canvasElement.getContext("2d");

document.body.appendChild(videoElement);
document.body.appendChild(canvasElement);
document.body.appendChild(textArea);
document.body.appendChild(document.createElement("br"));
document.body.appendChild(clearButton);

canvasElement.classList.add("output_canvas");
textArea.id = "gestureText";

document.getElementById("webcamButton").addEventListener("click", async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = stream;
        videoElement.setAttribute("playsinline", "");
        videoElement.setAttribute("autoplay", "true");

        await new Promise((resolve) => {
            videoElement.onloadedmetadata = () => {
                videoElement.play().then(resolve).catch((err) => {
                    console.error("Error starting video playback:", err);
                });
            };
        });

        predictGestures();
    } catch (err) {
        console.error("Error accessing webcam: ", err);
    }
});

const createGestureRecognizer = async () => {
    const vision = await tasks_vision.FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );
    gestureRecognizer = await tasks_vision.GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: "/gesture_recognizer.task",
            delegate: "GPU",
            useGpuInference: true,
            optimizeForPerformance: true,
        },
        runningMode: runningMode,
        customGestureClassifier: null,
    });
    demosSection?.classList.remove("invisible");
};

createGestureRecognizer();

let lastGestureTime = 0; // Debounce timer setup

async function predictGestures() {
    try {
        if (!gestureRecognizer || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
            requestAnimationFrame(predictGestures);
            return;
        }

        const results = await gestureRecognizer.recognizeForVideo(videoElement, performance.now());

        if (results.landmarks) {
            drawLandmarks(results.landmarks);
        }

        const now = Date.now();

        if (results.gestures.length > 0) {
            const currentGesture = results.gestures[0][0].categoryName;

            // Avoid processing the same gesture consecutively (debounce)
            if (currentGesture !== lastGesture && (now - lastGestureTime) > 2000) {
                if (currentGesture === "new_line") {
                    sentence += "\n";
                } else if (currentGesture === "period") {
                    sentence += ".";
                } else if (currentGesture === "e1" || currentGesture === "e2") {
                    sentence += " ";
                } else if (!["none"].includes(currentGesture)) {
                    sentence += currentGesture;
                }

                lastGesture = currentGesture;
                lastGestureTime = now;
                animateDebounce();
            }

            textArea.textContent = `Sentence: ${sentence}`;
        } else {
            lastGesture = "";
        }
    } catch (error) {
        console.error("Error in predictGestures loop:", error);
    }

    requestAnimationFrame(predictGestures);
}

function drawLandmarks(landmarks) {
    if (!landmarks || landmarks.length === 0 || !canvasElement || !canvasCtx) return;

    // Set canvas dimensions to match video stream
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    
    // Clear previous frame
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Configuration for different hand parts
    const landmarkConfig = {
        palm: { indices: [0, 1, 5, 9, 13, 17], color: '#FF0000', size: 6 },
        thumb: { indices: [1, 2, 3, 4], color: '#00FF00', size: 5 },
        index: { indices: [5, 6, 7, 8], color: '#0000FF', size: 5 },
        middle: { indices: [9, 10, 11, 12], color: '#FF00FF', size: 5 },
        ring: { indices: [13, 14, 15, 16], color: '#FFFF00', size: 5 },
        pinky: { indices: [17, 18, 19, 20], color: '#00FFFF', size: 5 },
        connections: {
            color: '#FFFFFF',
            width: 2,
            pairs: [
                [0, 1], [1, 2], [2, 3], [3, 4],
                [0, 5], [5, 6], [6, 7], [7, 8],
                [0, 9], [9, 10], [10, 11], [11, 12],
                [0, 13], [13, 14], [14, 15], [15, 16],
                [0, 17], [17, 18], [18, 19], [19, 20],
                [5, 9], [9, 13], [13, 17]
            ]
        }
    };

    landmarks.forEach(landmarkSet => {
        // Draw connections first with safety checks
        canvasCtx.beginPath();
        landmarkConfig.connections.pairs.forEach(pair => {
            const start = landmarkSet[pair[0]];
            const end = landmarkSet[pair[1]];
            
            if (start && end) {
                // Clamp coordinates to canvas dimensions
                const startX = Math.max(0, Math.min(start.x * canvasElement.width, canvasElement.width));
                const startY = Math.max(0, Math.min(start.y * canvasElement.height, canvasElement.height));
                const endX = Math.max(0, Math.min(end.x * canvasElement.width, canvasElement.width));
                const endY = Math.max(0, Math.min(end.y * canvasElement.height, canvasElement.height));
                
                canvasCtx.moveTo(startX, startY);
                canvasCtx.lineTo(endX, endY);
            }
        });
        canvasCtx.strokeStyle = landmarkConfig.connections.color;
        canvasCtx.lineWidth = landmarkConfig.connections.width;
        canvasCtx.stroke();

        // Draw landmarks with validation
        Object.entries(landmarkConfig).forEach(([key, config]) => {
            if (key === 'connections') return;

            config.indices.forEach(index => {
                const landmark = landmarkSet[index];
                if (!landmark || typeof landmark.x !== 'number' || typeof landmark.y !== 'number') return;

                // Safe radius calculation
                const baseSize = config.size || 3;
                const depthSize = Math.max(
                    Math.abs(baseSize * (1 + landmark.z * 2)), // Reduced z multiplier
                    2 // Minimum radius to prevent invisible dots
                );

                // Clamp coordinates to canvas boundaries
                const x = Math.max(0, Math.min(landmark.x * canvasElement.width, canvasElement.width));
                const y = Math.max(0, Math.min(landmark.y * canvasElement.height, canvasElement.height));

                canvasCtx.beginPath();
                canvasCtx.arc(x, y, depthSize, 0, 2 * Math.PI);
                canvasCtx.fillStyle = config.color;
                canvasCtx.fill();
                
                // Outline with safety check
                if (depthSize > 0) {
                    canvasCtx.strokeStyle = '#000000';
                    canvasCtx.lineWidth = 1;
                    canvasCtx.stroke();
                }
            });
        });
    });
}
function animateDebounce() {
    // reset instantly
    debounceProgress.style.transition = 'none';
    debounceProgress.style.width = '0%';
    
    // next frame, animate to 100% over DEBOUNCE_INTERVAL
    requestAnimationFrame(() => {
      debounceProgress.style.transition = `width ${DEBOUNCE_INTERVAL}ms linear`;
      debounceProgress.style.width = '100%';
    });
  }
  

export {};
