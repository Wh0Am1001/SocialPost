import { useRef, useState } from 'react';
import { X, ImagePlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePosts } from '../../hooks/usePosts';
import Spinner from '../common/Spinner';

export default function CreatePostModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const { createPost } = usePosts();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!file || !user) return;
    setLoading(true);
    setError(null);
    const { error } = await createPost(file, caption, user.id);
    setLoading(false);
    if (error) setError(error);
    else onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="font-semibold">Create new post</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {preview ? (
            <img src={preview} alt="Preview" className="w-full max-h-80 object-cover rounded-lg" />
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-brand-400 hover:text-brand-500"
            >
              <ImagePlus size={40} />
              <span className="text-sm">Click to select a photo</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {preview && (
            <button onClick={() => fileInputRef.current?.click()} className="text-xs text-brand-600">
              Choose a different photo
            </button>
          )}

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={!file || loading}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg py-2 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Spinner size={16} />}
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
