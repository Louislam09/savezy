import React, { createContext, useContext, useState } from "react";

export type ThemeColors = {
  background: string;
  card: string;
  cardBorder: string;
  text: string;
  textSecondary: string;
  accent: string;
  buttonBackground: string;
  searchBackground: string;
};

export const lightTheme: ThemeColors = {
  background: "#F2F2F7",
  card: "#FFFFFF",
  cardBorder: "#E5E5EA",
  text: "#000000",
  textSecondary: "#6C6C70",
  accent: "#007AFF",
  buttonBackground: "#FFFFFF",
  searchBackground: "#FFFFFF",
};

export const darkTheme: ThemeColors = {
  background: "#000000",
  card: "#1C1C1E",
  cardBorder: "#2C2C2E",
  text: "#FFFFFF",
  textSecondary: "#8E8E93",
  accent: "#0A84FF",
  buttonBackground: "#1C1C1E",
  searchBackground: "#1C1C1E",
};

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const value = {
    isDark,
    toggleTheme,
    colors: isDark ? darkTheme : lightTheme,
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
