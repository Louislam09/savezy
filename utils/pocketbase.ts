import AsyncStorage from "@react-native-async-storage/async-storage";
import PocketBase from "pocketbase";
import { POCKETBASE_URL } from "../globalConfig";
import type { ContentItem, User } from "../types";
import "./eventSourcePolyfill";

type AuthModel = User;

// Create a single PocketBase instance for the entire app
let pb: PocketBase;
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
      let pocketbaseUrl = POCKETBASE_URL || "http://127.0.0.1:8090";

      if (
        !pocketbaseUrl.startsWith("http://") &&
        !pocketbaseUrl.startsWith("https://")
      ) {
        pocketbaseUrl = `http://${pocketbaseUrl}`;
      }

      console.log("Initializing PocketBase with URL:", pocketbaseUrl);

      if (!pb) {
        pb = new PocketBase(pocketbaseUrl);
        pb.autoCancellation(false);

        if (typeof window !== "undefined") {
          try {
            const authData = await AsyncStorage.getItem("pocketbase_auth");
            if (authData) {
              const parsedData = JSON.parse(authData);
              if (parsedData.token && parsedData.record) {
                pb.authStore.save(parsedData.token, parsedData.record);

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

          pb.authStore.onChange(() => {
            try {
              const record = pb.authStore.record as AuthModel | null;
              console.log("Auth state changed", {
                isValid: pb.authStore.isValid,
                hasModel: !!record,
                userId: record?.id,
              });

              if (pb.authStore.isValid && record) {
                AsyncStorage.setItem(
                  "pocketbase_auth",
                  JSON.stringify({
                    token: pb.authStore.token,
                    record: record,
                  })
                );
              } else {
                AsyncStorage.removeItem("pocketbase_auth");
              }
            } catch (error) {
              console.error("Error handling auth change:", error);
            }
          });
        }
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

export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const pb = await getPocketBase();
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

export function getPocketBase() {
  try {
    if (typeof window !== "undefined") {
      if (!pb) {
        return initPocketBase();
      }
      return pb;
    }
    const newPb = new PocketBase(
      process.env.POCKETBASE_URL || "http://127.0.0.1:8090"
    );
    newPb.autoCancellation(false);
    return newPb;
  } catch (error) {
    console.error("Error getting PocketBase instance:", error);
    throw error;
  }
}

// Save content to PocketBase
export async function saveContent(
  contentData: Partial<ContentItem>
): Promise<ContentItem> {
  try {
    const pb = await getPocketBase();
    const userId = await getCurrentUserId();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const data = {
      ...contentData,
      user: userId,
      tags: Array.isArray(contentData.tags) ? contentData.tags : [],
    };

    const record = await pb.collection("contents").create(data);

    return {
      id: record.id,
      type: record.type,
      user: record.user,
      url: record.url,
      title: record.title,
      imageUrl: record.imageUrl,
      description: record.description,
      summary: record.summary,
      comment: record.comment,
      category: record.category,
      tags: Array.isArray(record.tags) ? record.tags : [],
      created: record.created,
      updated: record.updated,
    };
  } catch (error) {
    console.error("Error saving content:", error);
    throw error;
  }
}

// Get all content from PocketBase
export async function getAllContents(): Promise<ContentItem[]> {
  try {
    const pb = await getPocketBase();
    const userId = await getCurrentUserId();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const records = await pb.collection("contents").getList(1, 100, {
      filter: `user = "${userId}"`,
      sort: "-created",
    });

    return records.items.map((record) => ({
      collectionId: record.collectionId,
      collectionName: record.collectionName,
      id: record.id,
      type: record.type,
      user: record.user,
      url: record.url,
      title: record.title,
      imageUrl: record.imageUrl,
      description: record.description,
      summary: record.summary,
      comment: record.comment,
      category: record.category,
      tags: Array.isArray(record.tags) ? record.tags : [],
      created: record.created,
      updated: record.updated,
    }));
  } catch (error: any) {
    console.error("Error getting content:", error, error.originalError);
    throw error;
  }
}

// Delete content from PocketBase
export async function deleteContent(id: string): Promise<void> {
  try {
    const pb = await getPocketBase();
    await pb.collection("contents").delete(id);
  } catch (error) {
    console.error("Error deleting content:", error);
    throw error;
  }
}

// Upload file to PocketBase
export async function uploadFile(file: File, folder?: string): Promise<string> {
  try {
    const pb = await getPocketBase();
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
    const pb = await getPocketBase();

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
    const isPbAvailable = await isPocketBaseAvailable();

    if (isPbAvailable) {
      const pb = await getPocketBase();
      const record = await pb.collection("contents").getOne(id);

      return {
        id: record.id,
        type: record.type,
        user: record.user,
        url: record.url,
        title: record.title,
        imageUrl: record.imageUrl,
        description: record.description,
        summary: record.summary,
        comment: record.comment,
        category: record.category,
        tags: Array.isArray(record.tags) ? record.tags : [],
        created: record.created,
        updated: record.updated,
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting content by ID:", error);
    return null;
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

function deleteFromLocalStorage(id: string): void {
  // Get existing items
  const items = getLocalStorage("contentItems") || [];

  // Filter out the item to delete
  const updatedItems = items.filter((item: ContentItem) => item.id !== id);

  // Save back to localStorage
  setLocalStorage("contentItems", updatedItems);
  console.log("Content deleted from localStorage:", id);
}

export async function updateContent(
  id: string,
  contentData: Partial<ContentItem>
): Promise<ContentItem> {
  try {
    const isPbAvailable = await isPocketBaseAvailable();

    if (isPbAvailable) {
      const pb = await getPocketBase();
      const userId = await getCurrentUserId();

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const data = {
        ...contentData,
        tags: Array.isArray(contentData.tags) ? contentData.tags : [],
      };

      const record = await pb.collection("contents").update(id, data);

      return {
        id: record.id,
        type: record.type,
        user: record.user,
        url: record.url,
        title: record.title,
        imageUrl: record.imageUrl,
        description: record.description,
        summary: record.summary,
        comment: record.comment,
        category: record.category,
        tags: Array.isArray(record.tags) ? record.tags : [],
        created: record.created,
        updated: record.updated,
      };
    }
    throw new Error("PocketBase is not available");
  } catch (error) {
    console.error("Error updating content:", error);
    throw error;
  }
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
