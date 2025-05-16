import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';
import { pb } from '@/utils/pb';
import { AuthState, User } from '@/types';

WebBrowser.maybeCompleteAuthSession();

const AUTH_STORAGE_KEY = 'content-saver-auth';

interface AuthContextType extends AuthState {
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const initialState: AuthState = {
  isLoading: true,
  isSignedIn: false,
  user: null,
  error: null,
};

const AuthContext = createContext<AuthContextType>({
  ...initialState,
  signIn: async () => {},
  signOut: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);

  // Load auth state from storage on mount
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const storedAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        
        if (storedAuth) {
          const parsedAuth = JSON.parse(storedAuth);
          pb.authStore.save(parsedAuth.token, parsedAuth.model);
          
          if (pb.authStore.isValid) {
            setState({
              isLoading: false,
              isSignedIn: true,
              user: parsedAuth.model as User,
              error: null,
            });
          } else {
            // Token expired
            await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
            setState({
              isLoading: false,
              isSignedIn: false,
              user: null,
              error: null,
            });
          }
        } else {
          setState({
            ...state,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        setState({
          isLoading: false,
          isSignedIn: false,
          user: null,
          error: 'Failed to load authentication state',
        });
      }
    };

    loadAuthState();
  }, []);

  // Save auth state to storage when it changes
  useEffect(() => {
    const saveAuthState = async () => {
      try {
        if (state.isSignedIn && pb.authStore.isValid) {
          await AsyncStorage.setItem(
            AUTH_STORAGE_KEY,
            JSON.stringify({
              token: pb.authStore.token,
              model: pb.authStore.model,
            })
          );
        } else if (!state.isSignedIn) {
          await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } catch (error) {
        console.error('Error saving auth state:', error);
      }
    };

    if (!state.isLoading) {
      saveAuthState();
    }
  }, [state.isSignedIn, state.user]);

  const signIn = async () => {
    try {
      setState({ ...state, isLoading: true, error: null });

      // For a real implementation, you would replace this URL with your PocketBase instance OAuth URL
      const authUrl = `${pb.baseUrl}/api/oauth2-redirect`;
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'your-app-scheme', // Replace with your actual app scheme
        path: 'redirect',
      });

      // In a real implementation, this would be the actual Google OAuth flow through PocketBase
      // For demo purposes, we're simulating a successful auth
      const authResult = await AuthSession.startAsync({
        authUrl: `${authUrl}?provider=google&redirect=${encodeURIComponent(redirectUri)}`,
      });

      if (authResult.type === 'success') {
        // This is where you would handle the auth code from Google
        // For this demo, we'll simulate a successful auth
        
        // In a real implementation, PocketBase would handle the OAuth flow and return a user
        // Here we're simulating a successful login
        const mockUser = {
          id: 'user123',
          email: 'user@example.com',
          name: 'Demo User',
          avatar: 'https://i.pravatar.cc/300',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        };
        
        // Simulate saving to PocketBase auth store
        pb.authStore.save('mock_token', mockUser);
        
        setState({
          isLoading: false,
          isSignedIn: true,
          user: mockUser,
          error: null,
        });
      } else {
        setState({
          ...state,
          isLoading: false,
          error: 'Sign in was cancelled or failed',
        });
      }
    } catch (error) {
      console.error('Error during sign in:', error);
      setState({
        ...state,
        isLoading: false,
        error: 'Failed to sign in. Please try again.',
      });
    }
  };

  const signOut = async () => {
    try {
      setState({ ...state, isLoading: true });
      pb.authStore.clear();
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setState({
        isLoading: false,
        isSignedIn: false,
        user: null,
        error: null,
      });
    } catch (error) {
      console.error('Error during sign out:', error);
      setState({
        ...state,
        isLoading: false,
        error: 'Failed to sign out. Please try again.',
      });
    }
  };

  const refreshUser = async () => {
    try {
      if (pb.authStore.isValid) {
        setState({ ...state, isLoading: true });
        // In a real app, you would refresh the user data from PocketBase
        // For this demo, we'll simulate a refresh by keeping the same user
        setState({
          ...state,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      setState({
        ...state,
        isLoading: false,
        error: 'Failed to refresh user data',
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signOut,
        refreshUser,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);