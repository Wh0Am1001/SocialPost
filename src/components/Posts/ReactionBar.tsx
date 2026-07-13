import { useState } from 'react';
import { ThumbsUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useReactions } from '../../hooks/usePosts';
import { EMOJI_MAP } from '../../types';
import type { EmojiKey } from '../../types';

export default function ReactionBar({ postId }: { postId: string }) {
  const { user } = useAuth();
  const { myReaction, counts, total, toggleReaction } = useReactions(postId, user?.id ?? null);
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="relative">
      {/* Reaction summary */}
      {total > 0 && (
        <div className="flex items-center gap-1 px-4 pt-2 text-sm text-gray-500">
          <span className="flex -space-x-1">
            {Object.keys(counts)
              .slice(0, 3)
              .map((key) => (
                <span key={key}>{EMOJI_MAP[key as EmojiKey]}</span>
              ))}
          </span>
          <span>{total}</span>
        </div>
      )}

      {/* Emoji picker popover */}
      {pickerOpen && (
        <div
          className="absolute bottom-12 left-4 bg-white shadow-lg rounded-full px-2 py-1.5 flex gap-1 border border-gray-100 animate-fade-in z-10"
          onMouseLeave={() => setPickerOpen(false)}
        >
          {(Object.keys(EMOJI_MAP) as EmojiKey[]).map((key) => (
            <button
              key={key}
              onClick={() => {
                toggleReaction(key);
                setPickerOpen(false);
              }}
              className="text-2xl hover:scale-125 transition-transform"
              title={key}
            >
              {EMOJI_MAP[key]}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center border-t border-gray-100 mt-2 px-2">
        <button
          onMouseEnter={() => setPickerOpen(true)}
          onClick={() => toggleReaction(myReaction ?? 'like')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md font-medium text-sm transition-colors ${
            myReaction ? 'text-brand-600' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          {myReaction ? (
            <>
              <span className="text-lg leading-none">{EMOJI_MAP[myReaction]}</span>
              <span className="capitalize">{myReaction}</span>
            </>
          ) : (
            <>
              <ThumbsUp size={18} /> Like
            </>
          )}
        </button>
      </div>
    </div>
  );
}
