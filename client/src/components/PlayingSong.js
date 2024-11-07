import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './css/PlayingSong.css';

const PlayingSong = () => {
  const location = useLocation();
  const { gameCode, userId } = location.state || {};
  const [artistGuess, setArtistGuess] = useState('');
  const [trackGuess, setTrackGuess] = useState('');
  const [isArtistSubmitted, setIsArtistSubmitted] = useState(false);
  const [isTrackSubmitted, setIsTrackSubmitted] = useState(false);

  const handleArtistSubmit = () => {
    // Lock the input field and button
    setIsArtistSubmitted(true);
    console.log('Artist guess:', artistGuess);
    console.log('Game code:', gameCode);
    console.log('User ID:', userId);
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
      })
      .catch(error => console.error('Error:', error));
  };

  const handleTrackSubmit = () => {
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
      })
      .catch(error => console.error('Error:', error));
  };

  return (
    <div className="playing-song-container">
      <div className="input-group">
        <input
          type="text"
          value={artistGuess}
          onChange={(e) => setArtistGuess(e.target.value)}
          disabled={isArtistSubmitted}
          className={isArtistSubmitted ? 'locked' : ''}
        />
        <button
          onClick={handleArtistSubmit}
          disabled={isArtistSubmitted}
          className={isArtistSubmitted ? 'locked' : ''}
        >
          Submit Artist
        </button>
      </div>
      <div className="input-group">
        <input
          type="text"
          value={trackGuess}
          onChange={(e) => setTrackGuess(e.target.value)}
          disabled={isTrackSubmitted}
          className={isTrackSubmitted ? 'locked' : ''}
        />
        <button
          onClick={handleTrackSubmit}
          disabled={isTrackSubmitted}
          className={isTrackSubmitted ? 'locked' : ''}
        >
          Submit Track
        </button>
      </div>
    </div>
  );
};

export default PlayingSong;