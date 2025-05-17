import { AuthState, User } from "@/types";
import { getPocketBase } from "@/utils/pocketbase";
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

  // Load auth state from storage on mount
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const pb = await getPocketBase();

        console.log("Loading auth state from storage...");
        const storedAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);

        if (storedAuth) {
          console.log("Found stored auth data");
          const parsedAuth = JSON.parse(storedAuth);

          // Save to PocketBase auth store
          pb.authStore.save(parsedAuth.token, parsedAuth.record);

          if (pb.authStore.isValid) {
            console.log("Stored auth is valid, restoring session");
            setState({
              isLoading: false,
              isSignedIn: true,
              user: parsedAuth.record as User,
              error: null,
            });

            // Verify and refresh the token
            try {
              const authData = await pb.collection("users").authRefresh();
              console.log("Successfully refreshed auth token");

              // Update stored data with refreshed token
              await AsyncStorage.setItem(
                AUTH_STORAGE_KEY,
                JSON.stringify({
                  token: pb.authStore.token,
                  record: authData.record,
                })
              );
            } catch (refreshError) {
              console.error("Failed to refresh token:", refreshError);
              // Clear invalid auth data
              pb.authStore.clear();
              await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
              setState({
                isLoading: false,
                isSignedIn: false,
                user: null,
                error: null,
              });
            }
          } else {
            console.log("Stored auth is invalid, clearing");
            await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
            setState({
              isLoading: false,
              isSignedIn: false,
              user: null,
              error: null,
            });
          }
        } else {
          console.log("No stored auth found");
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

  const performGoogleSignIn = async () => {
    try {
      const pb = await getPocketBase();
      console.log("Starting Google sign in...");
      setState({ ...state, isLoading: true, error: null });

      pb.authStore.clear();
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);

      const authData = await pb.collection("users").authWithOAuth2({
        provider: "google",
        urlCallback: async (url) => {
          await WebBrowser.openAuthSessionAsync(url, REDIRECT_URI);
        },
      });

      console.log("Google sign in successful");

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

      // Save auth data to storage
      await AsyncStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({
          token: pb.authStore.token,
          record: authData.record,
        })
      );

      setState({
        isLoading: false,
        isSignedIn: true,
        user,
        error: null,
      });
    } catch (error: any) {
      console.error("Error during Google sign in:", error);
      setState({
        ...state,
        isLoading: false,
        error: "Failed to sign in with Google. Please try again.",
      });
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const pb = await getPocketBase();
      setState({ ...state, isLoading: true, error: null });
      pb.authStore.clear();
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);

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

      // Save auth data to storage
      await AsyncStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({
          token: pb.authStore.token,
          record: authData.record,
        })
      );

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
      const pb = await getPocketBase();
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
      const pb = await getPocketBase();
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

        // Update stored auth data
        await AsyncStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({
            token: pb.authStore.token,
            record: authData.record,
          })
        );

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
