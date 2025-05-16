import AsyncStorage from "@react-native-async-storage/async-storage";
import PocketBase from "pocketbase";
import { POCKETBASE_URL, pb as globalPb } from "../globalConfig";
import type { ContentItem, User } from "../types";
import "./eventSourcePolyfill";

type AuthModel = User;

// Use the global PocketBase instance
let pb = globalPb;
let initPromise: Promise<PocketBase> | null = null;

// Initialize PocketBase
export async function initPocketBase() {
  // Return existing initialization promise if it exists
  if (initPromise) {
    return initPromise;
  }

  // Create new initialization promise
  initPromise = (async () => {
    try {
      // Use POCKETBASE_URL from global config
      let pocketbaseUrl = POCKETBASE_URL || "http://127.0.0.1:8090";

      // Ensure the URL has a protocol
      if (
        !pocketbaseUrl.startsWith("http://") &&
        !pocketbaseUrl.startsWith("https://")
      ) {
        pocketbaseUrl = `http://${pocketbaseUrl}`; // Default to http:// for local development
      }

      console.log("Initializing PocketBase with URL:", pocketbaseUrl);

      // Configure the global instance
      pb.autoCancellation(false); // Disable auto-cancellation

      // Load any existing auth data on client-side
      if (typeof window !== "undefined") {
        // Try to load auth data from AsyncStorage
        try {
          const authData = await AsyncStorage.getItem("pocketbase_auth");
          if (authData) {
            const parsedData = JSON.parse(authData);
            if (parsedData.token && parsedData.model) {
              pb.authStore.save(parsedData.token, parsedData.model);

              // Verify the loaded auth data
              try {
                await pb.collection("users").authRefresh();
                console.log("Successfully refreshed auth token");
              } catch (refreshError) {
                console.error(
                  "Failed to refresh auth, clearing auth store:",
                  refreshError
                );
                pb.authStore.clear();
                await AsyncStorage.removeItem("pocketbase_auth");
              }
            }
          }
        } catch (e) {
          console.error("Failed to load auth data:", e);
          await AsyncStorage.removeItem("pocketbase_auth");
        }

        // Set up auth change listener
        pb.authStore.onChange(() => {
          try {
            const model = pb.authStore.record as AuthModel | null;
            console.log("Auth state changed", {
              isValid: pb.authStore.isValid,
              hasModel: !!model,
              userId: model?.id,
              token: pb.authStore.token ? "present" : "none",
              modelData: model
                ? {
                    email: model.email,
                    id: model.id,
                  }
                : null,
            });

            if (pb.authStore.isValid && model) {
              AsyncStorage.setItem(
                "pocketbase_auth",
                JSON.stringify({
                  token: pb.authStore.token,
                  model: model,
                })
              )
                .then(() => {
                  console.log("Successfully saved auth data to AsyncStorage");
                })
                .catch((error) => {
                  console.error(
                    "Failed to save auth data to AsyncStorage:",
                    error
                  );
                });
            } else {
              AsyncStorage.removeItem("pocketbase_auth")
                .then(() => {
                  console.log("Cleared auth data from AsyncStorage");
                })
                .catch((error) => {
                  console.error(
                    "Failed to clear auth data from AsyncStorage:",
                    error
                  );
                });
            }
          } catch (error) {
            console.error("Error handling auth change:", error);
          }
        });
      }

      // Verify connection
      try {
        await pb.health.check();
        console.log("PocketBase connection verified successfully");
      } catch (error) {
        console.error("Failed to verify PocketBase connection:", error);
        throw error;
      }

      return pb;
    } catch (error) {
      console.error("Failed to initialize PocketBase:", error);
      // Clear the promise so we can try again
      initPromise = null;
      pb?.authStore.clear(); // Clear the auth store
      throw error;
    }
  })();

  return initPromise;
}

// Get current user ID with better error handling
export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    if (!pb.authStore.isValid) {
      console.log("No valid auth session");
      return null;
    }

    const model = pb.authStore.record as AuthModel | null;
    if (!model?.id) {
      console.log("No user model found");
      return null;
    }

    return model.id;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// Save content to PocketBase
export async function saveContent(
  contentData: Partial<ContentItem>
): Promise<ContentItem> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const data = {
      ...contentData,
      user: userId,
    };

    const record = await pb.collection("contents").create(data);

    return {
      id: record.id,
      type: record.type,
      url: record.url,
      title: record.title,
      imageUrl: record.imageUrl,
      description: record.description,
      summary: record.summary,
      comment: record.comment,
      category: record.category,
      tags: record.tags || [],
      created: record.created,
      updated: record.updated,
      user: record.user,
    };
  } catch (error) {
    console.error("Error saving content:", error);
    throw error;
  }
}

// Get all content from PocketBase
export async function getAllContents(): Promise<ContentItem[]> {
  try {
    const userId = await getCurrentUserId();
    console.log("Fetching contents for user:", userId);

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const records = await pb.collection("contents").getList(1, 100, {
      filter: `user = "${userId}"`,
      sort: "-created",
    });

    return records.items.map((record) => ({
      id: record.id,
      type: record.type,
      url: record.url,
      title: record.title,
      imageUrl: record.imageUrl,
      description: record.description,
      summary: record.summary,
      comment: record.comment,
      category: record.category,
      tags: record.tags || [],
      created: record.created,
      updated: record.updated,
      user: record.user,
    }));
  } catch (error: any) {
    console.error("Error getting content:", error, error.originalError);
    throw error;
  }
}

// Delete content from PocketBase
export async function deleteContent(id: string): Promise<void> {
  try {
    await pb.collection("contents").delete(id);
  } catch (error) {
    console.error("Error deleting content:", error);
    throw error;
  }
}

// Upload file to PocketBase
export async function uploadFile(file: File, folder?: string): Promise<string> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("user", userId);
    if (folder) {
      formData.append("folder", folder);
    }

    const record = await pb.collection("files").create(formData);
    return pb.files.getUrl(record, record.file);
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

// Check if PocketBase is available
export const isPocketBaseAvailable = async (): Promise<boolean> => {
  try {
    // Create an AbortController for the request
    const controller = new AbortController();

    // Set a timeout of 5 seconds
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      // Try to fetch the health status with the signal
      await pb.health.check({ signal: controller.signal });
      clearTimeout(timeoutId);
      return true;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        console.log("Health check request timed out");
        return false;
      }
      throw error;
    }
  } catch (error) {
    console.error("PocketBase is not available:", error);
    return false;
  }
};

// Save to localStorage as fallback
function saveToLocalStorage(contentData: ContentItem): ContentItem {
  const id = generateId();
  const newItem = { ...contentData, id };

  // Get existing items
  const existingItems = getLocalStorage("contentItems") || [];

  // Add new item
  const updatedItems = [newItem, ...existingItems];

  // Save to localStorage
  setLocalStorage("contentItems", updatedItems);

  console.log("Content saved to localStorage with ID:", id);
  return newItem;
}

// Get from localStorage as fallback
function getFromLocalStorage(): ContentItem[] {
  const items = getLocalStorage("contentItems") || [];
  console.log("Retrieved items from localStorage:", items.length);
  return items;
}

// Get content by ID from PocketBase
export async function getContentById(id: string): Promise<ContentItem | null> {
  try {
    // Check if PocketBase is available
    const isPbAvailable = await isPocketBaseAvailable();

    if (isPbAvailable) {
      // Fetch a record from the 'content' collection by ID
      const record = await pb.collection("contents").getOne(id);

      // Convert PocketBase record to ContentItem
      const item: ContentItem = {
        id: record.id,
        type: record.type,
        url: record.url,
        title: record.title,
        imageUrl: record.imageUrl,
        description: record.description,
        summary: record.summary,
        comment: record.comment,
        category: record.category,
        tags: record.tags,
        created: record.created,
        updated: record.updated,
        user: record.user,
      };

      return item;
    } else {
      // Fall back to localStorage if PocketBase is not available
      return getItemByIdFromLocalStorage(id);
    }
  } catch (error) {
    console.error("Error getting document from PocketBase:", error);
    // Fall back to localStorage if PocketBase fails
    return getItemByIdFromLocalStorage(id);
  }
}

// Get item by ID from localStorage
function getItemByIdFromLocalStorage(id: string): ContentItem | null {
  const items = getLocalStorage("contentItems") || [];
  const item = items.find((item: ContentItem) => item.id === id);
  return item || null;
}

// Convert file to data URL for localStorage
function convertToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Delete from localStorage as fallback
function deleteFromLocalStorage(id: string): void {
  // Get existing items
  const items = getLocalStorage("contentItems") || [];

  // Filter out the item to delete
  const updatedItems = items.filter((item: ContentItem) => item.id !== id);

  // Save back to localStorage
  setLocalStorage("contentItems", updatedItems);
  console.log("Content deleted from localStorage:", id);
}

// Update content in PocketBase
export async function updateContent(
  id: string,
  contentData: Partial<ContentItem>
): Promise<ContentItem> {
  try {
    // Check if PocketBase is available
    const isPbAvailable = await isPocketBaseAvailable();

    if (isPbAvailable) {
      // Get current user ID
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Update the record in PocketBase
      const record = await pb.collection("contents").update(id, contentData);

      // Convert PocketBase record to ContentItem
      const updatedContent: ContentItem = {
        id: record.id,
        type: record.type,
        url: record.url,
        title: record.title,
        imageUrl: record.imageUrl,
        description: record.description,
        summary: record.summary,
        comment: record.comment,
        category: record.category,
        tags: record.tags,
        created: record.created,
        updated: record.updated,
        user: record.user,
      };

      console.log("Content updated in PocketBase:", updatedContent);
      return updatedContent;
    } else {
      // Fall back to localStorage if PocketBase is not available
      console.log("PocketBase not available, using localStorage");
      return updateInLocalStorage(id, contentData);
    }
  } catch (error) {
    console.error(
      "Error updating in PocketBase, falling back to localStorage:",
      error
    );
    // Fall back to localStorage if PocketBase fails
    return updateInLocalStorage(id, contentData);
  }
}

// Update in localStorage as fallback
function updateInLocalStorage(
  id: string,
  contentData: Partial<ContentItem>
): ContentItem {
  // Get existing items
  const items = getLocalStorage("contentItems") || [];

  // Find and update the item
  const updatedItems = items.map((item: ContentItem) => {
    if (item.id === id) {
      return { ...item, ...contentData };
    }
    return item;
  });

  // Save back to localStorage
  setLocalStorage("contentItems", updatedItems);

  // Return the updated item
  const updatedItem = updatedItems.find((item: ContentItem) => item.id === id);
  if (!updatedItem) {
    throw new Error("Item not found");
  }

  console.log("Content updated in localStorage:", updatedItem);
  return updatedItem;
}

// Local storage fallback functions
const getLocalStorage = (key: string) => {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
  return null;
};

const setLocalStorage = (key: string, value: any) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// Generate a random ID for local storage
const generateId = () => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};
