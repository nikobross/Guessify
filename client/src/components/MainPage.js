import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from './TopBars';
import Card from './Card';
import './css/MainPage.css';

/**
 * Packs of games
 * Top hits
 * Through the years (70s, 80s, 90s, 00s, 10s)
 * Genres (pop, rock, hip-hop, electronic, etc.)
 * Custom playlists
 * 
 * Maybe this page should have two sections:
 * - One for the user to create a game
 * - One for the user to join a game 
 * These pages would then navigate to the HostGame and JoinGame pages respectively
 * The host game can have options for quickstart games with popular playlists
 * and the ability to click to see more playlists, this would then navigate to the 
 * host game page
 */

const MainPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [playlists, setPlaylists] = useState([
    {
      uri: '37i9dQZF1DXcBWIGoYBM5M',
      name: 'Top 50 - USA',
      image: '/top50global.jpeg'
    },
    {
      uri: '37i9dQZF1DXcBWIGoYBM5M',
      name: 'Top 50 - Global',
      image: '/top50us.jpeg'
    },
    {
      uri: '37i9dQZF1DX4JAvHpjipBk',
      name: 'Viral Hits',
      image: '/viralhits2.jpeg'
    },
    {
      uri: '37i9dQZF1DX4JAvHpjipBk',
      name: 'Custom Game',
      image: '/customgame.jpeg'
    }
  ]);

  useEffect(() => {
    // Check if the user is logged in by checking localStorage
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const storedUsername = localStorage.getItem('username');
    setIsLoggedIn(loggedIn);
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const createGame = async (playlistUri) => {
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
        alert(`Game created! Game Code: ${data.game_code}`);
        navigate(`/game/${data.game_id}`);
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
    <div>
      <TopBar username={username} />
      <div className="main-page-container">
        {playlists.map((playlist) => (
          <Card
            key={playlist.uri}
            playlistUri={playlist.uri}
            playlistName={playlist.name}
            image={playlist.image}
            onCreateGame={createGame}
          />
        ))}
      </div>
    </div>
  );
};

export default MainPage;