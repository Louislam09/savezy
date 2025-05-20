import React, { createContext, useContext, useEffect } from "react";
import { useColorScheme } from "react-native";
import { useStorage } from "./StorageContext";

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
  mainColor: string;
  setMainColor: (color: string) => void;
  colors: ThemeColors;
  completeOnboarding: () => Promise<void>;
};

export type ThemeColors = {
  background: string;
  card: string;
  cardBorder: string;
  text: string;
  textSecondary: string;
  accent: string;
  buttonBackground: string;
  searchBackground: string;
  error: string;
  mainColor: string;
};
const defaultMainColor = "#60A5FA";
export const lightTheme: ThemeColors = {
  background: "#FFFFFF",
  card: "#FFFFFF",
  cardBorder: "#E5E5EA",
  text: "#000000",
  textSecondary: "#8E8E93",
  accent: "#0A84FF",
  buttonBackground: "#F2F2F7",
  searchBackground: "#F2F2F7",
  error: "#FF3B30",
  mainColor: defaultMainColor,
};
export const darkTheme: ThemeColors = {
  background: "#000000",
  card: "#1C1C1E",
  cardBorder: "#38383A",
  text: "#FFFFFF",
  textSecondary: "#8E8E93",
  accent: "#0A84FF",
  buttonBackground: "#2C2C2E",
  searchBackground: "#1C1C1E",
  error: "#FF453A",
  mainColor: defaultMainColor,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemColorScheme = useColorScheme();
  const { config, updateConfig } = useStorage();

  const isDark = config.theme === "dark";
  const mainColor = config.mainColor || defaultMainColor;

  const colors = {
    ...(isDark ? darkTheme : lightTheme),
    mainColor,
    accent: mainColor,
  };

  const toggleTheme = async () => {
    await updateConfig({ theme: isDark ? "light" : "dark" });
  };

  const setMainColor = async (color: string) => {
    await updateConfig({ mainColor: color });
  };

  const completeOnboarding = async () => {
    await updateConfig({ hasCompletedOnboarding: true });
  };

  // Sync with system theme if not explicitly set
  useEffect(() => {
    if (systemColorScheme && !config.hasCompletedOnboarding) {
      updateConfig({ theme: systemColorScheme });
    }
  }, [systemColorScheme]);

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        toggleTheme,
        mainColor,
        setMainColor,
        colors,
        completeOnboarding,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
