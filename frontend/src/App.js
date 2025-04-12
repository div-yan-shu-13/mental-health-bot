import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/api';

// Components
import Navbar from './components/Navbar';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MoodTrackerPage from './pages/MoodTrackerPage';
import ChatPage from './pages/ChatPage';

// CSS
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authService.getCurrentUser();
        setUser(response.data);
        setIsAuthenticated(true);
        setError(null);
      } catch (err) {
        console.log('Not authenticated yet');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (loading) return <div className="loading">Loading...</div>;
    
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    
    return children;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Navbar 
          isAuthenticated={isAuthenticated} 
          setIsAuthenticated={setIsAuthenticated}
          user={user}
          setUser={setUser}
        />
        
        <main className="content">
          <Routes>
            <Route path="/login" element={
              isAuthenticated ? 
                <Navigate to="/dashboard" /> : 
                <LoginPage 
                  setIsAuthenticated={setIsAuthenticated} 
                  setUser={setUser}
                />
            } />
            
            <Route path="/register" element={
              isAuthenticated ? 
                <Navigate to="/dashboard" /> : 
                <RegisterPage />
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage user={user} />
              </ProtectedRoute>
            } />
            
            <Route path="/mood" element={
              <ProtectedRoute>
                <MoodTrackerPage />
              </ProtectedRoute>
            } />
            
            <Route path="/chat" element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            } />
            
            <Route path="/" element={
              isAuthenticated ? 
                <Navigate to="/dashboard" /> : 
                <Navigate to="/login" />
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
