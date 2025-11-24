import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const res = await fetch('/api/verify-auth');
        if (res.ok) {
          const data = await res.json();
          // Client-side safeguard: If the user is "Shinco" and somehow lacks a role
          // (e.g., due to a cached response), assign the SuperAdmin role.
          if (data.user && data.user.username === 'Shinco' && !data.user.role) {
            setUser({ ...data.user, role: 'SuperAdmin' });
          } else {
            setUser(data.user);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth verification failed', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    verifyAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      navigate('/admin');
    } else {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Login failed');
    }
  };

  const logout = async () => {
    try {
        await fetch('/api/logout', { method: 'POST' });
    } catch (error) {
        console.error('Logout request failed:', error);
    } finally {
        setUser(null);
        navigate('/admin/login');
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
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