import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Settings.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function Settings({ user }) {
  const [availableModels, setAvailableModels] = useState([]);
  const [currentModel, setCurrentModel] = useState(user.preferred_ai_model || 'gemini');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadModelSettings();
  }, []);

  const getAuthToken = async () => {
    return new Promise((resolve) => {
      chrome.storage.local.get(['authToken'], (result) => {
        resolve(result.authToken);
      });
    });
  };

  const loadModelSettings = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/api/model/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAvailableModels(response.data.available_models || []);
      setCurrentModel(response.data.current_model || 'gemini');
    } catch (error) {
      console.error('Error loading model settings:', error);
      setMessage('Failed to load model settings');
    } finally {
      setLoading(false);
    }
  };

  const updateModel = async (modelName) => {
    try {
      setSaving(true);
      setMessage(null);
      const token = await getAuthToken();
      const response = await axios.post(
        `${API_BASE_URL}/api/model/`,
        { model_name: modelName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCurrentModel(modelName);
      setMessage(`Model updated to ${modelName}`);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error updating model:', error);
      setMessage(error.response?.data?.error || 'Failed to update model');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>AI Model Settings</h2>
        <p className="settings-subtitle">Choose your preferred AI model for form analysis</p>
      </div>

      {message && (
        <div className={`message ${message.includes('Failed') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="model-selection">
        <h3>Available Models</h3>
        <div className="model-list">
          {availableModels.map((model) => (
            <div
              key={model.id}
              className={`model-card ${currentModel === model.model_name ? 'active' : ''} ${
                !model.is_active ? 'disabled' : ''
              }`}
            >
              <div className="model-info">
                <div className="model-name">
                  {model.model_name === 'gemini' ? '🤖' : '⚡'} {model.model_name.toUpperCase()}
                </div>
                <div className="model-status">
                  {model.is_active ? (
                    <span className="status-active">Active</span>
                  ) : (
                    <span className="status-inactive">Inactive</span>
                  )}
                </div>
              </div>
              {currentModel === model.model_name && (
                <div className="current-badge">Current</div>
              )}
              <button
                className="select-btn"
                onClick={() => updateModel(model.model_name)}
                disabled={!model.is_active || saving || currentModel === model.model_name}
              >
                {currentModel === model.model_name ? 'Selected' : 'Select'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-info">
        <h4>About AI Models</h4>
        <ul>
          <li>
            <strong>Gemini:</strong> Google's advanced AI model, great for complex form analysis
          </li>
          <li>
            <strong>Groq:</strong> Fast inference with Llama models, ideal for quick responses
          </li>
        </ul>
        <p className="info-note">
          Note: API keys must be configured in the backend using the management command:
          <code>python manage.py update_aimodel &lt;model_name&gt; &lt;api_key&gt;</code>
        </p>
      </div>
    </div>
  );
}

export default Settings;

