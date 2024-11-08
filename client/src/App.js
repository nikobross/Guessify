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
import MoreGames from './components/MoreGames';
import PlaySong from './components/PlaySong';
import WaitingRoom from './components/WaitingRoom';
import HostWaitingRoom from './components/HostWaitingRoom';
import PlayingSong from './components/PlayingSong';
import Leaderboard from './components/Leaderboard';
import Podium from './components/Podium';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/host" element={<HostGame />} />
        <Route path="/join-game" element={<JoinGame />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/spotify-login" element={<SpotifyLogin />} />
        <Route path="/callback" element={<SpotifyCallback />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/more-games" element={<MoreGames />} />
        <Route path="/play" element={<PlaySong />} />
        <Route path="/waiting-room" element={<WaitingRoom />} />
        <Route path="/host-waiting-room" element={<HostWaitingRoom />} />
        <Route path="/playing-song" element={<PlayingSong />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/podium" element={<Podium />} />
      </Routes>
    </Router>
  );
}

export default App;