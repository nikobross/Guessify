import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from './TopBars';
import './css/UserProfile.css';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
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

  const handleUpdateUsername = async () => {
    try {
      const response = await fetch('/user/update-username/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage(data.message);
        setErrorMessage('');
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message);
        setSuccessMessage('');
      }
    } catch (error) {
      setErrorMessage('An error occurred while updating the username.');
      setSuccessMessage('');
    }
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
            {successMessage && <p className="success-message">{successMessage}</p>}
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;