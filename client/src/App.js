import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './components/MainPage';
import HostGame from './components/HostGame';
import JoinGame from './components/JoinGame';
import Login from './components/Login';
import SignUp from './components/SignUp';
import SpotifyLogin from './components/SpotifyLogin';
import SpotifyCallback from './components/SpotifyCallback';
import UserProfile from './components/UserProfile';
import MoreGames from './components/MoreGames'; // Ensure this import is correct

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/host" element={<HostGame />} />
        <Route path="/join" element={<JoinGame />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/spotify-login" element={<SpotifyLogin />} />
        <Route path="/callback" element={<SpotifyCallback />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/more-games" element={<MoreGames />} />
      </Routes>
    </Router>
  );
}

export default App;