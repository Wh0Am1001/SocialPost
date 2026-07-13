import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, MoreHorizontal, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { Post } from '../../types';
import Avatar from '../common/Avatar';
import ReactionBar from './ReactionBar';
import CommentSection from './CommentSection';

interface PostCardProps {
  post: Post;
  onDelete: (postId: string) => void;
}

export default function PostCard({ post, onDelete }: PostCardProps) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isOwner = user?.id === post.user_id;

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 mb-5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link to={`/profile/${post.user_id}`} className="flex items-center gap-2.5">
          <Avatar src={post.avatar_url} name={post.display_name} />
          <div>
            <p className="font-semibold text-sm leading-tight">{post.username}</p>
            <p className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </Link>

        {isOwner && (
          <div className="relative">
            <button onClick={() => setMenuOpen((v) => !v)} className="text-gray-400 hover:text-gray-600 p-1">
              <MoreHorizontal size={20} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 bg-white shadow-lg rounded-lg border border-gray-100 py-1 w-32 z-10 animate-fade-in">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(post.id);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                >
                  <Trash2 size={14} /> Delete post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image */}
      <img src={post.image_url} alt={post.caption ?? 'Post image'} className="w-full max-h-[600px] object-cover bg-gray-100" />

      {/* Caption */}
      {post.caption && (
        <p className="px-4 pt-3 text-sm">
          <span className="font-semibold mr-1.5">{post.username}</span>
          {post.caption}
        </p>
      )}

      <ReactionBar postId={post.id} />

      <button
        onClick={() => setShowComments((v) => !v)}
        className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <MessageCircle size={16} />
        {post.comment_count ? `View all ${post.comment_count} comments` : 'Add a comment'}
      </button>

      {showComments && <CommentSection postId={post.id} />}
    </article>
  );
}
