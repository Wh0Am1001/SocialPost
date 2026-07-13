import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Comment, EmojiKey, Post, Reaction } from '../types';

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('post_feed')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setPosts(data as Post[]);
      setError(null);
    }
    setLoading(false);
  }, []);
/*
  useEffect(() => {
    fetchPosts();

    // Live updates: re-fetch whenever posts/comments/reactions change.
    
    const channel = supabase
      .channel('public:feed-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, fetchPosts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reactions' }, fetchPosts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, fetchPosts)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPosts]);
*/
useEffect(() => {
  fetchPosts();
}, [fetchPosts]);

  const createPost = async (file: File, caption: string, userId: string) => {
    const ext = file.name.split('.').pop();
    const path = `${userId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from('post-images').upload(path, file);
    if (uploadError) return { error: uploadError.message };

    const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(path);

    const { error: insertError } = await supabase.from('posts').insert({
      user_id: userId,
      image_url: urlData.publicUrl,
      caption,
    });

    if (insertError) return { error: insertError.message };
    await fetchPosts();
    return { error: null };
  };

  const deletePost = async (postId: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (!error) setPosts((prev) => prev.filter((p) => p.id !== postId));
    return { error: error?.message ?? null };
  };

  return { posts, loading, error, fetchPosts, createPost, deletePost };
}

export function useComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(username, display_name, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    setComments((data as unknown as Comment[]) ?? []);
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (userId: string, content: string) => {
    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      user_id: userId,
      content,
    });
    if (!error) await fetchComments();
    return { error: error?.message ?? null };
  };

  const deleteComment = async (commentId: string) => {
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (!error) setComments((prev) => prev.filter((c) => c.id !== commentId));
    return { error: error?.message ?? null };
  };

  return { comments, loading, addComment, deleteComment };
}

export function useReactions(postId: string, userId: string | null) {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [myReaction, setMyReaction] = useState<EmojiKey | null>(null);

  const fetchReactions = useCallback(async () => {
    const { data } = await supabase.from('reactions').select('*').eq('post_id', postId);
    const all = (data as Reaction[]) ?? [];
    setReactions(all);
    setMyReaction(all.find((r) => r.user_id === userId)?.emoji ?? null);
  }, [postId, userId]);

  useEffect(() => {
    fetchReactions();
  }, [fetchReactions]);

  const toggleReaction = async (emoji: EmojiKey) => {
    if (!userId) return;

    if (myReaction === emoji) {
      // Same emoji clicked again -> remove reaction
      await supabase.from('reactions').delete().eq('post_id', postId).eq('user_id', userId);
    } else {
      // Upsert: insert new or switch emoji
      await supabase
        .from('reactions')
        .upsert({ post_id: postId, user_id: userId, emoji }, { onConflict: 'post_id,user_id' });
    }
    await fetchReactions();
  };

  const counts = reactions.reduce<Record<string, number>>((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] ?? 0) + 1;
    return acc;
  }, {});

  return { reactions, myReaction, counts, total: reactions.length, toggleReaction };
}
