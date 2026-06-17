import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center px-4">
      <div className="text-center animate-fade-in">
        <div className="text-[120px] font-display font-black gradient-text leading-none mb-4">404</div>
        <h1 className="text-3xl font-display font-bold text-white mb-3">Page Not Found</h1>
        <p className="text-dark-100 mb-8 max-w-sm mx-auto">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => window.history.back()} className="btn btn-secondary gap-2">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
          <Link to="/" className="btn btn-primary gap-2">
            <Home className="w-4 h-4" /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}
