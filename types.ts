import React from 'react';

export interface User {
  id: string;
  name: string;
  avatar: string;
  email?: string;
  location?: {
    lat: number;
    lng: number;
  };
  isOnline?: boolean;
  hasStory?: boolean;
  coverPhoto?: string;
  bio?: string;
  stats?: {
    posts: number;
    followers: number;
    following: number;
  };
}

export type PrivacyLevel = 'public' | 'friends' | 'private';

export interface UserProfileDetail {
  id: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  privacy: PrivacyLevel;
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  timestamp: number;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  image?: string; // Single image (Backward compatibility)
  images?: string[]; // Multiple images support
  video?: string; // URL or Base64 for video clips
  likes: string[]; // Array of User IDs
  savedBy?: string[]; // Array of User IDs who saved this post
  comments: Comment[];
  timestamp: number;
  type: 'image' | 'video' | 'short_video' | 'text';
  isBroadcast?: boolean; // For admin announcements
  broadcastExpiresAt?: number; // Timestamp when the broadcast unpins
  location?: {
    lat: number;
    lng: number;
  };
  locationName?: string; // e.g. "Siam Paragon"
  mood?: string; // e.g. "Happy 😊"
}

export interface Story {
  id: string;
  userId: string;
  image: string;
  timestamp: number;
  isViewed: boolean;
}

export interface LiveSession {
  id: string;
  userId: string;
  title: string;
  viewerCount: number;
  isActive: boolean;
  startedAt: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  isRead?: boolean;
}

export interface Notification {
  id: string;
  userId: string; // Actor
  type: 'like' | 'comment' | 'follow';
  postId?: string;
  text?: string;
  timestamp: number;
  isRead: boolean;
}

export interface ChatSession {
  userId: string;
  lastMessage: string;
  unread: number;
  timestamp: number;
}

export interface UserBehavior {
  moods: Record<string, number>;
  locations: Record<string, number>;
  interactions: string[];
}

export enum ViewState {
  FEED = 'FEED',
  EXPLORE_NEARBY = 'EXPLORE_NEARBY',
  CHAT = 'CHAT',
  PROFILE = 'PROFILE',
  CREATE_POST = 'CREATE_POST',
  SHORT_CLIPS = 'SHORT_CLIPS',
  LIVE_HOST = 'LIVE_HOST',
  LIVE_VIEW = 'LIVE_VIEW'
}