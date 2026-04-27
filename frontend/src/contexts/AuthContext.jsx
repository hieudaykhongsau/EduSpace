import { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import authService from '../services/authService';

const AuthContext = createContext(null);

const parseUserFromToken = (token) => {
  try {
    const decoded = jwtDecode(token);
    return {
      userId: decoded.userId,
      username: decoded.sub,
      fullName: decoded.name || decoded.sub,
      email: decoded.email,
      avatarUrl: decoded.avatar || null,
      role: decoded.role,
    };
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check if token is in URL (from OAuth2 Google redirect)
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');

    if (urlToken) {
      localStorage.setItem('jwtToken', urlToken);
      window.history.replaceState({}, document.title, "/");
    }

    // 2. Load token from localStorage
    const token = localStorage.getItem('jwtToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const isExpired = decoded.exp && decoded.exp * 1000 < Date.now();
        if (isExpired) {
          logout();
          setLoading(false);
        } else {
          // Instead of just parsing the token, fetch the full profile from backend
          fetchProfile();
        }
      } catch (error) {
        console.error('Invalid token', error);
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userData = await authService.getCurrentUser();
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      // If profile fetch fails, we still have the token parse as fallback or logout
      const token = localStorage.getItem('jwtToken');
      if (token) {
        const parsed = parseUserFromToken(token);
        if (parsed) {
          setUser(parsed);
          setIsAuthenticated(true);
        } else {
          logout();
        }
      }
    } finally {
      setLoading(false);
    }
  };


  const login = async (emailOrUsername, password) => {
    const data = await authService.login(emailOrUsername, password);
    if (data && data.token) {
      localStorage.setItem('jwtToken', data.token);
      // If backend returns user info, use it immediately
      if (data.user) {
        setUser(data.user);
      } else {
        // Fallback to parsing token
        setUser(parseUserFromToken(data.token));
      }
      setIsAuthenticated(true);
      return data;
    }
    throw new Error(data?.message || 'Login failed: No token received');
  };

  const register = async (userData) => {
    return await authService.register(userData);
  };

  const logout = () => {
    localStorage.removeItem('jwtToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
