// Select HTML elements
const startButton = document.getElementById('start-recording');
const transcriptDiv = document.getElementById('transcript');
const translationDiv = document.getElementById('translation');
const speakButton = document.getElementById('speak-translation');

// Initialize Speech Recognition (Web Speech API)
let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';

// Start recording on button click
startButton.onclick = () => {
    console.log("Requesting microphone access...");
    recognition.start();
};

// Handle the result of voice-to-text conversion
recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    transcriptDiv.textContent = `Transcript: ${transcript}`;
    console.log("Transcript received:", transcript); // Log the received transcript

    // Send transcript to the backend for translation
    fetch('/translate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: transcript, targetLang: 'es' }) // Example: translating to Spanish
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Received translation data:", data); // Log the received data
        if (data.translation) {
            // Display the translated text
            translationDiv.textContent = `Translation: ${data.translation}`;
            console.log("Translation:", data.translation);
        } else {
            console.warn("No translation found in the response.");
            translationDiv.textContent = "Translation: No translation available."; // Update the UI accordingly
        }
    })
    .catch(error => console.error('Error in translation:', error));
};

// Handle recognition errors
recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
};

// Add functionality for the "Speak Translation" button
speakButton.onclick = () => {
    const translationText = translationDiv.textContent.replace('Translation: ', '').trim();
    console.log("Translation ready to be spoken:", translationText);

    if (translationText) {
        const utterance = new SpeechSynthesisUtterance(translationText);
        utterance.lang = 'es'; // Set to target language code, e.g., 'es' for Spanish

        // Event listeners for speech synthesis
        utterance.onstart = () => {
            console.log("Speech synthesis started.");
        };

        utterance.onend = () => {
            console.log("Speech synthesis ended.");
        };

        utterance.onerror = (event) => {
            console.error("Speech synthesis error:", event.error);
        };

        window.speechSynthesis.speak(utterance);
        console.log("Playing translation...");
    } else {
        console.warn("No translation available for playback.");
        const fallbackUtterance = new SpeechSynthesisUtterance("No translation available to play.");
        window.speechSynthesis.speak(fallbackUtterance);
    }
};
