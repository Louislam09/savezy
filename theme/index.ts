// Colors based on Material You palette
const lightColors = {
  primary: "#F87171", // Pink/Red
  secondary: "#60A5FA", // Blue
  tertiary: "#FBBF24", // Yellow/Orange
  surface: "#FFFFFF",
  background: "#F9FAFB",
  error: "#EF4444",
  success: "#10B981",
  warning: "#FBBF24",
  outline: "#6B7280",
  outlineVariant: "#E5E7EB",
  onPrimary: "#FFFFFF",
  onSecondary: "#FFFFFF",
  onTertiary: "#FFFFFF",
  onSurface: "#1F2937",
  onBackground: "#1F2937",
  accent: "#A78BFA", // Purple
  elevation: {
    level0: "transparent",
    level1: "#F3F4F6",
    level2: "#E5E7EB",
    level3: "#D1D5DB",
    level4: "#9CA3AF",
    level5: "#6B7280",
  },
};

const darkColors = {
  primary: "#F87171", // Pink/Red
  secondary: "#60A5FA", // Blue
  tertiary: "#FBBF24", // Yellow/Orange
  surface: "#1F2937",
  background: "#000000",
  error: "#F87171",
  success: "#34D399",
  warning: "#FBBF24",
  outline: "#9CA3AF",
  outlineVariant: "#374151",
  onPrimary: "#111827",
  onSecondary: "#111827",
  onTertiary: "#111827",
  onSurface: "#F9FAFB",
  onBackground: "#F9FAFB",
  accent: "#A78BFA", // Purple
  elevation: {
    level0: "transparent",
    level1: "#374151",
    level2: "#4B5563",
    level3: "#6B7280",
    level4: "#9CA3AF",
    level5: "#D1D5DB",
  },
};

export const theme = {
  colors: {
    ...lightColors,
  },
  roundness: 8,
};

export const darkTheme = {
  colors: {
    ...darkColors,
  },
  roundness: 8,
};
