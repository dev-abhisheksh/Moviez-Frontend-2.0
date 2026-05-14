import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import HomePage from './pages/Home';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';

import MovieDetail from './pages/MovieDetail';
import Favourites from './pages/Favourites';
import History from './pages/History';
import ProfilePage from './pages/ProfilePage';
import MediaUpload from './pages/Admin/MediaUpload';
import Dashboard from './pages/Admin/Dashboard';
import CategoryPage from './pages/CategoryPage';
import DownloadPage from './pages/DownloadPage';

function AppContent() {
  const location = useLocation();
  const hideNavbarPaths = ['/login', '/signup'];

  return (
    <div className="font-sans text-white min-h-screen bg-surfaceDark overflow-x-hidden">
      {!hideNavbarPaths.includes(location.pathname) && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<RegisterPage />} />

        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/download/:mediaType/:mediaId" element={<DownloadPage />} />

        {/* Protected Routes */}
        <Route
          path="/watch/:mediaType/:mediaId"
          element={
            <ProtectedRoute>
              <MovieDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favourites"
          element={
            <ProtectedRoute>
              <Favourites />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/upload"
          element={
            <ProtectedRoute adminOnly={true}>
              <MediaUpload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute adminOnly={true}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;