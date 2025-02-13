document.addEventListener("DOMContentLoaded", () => {
    const enableWebcamButton = document.getElementById("webcamButton");
    const video = document.getElementById("webcam");

    function hasGetUserMedia() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }

    if (hasGetUserMedia()) {
        enableWebcamButton.addEventListener("click", () => {
            const constraints = { video: true };
            navigator.mediaDevices.getUserMedia(constraints)
                .then((stream) => {
                    video.srcObject = stream;
                })
                .catch((err) => {
                    console.error("Error accessing webcam: ", err);
                });
        });
    } else {
        alert("Webcam not supported in this browser.");
    }
});
