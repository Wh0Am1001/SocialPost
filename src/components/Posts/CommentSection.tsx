import { FormEvent, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { useComments } from '../../hooks/usePosts';
import Avatar from '../common/Avatar';

export default function CommentSection({ postId }: { postId: string }) {
  const { user, profile } = useAuth();
  const { comments, addComment, deleteComment } = useComments(postId);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user) return;
    setSubmitting(true);
    await addComment(user.id, text.trim());
    setText('');
    setSubmitting(false);
  };

  return (
    <div className="px-4 pb-3 pt-1">
      {comments.length > 0 && (
        <ul className="space-y-2 mb-2 max-h-56 overflow-y-auto">
          {comments.map((c) => (
            <li key={c.id} className="flex items-start gap-2 group">
              <Avatar src={c.profiles?.avatar_url} name={c.profiles?.display_name} size="sm" />
              <div className="flex-1 bg-gray-100 rounded-2xl px-3 py-1.5">
                <p className="text-sm">
                  <span className="font-semibold mr-1">{c.profiles?.username}</span>
                  {c.content}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[11px] text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                </span>
                {c.user_id === user?.id && (
                  <button
                    onClick={() => deleteComment(c.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 mt-0.5"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Avatar src={profile?.avatar_url} name={profile?.display_name} size="sm" />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 bg-gray-100 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="text-brand-600 font-semibold text-sm disabled:opacity-40"
        >
          Post
        </button>
      </form>
    </div>
  );
}
