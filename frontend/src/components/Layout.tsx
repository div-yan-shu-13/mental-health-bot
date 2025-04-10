import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  return (
    <div className="layout">
      <header className="header">
        <div className="logo">
          <Link to="/">Mental Health Assistant</Link>
        </div>
        
        <nav className="navigation">
          {user ? (
            <>
              <Link 
                to="/dashboard" 
                className={location.pathname === '/dashboard' ? 'active' : ''}
              >
                Dashboard
              </Link>
              <Link 
                to="/chat" 
                className={location.pathname.startsWith('/chat') ? 'active' : ''}
              >
                Chat
              </Link>
              <Link 
                to="/mood-tracker" 
                className={location.pathname === '/mood-tracker' ? 'active' : ''}
              >
                Mood Tracker
              </Link>
              <div className="user-menu">
                <div className="user-name">{user.name}</div>
                <div className="dropdown-menu">
                  <Link to="/profile">Profile</Link>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Sign Up</Link>
            </>
          )}
        </nav>
      </header>
      
      <main className="main-content">
        {children}
      </main>
      
      <footer className="footer">
        <p>
          This is an AI assistant and not a replacement for professional mental health care. 
          If you're in crisis, please call a crisis hotline or seek professional help immediately.
        </p>
        <p>© {new Date().getFullYear()} Mental Health Assistant</p>
      </footer>
    </div>
  );
};

export default Layout;
