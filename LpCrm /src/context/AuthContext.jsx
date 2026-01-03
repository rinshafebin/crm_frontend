// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const AuthContext = createContext(null);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshAccessToken = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/token/refresh/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Failed to refresh token');
      }
      
      const data = await res.json();
      setAccessToken(data.access);
      return data.access;
    } catch (err) {
      console.error('Refresh token failed:', err);
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem('user');
      return null;
    }
  }, []);

  // Login handler
  const login = async ({ access, user: userData }) => {
    setAccessToken(access);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Logout handler
  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/logout/`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  // ✅ FIXED: Initialize auth on app load
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        // Try to get a fresh access token using the refresh cookie
        const newAccessToken = await refreshAccessToken();
        
        if (newAccessToken) {
          // ✅ Only restore user if token refresh succeeded
          setUser(JSON.parse(storedUser));
        } else {
          // ❌ Token refresh failed - clear everything
          localStorage.removeItem('user');
          setUser(null);
          setAccessToken(null);
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []); 
  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        isAuthenticated: !!accessToken && !!user,
        login,
        logout,
        refreshAccessToken,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);