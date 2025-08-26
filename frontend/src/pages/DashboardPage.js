import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { moodService, selfCareService } from '../services/api';

const DashboardPage = ({ user }) => {
  const [moodCount, setMoodCount] = useState(0);
  const [averageMood, setAverageMood] = useState(0);
  const [selfCareTips, setSelfCareTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch mood data
        const moodsResponse = await moodService.getMoods();
        const moods = moodsResponse.data;
        setMoodCount(moods.length);
        
        if (moods.length > 0) {
          const total = moods.reduce((sum, mood) => sum + mood.score, 0);
          setAverageMood(Math.round((total / moods.length) * 10) / 10);
        }
        
        // Fetch self-care tips
        const tipsResponse = await selfCareService.getTips();
        setSelfCareTips(tipsResponse.data.tips.slice(0, 3)); // Show only 3 tips
        
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getMoodEmoji = (score) => {
    if (score >= 8) return '😄';
    if (score >= 6) return '🙂';
    if (score >= 4) return '😐';
    if (score >= 2) return '😔';
    return '😢';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading your dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Error</h2>
          <p className="card-subtitle">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="btn btn-secondary"
        >
          🔄 Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="content">
      {/* Welcome Section */}
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Welcome back, {user?.username}! 👋</h1>
          <p className="card-subtitle">
            Let's check in on your mental health journey today
          </p>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="dashboard-icon icon-mood">
            😊
          </div>
          <div className="dashboard-number">{moodCount}</div>
          <div className="dashboard-label">Mood Entries</div>
          <p style={{ marginTop: '1rem', color: '#a0aec0', fontSize: '0.9rem' }}>
            {moodCount === 0 ? 'Start tracking your mood today!' : 'Keep up the great work!'}
          </p>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-icon icon-chat">
            💬
          </div>
          <div className="dashboard-number">
            {averageMood > 0 ? averageMood : 'N/A'}
          </div>
          <div className="dashboard-label">Average Mood</div>
          {averageMood > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>
                {getMoodEmoji(averageMood)}
              </span>
              <p style={{ color: '#a0aec0', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                {averageMood >= 8 ? 'Excellent!' : 
                 averageMood >= 6 ? 'Good!' : 
                 averageMood >= 4 ? 'Okay' : 
                 averageMood >= 2 ? 'Could be better' : 'Let\'s talk'}
              </p>
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <div className="dashboard-icon icon-tips">
            💡
          </div>
          <div className="dashboard-number">{selfCareTips.length}</div>
          <div className="dashboard-label">Self-Care Tips</div>
          <p style={{ marginTop: '1rem', color: '#a0aec0', fontSize: '0.9rem' }}>
            Fresh tips to boost your mood
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Quick Actions</h2>
          <p className="card-subtitle">What would you like to do today?</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <Link to="/mood" className="btn btn-full">
            📝 Track My Mood
          </Link>
          
          <Link to="/chat" className="btn btn-full">
            💬 Chat with MindBot
          </Link>
          
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-secondary btn-full"
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {/* Self-Care Tips */}
      {selfCareTips.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Today's Self-Care Tips</h2>
            <p className="card-subtitle">Small actions for big impact</p>
          </div>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            {selfCareTips.map((tip, index) => (
              <div 
                key={index}
                style={{
                  padding: '1rem',
                  background: 'rgba(102, 126, 234, 0.2)',
                  borderRadius: '12px',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  borderLeft: '4px solid #667eea'
                }}
              >
                <p style={{ margin: 0, color: '#e2e8f0', lineHeight: '1.6' }}>
                  💡 {tip}
                </p>
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link to="/mood" className="btn btn-secondary">
              Get More Tips
            </Link>
          </div>
        </div>
      )}

      {/* Encouragement */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Remember 🌟</h2>
          <p className="card-subtitle">
            Your mental health matters. Every step you take towards self-care is a victory.
          </p>
        </div>
        
        <div style={{ 
          textAlign: 'center', 
          padding: '1rem', 
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(159, 122, 234, 0.2))',
          borderRadius: '12px',
          border: '1px solid rgba(102, 126, 234, 0.3)'
        }}>
          <p style={{ 
            margin: 0, 
            fontSize: '1.1rem', 
            color: '#e2e8f0',
            fontStyle: 'italic'
          }}>
            "The only way to do great work is to love what you do." - Steve Jobs
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
