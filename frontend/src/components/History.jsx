import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './History.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function History({ user }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadHistory();
  }, [user]);

  const getAuthToken = async () => {
    return new Promise((resolve) => {
      chrome.storage.local.get(['authToken'], (result) => {
        resolve(result.authToken);
      });
    });
  };

  const loadHistory = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/api/history/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          user_id: user.id,
        },
      });
      setSubmissions(response.data.results || response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error loading history:', err);
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDomain = (url) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  if (loading) {
    return (
      <div className="history-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-container">
        <div className="error-state">
          <p>{error}</p>
          <button className="retry-btn" onClick={loadHistory}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <h2>Form Filling History</h2>
        <button className="refresh-btn" onClick={loadHistory} title="Refresh">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      </div>

      {submissions.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          <p>No form submissions yet</p>
          <p className="empty-subtitle">Your filled forms will appear here</p>
        </div>
      ) : (
        <div className="submissions-list">
          {submissions.map((submission) => (
            <div key={submission.id} className="submission-card">
              <div className="submission-header">
                <div className="website-info">
                  <div className="website-icon">
                    {getDomain(submission.website || submission.url)[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="website-name">{getDomain(submission.website || submission.url)}</div>
                    <div className="submission-date">{formatDate(submission.created_at)}</div>
                  </div>
                </div>
                <a
                  href={submission.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="external-link"
                  title="Open in new tab"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>

              <div className="fields-list">
                {submission.fields && submission.fields.length > 0 ? (
                  submission.fields.map((field, idx) => (
                    <div key={idx} className="field-item">
                      <span className="field-name">{field.name || field.field}:</span>
                      <span className="field-value">{field.value || 'N/A'}</span>
                    </div>
                  ))
                ) : (
                  <div className="no-fields">No field data available</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default History;

