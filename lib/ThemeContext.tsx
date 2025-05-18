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
  mainColor: string;
};

const defaultMainColor = "#60A5FA";

export const lightTheme: ThemeColors = {
  background: "#F9FAFB",
  card: "#FFFFFF",
  cardBorder: "#E5E5EA",
  text: "#000000",
  textSecondary: "#6C6C70",
  accent: "#A78BFA",
  buttonBackground: "#FFFFFF",
  searchBackground: "#FFFFFF",
  mainColor: defaultMainColor,
};

export const darkTheme: ThemeColors = {
  background: "#000000",
  card: "#1C1C1E",
  cardBorder: "#2C2C2E",
  text: "#FFFFFF",
  textSecondary: "#8E8E93",
  accent: "#A78BFA",
  buttonBackground: "#1C1C1E",
  searchBackground: "#1C1C1E",
  mainColor: defaultMainColor,
};

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
  mainColor: string;
  setMainColor: (color: string) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);
  const [mainColor, setMainColor] = useState(defaultMainColor);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
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
