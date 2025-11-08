import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function Profile({ user }) {
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');

  useEffect(() => {
    loadProfile();
  }, [user]);

  const getAuthToken = async () => {
    return new Promise((resolve) => {
      chrome.storage.local.get(['authToken'], (result) => {
        resolve(result.authToken);
      });
    });
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/api/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfileData(response.data.data || {});
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfileData({});
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      setMessage(null);
      const token = await getAuthToken();
      await axios.put(`${API_BASE_URL}/api/profile/`, {
        data: profileData,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage({ type: 'success', text: 'Profile saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: 'Failed to save profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const addField = () => {
    if (!newFieldName.trim()) {
      setMessage({ type: 'error', text: 'Field name is required' });
      return;
    }
    
    const fieldKey = newFieldName.trim().toLowerCase().replace(/\s+/g, '_');
    setProfileData({
      ...profileData,
      [fieldKey]: newFieldValue.trim(),
    });
    setNewFieldName('');
    setNewFieldValue('');
    setMessage(null);
  };

  const updateField = (fieldName, value) => {
    setProfileData({
      ...profileData,
      [fieldName]: value,
    });
  };

  const deleteField = (fieldName) => {
    const newData = { ...profileData };
    delete newData[fieldName];
    setProfileData(newData);
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>My Profile</h2>
        <p className="profile-subtitle">Add custom fields that will be used for form filling</p>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="profile-content">
        <div className="add-field-section">
          <h3>Add New Field</h3>
          <div className="add-field-form">
            <input
              type="text"
              placeholder="Field name (e.g., Phone Number, Address)"
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              className="field-input"
            />
            <input
              type="text"
              placeholder="Field value"
              value={newFieldValue}
              onChange={(e) => setNewFieldValue(e.target.value)}
              className="field-input"
            />
            <button onClick={addField} className="btn-add-field">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Field
            </button>
          </div>
        </div>

        <div className="fields-section">
          <h3>Your Profile Fields</h3>
          {Object.keys(profileData).length === 0 ? (
            <div className="empty-state">
              <p>No profile fields yet. Add your first field above!</p>
            </div>
          ) : (
            <div className="fields-list">
              {Object.entries(profileData).map(([key, value]) => (
                <div key={key} className="field-item">
                  <div className="field-info">
                    <label className="field-label">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => updateField(key, e.target.value)}
                      className="field-value-input"
                      placeholder="Enter value"
                    />
                  </div>
                  <button
                    onClick={() => deleteField(key)}
                    className="btn-delete-field"
                    title="Delete field"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="profile-actions">
          <button
            onClick={saveProfile}
            disabled={saving}
            className="btn-save-profile"
          >
            {saving ? (
              <>
                <div className="spinner-small"></div>
                Saving...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Save Profile
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;

