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
      console.log('🔄 Attempting to refresh token...');
      
      // ✅ Get refresh token from localStorage
      const storedRefreshToken = localStorage.getItem('refreshToken');
      
      if (!storedRefreshToken) {
        console.log('❌ No refresh token found in localStorage');
        throw new Error('No refresh token available');
      }
      
      const res = await fetch(`${API_BASE_URL}/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: storedRefreshToken  // ✅ Send in request body
        }),
      });

      console.log('🔄 Refresh response status:', res.status);

      if (!res.ok) {
        throw new Error('Failed to refresh token');
      }
      
      const data = await res.json();
      console.log('✅ Token refreshed successfully');
      
      setAccessToken(data.access);
      
      // ✅ Update refresh token if backend sends a new one
      if (data.refresh) {
        localStorage.setItem('refreshToken', data.refresh);
      }
      
      return data.access;
    } catch (err) {
      console.error('❌ Refresh token failed:', err);
      // Clear everything on failure
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      return null;
    }
  }, []);

  // Login handler
  const login = async ({ access, refresh, user: userData }) => {
    console.log('🔐 Logging in user...');
    setAccessToken(access);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('refreshToken', refresh);  // ✅ Store refresh token
    console.log('✅ Login successful, tokens stored');
  };

  // Logout handler
  const logout = async () => {
    console.log('🚪 Logging out...');
    try {
      // Optional: Call backend logout endpoint if you have one
      await fetch(`${API_BASE_URL}/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (err) {
      console.error('Logout API call failed:', err);
    } finally {
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      console.log('✅ Logout complete');
    }
  };

  // Initialize auth on app load
  useEffect(() => {
    const initAuth = async () => {
      console.log('🚀 Initializing auth...');
      const storedUser = localStorage.getItem('user');
      const storedRefreshToken = localStorage.getItem('refreshToken');
      
      if (storedUser && storedRefreshToken) {
        console.log('👤 Found stored user and refresh token');
        
        // Try to get a fresh access token
        const newAccessToken = await refreshAccessToken();
        
        if (newAccessToken) {
          console.log('✅ Auth restored successfully');
          setUser(JSON.parse(storedUser));
        } else {
          console.log('❌ Token refresh failed, clearing stored data');
          localStorage.removeItem('user');
          localStorage.removeItem('refreshToken');
        }
      } else {
        console.log('👤 No stored credentials found');
      }
      
      setLoading(false);
    };

    initAuth();
  }, [refreshAccessToken]);

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