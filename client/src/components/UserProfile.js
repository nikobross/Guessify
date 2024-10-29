import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from './TopBars';
import './css/UserProfile.css';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
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
        if (data.spotify_logged_in) {
          setProfile(data.spotify_profile);
        }
      } else {
        navigate('/login');
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleSpotifyLogin = () => {
    navigate('/spotify-login');
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
    <div>
      <TopBar
        isLoggedIn={true} // Assuming the user is logged in if they are on the profile page
        username={username}
        toggleSidebar={() => {}}
        toggleRightSidebar={() => {}}
      />
      <div className="profile-container">
        <h1>User Profile</h1>
        {profile ? (
          <div className="spotify-profile">
            <p className="spotify-login-text">Logged into Spotify as {profile.display_name}</p>
            <img src={profile.images?.[0]?.url || 'default-profile.png'} alt="Profile" />
          </div>
        ) : (
          <div>
            <button className="custom-button" onClick={handleSpotifyLogin}>Log in with Spotify</button>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div>
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
    </div>
  );
};

export default UserProfile;