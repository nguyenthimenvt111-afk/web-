export type UserRole = 'guest' | 'pending' | 'approved' | 'admin';
export type AccountStatus = 'pending' | 'approved' | 'rejected' | 'banned';

export interface User {
  id: string;
  email: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  status: AccountStatus;
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
}

export interface Post {
  id: string;
  author_id: string;
  content: string;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  author?: Pick<User, 'id' | 'username' | 'display_name' | 'avatar_url'>;
  user_liked?: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: Pick<User, 'id' | 'username' | 'display_name' | 'avatar_url'>;
}

export interface Conversation {
  id: string;
  created_at: string;
  participants?: User[];
  last_message?: Message;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_deleted: boolean;
  sender?: Pick<User, 'id' | 'username' | 'display_name' | 'avatar_url'>;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'comment' | 'like' | 'follow' | 'approved' | 'rejected';
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
