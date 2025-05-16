import { useState, useEffect, useCallback } from 'react';
import { pb, ContentType, getCollectionForType } from '@/utils/pb';
import { ContentUnion, Tag } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface ContentHookResult {
  items: ContentUnion[];
  tags: Tag[];
  isLoading: boolean;
  error: string | null;
  fetchContent: (type?: ContentType) => Promise<void>;
  searchContent: (query: string) => Promise<void>;
  addContent: (type: ContentType, data: any, file?: File) => Promise<void>;
  deleteContent: (type: ContentType, id: string) => Promise<void>;
}

export function useContent(): ContentHookResult {
  const [items, setItems] = useState<ContentUnion[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isSignedIn, user } = useAuth();

  const fetchContent = useCallback(async (type?: ContentType) => {
    try {
      setIsLoading(true);
      setError(null);

      let result: ContentUnion[] = [];

      // If a specific type is provided, only fetch that type
      if (type) {
        const collection = getCollectionForType(type);
        const records = await pb.collection(collection).getList(1, 50, {
          sort: '-created',
          filter: isSignedIn ? `user = "${user?.id}"` : '',
          expand: 'tags',
        });
        
        result = records.items.map((item) => ({
          ...item,
          type,
        })) as ContentUnion[];
      } else {
        // Fetch all content types
        const types = Object.values(ContentType);
        
        for (const contentType of types) {
          const collection = getCollectionForType(contentType);
          const records = await pb.collection(collection).getList(1, 10, {
            sort: '-created',
            filter: isSignedIn ? `user = "${user?.id}"` : '',
            expand: 'tags',
          });
          
          const typedRecords = records.items.map((item) => ({
            ...item,
            type: contentType,
          })) as ContentUnion[];
          
          result = [...result, ...typedRecords];
        }
        
        // Sort all items by created date
        result.sort((a, b) => 
          new Date(b.created).getTime() - new Date(a.created).getTime()
        );
      }

      // Fetch tags
      const tagsResult = await pb.collection('tags').getList(1, 50, {
        sort: 'name',
      });
      
      setItems(result);
      setTags(tagsResult.items as Tag[]);
    } catch (error) {
      console.error('Error fetching content:', error);
      setError('Failed to load content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, user]);

  const searchContent = useCallback(async (query: string) => {
    if (!query.trim()) {
      return fetchContent();
    }

    try {
      setIsLoading(true);
      setError(null);

      let result: ContentUnion[] = [];
      const types = Object.values(ContentType);
      
      for (const type of types) {
        const collection = getCollectionForType(type);
        let filter = '';
        
        // Build different search filters based on content type
        switch (type) {
          case ContentType.VIDEO:
            filter = `title ~ "${query}" || url ~ "${query}" || comment ~ "${query}"`;
            break;
          case ContentType.MEME:
            filter = `category ~ "${query}"`;
            break;
          case ContentType.NEWS:
            filter = `title ~ "${query}" || summary ~ "${query}" || url ~ "${query}"`;
            break;
          case ContentType.WEBSITE:
            filter = `name ~ "${query}" || url ~ "${query}" || category ~ "${query}"`;
            break;
          case ContentType.IMAGE:
            filter = `description ~ "${query}"`;
            break;
        }
        
        // Add user filter if signed in
        if (isSignedIn && user) {
          filter = filter ? `(${filter}) && user = "${user.id}"` : `user = "${user.id}"`;
        }
        
        const records = await pb.collection(collection).getList(1, 20, {
          sort: '-created',
          filter,
        });
        
        const typedRecords = records.items.map((item) => ({
          ...item,
          type,
        })) as ContentUnion[];
        
        result = [...result, ...typedRecords];
      }
      
      // Also search by tags
      const tagsResult = await pb.collection('tags').getList(1, 20, {
        filter: `name ~ "${query}"`,
      });
      
      for (const tag of tagsResult.items) {
        for (const type of types) {
          const collection = getCollectionForType(type);
          let filter = `tags ~ "${tag.id}"`;
          
          if (isSignedIn && user) {
            filter = `${filter} && user = "${user.id}"`;
          }
          
          const records = await pb.collection(collection).getList(1, 10, {
            filter,
          });
          
          const typedRecords = records.items.map((item) => ({
            ...item,
            type,
          })) as ContentUnion[];
          
          // Add only non-duplicate items
          for (const record of typedRecords) {
            if (!result.some(r => r.id === record.id && r.type === record.type)) {
              result.push(record);
            }
          }
        }
      }
      
      // Sort results by relevance (this is a simple implementation)
      result.sort((a, b) => {
        const aMatch = JSON.stringify(a).toLowerCase().includes(query.toLowerCase());
        const bMatch = JSON.stringify(b).toLowerCase().includes(query.toLowerCase());
        
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        
        // If both match or don't match, sort by created date
        return new Date(b.created).getTime() - new Date(a.created).getTime();
      });
      
      setItems(result);
    } catch (error) {
      console.error('Error searching content:', error);
      setError('Failed to search content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchContent, isSignedIn, user]);

  const addContent = useCallback(async (type: ContentType, data: any, file?: File) => {
    if (!isSignedIn || !user) {
      setError('You must be signed in to save content');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const collection = getCollectionForType(type);
      const formData = new FormData();

      // Add user ID
      const contentData = {
        ...data,
        user: user.id,
      };

      // Handle file upload if present
      if (file) {
        formData.append('file', file);
      }

      // Add data as JSON
      Object.keys(contentData).forEach(key => {
        if (key !== 'file') {
          formData.append(key, contentData[key]);
        }
      });

      // Create record
      await pb.collection(collection).create(formData);

      // Refresh content
      await fetchContent();
    } catch (error) {
      console.error('Error adding content:', error);
      setError('Failed to save content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchContent, isSignedIn, user]);

  const deleteContent = useCallback(async (type: ContentType, id: string) => {
    if (!isSignedIn) {
      setError('You must be signed in to delete content');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const collection = getCollectionForType(type);
      await pb.collection(collection).delete(id);

      // Refresh content
      await fetchContent();
    } catch (error) {
      console.error('Error deleting content:', error);
      setError('Failed to delete content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchContent, isSignedIn]);

  // Fetch content on mount
  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return {
    items,
    tags,
    isLoading,
    error,
    fetchContent,
    searchContent,
    addContent,
    deleteContent,
  };
}