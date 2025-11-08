// Speech Recognition hook for Chrome Extension
// This file provides a polyfill for react-speech-recognition in extension context

let recognition = null;

if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
  recognition = new window.webkitSpeechRecognition();
} else if (typeof window !== 'undefined' && 'SpeechRecognition' in window) {
  recognition = new window.SpeechRecognition();
}

export const SpeechRecognition = recognition
  ? {
      startListening: (options = {}) => {
        if (recognition) {
          recognition.continuous = options.continuous || false;
          recognition.interimResults = options.interimResults || false;
          recognition.lang = options.language || 'en-US';
          recognition.start();
        }
      },
      stopListening: () => {
        if (recognition) {
          recognition.stop();
        }
      },
      abortListening: () => {
        if (recognition) {
          recognition.abort();
        }
      },
    }
  : null;

export default recognition;

