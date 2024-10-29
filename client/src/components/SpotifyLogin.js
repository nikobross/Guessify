// src/components/SpotifyLogin.js
import React from 'react';

const SpotifyLogin = () => {
  const handleLogin = () => {
    window.location.href = 'http://127.0.0.1:5000/login-test';
  };

  return (
    <button onClick={handleLogin}>Log in with Spotify</button>
  );
};

export default SpotifyLogin;