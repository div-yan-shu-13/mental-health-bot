import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await authService.register(
        formData.username, 
        formData.email, 
        formData.password
      );
      
      setSuccess('Account created successfully! Redirecting to login...');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content">
      <div className="card" style={{ maxWidth: '500px', margin: '2rem auto' }}>
        <div className="card-header">
          <h1 className="card-title">Join MindBot! 🚀</h1>
          <p className="card-subtitle">
            Start your mental health journey with us
          </p>
        </div>

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            ✅ {success}
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
              placeholder="Choose a unique username"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              📧 Email
            </label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
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
              placeholder="Create a strong password (min. 6 characters)"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              🔐 Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              className="form-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '20px', height: '20px', margin: '0 0.5rem 0 0' }}></div>
                Creating Account...
              </>
            ) : (
              '🚀 Create Account'
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
            Already have an account?
          </p>
          <Link to="/login" className="btn btn-secondary">
            🔐 Sign In
          </Link>
        </div>

        {/* Benefits Section */}
        <div style={{ 
          marginTop: '2rem',
          padding: '1.5rem',
          background: 'rgba(72, 187, 120, 0.2)',
          borderRadius: '12px',
          border: '1px solid rgba(72, 187, 120, 0.3)'
        }}>
          <h3 style={{ 
            margin: '0 0 1rem 0', 
            color: '#9ae6b4',
            textAlign: 'center'
          }}>
            🌟 Why Join MindBot?
          </h3>
          
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📊</span>
              <span style={{ fontSize: '0.9rem', color: '#9ae6b4' }}>
                Track your mood and emotional patterns
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>💬</span>
              <span style={{ fontSize: '0.9rem', color: '#9ae6b4' }}>
                Chat with an AI mental health companion
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>💡</span>
              <span style={{ fontSize: '0.9rem', color: '#9ae6b4' }}>
                Get personalized self-care tips
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🔒</span>
              <span style={{ fontSize: '0.9rem', color: '#9ae6b4' }}>
                Your data is private and secure
              </span>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div style={{ 
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'rgba(237, 137, 54, 0.2)',
          borderRadius: '12px',
          border: '1px solid rgba(237, 137, 54, 0.3)',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#feb2b2', fontSize: '0.8rem' }}>
            🔒 <strong>Privacy:</strong> We respect your privacy. Your personal information 
            is encrypted and never shared with third parties.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
