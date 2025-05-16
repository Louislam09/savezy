import { useAuth } from "@/contexts/AuthContext";
import { pb } from "@/globalConfig";
import { ContentItem, Tag } from "@/types";
import { deleteContent, getAllContents, saveContent } from "@/utils/pocketbase";
import { useCallback, useEffect, useState } from "react";

interface ContentHookResult {
  items: ContentItem[];
  tags: Tag[];
  isLoading: boolean;
  error: string | null;
  fetchContent: () => Promise<void>;
  searchContent: (query: string) => Promise<void>;
  addContent: (data: ContentItem, file?: File) => Promise<void>;
  deleteContent: (id: string) => Promise<void>;
}

export function useContent(): ContentHookResult {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isSignedIn, user } = useAuth();

  const fetchContents = useCallback(async () => {
    console.log("--- fetchContents");
    try {
      setIsLoading(true);
      setError(null);

      const result = await getAllContents();
      console.log("result", result);
      // Fetch tags
      // const tagsResult = await pb.collection("contents").getList(1, 50, {
      //   sort: "name",
      // });

      // Convert PocketBase records to Tag objects
      // const tags = tagsResult.items.map((record) => ({
      //   id: record.id,
      //   name: record.name,
      //   count: record.count || 0,
      // })) as Tag[];

      // setItems(result);
      // setTags(tags);
    } catch (error: any) {
      console.error("Error fetching content:", error, error.originalError);
      setError("Failed to load content. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, user]);

  const searchContent = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        return fetchContents();
      }

      try {
        setIsLoading(true);
        setError(null);

        const userId = user?.id;

        if (!userId) {
          throw new Error("User not authenticated");
        }

        // Search in contents collection
        const records = await pb.collection("contents").getList(1, 100, {
          filter: `user = "${userId}" && (title ~ "${query}" || description ~ "${query}" || summary ~ "${query}" || comment ~ "${query}" || category ~ "${query}")`,
          sort: "-created",
        });
        // Convert records to ContentItems
        const items: ContentItem[] = records.items.map((record) => ({
          id: record.id,
          type: record.type,
          url: record.url,
          title: record.title,
          created: record.created,
          updated: record.updated,
          imageUrl: record.imageUrl,
          description: record.description,
          summary: record.summary,
          comment: record.comment,
          category: record.category,
          tags: record.tags,
          createdAt: record.createdAt || record.created,
          user: record.user,
        }));

        // Also search by tags
        const tagsResult = await pb.collection("tags").getList(1, 20, {
          filter: `name ~ "${query}"`,
        });

        // Get content items with matching tags
        for (const tag of tagsResult.items) {
          const taggedRecords = await pb
            .collection("contents")
            .getList(1, 100, {
              filter: `user = "${userId}" && tags ~ "${tag.id}"`,
              sort: "-created",
            });

          // Add non-duplicate items
          for (const record of taggedRecords.items) {
            if (!items.some((item) => item.id === record.id)) {
              items.push({
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
                // createdAt: record.createdAt || record.created,
                user: record.user,
              });
            }
          }
        }

        // Sort by relevance and date
        items.sort((a, b) => {
          const aMatch = JSON.stringify(a)
            .toLowerCase()
            .includes(query.toLowerCase());
          const bMatch = JSON.stringify(b)
            .toLowerCase()
            .includes(query.toLowerCase());

          if (aMatch && !bMatch) return -1;
          if (!aMatch && bMatch) return 1;

          // If both match or don't match, sort by created date
          return new Date(b.created).getTime() - new Date(a.created).getTime();
        });

        setItems(items);
      } catch (error) {
        console.error("Error searching content:", error);
        setError("Failed to search content. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [fetchContents, isSignedIn, user]
  );

  const addContent = useCallback(
    async (data: ContentItem, file?: File) => {
      if (!isSignedIn || !user) {
        setError("You must be signed in to save content");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Save content
        await saveContent(data);

        // Refresh content
        await fetchContents();
      } catch (error) {
        console.error("Error adding content:", error);
        setError("Failed to save content. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [fetchContents, isSignedIn, user]
  );

  const handleDeleteContent = useCallback(
    async (id: string) => {
      if (!isSignedIn) {
        setError("You must be signed in to delete content");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Delete content
        await deleteContent(id);

        // Refresh content
        await fetchContents();
      } catch (error) {
        console.error("Error deleting content:", error);
        setError("Failed to delete content. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [fetchContents, isSignedIn]
  );

  useEffect(() => {
    fetchContents();
  }, []);

  return {
    items,
    tags,
    isLoading,
    error,
    fetchContent: fetchContents,
    searchContent,
    addContent,
    deleteContent: handleDeleteContent,
  };
}
