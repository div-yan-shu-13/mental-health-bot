import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const LoginPage = ({ setIsAuthenticated, setUser }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(
        formData.username, 
        formData.password, 
        formData.remember
      );
      
      setUser(response.data.user);
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content">
      <div className="card" style={{ maxWidth: '500px', margin: '2rem auto' }}>
        <div className="card-header">
          <h1 className="card-title">Welcome Back! 👋</h1>
          <p className="card-subtitle">
            Sign in to continue your mental health journey
          </p>
        </div>

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              👤 Username
            </label>
            <input
              type="text"
              name="username"
              className="form-input"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              🔒 Password
            </label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              name="remember"
              id="remember"
              checked={formData.remember}
              onChange={handleChange}
              style={{ width: 'auto' }}
            />
            <label htmlFor="remember" style={{ margin: 0, cursor: 'pointer', color: '#e2e8f0' }}>
              Remember me
            </label>
          </div>

          <button 
            type="submit" 
            className="btn btn-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '20px', height: '20px', margin: '0 0.5rem 0 0' }}></div>
                Signing In...
              </>
            ) : (
              '🔐 Sign In'
            )}
          </button>
        </form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '2rem',
          padding: '1.5rem',
          background: 'rgba(102, 126, 234, 0.2)',
          borderRadius: '12px',
          border: '1px solid rgba(102, 126, 234, 0.3)'
        }}>
          <p style={{ margin: 0, color: '#e2e8f0', marginBottom: '1rem' }}>
            Don't have an account yet?
          </p>
          <Link to="/register" className="btn btn-secondary">
            📝 Create Account
          </Link>
        </div>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'rgba(72, 187, 120, 0.2)',
          borderRadius: '12px',
          border: '1px solid rgba(72, 187, 120, 0.3)'
        }}>
          <p style={{ margin: 0, color: '#9ae6b4', fontSize: '0.9rem' }}>
            💡 <strong>Tip:</strong> Your mental health journey starts with small steps. 
            Every login is a step toward better self-awareness.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
