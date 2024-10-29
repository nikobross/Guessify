// src/components/UserProfile.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/UserProfile.css';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [spotifyLoggedIn, setSpotifyLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const response = await fetch('/user/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsername(data.username);
        setSpotifyLoggedIn(data.spotify_logged_in);

        if (data.spotify_logged_in) {
          const accessToken = data.spotify_access_token;
          fetch('https://api.spotify.com/v1/me', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })
            .then(response => response.json())
            .then(data => {
              setProfile(data);
            })
            .catch(error => {
              console.error('Error fetching profile:', error);
            });
        }
      } else {
        navigate('/login');
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleSpotifyLogin = () => {
    const clientId = 'b5d98381070641b38c70deafcae79169';
    const redirectUri = 'http://localhost:3000/callback';
    const scopes = [
      'user-read-private',
      'user-read-email',
      'user-modify-playback-state',
      'user-read-playback-state',
      'streaming',
    ];

    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes.join(' '))}`;
    window.location.href = authUrl;
  };

  const handleUpdateUsername = () => {
    // Placeholder for updating username
    console.log('Update username:', username);
  };

  const handleUpdatePassword = () => {
    // Placeholder for updating password
    console.log('Update password:', password);
  };

  return (
    <div className="profile-container">
      <h1>User Profile</h1>
      {profile ? (
        <div>
          <h2>{profile.display_name}</h2>
          <img src={profile.images[0]?.url} alt="Profile" />
          <p>{profile.email}</p>
          <p>Logged in with Spotify</p>
        </div>
      ) : (
        <button className="custom-button" onClick={handleSpotifyLogin}>Log in with Spotify</button>
      )}
      <div className="update-fields">
        <div className="input-group">
          <label>Update Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button className="custom-button" onClick={handleUpdateUsername}>Update Username</button>
        </div>
        <div className="input-group">
          <label>Update Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="custom-button" onClick={handleUpdatePassword}>Update Password</button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;