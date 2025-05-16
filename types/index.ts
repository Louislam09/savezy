export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  created: string;
  updated: string;
}

export interface BaseContent {
  id: string;
  user: string;
  created: string;
  updated: string;
  tags: string[];
}

export interface VideoContent extends BaseContent {
  url: string;
  title?: string;
  comment?: string;
}

export interface MemeContent extends BaseContent {
  imageUrl: string;
  file?: string;  // PocketBase file reference
  category: string;
}

export interface NewsContent extends BaseContent {
  title: string;
  url: string;
  summary: string;
}

export interface WebsiteContent extends BaseContent {
  url: string;
  name?: string;
  category: string;
}

export interface ImageContent extends BaseContent {
  imageUrl?: string;
  file?: string;  // PocketBase file reference
  description: string;
}

export interface Tag {
  id: string;
  name: string;
  count: number;
}

export type ContentUnion = 
  | VideoContent 
  | MemeContent 
  | NewsContent 
  | WebsiteContent 
  | ImageContent;

export interface AuthState {
  isLoading: boolean;
  isSignedIn: boolean;
  user: User | null;
  error: string | null;
}