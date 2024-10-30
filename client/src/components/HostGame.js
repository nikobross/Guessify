import React, { useState } from 'react';
import './css/HostGame.css'; // Import the CSS file

const HostGame = () => {
  const [playlistUri, setPlaylistUri] = useState('');
  const [gameCode, setGameCode] = useState(null);

  const createGame = async () => {
    try {
      const response = await fetch('/create-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playlist_uri: playlistUri }),
      });

      if (response.ok) {
        const data = await response.json();
        setGameCode(data.game_code);
        alert(`Game created! Game Code: ${data.game_code}`);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error creating game:', error);
      alert('Error creating game');
    }
  };

  return (
    <div className="host-game-container">
      <h1>Host Game Page</h1>
      <input
        type="text"
        value={playlistUri}
        onChange={(e) => setPlaylistUri(e.target.value)}
        placeholder="Enter Playlist URI"
      />
      <button onClick={createGame}>Create Game</button>
      {gameCode && <p>Game Code: {gameCode}</p>}
    </div>
  );
};

export default HostGame;