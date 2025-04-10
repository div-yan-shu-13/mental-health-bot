import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { moodAPI, chatAPI } from '../services/api';
import { MoodEntry, ChatSession } from '../types';
import Layout from '../components/Layout';
import { Line } from 'react-chartjs-2';
import { format, subDays } from 'date-fns';
import '../styles/Dashboard.css';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [recentMoods, setRecentMoods] = useState<MoodEntry[]>([]);
  const [recentChats, setRecentChats] = useState<ChatSession[]>([]);
  const [moodLoading, setMoodLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch recent mood entries and chat sessions
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch recent moods (last 7 days)
        const sevenDaysAgo = subDays(new Date(), 7).toISOString();
        const moodResponse = await moodAPI.getMoods({
          start_date: sevenDaysAgo,
          limit: 7
        });
        setRecentMoods(moodResponse.data.entries);
        setMoodLoading(false);

        // Fetch recent chat sessions
        const chatResponse = await chatAPI.getChatSessions();
        setRecentChats(chatResponse.data.slice(0, 5)); // Get only 5 most recent
        setChatLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        setMoodLoading(false);
        setChatLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Prepare mood chart data
  const moodChartData = {
    labels: recentMoods.map(mood => 
      format(new Date(mood.timestamp), 'MMM d')
    ).reverse(),
    datasets: [
      {
        label: 'Mood Score',
        data: recentMoods.map(mood => mood.mood_score).reverse(),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const getMoodEmoji = (score: number) => {
    if (score <= 2) return '😢';
    if (score <= 4) return '😕';
    if (score <= 6) return '😐';
    if (score <= 8) return '🙂';
    return '😄';
  };

  return (
    <Layout>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.name}!</h1>
          <p className="date-display">{format(new Date(), 'EEEE, MMMM do, yyyy')}</p>
        </div>

        <div className="dashboard-grid">
          {/* Mood tracking section */}
          <div className="dashboard-card mood-section">
            <div className="card-header">
              <h2>Your Mood</h2>
              <Link to="/mood-tracker" className="view-all-link">View All</Link>
            </div>
            
            {moodLoading ? (
              <div className="loading">Loading mood data...</div>
            ) : recentMoods.length === 0 ? (
              <div className="empty-state">
                <p>You haven't logged any moods recently.</p>
                <Link to="/mood-tracker" className="btn btn-primary">Log Your Mood</Link>
              </div>
            ) : (
              <>
                <div className="mood-chart">
                  <Line 
                    data={moodChartData} 
                    options={{
                      scales: {
                        y: {
                          min: 1,
                          max: 10,
                          title: {
                            display: true,
                            text: 'Mood Score'
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          display: false
                        }
                      },
                      maintainAspectRatio: false
                    }}
                  />
                </div>
                
                <div className="current-streak">
                  <div className="streak-label">Current Streak</div>
                  <div className="streak-value">{user?.current_streak || 0} days</div>
                </div>
                
                <Link to="/mood-tracker" className="btn btn-primary mood-log-btn">
                  Log Today's Mood
                </Link>
              </>
            )}
          </div>

          {/* Recent conversations section */}
          <div className="dashboard-card chat-section">
            <div className="card-header">
              <h2>Recent Conversations</h2>
              <Link to="/chat" className="view-all-link">View All</Link>
            </div>
            
            {chatLoading ? (
              <div className="loading">Loading chats...</div>
            ) : recentChats.length === 0 ? (
              <div className="empty-state">
                <p>You haven't had any conversations yet.</p>
                <Link to="/chat" className="btn btn-primary">Start Chatting</Link>
              </div>
            ) : (
              <>
                <div className="chat-list">
                  {recentChats.map(chat => (
                    <Link to={`/chat/${chat.id}`} key={chat.id} className="chat-item">
                      <div className="chat-title">{chat.title}</div>
                      <div className="chat-date">
                        {format(new Date(chat.updated_at), 'MMM d, h:mm a')}
                      </div>
                    </Link>
                  ))}
                </div>
                
                <Link to="/chat" className="btn btn-primary new-chat-btn">
                  Start New Chat
                </Link>
              </>
            )}
          </div>

          {/* Quick access section */}
          <div className="dashboard-card resources-section">
            <h2>Quick Access</h2>
            <div className="quick-links">
              <Link to="/mood-tracker" className="quick-link-card">
                <div className="quick-link-icon">📊</div>
                <div className="quick-link-text">Track Mood</div>
              </Link>
              <Link to="/chat" className="quick-link-card">
                <div className="quick-link-icon">💬</div>
                <div className="quick-link-text">Chat</div>
              </Link>
              <Link to="/profile" className="quick-link-card">
                <div className="quick-link-icon">👤</div>
                <div className="quick-link-text">Profile</div>
              </Link>
            </div>
            
            <div className="resource-links">
              <h3>Mental Health Resources</h3>
              <ul>
                <li><a href="https://www.nimh.nih.gov/" target="_blank" rel="noopener noreferrer">National Institute of Mental Health</a></li>
                <li><a href="https://www.nami.org/" target="_blank" rel="noopener noreferrer">National Alliance on Mental Illness</a></li>
                <li><a href="https://988lifeline.org/" target="_blank" rel="noopener noreferrer">988 Suicide & Crisis Lifeline</a></li>
              </ul>
            </div>
          </div>

          {/* Mood insights section */}
          <div className="dashboard-card insights-section">
            <h2>Mood Insights</h2>
            
            {moodLoading ? (
              <div className="loading">Loading insights...</div>
            ) : recentMoods.length < 3 ? (
              <div className="empty-state">
                <p>Track your mood regularly to get personalized insights.</p>
              </div>
            ) : (
              <div className="insights-content">
                <div className="current-mood">
                  <h3>Your most recent mood:</h3>
                  <div className="mood-display">
                    <span className="mood-emoji">
                      {getMoodEmoji(recentMoods[0].mood_score)}
                    </span>
                    <span className="mood-score">{recentMoods[0].mood_score}/10</span>
                  </div>
                  <div className="mood-time">
                    {format(new Date(recentMoods[0].timestamp), 'EEEE, h:mm a')}
                  </div>
                </div>
                
                <div className="mood-trend">
                  <h3>This week:</h3>
                  <p>
                    {recentMoods[0].mood_score > recentMoods[recentMoods.length - 1].mood_score
                      ? 'Your mood has improved compared to earlier this week.'
                      : recentMoods[0].mood_score < recentMoods[recentMoods.length - 1].mood_score
                      ? 'Your mood has declined compared to earlier this week.'
                      : 'Your mood has been stable this week.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
