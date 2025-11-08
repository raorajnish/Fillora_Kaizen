import React from 'react';
import { SpeechRecognitionProvider as SRProvider } from 'react-speech-recognition';

// Wrapper component to provide speech recognition context
export const SpeechRecognitionProvider = ({ children }) => {
  // Use the provider from react-speech-recognition
  // If it fails, React's error boundary will catch it
  return <SRProvider>{children}</SRProvider>;
};

