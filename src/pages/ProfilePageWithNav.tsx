import { useState } from 'react';
import Navbar from '../components/Navbar';
import ProfilePage from '../components/Profile/ProfilePage';
import CreatePostModal from '../components/Posts/CreatePostModal';

export default function ProfilePageWithNav() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onCreatePost={() => setShowCreate(true)} />
      <ProfilePage />
      {showCreate && <CreatePostModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
