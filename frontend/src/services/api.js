import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true  // Important for sending/receiving cookies
});

// Authentication services
export const authService = {
  register: (username, email, password) => 
    api.post('/auth/register', { username, email, password }),
  
  login: (username, password, remember = false) => 
    api.post('/auth/login', { username, password, remember }),
  
  logout: () => 
    api.post('/auth/logout'),
  
  getCurrentUser: () => 
    api.get('/auth/me'),
};

// Mood tracking services
export const moodService = {
  addMood: (score, notes) => 
    api.post('/mood', { score, notes }),
  
  getMoods: () => 
    api.get('/mood'),
  
  getInsights: () => 
    api.get('/mood/insights'),
};

// Chatbot services
export const chatbotService = {
  sendMessage: (message) => 
    api.post('/chatbot/chat', { message }),
};

export const selfCareService = {
  getTips: () => api.get('/self_care_tips'),
};

export default api;
