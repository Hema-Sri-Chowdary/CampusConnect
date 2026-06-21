import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { eventsAPI } from '../api/axios';
import { format } from 'date-fns';
import { Search, Filter, Calendar, MapPin, Users, X, ChevronDown, Sparkles, SlidersHorizontal } from 'lucide-react';

const CATEGORIES = ['technical', 'coding', 'hackathon', 'workshop', 'cultural', 'sports', 'entrepreneurship', 'ai-ml', 'robotics', 'other'];
const MODES = ['online', 'offline', 'hybrid'];

function EventCard({ event }) {
  const isFull = event.registeredCount >= event.capacity;
  return (
    <Link to={`/events/${event._id}`} className="event-card block">
      <div className="relative h-44 bg-dark-800 overflow-hidden">
        {event.banner
          ? <img src={event.banner} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500/10 to-blue-500/10"><span className="text-4xl">📅</span></div>
        }
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <span className="badge badge-primary capitalize">{event.category}</span>
          {!event.feeStructure?.isFree && <span className="badge badge-warning">Paid</span>}
          {isFull && <span className="badge badge-danger">Full</span>}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/70 via-transparent" />
      </div>
      <div className="p-4">
        <h3 className="font-display font-bold text-white mb-1 line-clamp-1 group-hover:text-primary-300 transition-colors">{event.title}</h3>
        <p className="text-primary-400 text-xs mb-2 font-medium">{event.clubId?.clubName}</p>
        <div className="flex items-center gap-3 text-xs text-dark-100 mb-3">
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{format(new Date(event.date), 'dd MMM yyyy')}</span>
          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /><span className="truncate max-w-[90px]">{event.venue?.name}</span></span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm">{event.feeStructure?.isFree ? <span className="text-emerald-400">Free</span> : <span className="text-white">₹{event.feeStructure?.vitapFee}+</span>}</span>
          <div className="flex items-center gap-1 text-xs text-dark-100">
            <Users className="w-3.5 h-3.5" />{event.registeredCount}/{event.capacity}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filters = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    mode: searchParams.get('mode') || '',
    isFree: searchParams.get('isFree') || '',
    date: searchParams.get('date') || 'upcoming',
    sort: searchParams.get('sort') || 'date',
    page: parseInt(searchParams.get('page') || '1'),
  };

  const { data, isLoading } = useQuery({
    queryKey: ['events', filters],
    queryFn: () => eventsAPI.getAll({ ...filters, limit: 12 }).then(r => r.data)
  });

  const updateFilter = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    if (key !== 'page') p.set('page', '1');
    setSearchParams(p);
  };

  const handleSearch = (e) => { e.preventDefault(); updateFilter('search', searchInput); };
  const clearFilters = () => { setSearchParams({}); setSearchInput(''); };

  const hasFilters = filters.search || filters.category || filters.mode || filters.isFree || filters.date !== 'upcoming';

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="section-title mb-2">Explore Events</h1>
        <p className="text-dark-100">Discover and register for events from all college clubs</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-100" />
        <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
          placeholder="Search events by name, club, keyword..."
          className="input pl-12 pr-32 py-4 text-base rounded-2xl" />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
          <button type="button" onClick={() => setFiltersOpen(!filtersOpen)}
            className={`btn btn-secondary btn-sm gap-1.5 ${filtersOpen ? 'border-primary-500/50 text-primary-300' : ''}`}>
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
          </button>
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </div>
      </form>

      {/* Filters Panel */}
      {filtersOpen && (
        <div className="card p-5 mb-6 animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="label">Category</label>
              <select value={filters.category} onChange={e => updateFilter('category', e.target.value)}
                className="input py-2">
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c} className="capitalize bg-dark-800">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Mode</label>
              <select value={filters.mode} onChange={e => updateFilter('mode', e.target.value)}
                className="input py-2">
                <option value="">All Modes</option>
                {MODES.map(m => <option key={m} value={m} className="capitalize bg-dark-800">{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Fee</label>
              <select value={filters.isFree} onChange={e => updateFilter('isFree', e.target.value)}
                className="input py-2">
                <option value="">Any</option>
                <option value="true" className="bg-dark-800">Free Only</option>
                <option value="false" className="bg-dark-800">Paid Only</option>
              </select>
            </div>
            <div>
              <label className="label">Sort By</label>
              <select value={filters.sort} onChange={e => updateFilter('sort', e.target.value)}
                className="input py-2">
                <option value="date" className="bg-dark-800">Date (Nearest)</option>
                <option value="popular" className="bg-dark-800">Most Popular</option>
                <option value="newest" className="bg-dark-800">Newest</option>
              </select>
            </div>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-3 flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors">
              <X className="w-3.5 h-3.5" /> Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Date Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
        {[['upcoming', '📅 Upcoming'], ['today', '⚡ Today'], ['', '🔍 All Events']].map(([val, label]) => (
          <button key={val} onClick={() => updateFilter('date', val)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filters.date === val ? 'bg-primary-500 text-white shadow-glow' : 'bg-dark-800/60 border border-dark-700 text-dark-100 hover:text-white'
            }`}>{label}</button>
        ))}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="card h-72 animate-pulse">
              <div className="h-44 bg-dark-800 rounded-t-2xl" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-dark-700 rounded w-3/4" />
                <div className="h-3 bg-dark-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : data?.data?.length > 0 ? (
        <>
          <p className="text-dark-100 text-sm mb-4">{data.pagination?.total || 0} events found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {data.data.map(event => <EventCard key={event._id} event={event} />)}
          </div>
          {/* Pagination */}
          {data.pagination?.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => updateFilter('page', p.toString())}
                  className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                    filters.page === p ? 'bg-primary-500 text-white shadow-glow' : 'bg-dark-800/60 border border-dark-700 text-dark-100 hover:text-white'
                  }`}>{p}</button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 card">
          <span className="text-6xl mb-4 block">🔍</span>
          <h3 className="text-xl font-bold text-white mb-2">No events found</h3>
          <p className="text-dark-100 mb-4">Try adjusting your filters or search query</p>
          <button onClick={clearFilters} className="btn btn-primary">Clear Filters</button>
        </div>
      )}
    </div>
  );
}
