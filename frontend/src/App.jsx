import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import MainApp from './components/MainApp';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('App component mounted');
    // Check if user is already logged in
    chrome.storage.local.get(['authToken', 'user'], (result) => {
      console.log('Storage result:', result);
      if (result.authToken && result.user) {
        console.log('User found in storage, logging in');
        setUser(result.user);
        setIsLoggedIn(true);
      } else {
        console.log('No user found in storage');
      }
      setLoading(false);
    });
  }, []);

  const handleLogin = (userData, token) => {
    chrome.storage.local.set({ user: userData, authToken: token }, () => {
      setUser(userData);
      setIsLoggedIn(true);
    });
  };

  const handleLogout = () => {
    chrome.storage.local.remove(['authToken', 'user'], () => {
      setUser(null);
      setIsLoggedIn(false);
    });
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="app">
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <MainApp user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;

