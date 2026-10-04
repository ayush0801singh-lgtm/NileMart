import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import authService from '../api/services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('nilemart_tokens');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const decoded = jwtDecode(parsed.access);
        if (decoded.exp * 1000 > Date.now()) {
          setTokens(parsed);
          setUser(JSON.parse(localStorage.getItem('nilemart_user') || 'null'));
        } else {
          localStorage.removeItem('nilemart_tokens');
          localStorage.removeItem('nilemart_user');
        }
      } catch {
        localStorage.removeItem('nilemart_tokens');
        localStorage.removeItem('nilemart_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await authService.login(email, password);
    const { tokens: newTokens, user: newUser } = response.data;
    localStorage.setItem('nilemart_tokens', JSON.stringify(newTokens));
    localStorage.setItem('nilemart_user', JSON.stringify(newUser));
    setTokens(newTokens);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      if (tokens?.refresh) {
        await authService.logout(tokens.refresh);
      }
    } finally {
      localStorage.removeItem('nilemart_tokens');
      localStorage.removeItem('nilemart_user');
      setTokens(null);
      setUser(null);
    }
  }, [tokens]);

  const updateTokens = useCallback((newTokens) => {
    localStorage.setItem('nilemart_tokens', JSON.stringify(newTokens));
    setTokens(newTokens);
  }, []);

  return (
    <AuthContext.Provider value={{ user, tokens, loading, login, logout, updateTokens }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}