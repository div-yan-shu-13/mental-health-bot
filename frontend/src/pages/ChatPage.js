import React, { useState, useEffect, useRef } from 'react';
import { chatbotService } from '../services/api';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // Welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        text: "Hello! I'm MindBot, your mental health companion. I'm here to listen, support, and chat with you about anything on your mind. How are you feeling today? 💙",
        isBot: true,
        timestamp: new Date()
      }
    ]);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError('');

    try {
      const response = await chatbotService.sendMessage(inputMessage.trim());
      
      const botMessage = {
        id: Date.now() + 1,
        text: response.data.response,
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setError('Sorry, I\'m having trouble responding right now. Please try again.');
      
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm sorry, but I'm experiencing some technical difficulties right now. Please try again in a moment, or feel free to continue our conversation. 💙",
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypingIndicator = () => (
    <div className="message bot typing">
      <div className="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div style={{ fontSize: '0.8rem', color: '#a0aec0', marginTop: '0.5rem' }}>
        MindBot is typing...
      </div>
    </div>
  );

  return (
    <div className="content">
      {/* Header */}
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Chat with MindBot 💬</h1>
          <p className="card-subtitle">
            Your AI mental health companion is here to listen and support you
          </p>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="chat-container">
        {/* Messages */}
        <div className="chat-messages">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`message ${message.isBot ? 'bot' : 'user'}`}
            >
              <div className="message-content">
                {message.text}
              </div>
              <div className="message-time">
                {formatTime(message.timestamp)}
              </div>
            </div>
          ))}
          
          {isLoading && getTypingIndicator()}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="chat-input-container">
          <input
            type="text"
            className="chat-input"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message here..."
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="btn"
            disabled={!inputMessage.trim() || isLoading}
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </form>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>

      {/* Chat Guidelines */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Chat Guidelines 📋</h2>
          <p className="card-subtitle">
            How to make the most of your conversation with MindBot
          </p>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1.5rem' 
        }}>
          <div style={{
            padding: '1.5rem',
            background: 'rgba(102, 126, 234, 0.2)',
            borderRadius: '12px',
            border: '1px solid rgba(102, 126, 234, 0.3)'
          }}>
            <h4 style={{ marginBottom: '1rem', color: '#e2e8f0' }}>💭 Be Open & Honest</h4>
            <p style={{ margin: 0, color: '#a0aec0', lineHeight: '1.6' }}>
              Share your thoughts and feelings openly. MindBot is here to listen without judgment.
            </p>
          </div>
          
          <div style={{
            padding: '1.5rem',
            background: 'rgba(72, 187, 120, 0.2)',
            borderRadius: '12px',
            border: '1px solid rgba(72, 187, 120, 0.3)'
          }}>
            <h4 style={{ marginBottom: '1rem', color: '#e2e8f0' }}>🎯 Ask Specific Questions</h4>
            <p style={{ margin: 0, color: '#a0aec0', lineHeight: '1.6' }}>
              The more specific you are, the better MindBot can support and guide you.
            </p>
          </div>
          
          <div style={{
            padding: '1.5rem',
            background: 'rgba(237, 137, 54, 0.2)',
            borderRadius: '12px',
            border: '1px solid rgba(237, 137, 54, 0.3)'
          }}>
            <h4 style={{ marginBottom: '1rem', color: '#e2e8f0' }}>🔄 Keep the Conversation Going</h4>
            <p style={{ margin: 0, color: '#a0aec0', lineHeight: '1.6' }}>
              Feel free to ask follow-up questions or explore topics in more detail.
            </p>
          </div>
        </div>
      </div>

      {/* Conversation Starters */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Conversation Starters 💡</h2>
          <p className="card-subtitle">
            Not sure what to talk about? Try one of these topics
          </p>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1rem' 
        }}>
          {[
            "I've been feeling stressed lately. Can you help me understand why?",
            "What are some good ways to practice self-care?",
            "I'm having trouble sleeping. Any suggestions?",
            "How can I build better habits?",
            "I'm feeling overwhelmed. What should I do?",
            "Can you help me set some mental health goals?"
          ].map((starter, index) => (
            <button
              key={index}
              onClick={() => setInputMessage(starter)}
              style={{
                padding: '1rem',
                background: 'rgba(26, 32, 44, 0.8)',
                border: '2px solid rgba(74, 85, 104, 0.3)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'left',
                fontSize: '0.9rem',
                color: '#e2e8f0',
                lineHeight: '1.4'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(102, 126, 234, 0.2)';
                e.target.style.borderColor = '#667eea';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(26, 32, 44, 0.8)';
                e.target.style.borderColor = 'rgba(74, 85, 104, 0.3)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              {starter}
            </button>
          ))}
        </div>
      </div>

      {/* Important Notice */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Important Notice ⚠️</h2>
          <p className="card-subtitle">
            MindBot is here to support you, but please remember
          </p>
        </div>
        
        <div style={{
          padding: '1.5rem',
          background: 'rgba(237, 137, 54, 0.2)',
          borderRadius: '12px',
          border: '1px solid rgba(237, 137, 54, 0.3)',
          textAlign: 'center'
        }}>
          <p style={{ 
            margin: 0, 
            color: '#feb2b2',
            lineHeight: '1.6',
            fontSize: '1rem'
          }}>
            <strong>MindBot is not a substitute for professional mental health care.</strong> 
            If you're experiencing a mental health crisis or need immediate support, 
            please contact a mental health professional or call your local crisis hotline.
          </p>
          
          <div style={{ 
            marginTop: '1rem',
            padding: '1rem',
            background: 'rgba(26, 32, 44, 0.8)',
            borderRadius: '8px',
            border: '1px solid rgba(74, 85, 104, 0.3)'
          }}>
            <p style={{ margin: 0, color: '#a0aec0', fontSize: '0.9rem' }}>
              <strong>National Suicide Prevention Lifeline (US):</strong> 988 or 1-800-273-8255
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
