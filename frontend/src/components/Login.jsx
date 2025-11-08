import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Login.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

function Login({ onLogin }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('Login component mounted');
  }, []);

  const handleGoogleLogin = () => {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') {
      setError('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file.');
      return;
    }

    setLoading(true);
    setError(null);

    // Use Chrome's identity API for OAuth
    // This requires the redirect URI to be registered in Google Cloud Console
    const redirectUrl = chrome.identity.getRedirectURL();
    
    console.log('='.repeat(60));
    console.log('OAUTH DEBUG INFO');
    console.log('='.repeat(60));
    console.log('Google Client ID:', GOOGLE_CLIENT_ID);
    console.log('Redirect URI:', redirectUrl);
    console.log('Extension ID:', chrome.runtime.id);
    console.log('');
    console.log('VERIFY IN GOOGLE CLOUD CONSOLE:');
    console.log('1. Go to: https://console.cloud.google.com/apis/credentials');
    console.log('2. Find OAuth Client ID:', GOOGLE_CLIENT_ID);
    console.log('3. Check "Authorized redirect URIs" contains:');
    console.log('   ', redirectUrl);
    console.log('4. Make sure it matches EXACTLY (including trailing slash)');
    console.log('='.repeat(60));
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(redirectUrl)}&` +
      `response_type=token&` +
      `scope=email profile openid&` +
      `prompt=consent`;
    
    console.log('OAuth URL (first 100 chars):', authUrl.substring(0, 100) + '...');

    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl,
        interactive: true,
      },
      (responseUrl) => {
        if (chrome.runtime.lastError) {
          const error = chrome.runtime.lastError.message;
          console.error('OAuth error:', error);
          
          // Provide more helpful error messages
          if (error.includes('redirect_uri_mismatch') || error.includes('redirect_uri')) {
            setError(
              `Redirect URI mismatch. Please verify:\n\n` +
              `1. Redirect URI in Google Console: ${redirectUrl}\n` +
              `2. Client ID matches: ${GOOGLE_CLIENT_ID}\n` +
              `3. Check console for exact URI to add`
            );
          } else {
            setError(`OAuth error: ${error}. Check console for details.`);
          }
          setLoading(false);
          return;
        }

        if (!responseUrl) {
          setError('Authentication was cancelled.');
          setLoading(false);
          return;
        }
        
        console.log('OAuth response received, processing...');

        // Extract access token from the redirect URL hash
        // Format: https://extension-id.chromiumapp.org/#access_token=TOKEN&token_type=Bearer&...
        try {
          const url = new URL(responseUrl);
          const hashParams = new URLSearchParams(url.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          
          if (accessToken) {
            // For now, we'll need to get user info from Google and then send to backend
            // Or we can use the access token directly if backend supports it
            // Let's use a simpler approach - get user info and create a JWT-like flow
            handleAccessToken(accessToken);
          } else {
            setError('Authentication failed. No access token received.');
            setLoading(false);
          }
        } catch (err) {
          console.error('Error parsing OAuth response:', err);
          setError('Failed to process authentication response.');
          setLoading(false);
        }
      }
    );
  };

  const handleAccessToken = async (accessToken) => {
    try {
      // Get user info from Google
      const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log('User info from Google:', userInfoResponse.data);

      // Map user info to match backend expectations
      const userInfo = {
        id: userInfoResponse.data.id || userInfoResponse.data.sub,
        email: userInfoResponse.data.email,
        name: userInfoResponse.data.name,
        picture: userInfoResponse.data.picture,
        given_name: userInfoResponse.data.given_name,
        family_name: userInfoResponse.data.family_name,
      };

      // Send to backend for token creation
      const response = await axios.post(`${API_BASE_URL}/api/social-login/`, {
        access_token: accessToken,
        user_info: userInfo,
      });

      if (response.data.token && response.data.user) {
        const userData = response.data.user;
        onLogin(userData, response.data.token);
      } else {
        setError('Login failed. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Failed to authenticate with Google');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <div className="logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <h1>Fillora</h1>
        <p className="subtitle">Voice-powered form filling</p>
      </div>

      <div className="login-content">
        {error && <div className="error-message">{error}</div>}

        <div className="google-login-wrapper">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              padding: '12px 24px',
              background: '#4285f4',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              justifyContent: 'center',
              minWidth: '200px',
            }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                Signing in...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </>
            )}
          </button>
        </div>

        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Signing you in...</p>
          </div>
        )}
      </div>

      <div className="login-footer">
        <p>Secure authentication with Google</p>
      </div>
    </div>
  );
}

export default Login;

