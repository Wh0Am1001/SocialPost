import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import type { Post, Profile as ProfileType } from '../../types';
import Avatar from '../common/Avatar';
import Spinner from '../common/Spinner';
import PostCard from '../Posts/PostCard';
import EditProfileModal from './EditProfileModal';

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user, profile: myProfile } = useAuth();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const isOwnProfile = user?.id === id;

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const [{ data: p }, { data: pos }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('post_feed').select('*').eq('user_id', id).order('created_at', { ascending: false }),
    ]);
    setProfile((isOwnProfile ? myProfile : p) as ProfileType);
    setPosts((pos as Post[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, myProfile]);

  const handleDeletePost = async (postId: string) => {
    await supabase.from('posts').delete().eq('id', postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  if (loading) {
    return (
      <div className="flex
      justify-center
      py-16
      min-h-screen
      bg-gray-50
      dark:bg-gray-950">
        <Spinner size={32} />
      </div>
    );
  }

  if (!profile) {
    return <p className="text-center
    py-16
    text-gray-400
    dark:text-gray-500">User not found.</p>;
  }

  return (
    <div className="max-w-lg
      mx-auto
      px-3
      sm:px-0
      pt-6
      pb-20
      min-h-screen
      bg-gray-50
      dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm p-6 flex items-center gap-5 mb-6 text-gray-900 dark:text-gray-100">
        <Avatar src={profile.avatar_url} name={profile.display_name} size="lg" />
        <div className="flex-1">
          <h1 className="text-xl font-bold">{profile.display_name ?? profile.username}</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm">@{profile.username}</p>
          {profile.bio && <p className="text-sm mt-1">{profile.bio}</p>}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{posts.length} posts</p>
        </div>
        {isOwnProfile && (
          <button
            onClick={() => setEditing(true)}
           className="bg-brand-600
          hover:bg-brand-700
          dark:bg-brand-500
          dark:hover:bg-brand-600
          text-white
          px-4
          py-2
          rounded-lg
          text-sm
          font-semibold"
          >
            Edit Profile
          </button>
        )}
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-gray-400 py-10">No posts yet.</p>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} onDelete={handleDeletePost} />)
      )}

      {editing && <EditProfileModal onClose={() => setEditing(false)} onSaved={load} />}
    </div>
  );
}
