// User related types
export interface User {
    id: number;
    email: string;
    name: string;
    created_at: string;
    current_streak: number;
    best_streak: number;
  }
  
  export interface AuthResponse {
    message: string;
    token: string;
    user: User;
  }
  
  // Mood tracking types
  export interface MoodEntry {
    id: number;
    mood_score: number;
    notes: string;
    activities: string[];
    timestamp: string;
    user_id: number;
  }
  
  export interface MoodSummary {
    summary: {
      timeline: Array<{date: string, score: number}>;
      day_of_week: Array<{day: string, average: number}>;
    };
    current_streak: number;
    best_streak: number;
    entry_count: number;
    average_mood: number;
  }
  
  // Chat types
  export interface ChatMessage {
    id: number;
    content: string;
    role: 'user' | 'assistant';
    timestamp: string;
    session_id: number;
  }
  
  export interface ChatSession {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
    user_id: number;
    message_count: number;
  }
  
  export interface ChatSessionWithMessages {
    session: ChatSession;
    messages: ChatMessage[];
  }
  