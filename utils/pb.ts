import PocketBase from 'pocketbase';
import Constants from 'expo-constants';

// Initialize PocketBase
// In a real app, you would get this from environment variables
// For this example, we'll use a placeholder URL
const PB_URL = 'https://your-pocketbase-instance.com';

export const pb = new PocketBase(PB_URL);

// Define collection names for better maintainability
export const COLLECTIONS = {
  USERS: 'users',
  VIDEOS: 'videos',
  MEMES: 'memes',
  NEWS: 'news',
  WEBSITES: 'websites',
  IMAGES: 'images',
  TAGS: 'tags',
};

// Content type enum for easier reference
export enum ContentType {
  VIDEO = 'video',
  MEME = 'meme',
  NEWS = 'news',
  WEBSITE = 'website',
  IMAGE = 'image',
}

// Helper function to get collection name from content type
export const getCollectionForType = (type: ContentType): string => {
  switch (type) {
    case ContentType.VIDEO:
      return COLLECTIONS.VIDEOS;
    case ContentType.MEME:
      return COLLECTIONS.MEMES;
    case ContentType.NEWS:
      return COLLECTIONS.NEWS;
    case ContentType.WEBSITE:
      return COLLECTIONS.WEBSITES;
    case ContentType.IMAGE:
      return COLLECTIONS.IMAGES;
    default:
      throw new Error(`Unknown content type: ${type}`);
  }
};