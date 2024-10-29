// src/components/SpotifyCallback.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SpotifyCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const expiresIn = params.get('expires_in');

    if (accessToken && refreshToken && expiresIn) {
      fetch('/user/spotify-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_token: accessToken, refresh_token: refreshToken, expires_in: parseInt(expiresIn) }),
      })
        .then(response => response.json())
        .then(() => {
          localStorage.setItem('spotifyAccessToken', accessToken);
          localStorage.setItem('spotifyRefreshToken', refreshToken);
          localStorage.setItem('spotifyTokenExpiry', Date.now() + parseInt(expiresIn) * 1000);
          navigate('/profile');
        })
        .catch(error => {
          console.error('Error logging in with Spotify:', error);
          navigate('/login');
        });
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return <div>Loading...</div>;
};

export default SpotifyCallback;