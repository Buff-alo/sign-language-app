"use strict";

import * as tasks_vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/+esm";

const demosSection = document.getElementById("demos");
let gestureRecognizer;
let runningMode = "VIDEO";
let videoElement = document.createElement("video");
let canvasElement = document.createElement("canvas");
let textArea = document.createElement("textarea");
let canvasCtx = canvasElement.getContext("2d");

document.body.appendChild(videoElement);
document.body.appendChild(canvasElement);
document.body.appendChild(textArea);

canvasElement.classList.add("output_canvas");
textArea.id = "gestureText";

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

async function predictGestures() {
    if (!gestureRecognizer || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
        requestAnimationFrame(predictGestures);
        return;
    }

    const results = await gestureRecognizer.recognizeForVideo(videoElement, performance.now());

    if (results.landmarks) {
        drawLandmarks(results.landmarks);
    }

    if (results.gestures.length > 0) {
        textArea.value = `Gesture: ${results.gestures[0][0].categoryName}, Confidence: ${(results.gestures[0][0].score * 100).toFixed(2)}%`;
    }

    requestAnimationFrame(predictGestures);
}

function drawLandmarks(landmarks) {
    if (!landmarks || landmarks.length === 0) return;

    // Match canvas size with video
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    // Set transparency
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    landmarks.forEach((landmarkSet) => {
        landmarkSet.forEach((landmark) => {
            canvasCtx.beginPath();
            canvasCtx.arc(landmark.x * canvasElement.width, landmark.y * canvasElement.height, 5, 0, 2 * Math.PI);
            canvasCtx.fillStyle = "red";
            canvasCtx.fill();
        });

        for (let i = 0; i < landmarkSet.length - 1; i++) {
            canvasCtx.beginPath();
            canvasCtx.moveTo(landmarkSet[i].x * canvasElement.width, landmarkSet[i].y * canvasElement.height);
            canvasCtx.lineTo(landmarkSet[i + 1].x * canvasElement.width, landmarkSet[i + 1].y * canvasElement.height);
            canvasCtx.strokeStyle = "blue";
            canvasCtx.lineWidth = 2;
            canvasCtx.stroke();
        }
    });
}


export {};
