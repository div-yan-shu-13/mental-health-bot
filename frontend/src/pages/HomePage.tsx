import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/HomePage.css';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="logo">Mental Health Assistant</div>
        <nav className="home-nav">
          {user ? (
            <Link to="/dashboard" className="nav-button primary">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-button primary">Sign Up</Link>
            </>
          )}
        </nav>
      </header>

      <main className="home-main">
        <section className="hero-section">
          <div className="hero-content">
            <h1>Support for Your Mental Wellbeing</h1>
            <p className="hero-subtitle">
              Track your moods, chat with our AI assistant, and find strategies to improve your mental health.
            </p>
            {user ? (
              <Link to="/dashboard" className="cta-button">Go to Dashboard</Link>
            ) : (
              <Link to="/register" className="cta-button">Get Started</Link>
            )}
          </div>
          <div className="hero-image">
            <img src="/images/mental-health-illustration.svg" alt="Mental health support" />
          </div>
        </section>

        <section className="features-section">
          <h2>How It Helps You</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🗣️</div>
              <h3>AI Chat Support</h3>
              <p>Talk with our AI assistant about your thoughts, feelings, and concerns in a safe, private space.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Mood Tracking</h3>
              <p>Log your daily moods and activities to identify patterns and triggers over time.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🧠</div>
              <h3>Coping Strategies</h3>
              <p>Discover evidence-based techniques to help manage stress, anxiety, and other difficult emotions.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Progress Insights</h3>
              <p>View your mental wellbeing trends and celebrate your consistency with streak tracking.</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>About Mental Health Assistant</h2>
          <p>
            Our platform combines AI technology with evidence-based mental health practices to provide accessible support.
            While we're not a replacement for professional care, we offer a complementary tool for your mental health journey.
          </p>
          <div className="disclaimer">
            <h3>Important Note</h3>
            <p>
              If you're experiencing a mental health crisis or emergency, please contact a crisis line or seek professional help immediately:
            </p>
            <ul>
              <li>National Suicide Prevention Lifeline: 988 or 1-800-273-8255</li>
              <li>Crisis Text Line: Text HOME to 741741</li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <p>© {new Date().getFullYear()} Mental Health Assistant</p>
        <p>This is an AI assistant and not a replacement for professional mental health care.</p>
      </footer>
    </div>
  );
};

export default HomePage;
