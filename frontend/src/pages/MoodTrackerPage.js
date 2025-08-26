import React, { useState, useEffect } from 'react';
import { moodService } from '../services/api';

const MoodTrackerPage = () => {
  const [moodScore, setMoodScore] = useState(null);
  const [notes, setNotes] = useState('');
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    fetchMoods();
  }, []);

  const fetchMoods = async () => {
    try {
      setLoading(true);
      const response = await moodService.getMoods();
      setMoods(response.data);
    } catch (error) {
      console.error('Error fetching moods:', error);
      setMessage('Failed to load mood history');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSelect = (score) => {
    setMoodScore(score);
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!moodScore) {
      setMessage('Please select a mood score');
      setMessageType('error');
      return;
    }

    try {
      setSubmitting(true);
      await moodService.addMood(moodScore, notes);
      
      setMessage('Mood recorded successfully! 🎉');
      setMessageType('success');
      setMoodScore(null);
      setNotes('');
      
      // Refresh mood list
      fetchMoods();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
      
    } catch (error) {
      console.error('Error adding mood:', error);
      setMessage('Failed to record mood. Please try again.');
      setMessageType('error');
    } finally {
      setSubmitting(false);
    }
  };

  const getMoodEmoji = (score) => {
    const emojis = ['😢', '😔', '😐', '🙂', '😄'];
    const index = Math.floor((score - 1) / 2);
    return emojis[Math.min(index, emojis.length - 1)];
  };

  const getMoodLabel = (score) => {
    if (score >= 9) return 'Excellent';
    if (score >= 7) return 'Great';
    if (score >= 5) return 'Good';
    if (score >= 3) return 'Okay';
    if (score >= 1) return 'Poor';
    return 'Terrible';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="content">
      {/* Header */}
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Track Your Mood 😊</h1>
          <p className="card-subtitle">
            How are you feeling right now? Take a moment to check in with yourself.
          </p>
        </div>
      </div>

      {/* Mood Selection Form */}
      <div className="mood-form">
        <h2 style={{ marginBottom: '1.5rem', color: '#e2e8f0', textAlign: 'center' }}>
          Rate your current mood (1-10)
        </h2>
        
        <div className="mood-scale">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
            <div 
              key={score} 
              className="mood-option"
              onClick={() => handleMoodSelect(score)}
            >
              <div 
                className={`mood-circle mood-${score} ${moodScore === score ? 'selected' : ''}`}
                style={{
                  transform: moodScore === score ? 'scale(1.1)' : 'scale(1)',
                  boxShadow: moodScore === score ? '0 8px 25px rgba(0,0,0,0.5)' : 'none'
                }}
              >
                {score}
              </div>
              <div className="mood-label">
                {score === 1 ? 'Terrible' : 
                 score === 5 ? 'Okay' : 
                 score === 10 ? 'Amazing' : ''}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              💭 Additional Notes (Optional)
            </label>
            <textarea
              className="form-input form-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What's on your mind? Any specific thoughts or feelings you'd like to share?"
            />
          </div>

          {message && (
            <div className={messageType === 'success' ? 'success-message' : 'error-message'}>
              {message}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-full"
            disabled={!moodScore || submitting}
          >
            {submitting ? (
              <>
                <div className="spinner" style={{ width: '20px', height: '20px', margin: '0 0.5rem 0 0' }}></div>
                Recording Mood...
              </>
            ) : (
              '📝 Record My Mood'
            )}
          </button>
        </form>
      </div>

      {/* Mood History */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Your Mood Journey 📈</h2>
          <p className="card-subtitle">
            Track your emotional patterns over time
          </p>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            Loading your mood history...
          </div>
        ) : moods.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            color: '#a0aec0'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
            <h3 style={{ marginBottom: '1rem', color: '#e2e8f0' }}>
              No mood entries yet
            </h3>
            <p>Start tracking your mood to see your emotional journey!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {moods.slice(0, 10).map((mood) => (
              <div 
                key={mood.id}
                style={{
                  padding: '1.5rem',
                  background: 'rgba(26, 32, 44, 0.8)',
                  borderRadius: '12px',
                  border: '1px solid rgba(74, 85, 104, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <div 
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '1.2rem',
                    background: `linear-gradient(135deg, 
                      ${mood.score >= 8 ? '#48bb78' : 
                        mood.score >= 6 ? '#38b2ac' : 
                        mood.score >= 4 ? '#ecc94b' : 
                        mood.score >= 2 ? '#ed8936' : '#e53e3e'}, 
                      ${mood.score >= 8 ? '#38a169' : 
                        mood.score >= 6 ? '#319795' : 
                        mood.score >= 4 ? '#d69e2e' : 
                        mood.score >= 2 ? '#dd6b20' : '#c53030'})`
                  }}
                >
                  {mood.score}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>
                      {getMoodEmoji(mood.score)}
                    </span>
                    <span style={{ 
                      fontWeight: '600', 
                      color: '#e2e8f0',
                      fontSize: '1.1rem'
                    }}>
                      {getMoodLabel(mood.score)} ({mood.score}/10)
                    </span>
                  </div>
                  
                  {mood.notes && (
                    <p style={{ 
                      margin: 0, 
                      color: '#a0aec0',
                      fontStyle: 'italic'
                    }}>
                      "{mood.notes}"
                    </p>
                  )}
                </div>
                
                <div style={{ 
                  color: '#a0aec0', 
                  fontSize: '0.9rem',
                  textAlign: 'right'
                }}>
                  {formatDate(mood.created_at)}
                </div>
              </div>
            ))}
            
            {moods.length > 10 && (
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <p style={{ color: '#a0aec0' }}>
                  Showing last 10 entries. You have {moods.length} total mood records!
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Encouragement */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Why Track Your Mood? 🤔</h2>
          <p className="card-subtitle">
            Understanding your emotional patterns can lead to better mental health
          </p>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem' 
        }}>
          <div style={{
            padding: '1.5rem',
            background: 'rgba(102, 126, 234, 0.2)',
            borderRadius: '12px',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
            <h4 style={{ marginBottom: '0.5rem', color: '#e2e8f0' }}>Pattern Recognition</h4>
            <p style={{ margin: 0, color: '#a0aec0', fontSize: '0.9rem' }}>
              Identify triggers and patterns in your emotional well-being
            </p>
          </div>
          
          <div style={{
            padding: '1.5rem',
            background: 'rgba(72, 187, 120, 0.2)',
            borderRadius: '12px',
            border: '1px solid rgba(72, 187, 120, 0.3)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎯</div>
            <h4 style={{ marginBottom: '0.5rem', color: '#e2e8f0' }}>Goal Setting</h4>
            <p style={{ margin: 0, color: '#a0aec0', fontSize: '0.9rem' }}>
              Set and track progress toward your mental health goals
            </p>
          </div>
          
          <div style={{
            padding: '1.5rem',
            background: 'rgba(237, 137, 54, 0.2)',
            borderRadius: '12px',
            border: '1px solid rgba(237, 137, 54, 0.3)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💪</div>
            <h4 style={{ marginBottom: '0.5rem', color: '#e2e8f0' }}>Self-Awareness</h4>
            <p style={{ margin: 0, color: '#a0aec0', fontSize: '0.9rem' }}>
              Build better understanding of your emotional landscape
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodTrackerPage;
