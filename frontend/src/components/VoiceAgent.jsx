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
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('Click the mic to start');
  const [formData, setFormData] = useState(null);
  const [showFieldEditor, setShowFieldEditor] = useState(false);
  const [editingMode, setEditingMode] = useState(null); // 'update' | 'create' | null
  const [waitingForFieldInput, setWaitingForFieldInput] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
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
    
    // Auto-start listening after login
    if (user && browserSupportsSpeechRecognition) {
      setTimeout(() => {
        speakMessage("Hello! I'm your voice assistant. How can I help you today?");
        setMessage("Hello! I'm your voice assistant. How can I help you today?");
      }, 500);
    }
  }, [user]);

  useEffect(() => {
    if (listening) {
      setIsListening(true);
      setStatus('listening');
    } else if (isListening && !listening) {
      setIsListening(false);
    }
  }, [listening, isListening]);

  useEffect(() => {
    if (liveTranscript && !waitingForFieldInput) {
      setTranscript(liveTranscript);
      handleVoiceCommand(liveTranscript);
    } else if (liveTranscript && waitingForFieldInput) {
      setTranscript(liveTranscript);
      handleFieldInput(liveTranscript);
    }
  }, [liveTranscript, waitingForFieldInput]);

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
        params: { limit: 20 },
      });
      setChatHistory(response.data.history || []);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const saveToChatHistory = async (role, message, url = '') => {
    try {
      const token = await getAuthToken();
      await axios.post(
        `${API_BASE_URL}/api/chat/`,
        { message, url },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChatHistory((prev) => [...prev, { role, message }]);
    } catch (error) {
      console.error('Error saving to chat history:', error);
    }
  };

  const sendChatMessage = async (userMessage, url = '') => {
    try {
      const token = await getAuthToken();
      const response = await axios.post(
        `${API_BASE_URL}/api/chat/`,
        { message: userMessage, url },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const aiResponse = response.data.message;
      speakMessage(aiResponse);
      setMessage(aiResponse);
      
      setChatHistory((prev) => [
        ...prev,
        { role: 'user', message: userMessage },
        { role: 'assistant', message: aiResponse },
      ]);
      
      return aiResponse;
    } catch (error) {
      console.error('Error sending chat message:', error);
      const errorMsg = 'Sorry, I encountered an error. Please try again.';
      speakMessage(errorMsg);
      setMessage(errorMsg);
      return null;
    }
  };

  const parseFieldInput = (text) => {
    // Parse natural language input like:
    // "Update email to john@example.com"
    // "Change name to John Doe"
    // "Add phone number 1234567890"
    // "Create field address with value 123 Main St"
    
    const lowerText = text.toLowerCase();
    const words = text.split(/\s+/);
    
    // Try to extract field name and value
    let fieldName = null;
    let value = null;
    let selector = null;
    
    // Patterns for update
    if (lowerText.includes('update') || lowerText.includes('change') || lowerText.includes('modify')) {
      const updateMatch = text.match(/(?:update|change|modify)\s+(\w+)\s+(?:to|with|as)\s+(.+)/i);
      if (updateMatch) {
        fieldName = updateMatch[1];
        value = updateMatch[2].trim();
      }
    }
    
    // Patterns for create/add
    if (lowerText.includes('create') || lowerText.includes('add') || lowerText.includes('new')) {
      const createMatch = text.match(/(?:create|add|new)\s+(?:field\s+)?(\w+)(?:\s+with\s+value\s+|\s+as\s+|\s+to\s+)(.+)/i);
      if (createMatch) {
        fieldName = createMatch[1];
        value = createMatch[2].trim();
      }
    }
    
    // Fallback: try to find field name and value
    if (!fieldName || !value) {
      // Look for common field names
      const fieldPatterns = ['email', 'name', 'phone', 'address', 'city', 'state', 'zip', 'country', 'username', 'password'];
      for (const pattern of fieldPatterns) {
        if (lowerText.includes(pattern)) {
          fieldName = pattern;
          // Try to extract value after field name
          const valueMatch = text.match(new RegExp(`${pattern}\\s+(?:is|to|with|as)\\s+(.+?)(?:\\s+and|\\s+$|$)`, 'i'));
          if (valueMatch) {
            value = valueMatch[1].trim();
          } else {
            // Try to get next few words as value
            const fieldIndex = lowerText.indexOf(pattern);
            const afterField = text.substring(fieldIndex + pattern.length).trim();
            const valueWords = afterField.split(/\s+/).slice(0, 5).join(' ');
            if (valueWords) value = valueWords;
          }
          break;
        }
      }
    }
    
    // Generate selector if we have field name
    if (fieldName) {
      selector = `[name="${fieldName}"], #${fieldName}, input[name*="${fieldName}" i]`;
    }
    
    return { fieldName, value, selector };
  };

  const handleFieldInput = async (text) => {
    if (!formData || !editingMode) return;
    
    const parsed = parseFieldInput(text);
    
    if (!parsed.fieldName || !parsed.value) {
      const errorMsg = "I couldn't understand that. Please say something like 'Update email to john@example.com' or 'Add phone number 1234567890'.";
      speakMessage(errorMsg);
      setMessage(errorMsg);
      setWaitingForFieldInput(false);
      resetTranscript();
      return;
    }
    
    let updatedFields = [...(formData.fields || [])];
    
    if (editingMode === 'update') {
      // Find and update existing field
      const fieldIndex = updatedFields.findIndex(
        (f) => f.name?.toLowerCase() === parsed.fieldName.toLowerCase()
      );
      
      if (fieldIndex >= 0) {
        updatedFields[fieldIndex] = {
          ...updatedFields[fieldIndex],
          value: parsed.value,
          selector: parsed.selector || updatedFields[fieldIndex].selector,
        };
        const updateMsg = `Updated ${parsed.fieldName} to ${parsed.value}`;
        speakMessage(updateMsg);
        setMessage(updateMsg);
        await saveToChatHistory('user', `Update ${parsed.fieldName} to ${parsed.value}`);
        await saveToChatHistory('assistant', updateMsg);
      } else {
        const notFoundMsg = `Field ${parsed.fieldName} not found. Would you like to create it instead?`;
        speakMessage(notFoundMsg);
        setMessage(notFoundMsg);
        setWaitingForFieldInput(false);
        resetTranscript();
        return;
      }
    } else if (editingMode === 'create') {
      // Add new field
      updatedFields.push({
        name: parsed.fieldName,
        selector: parsed.selector,
        value: parsed.value,
        type: 'text',
      });
      const createMsg = `Added new field ${parsed.fieldName} with value ${parsed.value}`;
      speakMessage(createMsg);
      setMessage(createMsg);
      await saveToChatHistory('user', `Create field ${parsed.fieldName} with value ${parsed.value}`);
      await saveToChatHistory('assistant', createMsg);
    }
    
    setFormData({ ...formData, fields: updatedFields });
    setWaitingForFieldInput(false);
    setEditingMode(null);
    resetTranscript();
    
    // Ask if more changes needed
    setTimeout(() => {
      const continueMsg = 'Field updated. Would you like to make more changes, or fill the form?';
      speakMessage(continueMsg);
      setMessage(continueMsg);
    }, 1000);
  };

  const extractAndAnalyzePage = async () => {
    try {
      setStatus('processing');
      setMessage('Scraping page and analyzing with AI...');
      speakMessage('Scraping page and analyzing with AI...');
      
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
          const historyForLLM = chatHistory.map((chat) => ({
            role: chat.role,
            message: chat.message,
          }));

          // Send to backend for LLM analysis
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
            setFormData({
              ...response.data,
              url: pageData.url,
            });
            setShowFieldEditor(true);
            setStatus('editing');
            
            const displayMsg = `Found ${response.data.fields.length} form fields. Here's what I found:`;
            setMessage(displayMsg);
            speakMessage(displayMsg);
            
            // Display fields after a moment
            setTimeout(() => {
              const fieldsMsg = response.data.fields.map(f => `${f.name}: ${f.value}`).join(', ');
              const optionsMsg = 'You can update a field, create a new field, or fill the form. What would you like to do?';
              speakMessage(optionsMsg);
              setMessage(optionsMsg);
            }, 2000);
            
            // Save to chat history
            await saveToChatHistory('assistant', displayMsg, pageData.url);
          } else {
            const noFieldsMsg = 'No form fields detected on this page.';
            setMessage(noFieldsMsg);
            speakMessage(noFieldsMsg);
            setStatus('idle');
            resetTranscript();
          }
        } catch (error) {
          console.error('Error analyzing page:', error);
          const errorMsg = 'Error analyzing page. Please try again.';
          setMessage(errorMsg);
          speakMessage(errorMsg);
          setStatus('idle');
          resetTranscript();
        }
      });
    } catch (error) {
      console.error('Error:', error);
      const errorMsg = 'Error processing request. Please try again.';
      setMessage(errorMsg);
      speakMessage(errorMsg);
      setStatus('idle');
      resetTranscript();
    }
  };

  const fillForm = async (data) => {
    setStatus('filling');
    setMessage('Filling form...');
    speakMessage('Filling form...');
    setShowFieldEditor(false);
    setEditingMode(null);

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

        setStatus('done');
        const successMsg = 'Form filled successfully! Do you need anything else?';
        setMessage(successMsg);
        speakMessage(successMsg);
        
        await saveToChatHistory('assistant', successMsg, data.url);
        
        // Reset after asking
        setTimeout(() => {
          setFormData(null);
          setStatus('idle');
          setMessage('Click the mic to start');
          resetTranscript();
        }, 3000);
      });
    } catch (error) {
      console.error('Error filling form:', error);
      const errorMsg = 'Error filling form. Please try again.';
      setMessage(errorMsg);
      speakMessage(errorMsg);
      setStatus('idle');
      resetTranscript();
    }
  };

  const handleUpdateField = () => {
    setEditingMode('update');
    setWaitingForFieldInput(true);
    const promptMsg = 'Please speak the field name and new value. For example: "Update email to john@example.com"';
    speakMessage(promptMsg);
    setMessage(promptMsg);
    resetTranscript();
  };

  const handleCreateField = () => {
    setEditingMode('create');
    setWaitingForFieldInput(true);
    const promptMsg = 'Please speak the field name and value. For example: "Add phone number 1234567890"';
    speakMessage(promptMsg);
    setMessage(promptMsg);
    resetTranscript();
  };

  const handleFillForm = () => {
    if (formData) {
      fillForm(formData);
    }
  };

  const handleVoiceCommand = async (text) => {
    const lowerText = text.toLowerCase().trim();

    // If waiting for field input, don't process other commands
    if (waitingForFieldInput) return;

    // Check for page analysis/scraping commands
    if (
      lowerText.includes('analyze') ||
      lowerText.includes('scrape') ||
      (lowerText.includes('fill') && lowerText.includes('form'))
    ) {
      await extractAndAnalyzePage();
    }
    // Check for update field
    else if ((lowerText.includes('update') || lowerText.includes('change') || lowerText.includes('modify')) && showFieldEditor) {
      handleUpdateField();
    }
    // Check for create field
    else if ((lowerText.includes('create') || lowerText.includes('add') || lowerText.includes('new field')) && showFieldEditor) {
      handleCreateField();
    }
    // Check for fill form
    else if ((lowerText.includes('fill form') || lowerText.includes('fill it') || lowerText.includes('proceed')) && showFieldEditor) {
      handleFillForm();
    }
    // Check for logout
    else if (lowerText.includes('logout') || lowerText.includes('sign out')) {
      const logoutMsg = 'Logging out...';
      setMessage(logoutMsg);
      speakMessage(logoutMsg);
      chrome.storage.local.remove(['authToken', 'user'], () => {
        window.location.reload();
      });
    }
    // Check for ending conversation
    else if (lowerText.includes('no') && (lowerText.includes('else') || lowerText.includes('more'))) {
      const goodbyeMsg = 'Great! Have a wonderful day!';
      setMessage(goodbyeMsg);
      speakMessage(goodbyeMsg);
      setTimeout(() => {
        setStatus('idle');
        setMessage('Click the mic to start');
        setFormData(null);
        setShowFieldEditor(false);
        resetTranscript();
      }, 2000);
    }
    // General chat - send to LLM
    else if (text.trim().length > 0 && !showFieldEditor) {
      setStatus('processing');
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const url = tabs[0]?.url || '';
        await sendChatMessage(text, url);
        setStatus('idle');
        resetTranscript();
      });
    }
  };

  const toggleListening = () => {
    if (!browserSupportsSpeechRecognition) {
      setMessage('Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      SpeechRecognition.stopListening();
      setIsListening(false);
      setStatus('idle');
      setMessage('Click the mic to start');
      resetTranscript();
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    } else {
      SpeechRecognition.startListening({ continuous: true, interimResults: true });
      setIsListening(true);
      setStatus('listening');
      setMessage('Listening...');
      resetTranscript();
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
      <div className="voice-container">
        <div className={`mic-button ${isListening ? 'listening' : ''} ${status}`} onClick={toggleListening}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
          {isListening && <div className="pulse-ring"></div>}
        </div>

        <div className="status-message">{message}</div>

        {transcript && (
          <div className="transcript-box">
            <div className="transcript-label">You said:</div>
            <div className="transcript-text">{transcript}</div>
          </div>
        )}

        {showFieldEditor && formData && (
          <div className="field-editor">
            <div className="fields-display">
              <h4>Detected Fields:</h4>
              <div className="fields-list">
                {formData.fields.map((field, idx) => (
                  <div key={idx} className="field-item">
                    <span className="field-name">{field.name || 'Unnamed'}:</span>
                    <span className="field-value">{field.value || 'N/A'}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn-action btn-update" onClick={handleUpdateField}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Update Field
              </button>
              <button className="btn-action btn-create" onClick={handleCreateField}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Create New Field
              </button>
              <button className="btn-action btn-fill" onClick={handleFillForm}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Fill Form
              </button>
            </div>

            {waitingForFieldInput && (
              <div className="waiting-input">
                <p>🎤 Listening for field update...</p>
                <p className="hint">Say something like: "Update email to john@example.com"</p>
              </div>
            )}
          </div>
        )}

        {chatHistory.length > 0 && !showFieldEditor && (
          <div className="chat-history-preview">
            <div className="chat-history-label">Recent conversation:</div>
            <div className="chat-history-items">
              {chatHistory.slice(-3).map((chat, idx) => (
                <div key={idx} className={`chat-item ${chat.role}`}>
                  <span className="chat-role">{chat.role === 'user' ? 'You' : 'AI'}:</span>
                  <span className="chat-message">{chat.message.substring(0, 50)}...</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VoiceAgent;
