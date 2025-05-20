export const defaultMainColor = "#60A5FA";

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
