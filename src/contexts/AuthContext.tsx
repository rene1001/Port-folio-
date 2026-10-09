import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken, removeAuthToken, ApiError } from '../services/api.ts';
import type { AdminUser } from '../types.ts';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const LEGACY_TOKEN_KEY = 'devportfolio_admin_token';

interface AuthContextType {
  token: string | null;
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to safely read the stored token from localStorage
function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
  } catch {
    return null;
  }
}

// Helper function to safely read the stored user from localStorage
function getStoredUser(): AdminUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY) || localStorage.getItem('devportfolio_admin_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Retrieve token from localStorage immediately upon initialization
  const [token, setToken] = useState<string | null>(() => getStoredToken());

  // Synchronously retrieve cached user profile to prevent any flash or unwanted login redirect
  const [user, setUser] = useState<AdminUser | null>(() => getStoredUser());

  // Manage loading state while confirming validity
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const initialToken = getStoredToken();
    // If no token exists in localStorage, user is not logged in - loading is finished immediately
    if (!initialToken) return false;
    // If we have token and cached user, render right away without blocking
    return !getStoredUser();
  });

  // Ensure api service is in sync with the retrieved token
  useEffect(() => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    // Configure the bearer token in API client
    setAuthToken(storedToken);

    // Validate the token with the backend upon initialization
    api.getCurrentUser()
      .then(res => {
        setUser(res.user);
        setToken(storedToken);
        try {
          localStorage.setItem(TOKEN_KEY, storedToken);
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        } catch {}
      })
      .catch((err: any) => {
        // If the token is explicitly rejected (401 Unauthorized), remove from localStorage
        if (err instanceof ApiError && err.status === 401) {
          try {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(LEGACY_TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            localStorage.removeItem('devportfolio_admin_user');
          } catch {}
          removeAuthToken();
          setToken(null);
          setUser(null);
        } else {
          // If network glitch or offline, preserve user credentials in localStorage
          console.warn('Backend verification unavailable, keeping stored localStorage session:', err);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    const authToken = res.token;
    const authUser = res.user;

    // Store the authentication token and user profile in localStorage
    try {
      localStorage.setItem(TOKEN_KEY, authToken);
      localStorage.setItem(USER_KEY, JSON.stringify(authUser));
    } catch (e) {
      console.warn('Failed to write auth token to localStorage:', e);
    }

    // Sync token with API requests and state
    setAuthToken(authToken);
    setToken(authToken);
    setUser(authUser);
    setIsLoading(false);
  };

  const logout = async () => {
    try {
      // Invalidate the session token on the backend server
      await api.logout();
    } catch (e) {
      // In case of network failure, continue ensuring a clean local exit
      console.warn('Backend logout call failed or offline, proceeding with local cleanup:', e);
    } finally {
      // Clear all authentication tokens and cached user data from localStorage
      try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(LEGACY_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem('devportfolio_admin_user');
      } catch (e) {
        console.warn('Failed to clear credentials from localStorage:', e);
      }

      // Clear authorization headers in client API service
      removeAuthToken();

      // Reset authentication and user state to ensure a clean exit
      setToken(null);
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
