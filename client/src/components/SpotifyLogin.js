// src/components/SpotifyLogin.js
import React from 'react';

const SpotifyLogin = () => {
  const clientId = 'b5d98381070641b38c70deafcae79169';
  const redirectUri = 'http://localhost:3000/callback';
  const scopes = [
    'user-read-private',
    'user-read-email',
    'user-modify-playback-state',
    'user-read-playback-state',
    'streaming',
  ];

  const handleLogin = () => {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes.join(' '))}`;
    window.location.href = authUrl;
  };

  return (
    <button onClick={handleLogin}>Log in with Spotify</button>
  );
};

export default SpotifyLogin;