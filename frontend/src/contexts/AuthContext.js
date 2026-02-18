import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { getErrorFromResponse } from '../utils/errorHandler';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { access_token, user_type, user_id, recruiter_id } = response.data;
      
      const userData = {
        user_type,
        id: user_id || recruiter_id,
        email: credentials.email
      };
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: getErrorFromResponse(error, 'Login failed')
      };
    }
  };

  const register = async (userData, type) => {
    try {
      const response = type === 'user' 
        ? await authAPI.registerUser(userData)
        : await authAPI.registerRecruiter(userData);
      
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: getErrorFromResponse(error, 'Registration failed')
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    isUser: user?.user_type === 'user',
    isRecruiter: user?.user_type === 'recruiter'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};