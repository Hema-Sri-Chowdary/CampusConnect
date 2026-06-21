import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { clubsAPI } from '../api/axios';
import { Search, Users, Calendar, Cpu, Music2, Globe, Briefcase, Heart, HelpCircle } from 'lucide-react';

const CATEGORIES = [
  { value: '',               label: 'All Clubs',        icon: '🏆', color: 'text-white' },
  { value: 'technical',      label: 'Technical',        icon: '💻', color: 'text-blue-400' },
  { value: 'non-technical',  label: 'Non-Technical',    icon: '🎭', color: 'text-purple-400' },
  { value: 'regional',       label: 'Regional',         icon: '🌍', color: 'text-green-400' },
  { value: 'professional',   label: 'Professional',     icon: '💼', color: 'text-amber-400' },
  { value: 'social_outreach',label: 'Social Outreach',  icon: '❤️', color: 'text-red-400' },
];

const CATEGORY_BADGE = {
  technical:      'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  'non-technical':'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  regional:       'bg-green-500/20 text-green-300 border border-green-500/30',
  professional:   'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  social_outreach:'bg-red-500/20 text-red-300 border border-red-500/30',
  other:          'bg-dark-700 text-dark-100 border border-dark-600',
};

const CATEGORY_EMOJI = {
  technical: '💻', 'non-technical': '🎭', regional: '🌍',
  professional: '💼', social_outreach: '❤️', other: '✨',
};

function ClubCard({ club }) {
  const badgeClass = CATEGORY_BADGE[club.category] || CATEGORY_BADGE.other;
  const emoji = CATEGORY_EMOJI[club.category] || '🏆';
  const categoryLabel = CATEGORIES.find(c => c.value === club.category)?.label || club.category;

  return (
    <Link to={`/clubs/${club._id}`} className="card-hover block p-6 group">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary-500/20 border border-primary-500/20 overflow-hidden flex-shrink-0 flex items-center justify-center text-2xl">
          {club.logo ? <img src={club.logo} alt={club.clubName} className="w-full h-full object-cover" /> : emoji}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display font-bold text-white text-base group-hover:text-primary-300 transition-colors leading-tight mb-1.5">{club.clubName}</h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
            {categoryLabel}
          </span>
          <p className="text-dark-100 text-sm mt-2 line-clamp-2">{club.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-dark-700/50 text-xs text-dark-100">
        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{club.totalEvents} Events</span>
        {club.coordinatorId?.name && (
          <span className="flex items-center gap-1 truncate"><Users className="w-3.5 h-3.5 flex-shrink-0" />Coordinator: {club.coordinatorId.name}</span>
        )}
      </div>
    </Link>
  );
}

export default function ClubsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['clubs', search, category],
    queryFn: () => clubsAPI.getAll({ search, category }).then(r => r.data)
  });

  const clubs = data?.data || [];
  const activeCategory = CATEGORIES.find(c => c.value === category) || CATEGORIES[0];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title mb-2">College Clubs</h1>
        <p className="text-dark-100">Explore all active clubs and their upcoming events at VIT-AP University</p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-100" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search clubs by name..."
          className="input pl-10 w-full"
        />
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
              category === cat.value
                ? 'bg-primary-500 border-primary-500 text-white shadow-glow'
                : 'bg-dark-800/60 border-dark-700 text-dark-100 hover:border-dark-500 hover:text-white'
            }`}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results Count */}
      {!isLoading && (
        <p className="text-dark-100 text-sm mb-4">
          Showing <span className="text-white font-medium">{clubs.length}</span> {activeCategory.label !== 'All Clubs' ? activeCategory.label : ''} club{clubs.length !== 1 ? 's' : ''}
          {search && <span> matching "<span className="text-primary-300">{search}</span>"</span>}
        </p>
      )}

      {/* Club Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array(9).fill(0).map((_, i) => <div key={i} className="card h-44 animate-pulse" />)}
        </div>
      ) : clubs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {clubs.map(club => <ClubCard key={club._id} club={club} />)}
        </div>
      ) : (
        <div className="text-center py-20 card">
          <span className="text-6xl mb-4 block">🔍</span>
          <p className="text-white font-semibold mb-1">No clubs found</p>
          <p className="text-dark-100 text-sm">Try a different search or category filter</p>
        </div>
      )}
    </div>
  );
}
