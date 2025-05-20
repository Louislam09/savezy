import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

type StorageConfig = {
  theme: "light" | "dark";
  language: string;
  mainColor: string;
  hasCompletedOnboarding: boolean;
};

type StorageContextType = {
  config: StorageConfig;
  updateConfig: (newConfig: Partial<StorageConfig>) => Promise<void>;
  resetConfig: () => Promise<void>;
};

const defaultConfig: StorageConfig = {
  theme: "light",
  language: "en",
  mainColor: "#007AFF",
  hasCompletedOnboarding: false,
};

const STORAGE_KEY = "@savezy_config";

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [config, setConfig] = useState<StorageConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved config on mount
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const savedConfig = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }
    } catch (error) {
      console.error("Error loading config:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = async (newConfig: Partial<StorageConfig>) => {
    try {
      const updatedConfig = { ...config, ...newConfig };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfig));
      setConfig(updatedConfig);
    } catch (error) {
      console.error("Error saving config:", error);
    }
  };

  const resetConfig = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setConfig(defaultConfig);
    } catch (error) {
      console.error("Error resetting config:", error);
    }
  };

  if (isLoading) {
    // You might want to show a loading screen here
    return null;
  }

  return (
    <StorageContext.Provider value={{ config, updateConfig, resetConfig }}>
      {children}
    </StorageContext.Provider>
  );
};

export const useStorage = () => {
  const context = useContext(StorageContext);
  if (context === undefined) {
    throw new Error("useStorage must be used within a StorageProvider");
  }
  return context;
};
