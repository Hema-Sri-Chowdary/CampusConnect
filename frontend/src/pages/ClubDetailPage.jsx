import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { clubsAPI } from '../api/axios';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Globe, Instagram } from 'lucide-react';

export default function ClubDetailPage() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({ queryKey: ['club', id], queryFn: () => clubsAPI.getOne(id).then(r => r.data) });
  if (isLoading) return <div className="page-container"><div className="h-40 bg-dark-800 rounded-3xl animate-pulse mb-8" /></div>;
  if (!data?.data) return <div className="page-container text-center py-20"><p className="text-dark-100">Club not found.</p></div>;
  const { club, events } = data.data;
  return (
    <div className="page-container">
      <div className="card p-8 mb-8">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-primary-500/20 border-2 border-primary-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">{club.logo ? <img src={club.logo} alt={club.clubName} className="w-full h-full object-cover" /> : <span className="text-4xl">🏆</span>}</div>
          <div className="flex-1">
            <h1 className="text-3xl font-display font-black text-white mb-2">{club.clubName}</h1>
            <span className="badge badge-primary capitalize">{club.category}</span>
            <p className="text-dark-100 mt-3 leading-relaxed">{club.description}</p>
            <div className="flex gap-3 mt-4">
              {club.socialLinks?.instagram && <a href={club.socialLinks.instagram} className="btn btn-secondary btn-sm gap-1.5"><Instagram className="w-3.5 h-3.5" /> Instagram</a>}
              {club.socialLinks?.website && <a href={club.socialLinks.website} className="btn btn-secondary btn-sm gap-1.5"><Globe className="w-3.5 h-3.5" /> Website</a>}
            </div>
          </div>
        </div>
      </div>
      <h2 className="text-2xl font-display font-bold text-white mb-6">Events by {club.clubName}</h2>
      {events?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map(evt => (
            <Link key={evt._id} to={`/events/${evt._id}`} className="event-card block">
              <div className="h-40 bg-dark-800 overflow-hidden relative rounded-t-2xl">{evt.banner ? <img src={evt.banner} alt={evt.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">📅</div>}<div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent" /></div>
              <div className="p-4">
                <h3 className="font-display font-bold text-white mb-1 group-hover:text-primary-300 transition-colors">{evt.title}</h3>
                <div className="flex items-center gap-3 text-xs text-dark-100">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{format(new Date(evt.date), 'dd MMM yyyy')}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{evt.venue?.name}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : <div className="text-center py-16 card"><p className="text-dark-100">No events from this club yet.</p></div>}
    </div>
  );
}