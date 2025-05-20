import {
  darkTheme,
  defaultMainColor,
  lightTheme,
  ThemeColors,
} from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
  mainColor: string;
  setMainColor: (color: string) => void;
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);
  const [mainColor, setMainColor] = useState(defaultMainColor);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    // Load saved preferences
    const loadPreferences = async () => {
      try {
        const [savedTheme, savedColor, savedOnboarding] = await Promise.all([
          AsyncStorage.getItem("theme"),
          AsyncStorage.getItem("mainColor"),
          AsyncStorage.getItem("hasCompletedOnboarding"),
        ]);

        if (savedTheme) {
          setIsDark(savedTheme === "dark");
        }
        if (savedColor) {
          setMainColor(savedColor);
        }
        if (savedOnboarding) {
          setHasCompletedOnboarding(savedOnboarding === "true");
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
      }
    };

    loadPreferences();
  }, []);

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    try {
      await AsyncStorage.setItem("theme", newTheme ? "dark" : "light");
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem("hasCompletedOnboarding", "true");
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  };

  const themeColors = {
    ...(isDark ? darkTheme : lightTheme),
    mainColor,
    accent: mainColor,
  };

  const value = {
    isDark,
    toggleTheme,
    colors: themeColors,
    mainColor,
    setMainColor,
    hasCompletedOnboarding,
    completeOnboarding,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
