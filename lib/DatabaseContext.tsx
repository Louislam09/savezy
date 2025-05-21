import { useSQLiteContext } from "expo-sqlite";
import { createContext, useContext, useEffect, useState } from "react";
import { ContentItem } from "./database";

interface DatabaseContextType {
  items: ContentItem[];
  loading: boolean;
  error: Error | null;
  refreshItems: () => Promise<void>;
  saveItem: (content: ContentItem) => Promise<ContentItem>;
  deleteItem: (id: number) => Promise<void>;
  updateItem: (
    id: number,
    content: Partial<ContentItem>
  ) => Promise<ContentItem>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(
  undefined
);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshItems = async () => {
    try {
      setLoading(true);
      const result = await db.getAllAsync<ContentItem & { tags: string }>(
        "SELECT * FROM contents ORDER BY created DESC"
      );
      setItems(
        result.map((item) => ({
          ...item,
          tags: item.tags ? JSON.parse(item.tags) : [],
        }))
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load items"));
      console.error("Error loading items:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveItem = async (content: ContentItem): Promise<ContentItem> => {
    try {
      const result = await db.runAsync(
        `INSERT INTO contents (type, url, title, imageUrl, description, summary, comment, category, tags, isFavorite, directions, latitude, longitude)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          content.type,
          content.url || null,
          content.title || null,
          content.imageUrl || null,
          content.description || null,
          content.summary || null,
          content.comment || null,
          content.category || null,
          content.tags ? JSON.stringify(content.tags) : null,
          content.isFavorite ? 1 : 0,
          content.directions || null,
          content.latitude || null,
          content.longitude || null,
        ]
      );

      const newItem = { ...content, id: result.lastInsertRowId };
      setItems((prev) => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to save item");
      setError(error);
      throw error;
    }
  };

  const updateItem = async (
    id: number,
    content: Partial<ContentItem>
  ): Promise<ContentItem> => {
    try {
      const currentItem = items.find((item) => item.id === id);
      if (!currentItem) {
        throw new Error("Item not found");
      }

      const updatedItem = { ...currentItem, ...content };
      await db.runAsync(
        `UPDATE contents 
         SET type = ?, url = ?, title = ?, imageUrl = ?, description = ?, 
             summary = ?, comment = ?, category = ?, tags = ?, isFavorite = ?,
             directions = ?, latitude = ?, longitude = ?
         WHERE id = ?`,
        [
          updatedItem.type,
          updatedItem.url || null,
          updatedItem.title || null,
          updatedItem.imageUrl || null,
          updatedItem.description || null,
          updatedItem.summary || null,
          updatedItem.comment || null,
          updatedItem.category || null,
          updatedItem.tags ? JSON.stringify(updatedItem.tags) : null,
          updatedItem.isFavorite ? 1 : 0,
          updatedItem.directions || null,
          updatedItem.latitude || null,
          updatedItem.longitude || null,
          id,
        ]
      );

      setItems((prev) =>
        prev.map((item) => (item.id === id ? updatedItem : item))
      );
      setError(null);
      return updatedItem;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to update item");
      setError(error);
      throw error;
    }
  };

  const deleteItem = async (id: number): Promise<void> => {
    try {
      await db.runAsync("DELETE FROM contents WHERE id = ?", [id]);
      setItems((prev) => prev.filter((item) => item.id !== id));
      setError(null);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to delete item");
      setError(error);
      throw error;
    }
  };

  useEffect(() => {
    refreshItems();
  }, []);

  const value = {
    items,
    loading,
    error,
    refreshItems,
    saveItem,
    deleteItem,
    updateItem,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
}
