import React, { useState, useRef, useEffect } from 'react';
import { chatbotService } from '../services/api';
import './ChatPage.css';

const ChatPage = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi there! I\'m here to listen and support you. How are you feeling today?' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || loading) return;
    
    // Add user message to chat
    const userMessage = { role: 'user', content: newMessage };
    setMessages([...messages, userMessage]);
    setNewMessage('');
    setLoading(true);
    
    try {
      // Get response from chatbot
      const response = await chatbotService.sendMessage(newMessage);
      
      // Add assistant response to chat
      const assistantMessage = { role: 'assistant', content: response.data.response };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (err) {
      console.error('Error getting chatbot response:', err);
      
      // Add error message
      const errorMessage = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <h1>Chat Support</h1>
      
      <div className="chat-box">
        <div className="messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              {message.content}
            </div>
          ))}
          
          {loading && (
            <div className="message assistant loading-message">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSendMessage} className="message-form">
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
      </div>
      
      <div className="chat-disclaimer">
        <p>
          This AI assistant is here to provide support, but is not a replacement for professional mental health care.
          If you're experiencing a crisis, please contact a mental health professional or crisis service immediately.
        </p>
      </div>
    </div>
  );
};

export default ChatPage;
