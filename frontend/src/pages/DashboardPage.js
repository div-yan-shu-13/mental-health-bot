import React, { useState, useEffect } from 'react';
import { moodService } from '../services/api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './DashboardPage.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DashboardPage = () => {
  const [moods, setMoods] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moodsResponse, insightsResponse] = await Promise.all([
          moodService.getMoods(),
          moodService.getInsights()
        ]);
        
        setMoods(moodsResponse.data);
        setInsights(insightsResponse.data);
        setError('');
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare chart data
  const chartData = {
    labels: moods.slice(0, 10).map(mood => {
      const date = new Date(mood.created_at);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }).reverse(),
    datasets: [
      {
        label: 'Mood Score',
        data: moods.slice(0, 10).map(mood => mood.score).reverse(),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="dashboard-grid">
        <div className="chart-container">
          <h2>Recent Mood Trends</h2>
          {moods.length > 0 ? (
            <Line data={chartData} />
          ) : (
            <p>No mood data available yet. Start tracking your mood!</p>
          )}
        </div>
        
        <div className="insights-container">
          <h2>Insights</h2>
          {insights ? (
            <div>
              <div className="insight-summary">
                <div className="insight-stat">
                  <span className="stat-value">{insights.average_mood}</span>
                  <span className="stat-label">Average Mood</span>
                </div>
                <div className="insight-stat">
                  <span className="stat-value">{insights.total_entries}</span>
                  <span className="stat-label">Total Entries</span>
                </div>
              </div>
              
              <div className="insight-list">
                {insights.insights.map((insight, index) => (
                  <div key={index} className={`insight-item ${insight.type}`}>
                    {insight.message}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p>Track your mood regularly to receive personalized insights.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
