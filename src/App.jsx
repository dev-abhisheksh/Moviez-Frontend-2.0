import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/Home';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import SearchPage from './pages/Search';
import MovieDetail from './pages/MovieDetail';
import Favourites from './pages/Favourites';
import ProfilePage from './pages/ProfilePage';
import MediaUpload from './pages/Admin/MediaUpload';
import Dashboard from './pages/Admin/Dashboard';

function App() {
  return (
    <Router>
      <div className="font-sans text-textMain min-h-screen bg-background overflow-x-hidden">
        <Navbar />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<RegisterPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/watch/:mediaType/:mediaId" element={<MovieDetail />} />
          <Route path="/favourites" element={<Favourites />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin/upload" element={<MediaUpload />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;