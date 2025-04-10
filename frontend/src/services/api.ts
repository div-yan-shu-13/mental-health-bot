import axios from 'axios';
import { 
  AuthResponse, User, MoodEntry, MoodSummary, 
  ChatSession, ChatSessionWithMessages, ChatMessage 
} from '../types';

// Create Axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authentication token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication API
export const authAPI = {
  register: (name: string, email: string, password: string) => 
    api.post<{message: string}>('/auth/register', { name, email, password }),
  
  login: (email: string, password: string, remember: boolean = false) => 
    api.post<AuthResponse>('/auth/login', { email, password, remember }),
  
  logout: () => 
    api.post<{message: string}>('/auth/logout'),
  
  getCurrentUser: () => 
    api.get<{user: User}>('/auth/user'),
  
  updateUser: (userData: Partial<User>) => 
    api.put<{message: string, user: User}>('/auth/user', userData),
};

// Mood Tracking API
export const moodAPI = {
  getMoods: (params?: {start_date?: string, end_date?: string, limit?: number}) => 
    api.get<{entries: MoodEntry[], current_streak: number, best_streak: number}>('/mood', { params }),
  
  getMood: (id: number) => 
    api.get<MoodEntry>(`/mood/${id}`),
  
  addMood: (moodData: {mood_score: number, notes?: string, activities?: string[]}) => 
    api.post<{message: string, entry: MoodEntry, current_streak: number, best_streak: number}>('/mood', moodData),
  
  updateMood: (id: number, moodData: Partial<MoodEntry>) => 
    api.put<{message: string, entry: MoodEntry}>(`/mood/${id}`, moodData),
  
  deleteMood: (id: number) => 
    api.delete<{message: string}>(`/mood/${id}`),
  
  getMoodSummary: (days: number = 30) => 
    api.get<MoodSummary>('/mood/summary', { params: { days } }),
};

// Chat API
export const chatAPI = {
  getChatSessions: () => 
    api.get<ChatSession[]>('/chatbot/sessions'),
  
  createChatSession: (title?: string) => 
    api.post<ChatSession>('/chatbot/sessions', { title }),
  
  getChatSession: (sessionId: number) => 
    api.get<ChatSessionWithMessages>(`/chatbot/sessions/${sessionId}`),
  
  updateChatSession: (sessionId: number, title: string) => 
    api.put<ChatSession>(`/chatbot/sessions/${sessionId}`, { title }),
  
  deleteChatSession: (sessionId: number) => 
    api.delete<{message: string}>(`/chatbot/sessions/${sessionId}`),
  
  sendMessage: (sessionId: number, message: string) => 
    api.post<{user_message: ChatMessage, ai_message: ChatMessage}>(
      `/chatbot/sessions/${sessionId}/messages`, 
      { message }
    ),
};

// General resources
export const getResources = () => 
  api.get('/resources');

export default api;
