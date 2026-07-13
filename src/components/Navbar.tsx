import { Home, LogOut, PlusSquare, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './common/Avatar';
import ThemeToggle from "../components/common/ThemeToggle";
interface NavbarProps {
  onCreatePost: () => void;
}

export default function Navbar({ onCreatePost }: NavbarProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="text-xl font-bold text-brand-600">
            Snapfeed
          </Link>
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-4">
            <button
              onClick={onCreatePost}
              className="flex items-center gap-1.5 text-gray-700 hover:text-brand-600 font-medium"
            >
              <PlusSquare size={20} /> New Post
            </button>
            <Link
              to={`/profile/${profile?.id}`}
              className="flex items-center gap-1.5 text-gray-700 hover:text-brand-600 font-medium"
            >
              <Avatar src={profile?.avatar_url} name={profile?.display_name} size="sm" />
              {profile?.username}
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-gray-500 hover:text-red-500"
              title="Log out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Bottom nav for mobile */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 flex justify-around py-2">
        <Link to="/" className="p-2 text-gray-700">
          <Home size={24} />
        </Link>
        <button onClick={onCreatePost} className="p-2 text-gray-700">
          <PlusSquare size={24} />
        </button>
        <Link to={`/profile/${profile?.id}`} className="p-2 text-gray-700">
          <User size={24} />
        </Link>
        <button onClick={handleSignOut} className="p-2 text-gray-500">
          <LogOut size={24} />
        </button>
      </nav>
    </>
  );
}
