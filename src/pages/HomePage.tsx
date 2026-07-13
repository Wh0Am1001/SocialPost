import { useState } from 'react';
import Navbar from '../components/Navbar';
import Feed from '../components/Posts/Feed';
import CreatePostModal from '../components/Posts/CreatePostModal';

export default function HomePage() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onCreatePost={() => setShowCreate(true)} />
      <Feed />
      {showCreate && <CreatePostModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
