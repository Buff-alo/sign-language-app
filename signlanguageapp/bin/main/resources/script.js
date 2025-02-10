// DOM Elements
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const clearBtn = document.getElementById('clearBtn');
const transcriptText = document.getElementById('transcriptText');
const imageDisplay = document.getElementById('imageDisplay');

// Valid words for image matching
const validWords = ['hello', 'how', 'world', 'you', 'are', 'good', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'space']; // Add more words as needed
const imagesFolder = './images/'; // Folder for images
const displayedImages = new Set(); // Track displayed images

// Speech Recognition API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
  transcriptText.value = 'Your browser does not support Speech Recognition API.';
  throw new Error('Speech Recognition API not supported');
}

const recognition = new SpeechRecognition();
recognition.lang = 'en-US';
recognition.continuous = true;
recognition.interimResults = true;

// Handle Speech Recognition Results
recognition.onresult = (event) => {
  let transcript = '';
  for (let i = event.resultIndex; i < event.results.length; i++) {
    transcript += event.results[i][0].transcript;
  }

  // Trim and update the transcript
  const trimmedTranscript = transcript.trim();
  updateTranscript(trimmedTranscript);
  processWords(trimmedTranscript);
};

// Update Transcription Text Area
function updateTranscript(transcript) {
  transcriptText.value += ' ' + transcript; // Append the text in the text area
}

// Process Words and Display Matching Images
function processWords(transcript) {
  const words = transcript.toLowerCase().split(/\s+/); // Split transcript into words
  words.forEach((word) => {
    if (validWords.includes(word)) {
      displayImage(word);
    }
  });
}

// Display an Image for a Given Word
function displayImage(word) {
  const imageExtensions = ['jpg', 'png', 'gif']; // Supported image extensions
  imageExtensions.forEach((ext) => {
    const img = new Image();
    img.src = `${imagesFolder}${word}.${ext}`; // Dynamically set the image source
    img.alt = word;
    img.onerror = () => img.remove(); // Remove image if it fails to load
    imageDisplay.appendChild(img);
  });
}

// Event Listeners
startBtn.addEventListener('click', () => recognition.start());
stopBtn.addEventListener('click', () => recognition.stop());
clearBtn.addEventListener('click', () => {
  transcriptText.value = ''; // Clear transcript
  imageDisplay.innerHTML = ''; // Clear images
  displayedImages.clear(); // Reset displayed images
});


