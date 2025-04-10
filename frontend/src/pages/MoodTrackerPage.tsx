import React, { useState, useEffect } from 'react';
import { moodAPI } from '../services/api';
import { MoodEntry, MoodSummary } from '../types';
import { format } from 'date-fns';
import { Line, Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import Layout from '../components/Layout';
import MoodForm from '../components/MoodForm';
import '../styles/MoodTracker.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement,
  BarElement,
  Title, 
  Tooltip, 
  Legend
);

const MoodTrackerPage: React.FC = () => {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [moodSummary, setMoodSummary] = useState<MoodSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState(30); // Default 30 days
  
  // Fetch mood entries and summary
  const fetchMoodData = async () => {
    setLoading(true);
    try {
      const [entriesRes, summaryRes] = await Promise.all([
        moodAPI.getMoods(),
        moodAPI.getMoodSummary(timeframe)
      ]);
      
      setMoodEntries(entriesRes.data.entries);
      setMoodSummary(summaryRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to load mood data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Load data on initial render and timeframe change
  useEffect(() => {
    fetchMoodData();
  }, [timeframe]);
  
  // Handle adding a new mood entry
  const handleAddMood = async (moodData: {mood_score: number, notes?: string, activities?: string[]}) => {
    try {
      await moodAPI.addMood(moodData);
      fetchMoodData(); // Refresh data
    } catch (err) {
      setError('Failed to add mood entry');
      console.error(err);
    }
  };
  
  // Prepare chart data for mood timeline
  const timelineChartData = {
    labels: moodSummary?.summary.timeline.map(item => 
      format(new Date(item.date), 'MMM d')
    ) || [],
    datasets: [
      {
        label: 'Mood Score',
        data: moodSummary?.summary.timeline.map(item => item.score) || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.2
      }
    ]
  };
  
  // Prepare chart data for day of week averages
  const dayOfWeekChartData = {
    labels: moodSummary?.summary.day_of_week.map(item => item.day) || [],
    datasets: [
      {
        label: 'Average Mood',
        data: moodSummary?.summary.day_of_week.map(item => item.average) || [],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      }
    ]
  };
  
  return (
    <Layout>
      <div className="mood-tracker-container">
        <h1>Mood Tracker</h1>
        
        {/* Mood entry form */}
        <div className="mood-form-section">
          <h2>How are you feeling today?</h2>
          <MoodForm onSubmit={handleAddMood} />
        </div>
        
        {/* Streaks information */}
        <div className="streaks-section">
          <div className="streak-card">
            <h3>Current Streak</h3>
            <div className="streak-value">{moodSummary?.current_streak || 0}</div>
            <p>days in a row</p>
          </div>
          
          <div className="streak-card">
            <h3>Best Streak</h3>
            <div className="streak-value">{moodSummary?.best_streak || 0}</div>
            <p>days in a row</p>
          </div>
          
          <div className="streak-card">
            <h3>Average Mood</h3>
            <div className="streak-value">
              {moodSummary?.average_mood?.toFixed(1) || 'N/A'}
            </div>
            <p>out of 10</p>
          </div>
        </div>
        
        {/* Timeframe selector */}
        <div className="timeframe-selector">
          <label>View data for: </label>
          <div className="timeframe-buttons">
            <button 
              className={timeframe === 7 ? 'active' : ''} 
              onClick={() => setTimeframe(7)}
            >
              7 Days
            </button>
            <button 
              className={timeframe === 30 ? 'active' : ''} 
              onClick={() => setTimeframe(30)}
            >
              30 Days
            </button>
            <button 
              className={timeframe === 90 ? 'active' : ''} 
              onClick={() => setTimeframe(90)}
            >
              90 Days
            </button>
          </div>
        </div>
        
        {/* Charts */}
        {loading ? (
          <div className="loading">Loading mood data...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="charts-section">
            <div className="chart-container">
              <h2>Mood Timeline</h2>
              <Line 
                data={timelineChartData} 
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      min: 1,
                      max: 10,
                      title: {
                        display: true,
                        text: 'Mood Score'
                      }
                    }
                  }
                }}
              />
            </div>
            
            <div className="chart-container">
              <h2>Mood by Day of Week</h2>
              <Bar 
                data={dayOfWeekChartData}
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      min: 0,
                      max: 10,
                      title: {
                        display: true,
                        text: 'Average Score'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        )}
        
        {/* Recent entries */}
        <div className="entries-section">
          <h2>Recent Entries</h2>
          
          {moodEntries.length === 0 ? (
            <p>No mood entries yet. Start tracking your mood!</p>
          ) : (
            <div className="entries-list">
              {moodEntries.slice(0, 10).map(entry => (
                <div key={entry.id} className="entry-card">
                  <div className="entry-header">
                    <div className="mood-score">{entry.mood_score}/10</div>
                    <div className="entry-date">
                      {format(new Date(entry.timestamp), 'PPp')}
                    </div>
                  </div>
                  
                  {entry.notes && (
                    <div className="entry-notes">{entry.notes}</div>
                  )}
                  
                  {entry.activities && entry.activities.length > 0 && (
                    <div className="entry-activities">
                      <span>Activities: </span>
                      {entry.activities.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MoodTrackerPage;
