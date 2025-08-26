import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const Navbar = ({ isAuthenticated, setIsAuthenticated, user, setUser }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call logout API
      await authService.logout();
      
      // Clear local state
      setIsAuthenticated(false);
      setUser(null);
      
      // Redirect to login
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout locally even if API call fails
      setIsAuthenticated(false);
      setUser(null);
      navigate('/login');
    }
  };

  const getInitials = (username) => {
    return username ? username.substring(0, 2).toUpperCase() : 'U';
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (!isAuthenticated) {
    return (
      <nav className="navbar">
        <div className="navbar-content">
          <div className="logo">
            🧠 MindBot
          </div>
          <div className="nav-links">
            <Link to="/login" className="nav-link">
              <span>🔐</span> Login
            </Link>
            <Link to="/register" className="nav-link">
              <span>📝</span> Register
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="logo">
          🧠 MindBot
        </div>
        
        <div className="nav-links">
          <Link 
            to="/dashboard" 
            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
          >
            <span>📊</span> Dashboard
          </Link>
          
          <Link 
            to="/mood" 
            className={`nav-link ${isActive('/mood') ? 'active' : ''}`}
          >
            <span>😊</span> Mood Tracker
          </Link>
          
          <Link 
            to="/chat" 
            className={`nav-link ${isActive('/chat') ? 'active' : ''}`}
          >
            <span>💬</span> Chat
          </Link>
          
          <div className="user-info">
            <div className="user-avatar">
              {getInitials(user?.username)}
            </div>
            <span style={{ color: '#e2e8f0', fontWeight: '500' }}>
              {user?.username}
            </span>
            <button onClick={handleLogout} className="logout-btn">
              <span>🚪</span> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
