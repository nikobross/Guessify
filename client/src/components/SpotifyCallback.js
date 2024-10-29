// src/components/SpotifyCallback.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SpotifyCallback = () => {
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [expiresIn, setExpiresIn] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const search = window.location.search;
    console.log('Search:', search); // Log the search
    const params = new URLSearchParams(search);
    const code = params.get('code');

    console.log('Authorization Code:', code); // Log the authorization code

    if (code) {
      fetch('/user/spotify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })
        .then(response => response.json())
        .then(data => {
          setAccessToken(data.access_token);
          setRefreshToken(data.refresh_token);
          setExpiresIn(data.expires_in);
          navigate('/profile'); // Navigate to the profile component
        })
        .catch(error => {
          console.error('Error exchanging authorization code:', error);
          navigate('/login'); // Navigate to login on error
        });
    } else {
      console.error('Missing authorization code');
      navigate('/login'); // Navigate to login if authorization code is missing
    }
  }, [navigate]);

  return (
    <div>
      <h1>Spotify Callback</h1>
      <p><strong>Access Token:</strong> {accessToken}</p>
      <p><strong>Refresh Token:</strong> {refreshToken}</p>
      <p><strong>Expires In:</strong> {expiresIn} seconds</p>
    </div>
  );
};

export default SpotifyCallback;