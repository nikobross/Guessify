// src/components/SpotifyCallback.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SpotifyCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get('access_token');

    if (accessToken) {
      localStorage.setItem('spotifyAccessToken', accessToken);
      navigate('/');
    } else {
      navigate('/profile');
    }
  }, [navigate]);

  return <div>Loading...</div>;
};

export default SpotifyCallback;