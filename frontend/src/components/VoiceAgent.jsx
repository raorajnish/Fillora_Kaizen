import React, { useState, useEffect, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import axios from 'axios';
import './VoiceAgent.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Polyfill for Chrome extension context
if (typeof window !== 'undefined' && !window.SpeechRecognition && window.webkitSpeechRecognition) {
  window.SpeechRecognition = window.webkitSpeechRecognition;
}

function VoiceAgent({ user }) {
  const [isListening, setIsListening] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const chatEndRef = useRef(null);
  const synthRef = useRef(null);

  const {
    transcript: liveTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
    
    // Load chat history on mount
    loadChatHistory();
    
    // Welcome message
    if (user && browserSupportsSpeechRecognition) {
      setTimeout(() => {
        addMessage('assistant', "Hello! I'm your voice assistant. How can I help you today?");
      }, 500);
    }
  }, [user]);

  useEffect(() => {
    if (listening) {
      setIsListening(true);
    } else if (isListening && !listening) {
      setIsListening(false);
    }
  }, [listening, isListening]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const getAuthToken = async () => {
    return new Promise((resolve) => {
      chrome.storage.local.get(['authToken'], (result) => {
        resolve(result.authToken);
      });
    });
  };

  const loadChatHistory = async () => {
    try {
      const token = await getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/api/chat/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 50 },
      });
      
      if (response.data.history) {
        const messages = response.data.history.map(chat => ({
          role: chat.role,
          message: chat.message,
          timestamp: chat.created_at,
        }));
        setChatMessages(messages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const addMessage = (role, message) => {
    const newMessage = {
      role,
      message,
      timestamp: new Date().toISOString(),
    };
    setChatMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const saveChatMessage = async (role, message, url = '') => {
    try {
      const token = await getAuthToken();
      await axios.post(
        `${API_BASE_URL}/api/chat/`,
        { message, url },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    setLoading(true);
    const userMessage = messageText.trim();
    addMessage('user', userMessage);

    try {
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const url = tabs[0]?.url || '';
        await saveChatMessage('user', userMessage, url);

        const token = await getAuthToken();
        const response = await axios.post(
          `${API_BASE_URL}/api/chat/`,
          { message: userMessage, url },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.message) {
          const aiMessage = response.data.message;
          addMessage('assistant', aiMessage);
          await saveChatMessage('assistant', aiMessage, url);
          speakMessage(aiMessage);
        }

        setLoading(false);
      });
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    // When voice input stops and we have a transcript, send it
    if (!listening && isListening && liveTranscript && liveTranscript.trim()) {
      const transcript = liveTranscript.trim();
      sendMessage(transcript);
      resetTranscript();
    }
  }, [listening, isListening, liveTranscript]);

  const toggleListening = () => {
    if (!browserSupportsSpeechRecognition) {
      addMessage('assistant', 'Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      SpeechRecognition.stopListening();
      setIsListening(false);
      // The useEffect will handle sending the message when listening stops
    } else {
      SpeechRecognition.startListening({ continuous: true, interimResults: true });
      setIsListening(true);
    }
  };

  const handleScrape = async () => {
    setScraping(true);
    addMessage('assistant', 'Scraping page and analyzing with AI...');

    try {
      const token = await getAuthToken();
      
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        try {
          const [result] = await chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: () => {
              return {
                url: window.location.href,
                title: document.title,
                html: document.documentElement.outerHTML,
              };
            },
          });

          const pageData = result.result;

          // Prepare chat history for context
          const historyForLLM = chatMessages.map((msg) => ({
            role: msg.role,
            message: msg.message,
          }));

          // Send to backend for LLM analysis (includes profile data)
          const response = await axios.post(
            `${API_BASE_URL}/api/analyze/`,
            {
              url: pageData.url,
              html: pageData.html,
              chat_history: historyForLLM,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (response.data.fields && response.data.fields.length > 0) {
            const fieldsMsg = `Found ${response.data.fields.length} form fields:\n${response.data.fields.map(f => `- ${f.name}: ${f.value || 'N/A'}`).join('\n')}`;
            addMessage('assistant', fieldsMsg);
            await saveChatMessage('assistant', fieldsMsg, pageData.url);
            
            // Auto-fill the form
            setTimeout(() => {
              fillForm(response.data);
            }, 1000);
          } else {
            const noFieldsMsg = 'No form fields detected on this page.';
            addMessage('assistant', noFieldsMsg);
            await saveChatMessage('assistant', noFieldsMsg, pageData.url);
          }
        } catch (error) {
          console.error('Error scraping page:', error);
          addMessage('assistant', 'Error scraping page. Please try again.');
        } finally {
          setScraping(false);
        }
      });
    } catch (error) {
      console.error('Error:', error);
      addMessage('assistant', 'Error processing request. Please try again.');
      setScraping(false);
    }
  };

  const fillForm = async (data) => {
    addMessage('assistant', 'Filling form...');

    try {
      const token = await getAuthToken();
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        await chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: (fillData) => {
            const setValueAndNotify = (el, value) => {
              if (!el) return;
              try {
                const proto =
                  el.tagName === 'TEXTAREA'
                    ? window.HTMLTextAreaElement.prototype
                    : window.HTMLInputElement.prototype;
                const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
                if (setter) setter.call(el, String(value));
                else el.value = String(value);
              } catch (_) {
                try {
                  el.value = String(value);
                } catch (_) {}
              }
              el.dispatchEvent(new Event('input', { bubbles: true }));
              el.dispatchEvent(new Event('change', { bubbles: true }));
              el.dispatchEvent(new Event('blur', { bubbles: true }));
            };

            fillData.fields.forEach((field) => {
              const selector = field.selector || `[name="${field.name}"], #${field.name}, input[name*="${field.name}" i]`;
              const element = document.querySelector(selector);
              if (element && field.value) {
                setValueAndNotify(element, field.value);
              }
            });
          },
          args: [data],
        });

        // Save to backend
        await axios.post(
          `${API_BASE_URL}/api/fill-form/`,
          {
            url: data.url,
            website: new URL(data.url).hostname,
            fields: data.fields,
            user_id: user.id,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const successMsg = 'Form filled successfully!';
        addMessage('assistant', successMsg);
        await saveChatMessage('assistant', successMsg, data.url);
      });
    } catch (error) {
      console.error('Error filling form:', error);
      addMessage('assistant', 'Error filling form. Please try again.');
    }
  };

  const speakMessage = (text) => {
    if (synthRef.current && text) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      synthRef.current.speak(utterance);
    }
  };

  const handleSend = () => {
    if (textInput.trim()) {
      sendMessage(textInput);
      setTextInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="voice-agent">
        <div className="error-state">
          <p>Speech recognition is not supported in this browser.</p>
          <p>Please use Chrome or Edge.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="voice-agent">
      {/* Chat Display Area */}
      <div className="chat-display">
        {chatMessages.length === 0 ? (
          <div className="chat-empty">
            <p>Start a conversation by typing or using voice</p>
          </div>
        ) : (
          <div className="chat-messages">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.role}`}>
                <div className="chat-message-content">
                  {msg.role === 'user' ? (
                    <div className="message-bubble user-bubble">
                      {msg.message}
                    </div>
                  ) : (
                    <div className="message-bubble assistant-bubble">
                      {msg.message}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-message assistant">
                <div className="message-bubble assistant-bubble">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            {isListening && liveTranscript && (
              <div className="chat-message user">
                <div className="message-bubble user-bubble interim">
                  {liveTranscript}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="voice-agent-bottom">
        {/* Action Buttons */}
        <div className="action-buttons-row">
          <button
            className="btn-action btn-capture"
            disabled
            title="Capture (Coming soon)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
            Capture
          </button>
          <button
            className="btn-action btn-scrape"
            onClick={handleScrape}
            disabled={scraping}
          >
            {scraping ? (
              <>
                <div className="spinner-small"></div>
                Scraping...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                Scrape
              </>
            )}
          </button>
        </div>

        {/* Input Section */}
        <div className="input-section">
          <button
            className={`mic-button-small ${isListening ? 'listening' : ''}`}
            onClick={toggleListening}
            title={isListening ? 'Stop listening' : 'Start voice input'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {isListening ? (
                <>
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </>
              ) : (
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              )}
            </svg>
          </button>
          <input
            type="text"
            className="text-input"
            placeholder="Ask me anything..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <button
            className="btn-send"
            onClick={handleSend}
            disabled={loading || !textInput.trim()}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default VoiceAgent;
