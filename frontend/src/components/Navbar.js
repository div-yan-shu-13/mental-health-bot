import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';
import './Navbar.css';

const Navbar = ({ isAuthenticated, setIsAuthenticated, user, setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Mental Health App</Link>
      </div>
      
      {isAuthenticated && (
        <button className="mobile-menu-toggle" onClick={toggleMenu}>
          {menuOpen ? '✕' : '☰'}
        </button>
      )}
      
      <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
        {isAuthenticated ? (
          <>
            <span className="welcome-text">Welcome, {user?.username}</span>
            <Link 
              to="/dashboard" 
              className={location.pathname === '/dashboard' ? 'active' : ''}
              onClick={() => setMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/mood" 
              className={location.pathname === '/mood' ? 'active' : ''}
              onClick={() => setMenuOpen(false)}
            >
              Mood Tracker
            </Link>
            <Link 
              to="/chat" 
              className={location.pathname === '/chat' ? 'active' : ''}
              onClick={() => setMenuOpen(false)}
            >
              Chat Support
            </Link>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link 
              to="/login" 
              className={location.pathname === '/login' ? 'active' : ''}
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className={location.pathname === '/register' ? 'active' : ''}
              onClick={() => setMenuOpen(false)}
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
