/* global Spotify */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './css/PlayingSong.css';

const PlayingSong = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { gameCode, userId, isHost } = location.state || {};
  const [artistGuess, setArtistGuess] = useState('');
  const [trackGuess, setTrackGuess] = useState('');
  const [isArtistSubmitted, setIsArtistSubmitted] = useState(false);
  const [isTrackSubmitted, setIsTrackSubmitted] = useState(false);
  const [currentSongNumber, setCurrentSongNumber] = useState(1);
  const [totalSongs, setTotalSongs] = useState(10);
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [token, setToken] = useState('');
  const [songUri, setSongUri] = useState('');

  const trackInputRef = useRef(null);
  const artistInputRef = useRef(null);

  const loadSpotifySDK = useCallback((token) => {
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

  const playSong = (songUri) => {
    if (!deviceId || !token) {
      console.error('Device ID or token is missing');
      return;
    }

    console.log('Device ID:', deviceId);
    console.log('Access Token:', token);
    console.log('Request Body:', JSON.stringify({ uris: [songUri] }));

    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      body: JSON.stringify({
        uris: [songUri]
      }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    }).then(response => {
      if (response.ok) {
        console.log('Song is playing');
      } else {
        response.json().then(data => {
          console.error('Failed to play song', data);
        });
      }
    }).catch(error => console.error('Error playing song:', error));
  };

  useEffect(() => {
    const fetchCurrentSongNumber = () => {
      fetch('/get-current-song-number', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ game_code: gameCode }),
      })
        .then(response => response.json())
        .then(data => {
          setCurrentSongNumber(data.current_song_number);
          setTotalSongs(data.total_songs);
        })
        .catch(error => console.error('Error fetching current song number:', error));
    };

    const fetchSongUri = () => {
      fetch('/get-current-song-uri', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ game_code: gameCode }),
      })
        .then(response => response.json())
        .then(data => {
          console.log('Song URI:', data.song_uri);
          setSongUri(data.song_uri);
        })
        .catch(error => console.error('Error fetching song URI:', error));
    };

    fetchCurrentSongNumber();
    fetchSongUri();

    const checkLeaderboard = () => {
      fetch('/check-leaderboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ game_code: gameCode }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.move_to_podium) {
            navigate('/podium', { state: { gameCode, userId, isHost } });
          } else if (data.move_to_leaderboard) {
            fetch('/next-song', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ game_code: gameCode }),
            })
              .then(response => response.json())
              .then(data => {
                console.log('Next song loaded:', data);
                navigate('/leaderboard', { state: { gameCode, userId, isHost } });
              })
              .catch(error => console.error('Error fetching next song:', error));
          }
        })
        .catch(error => console.error('Error checking leaderboard:', error));
    };

    const intervalId = setInterval(checkLeaderboard, 1000); // Check every 1 second

    // Play the song after a 1-second delay if deviceId and token are set
    const playSongTimeout = setTimeout(() => {
      console.log('deviceId:', deviceId);
      console.log('token:', token);
      console.log('songUri:', songUri);
      if (deviceId && token && songUri) {
        playSong(songUri);
      }
    }, 1000);

    // Cleanup interval and timeout on component unmount
    return () => {
      clearInterval(intervalId);
      clearTimeout(playSongTimeout);
    };
  }, [gameCode, navigate, userId, isHost, songUri, deviceId, token]);

  const handleArtistSubmit = () => {
    if (artistGuess.trim() === '') {
      alert('Artist guess cannot be empty');
      return;
    }
    // Lock the input field and button
    setIsArtistSubmitted(true);
    // Send the guess to the server
    fetch('/lock-in-guess-artist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ game_code: gameCode, artist_guess: artistGuess, user_id: userId }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Response:', data);
        trackInputRef.current.focus(); // Focus on the track input field after submitting artist guess
      })
      .catch(error => console.error('Error:', error));
  };

  const handleTrackSubmit = () => {
    if (trackGuess.trim() === '') {
      alert('Track guess cannot be empty');
      return;
    }
    // Lock the input field and button
    setIsTrackSubmitted(true);
    // Send the guess to the server
    fetch('/lock-in-guess-track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ game_code: gameCode, track_guess: trackGuess, user_id: userId }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Response:', data);
        artistInputRef.current.focus(); // Focus on the artist input field after submitting track guess
      })
      .catch(error => console.error('Error:', error));
  };

  return (
    <div className="playing-song-container">
      <div className="playing-box">
        <div className="song-number">
          Song {currentSongNumber}/{totalSongs}
        </div>
        <div className="input-group">
          <input
            type="text"
            value={trackGuess}
            onChange={(e) => setTrackGuess(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleTrackSubmit();
              }
            }}
            disabled={isTrackSubmitted}
            className={`playing-input ${isTrackSubmitted ? 'locked' : ''}`}
            placeholder="Track Title"
            autoFocus
            ref={trackInputRef}
          />
          <button
            onClick={handleTrackSubmit}
            disabled={isTrackSubmitted || trackGuess.trim() === ''}
            className={`playing-button ${isTrackSubmitted ? 'locked' : ''}`}
          >
            Submit Track
          </button>
        </div>
        <div className="input-group">
          <input
            type="text"
            value={artistGuess}
            onChange={(e) => setArtistGuess(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleArtistSubmit();
              }
            }}
            disabled={isArtistSubmitted}
            className={`playing-input ${isArtistSubmitted ? 'locked' : ''}`}
            placeholder="Artist Name"
            ref={artistInputRef}
          />
          <button
            onClick={handleArtistSubmit}
            disabled={isArtistSubmitted || artistGuess.trim() === ''}
            className={`playing-button ${isArtistSubmitted ? 'locked' : ''}`}
          >
            Submit Artist
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayingSong;