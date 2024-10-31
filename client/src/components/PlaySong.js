/* global Spotify */

import React, { useEffect, useState, useCallback } from 'react';

const PlaySong = () => {
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [token, setToken] = useState('');

  const loadSpotifySDK = useCallback((token) => {
    // Define the onSpotifyWebPlaybackSDKReady function before loading the SDK
    window.onSpotifyWebPlaybackSDKReady = () => {
      initializePlayer(token);
    };

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    script.onerror = (error) => console.error('Error loading Spotify SDK:', error);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    // Fetch the access token from your backend
    fetch('/get-access-token')
      .then(response => response.json())
      .then(data => {
        setToken(data.access_token);
        loadSpotifySDK(data.access_token);
      })
      .catch(error => console.error('Error fetching access token:', error));
  }, [loadSpotifySDK]);

  const initializePlayer = (token) => {
    const player = new Spotify.Player({
      name: 'Web Playback SDK Quick Start Player',
      getOAuthToken: cb => { cb(token); },
      volume: 0.5,
      robustness: 'SW_SECURE_CRYPTO' // Specify the robustness level
    });

    // Error handling
    player.addListener('initialization_error', ({ message }) => { console.error('Initialization Error:', message); });
    player.addListener('authentication_error', ({ message }) => { console.error('Authentication Error:', message); });
    player.addListener('account_error', ({ message }) => { console.error('Account Error:', message); });
    player.addListener('playback_error', ({ message }) => { console.error('Playback Error:', message); });

    // Playback status updates
    player.addListener('player_state_changed', state => { console.log('Player State Changed:', state); });

    // Ready
    player.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id);
      setDeviceId(device_id);
    });

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
    });

    // Connect to the player!
    player.connect();
    setPlayer(player);
  };

  const playSong = () => {
    if (!deviceId || !token) {
      console.error('Device ID or token is missing');
      return;
    }

    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      body: JSON.stringify({
        uris: ['spotify:track:3xTUOCFRAsBHVFuwhpv5t3'] // Replace with the URI of the song you want to play
      }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    }).then(response => {
      if (response.ok) {
        console.log('Song is playing');
      } else {
        console.error('Failed to play song', response);
      }
    }).catch(error => console.error('Error playing song:', error));
  };

  return (
    <div>
      <h1>Play Song</h1>
      <button onClick={playSong}>Play Song</button>
      {player && <p>Player is initialized</p>}
    </div>
  );
};

export default PlaySong;