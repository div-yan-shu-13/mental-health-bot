import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatAPI } from '../services/api';
import { ChatSession, ChatMessage } from '../types';
import Layout from '../components/Layout';
import '../styles/Chat.css';

const ChatPage: React.FC = () => {
  const { sessionId } = useParams<{sessionId?: string}>();
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<number | null>(sessionId ? parseInt(sessionId) : null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch chat sessions
  const fetchSessions = async () => {
    try {
      setSessionLoading(true);
      const { data } = await chatAPI.getChatSessions();
      setSessions(data);
      
      // If no active session but sessions exist, set the first as active
      if (!activeSession && data.length > 0) {
        setActiveSession(data[0].id);
        navigate(`/chat/${data[0].id}`);
      }
    } catch (err) {
      setError('Failed to load chat sessions');
      console.error(err);
    } finally {
      setSessionLoading(false);
    }
  };
  
  // Fetch messages for active session
  const fetchMessages = async (sessionId: number) => {
    try {
      setLoading(true);
      const { data } = await chatAPI.getChatSession(sessionId);
      setMessages(data.messages);
    } catch (err) {
      setError('Failed to load chat messages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Create a new chat session
  const handleNewSession = async () => {
    try {
      const { data } = await chatAPI.createChatSession('New Chat');
      setSessions([data, ...sessions]);
      setActiveSession(data.id);
      navigate(`/chat/${data.id}`);
      setMessages([]);
    } catch (err) {
      setError('Failed to create new chat');
      console.error(err);
    }
  };
  
  // Send a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeSession || !newMessage.trim() || loading) return;
    
    try {
      setLoading(true);
      
      // Optimistically update UI
      const tempUserMessage: ChatMessage = {
        id: Date.now(),
        content: newMessage,
        role: 'user',
        timestamp: new Date().toISOString(),
        session_id: activeSession
      };
      
      setMessages(prev => [...prev, tempUserMessage]);
      setNewMessage('');
      
      // Send to API
      const { data } = await chatAPI.sendMessage(activeSession, newMessage);
      
      // Update with real data
      setMessages(prev => {
        // Remove temp message and add real user + AI messages
        const filtered = prev.filter(msg => msg.id !== tempUserMessage.id);
        return [...filtered, data.user_message, data.ai_message];
      });
      
      // Update session list to reflect changes
      fetchSessions();
    } catch (err) {
      setError('Failed to send message');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Change active session
  const handleSessionChange = (sessionId: number) => {
    setActiveSession(sessionId);
    navigate(`/chat/${sessionId}`);
  };
  
  // Delete a session
  const handleDeleteSession = async (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this chat?')) {
      try {
        await chatAPI.deleteChatSession(sessionId);
        
        // Update sessions list
        setSessions(sessions.filter(session => session.id !== sessionId));
        
        // If deleted the active session, set a new active session
        if (activeSession === sessionId) {
          const remainingSessions = sessions.filter(session => session.id !== sessionId);
          if (remainingSessions.length > 0) {
            setActiveSession(remainingSessions[0].id);
            navigate(`/chat/${remainingSessions[0].id}`);
          } else {
            setActiveSession(null);
            navigate('/chat');
          }
        }
      } catch (err) {
        setError('Failed to delete chat');
        console.error(err);
      }
    }
  };
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Fetch sessions on initial render
  useEffect(() => {
    fetchSessions();
  }, []);
  
  // Fetch messages when active session changes
  useEffect(() => {
    if (activeSession) {
      fetchMessages(activeSession);
    }
  }, [activeSession]);
  
  return (
    <Layout>
      <div className="chat-container">
        {/* Sessions sidebar */}
        <div className="sessions-sidebar">
          <div className="sidebar-header">
            <h2>Conversations</h2>
            <button className="new-chat-btn" onClick={handleNewSession}>
              New Chat
            </button>
          </div>
          
          {sessionLoading ? (
            <div className="loading">Loading sessions...</div>
          ) : (
            <div className="sessions-list">
              {sessions.length === 0 ? (
                <div className="no-sessions">
                  <p>No conversations yet.</p>
                  <p>Start a new chat to begin!</p>
                </div>
              ) : (
                sessions.map(session => (
                  <div 
                    key={session.id}
                    className={`session-item ${session.id === activeSession ? 'active' : ''}`}
                    onClick={() => handleSessionChange(session.id)}
                  >
                    <div className="session-title">
                      {session.title}
                    </div>
                    <div className="session-date">
                      {new Date(session.updated_at).toLocaleDateString()}
                    </div>
                    <button 
                      className="delete-session-btn"
                      onClick={(e) => handleDeleteSession(session.id, e)}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        
        {/* Chat main area */}
        <div className="chat-main">
          {activeSession ? (
            <>
              {/* Chat messages */}
              <div className="chat-messages">
                {messages.length === 0 ? (
                  <div className="welcome-message">
                    <h2>Welcome to your Mental Health Assistant</h2>
                    <p>
                      I'm here to listen and provide support. You can talk about how you're feeling, 
                      ask for coping strategies, or just chat about what's on your mind.
                    </p>
                    <p>
                      Remember, I'm here to provide support but not medical advice. 
                      Always reach out to a healthcare professional for serious concerns.
                    </p>
                  </div>
                ) : (
                  messages.map(message => (
                    <div 
                      key={message.id}
                      className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
                    >
                      <div className="message-content">
                        {message.content}
                      </div>
                      <div className="message-time">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
                
                {loading && (
                  <div className="message assistant-message">
                    <div className="message-content typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message input */}
              <form className="message-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message here..."
                  disabled={loading}
                />
                <button type="submit" disabled={!newMessage.trim() || loading}>
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="no-active-session">
              <h2>Select a conversation or start a new one</h2>
              <button className="new-chat-btn" onClick={handleNewSession}>
                Start New Chat
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ChatPage;
