import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    loadUser();
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userData = {
          username: session.user.email,
          role: 'admin',
          id: session.user.id,
        };
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } else {
        await AsyncStorage.removeItem('user');
        setUser(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const loadUser = async () => {
    try {
      // Check Supabase session first
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const userData = {
          username: session.user.email,
          role: 'admin',
          id: session.user.id,
        };
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } else {
        // Check local storage as fallback
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const userData = {
          username: data.user.email,
          role: 'admin',
          id: data.user.id,
        };
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isAdmin = () => user?.role === 'admin';
  const isViewer = () => !user || user?.role === 'viewer';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isViewer }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
