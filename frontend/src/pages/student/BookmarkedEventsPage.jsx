import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bookmark } from 'lucide-react';

export default function BookmarkedEventsPage() {
  const { user } = useAuth();
  const bookmarks = user?.bookmarkedEvents || [];
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-white mb-6">Bookmarked Events</h1>
      {bookmarks.length === 0 ? (
        <div className="text-center py-20 card">
          <Bookmark className="w-12 h-12 text-dark-100 mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">No bookmarks yet</p>
          <p className="text-dark-100 text-sm mb-4">Save events to access them quickly later!</p>
          <Link to="/events" className="btn btn-primary">Explore Events</Link>
        </div>
      ) : (
        <p className="text-dark-100">{bookmarks.length} bookmarked event(s).</p>
      )}
    </div>
  );
}