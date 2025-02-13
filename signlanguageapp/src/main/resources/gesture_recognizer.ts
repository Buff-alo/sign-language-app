import {
    GestureRecognizer,
    FilesetResolver,
    DrawingUtils,
} from "@mediapipe/tasks-vision";

const demosSection = document.getElementById("demos");
let gestureRecognizer: GestureRecognizer;
let runningMode = "IMAGE";
let enableWebcamButton: HTMLButtonElement;
let webcamRunning = false;

const createGestureRecognizer = async () => {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );
    gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: "gesture_recognizer.task",
            delegate: "GPU",
        },
        runningMode: runningMode,
    });
    demosSection?.classList.remove("invisible");
};
createGestureRecognizer();

const imageContainers = document.getElementsByClassName("detectOnClick");
for (let i = 0; i < imageContainers.length; i++) {
    (imageContainers[i] as HTMLElement).children[0].addEventListener(
        "click",
        handleClick
    );
}

async function handleClick(event: Event) {
    if (!gestureRecognizer) {
        alert("Please wait for gestureRecognizer to load");
        return;
    }
    if (runningMode === "VIDEO") {
        runningMode = "IMAGE";
        await gestureRecognizer.setOptions({ runningMode: "IMAGE" });
    }
    const results = gestureRecognizer.recognize(
        event.target as HTMLImageElement
    );
    if (results.gestures.length > 0) {
        const p = (event.target as HTMLElement).parentNode?.querySelector("p");
        if (p) {
            p.innerText = `Gesture: ${results.gestures[0][0].categoryName}, Confidence: ${(
                results.gestures[0][0].score * 100
            ).toFixed(2)}%`;
            p.classList.remove("removed");
        }
    }
}
