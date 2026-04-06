import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import socket from '../services/socket';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('devmatch_token'));
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/users/me');
      setUser(data);
      socket.connect();
      socket.emit('user_online', data._id);
    } catch (err) {
      console.error('Auth fetch failed:', err);
      localStorage.removeItem('devmatch_token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = (newToken, userData) => {
    localStorage.setItem('devmatch_token', newToken);
    setToken(newToken);
    setUser(userData);
    socket.connect();
    socket.emit('user_online', userData._id);
  };

  const logout = () => {
    localStorage.removeItem('devmatch_token');
    localStorage.removeItem('devmatch_user');
    setToken(null);
    setUser(null);
    socket.disconnect();
  };

  const updateUser = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}
