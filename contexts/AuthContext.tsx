import { pb } from "@/globalConfig";
import { AuthState, User } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import React, { createContext, useContext, useEffect, useState } from "react";

WebBrowser.maybeCompleteAuthSession();

const AUTH_STORAGE_KEY = "savezy-auth";
// const REDIRECT_URI = "savezy://redirect";

interface AuthContextType extends AuthState {
  signIn: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
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
  signInWithEmail: async () => {},
  signOut: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);
  const REDIRECT_URI = AuthSession.makeRedirectUri();

  // Initialize WebBrowser
  useEffect(() => {
    WebBrowser.warmUpAsync();
    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const storedAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        console.log("storedAuth", storedAuth);
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
        console.error("Error loading auth state:", error);
        setState({
          isLoading: false,
          isSignedIn: false,
          user: null,
          error: "Failed to load authentication state",
        });
      }
    };

    loadAuthState();
  }, []);

  useEffect(() => {
    console.log("state.isSignedIn", state.isSignedIn);
    const saveAuthState = async () => {
      try {
        if (state.isSignedIn && pb.authStore.isValid) {
          console.log("Saving auth state...", {
            token: pb.authStore.token,
            model: pb.authStore.record,
          });
          await AsyncStorage.setItem(
            AUTH_STORAGE_KEY,
            JSON.stringify({
              token: pb.authStore.token,
              model: pb.authStore.record,
            })
          );
        } else if (!state.isSignedIn) {
          await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } catch (error) {
        console.error("Error saving auth state:", error);
      }
    };

    if (!state.isLoading) {
      saveAuthState();
    }
  }, [state.isSignedIn, state.user]);

  const performGoogleSignIn = async () => {
    try {
      console.log("Init Login...", { REDIRECT_URI });
      setState({ ...state, isLoading: true, error: null });

      pb.authStore.clear();
      console.log("pb.authStore", pb.authStore);

      const authData = await pb.collection("users").authWithOAuth2({
        provider: "google",
        urlCallback: async (url) => {
          console.log("urlCallback", { url, REDIRECT_URI });
          await WebBrowser.openAuthSessionAsync(url, REDIRECT_URI);
        },
      });
      console.log("authData", authData);

      // Convert PocketBase user to our User type
      const user: User = {
        id: authData.record.id,
        email: authData.record.email,
        name: authData.record.name,
        avatar: authData.record.avatar,
        created: authData.record.created,
        updated: authData.record.updated,
        collectionId: authData.record.collectionId,
        collectionName: authData.record.collectionName,
        expand: authData.record.expand || {},
      };

      setState({
        isLoading: false,
        isSignedIn: true,
        user,
        error: null,
      });
    } catch (error: any) {
      console.error("Error during Google sign in:", error, error.originalError);
      setState({
        ...state,
        isLoading: false,
        error: "Failed to sign in with Google. Please try again.",
      });
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setState({ ...state, isLoading: true, error: null });
      pb.authStore.clear();

      const authData = await pb
        .collection("users")
        .authWithPassword(email, password);

      // Convert PocketBase user to our User type
      const user: User = {
        id: authData.record.id,
        email: authData.record.email,
        name: authData.record.name,
        avatar: authData.record.avatar,
        created: authData.record.created,
        updated: authData.record.updated,
        collectionId: authData.record.collectionId,
        collectionName: authData.record.collectionName,
        expand: authData.record.expand || {},
      };

      setState({
        isLoading: false,
        isSignedIn: true,
        user,
        error: null,
      });
    } catch (error) {
      console.error("Error during email sign in:", error);
      setState({
        ...state,
        isLoading: false,
        error: "Invalid email or password.",
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
      console.error("Error during sign out:", error);
      setState({
        ...state,
        isLoading: false,
        error: "Failed to sign out. Please try again.",
      });
    }
  };

  const refreshUser = async () => {
    try {
      if (pb.authStore.isValid) {
        setState({ ...state, isLoading: true });
        const authData = await pb.collection("users").authRefresh();

        // Convert PocketBase user to our User type
        const user: User = {
          id: authData.record.id,
          email: authData.record.email,
          name: authData.record.name,
          avatar: authData.record.avatar,
          created: authData.record.created,
          updated: authData.record.updated,
          collectionId: authData.record.collectionId,
          collectionName: authData.record.collectionName,
          expand: authData.record.expand || {},
        };

        setState({
          ...state,
          isLoading: false,
          user,
        });
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
      setState({
        ...state,
        isLoading: false,
        error: "Failed to refresh user data",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn: performGoogleSignIn,
        signInWithEmail,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
