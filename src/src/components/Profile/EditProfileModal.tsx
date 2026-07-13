import { useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import Avatar from '../common/Avatar';
import Spinner from '../common/Spinner';

export default function EditProfileModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const { user, profile, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFile(f);
    setAvatarPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    let avatarUrl = profile?.avatar_url ?? null;

    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, avatarFile, { upsert: true });
      if (uploadError) {
        setError(uploadError.message);
        setLoading(false);
        return;
      }
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      avatarUrl = data.publicUrl;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ display_name: displayName, bio, avatar_url: avatarUrl })
      .eq('id', user.id);

    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }

    await refreshProfile();
    onSaved();
    onClose();
  };

  return (
     <div
    className="
      fixed
      inset-0
      bg-black/50
      dark:bg-black/70
      z-40
      flex
      items-center
      justify-center
      p-4
      animate-fade-in
    "
  >
    <div
      className="
        bg-white
        dark:bg-gray-900
        text-gray-900
        dark:text-gray-100
        rounded-2xl
        w-full
        max-w-md
        overflow-hidden
      "
    >
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 px-4 py-3">
          <h2 className="font-semibold">Edit profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex flex-col items-center gap-2">
            <Avatar src={avatarPreview} name={displayName} size="lg" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-brand-600 font-medium"
            >
              Change photo
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">Display name</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full
              border
              border-gray-200
              dark:border-gray-700
              bg-white
              dark:bg-gray-800
              text-gray-900
              dark:text-white
              rounded-lg
              px-3
              py-2
              text-sm
              focus:outline-none
              focus:ring-2
              focus:ring-brand-500"
                          />
          </div>

          <div>
            <label className="text-xs text-gray-500">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full
                border
                border-gray-200
                dark:border-gray-700
                bg-white
                dark:bg-gray-800
                text-gray-900
                dark:text-white
                rounded-lg
                px-3
                py-2
                text-sm
                resize-none
                focus:outline-none
                focus:ring-2
                focus:ring-brand-500"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg py-2 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Spinner size={16} />}
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
