import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';
import { User } from '../types';
import jwt_decode from 'jwt-decode';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if token is valid
  const isTokenValid = (): boolean => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const decoded: any = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (err) {
      return false;
    }
  };

  // Load user data on initialization
  useEffect(() => {
    const loadUser = async () => {
      if (!isTokenValid()) {
        localStorage.removeItem('token');
        setLoading(false);
        return;
      }
      
      try {
        const { data } = await authAPI.getCurrentUser();
        setUser(data.user);
      } catch (err) {
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Login function
  const login = async (email: string, password: string, remember: boolean = false) => {
    try {
      setLoading(true);
      const { data } = await authAPI.login(email, password, remember);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      await authAPI.register(name, email, password);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await authAPI.logout();
    } catch (err) {
      // Continue logout even if API call fails
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    }
  };

  // Update user function
  const updateUser = async (userData: Partial<User>) => {
    try {
      setLoading(true);
      const { data } = await authAPI.updateUser(userData);
      setUser(data.user);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
