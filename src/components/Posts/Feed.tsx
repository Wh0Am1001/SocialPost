import { usePosts } from '../../hooks/usePosts';
import Spinner from '../common/Spinner';
import PostCard from './PostCard';

export default function Feed() {
  const { posts, loading, error, deletePost } = usePosts();

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={32} />
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 py-16">Failed to load feed: {error}</p>;
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg font-medium">No posts yet</p>
        <p className="text-sm">Be the first to share a photo!</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-3 sm:px-0 pt-4 pb-20">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onDelete={deletePost} />
      ))}
    </div>
  );
}
