export type EmojiKey = 'like' | 'heart' | 'laugh' | 'wow' | 'sad';

export const EMOJI_MAP: Record<EmojiKey, string> = {
  like: '👍',
  heart: '❤️',
  laugh: '😂',
  wow: '😮',
  sad: '😢',
};

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
  // Joined fields (from post_feed view)
  username?: string;
  display_name?: string | null;
  avatar_url?: string | null;
  comment_count?: number;
  reaction_count?: number;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: Pick<Profile, 'username' | 'display_name' | 'avatar_url'>;
}

export interface Reaction {
  id: string;
  post_id: string;
  user_id: string;
  emoji: EmojiKey;
  created_at: string;
}
