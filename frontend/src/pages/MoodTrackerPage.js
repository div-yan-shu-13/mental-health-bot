import React, { useState, useEffect } from 'react';
import { moodService } from '../services/api';
import './MoodTrackerPage.css';

const MoodTrackerPage = () => {
  const [moodScore, setMoodScore] = useState(5);
  const [notes, setNotes] = useState('');
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch existing mood entries
  useEffect(() => {
    const fetchMoods = async () => {
      try {
        const response = await moodService.getMoods();
        setMoods(response.data);
        setError('');
      } catch (err) {
        setError('Failed to load mood entries');
        console.error('Error fetching moods:', err.response || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMoods();
  }, []);

  // Handle mood submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await moodService.addMood(moodScore, notes);
      setMoods([response.data, ...moods]);
      setNotes('');
      setSuccess('Mood logged successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to log mood');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Get emoji based on mood score
  const getMoodEmoji = (score) => {
    if (score <= 2) return '😢';
    if (score <= 4) return '😕';
    if (score <= 6) return '😐';
    if (score <= 8) return '🙂';
    return '😄';
  };

  return (
    <div className="mood-tracker-container">
      <h1>Mood Tracker</h1>
      
      <div className="mood-form-container">
        <h2>How are you feeling today?</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mood-slider-container">
            <div className="mood-emoji">{getMoodEmoji(moodScore)}</div>
            <input
              type="range"
              min="1"
              max="10"
              value={moodScore}
              onChange={(e) => setMoodScore(parseInt(e.target.value))}
              className="mood-slider"
            />
            <div className="mood-scale">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6</span>
              <span>7</span>
              <span>8</span>
              <span>9</span>
              <span>10</span>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What's on your mind today?"
              rows="4"
            ></textarea>
          </div>
          
          <button type="submit" disabled={submitting}>
            {submitting ? 'Logging...' : 'Log Mood'}
          </button>
        </form>
      </div>
      
      <div className="mood-history-container">
        <h2>Mood History</h2>
        
        {loading ? (
          <div className="loading">Loading mood history...</div>
        ) : moods.length === 0 ? (
          <p>No mood entries yet. Start tracking your mood!</p>
        ) : (
          <div className="mood-entries">
            {moods.map((mood) => (
              <div key={mood.id} className="mood-entry">
                <div className="mood-entry-header">
                  <div className="mood-entry-score">
                    <span className="mood-emoji">{getMoodEmoji(mood.score)}</span>
                    <span className="score-value">{mood.score}/10</span>
                  </div>
                  <div className="mood-entry-date">
                    {new Date(mood.created_at).toLocaleDateString()} at {new Date(mood.created_at).toLocaleTimeString()}
                  </div>
                </div>
                {mood.notes && <div className="mood-entry-notes">{mood.notes}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodTrackerPage;
