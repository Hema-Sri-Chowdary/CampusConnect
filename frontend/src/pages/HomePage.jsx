import { Link, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { eventsAPI, clubsAPI } from '../api/axios';
import { format } from 'date-fns';
import {
  Zap, ArrowRight, Calendar, Users, Award, Star, ChevronRight,
  MapPin, Clock, Sparkles, TrendingUp, Shield, Search
} from 'lucide-react';

const CATEGORIES = [
  { id: 'technical', label: 'Technical', emoji: '💻', color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30' },
  { id: 'hackathon', label: 'Hackathon', emoji: '💡', color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30' },
  { id: 'workshop', label: 'Workshop', emoji: '🔧', color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30' },
  { id: 'cultural', label: 'Cultural', emoji: '🎭', color: 'from-pink-500/20 to-pink-600/10 border-pink-500/30' },
  { id: 'sports', label: 'Sports', emoji: '⚽', color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30' },
  { id: 'ai-ml', label: 'AI / ML', emoji: '🤖', color: 'from-red-500/20 to-red-600/10 border-red-500/30' },
];

const STATS = [
  { label: 'Active Students', value: '5,000+', icon: Users, color: 'text-blue-400' },
  { label: 'Events Hosted', value: '200+', icon: Calendar, color: 'text-purple-400' },
  { label: 'College Clubs', value: '50+', icon: Sparkles, color: 'text-emerald-400' },
  { label: 'Certificates Issued', value: '3,000+', icon: Award, color: 'text-amber-400' },
];

function EventCard({ event }) {
  const isFull = event.registeredCount >= event.capacity;
  const isPaid = !event.feeStructure?.isFree;

  return (
    <Link to={`/events/${event._id}`} className="event-card block">
      {/* Banner */}
      <div className="relative h-48 bg-gradient-to-br from-dark-800 to-dark-900 overflow-hidden">
        {event.banner ? (
          <img src={event.banner} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500/10 to-blue-500/10">
            <span className="text-5xl">📅</span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="badge badge-primary capitalize">{event.category}</span>
          {isPaid && <span className="badge badge-warning">Paid</span>}
          {isFull && <span className="badge badge-danger">Full</span>}
        </div>
        <div className="absolute top-3 right-3">
          <span className={`badge ${event.mode === 'online' ? 'badge-success' : event.mode === 'hybrid' ? 'badge-info' : 'badge-gray'} capitalize`}>
            {event.mode}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent" />
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display font-bold text-white text-lg mb-1 line-clamp-1 group-hover:text-primary-300 transition-colors">
          {event.title}
        </h3>
        <p className="text-dark-100 text-sm mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />
          {event.clubId?.clubName || 'Unknown Club'}
        </p>
        <div className="flex items-center gap-3 text-xs text-dark-100 mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-primary-400" />
            {format(new Date(event.date), 'dd MMM yyyy')}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate max-w-[100px]">{event.venue?.name}</span>
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            {event.feeStructure?.isFree ? (
              <span className="text-emerald-400 font-bold text-sm">Free</span>
            ) : (
              <div>
                <span className="text-white font-bold text-sm">₹{event.feeStructure?.vitapFee}</span>
                <span className="text-dark-100 text-xs"> VITAP / ₹{event.feeStructure?.externalFee} Others</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-dark-100">
            <Users className="w-3.5 h-3.5" />
            {event.registeredCount}/{event.capacity}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const { data: eventsData } = useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: () => eventsAPI.getAll({ date: 'upcoming', limit: 6, sort: 'date' }).then(r => r.data)
  });

  const { data: clubsData } = useQuery({
    queryKey: ['clubs'],
    queryFn: () => clubsAPI.getAll().then(r => r.data)
  });

  return (
    <div>
      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-mesh" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-blue-500/6 rounded-full blur-3xl" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(108,99,255,0.08) 1px, transparent 0)', backgroundSize: '48px 48px' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-300 text-xs font-semibold mb-6 animate-fade-in">
              <Sparkles className="w-3.5 h-3.5" />
              Platform for VIT AP College Clubs
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-black text-white mb-6 leading-[1.1] animate-slide-up">
              Discover &{' '}
              <span className="text-gradient">Connect</span> with{' '}
              <span className="text-gradient">Campus Events</span>
            </h1>

            <p className="text-xl text-dark-100 mb-8 max-w-2xl leading-relaxed animate-slide-up animate-delay-100">
              Register for hackathons, workshops, cultural events, and more.
              One platform for all your campus club experiences.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up animate-delay-200">
              <Link to="/events" className="btn btn-primary btn-lg group">
                Explore Events
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/register" className="btn btn-secondary btn-lg">
                Join Free
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6 mt-12 animate-fade-in animate-delay-300">
              {STATS.map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${color}`} />
                  <div>
                    <span className="text-white font-bold text-lg">{value}</span>
                    <span className="text-dark-100 text-xs ml-1.5">{label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-dark-600 rounded-full flex items-start justify-center p-1">
            <div className="w-1 h-3 bg-primary-500 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* ─── Categories ───────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-300 text-xs font-semibold mb-3">
            <TrendingUp className="w-3.5 h-3.5" /> Event Categories
          </div>
          <h2 className="section-title">Explore by Category</h2>
          <p className="section-subtitle">From coding to cultural — find events that match your passion</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map(({ id, label, emoji, color }) => (
            <Link key={id} to={`/events?category=${id}`}
              className={`group flex flex-col items-center gap-3 p-5 bg-gradient-to-br ${color} rounded-2xl border hover:scale-105 transition-all duration-200 hover:shadow-glow`}>
              <span className="text-3xl group-hover:animate-float">{emoji}</span>
              <span className="text-sm font-semibold text-white">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Upcoming Events ──────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-300 text-xs font-semibold mb-3">
              <Calendar className="w-3.5 h-3.5" /> Coming Up
            </div>
            <h2 className="section-title">Upcoming Events</h2>
          </div>
          <Link to="/events" className="btn btn-secondary gap-2">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {eventsData?.data?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventsData.data.map(event => <EventCard key={event._id} event={event} />)}
          </div>
        ) : (
          <div className="text-center py-16 card">
            <span className="text-5xl mb-4 block">📅</span>
            <p className="text-dark-100">No upcoming events yet. Check back soon!</p>
          </div>
        )}
      </section>

      {/* ─── Features Section ─────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="section-title">Everything you need</h2>
          <p className="section-subtitle">A complete platform for students and club coordinators</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Search, title: 'Discover Events', desc: 'Browse, search, and filter events from all clubs on campus. Never miss an opportunity.', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
            { icon: Shield, title: 'Secure Payments', desc: 'Pay registration fees securely via Razorpay. Get instant confirmation and receipt.', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            { icon: Award, title: 'Earn Certificates', desc: 'Get digital certificates with QR verification after attending events.', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          ].map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="card p-8 hover:scale-[1.02] transition-transform">
              <div className={`w-12 h-12 ${bg} border rounded-2xl flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-2">{title}</h3>
              <p className="text-dark-100 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA Section ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl gradient-primary p-12 text-center shadow-glow-lg">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-4">
              Ready to get started? 🚀
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of VIT AP students already on CampusConnect
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn bg-white text-primary-600 hover:bg-white/90 btn-lg font-bold shadow-lg">
                Create Free Account
              </Link>
              <Link to="/events" className="btn bg-white/10 hover:bg-white/20 text-white border border-white/20 btn-lg">
                Browse Events
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
