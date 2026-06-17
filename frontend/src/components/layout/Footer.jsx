import { Link } from 'react-router-dom';
import { Zap, Github, Twitter, Instagram, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-dark-700/50 bg-dark-950/80 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-xl gradient-text">CampusConnect</span>
            </div>
            <p className="text-dark-100 text-sm leading-relaxed max-w-xs">
              The ultimate platform for college club event discovery, registration, and management.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {[Twitter, Instagram, Github].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-dark-800 border border-dark-700 rounded-xl flex items-center justify-center text-dark-100 hover:text-primary-400 hover:border-primary-500/30 transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
              <a href="mailto:hello@campusconnect.in" className="w-9 h-9 bg-dark-800 border border-dark-700 rounded-xl flex items-center justify-center text-dark-100 hover:text-primary-400 hover:border-primary-500/30 transition-all">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Platform</h4>
            <ul className="space-y-2">
              {[['Events', '/events'], ['Clubs', '/clubs'], ['Register', '/register'], ['Login', '/login']].map(([label, to]) => (
                <li key={to}><Link to={to} className="text-dark-100 hover:text-primary-400 text-sm transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Support</h4>
            <ul className="space-y-2">
              {[['About', '#'], ['Contact', '#'], ['Privacy Policy', '#'], ['Terms of Service', '#']].map(([label, to]) => (
                <li key={label}><a href={to} className="text-dark-100 hover:text-primary-400 text-sm transition-colors">{label}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-700/50 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-dark-100 text-xs">© 2024 CampusConnect. Built for VIT AP 🎓</p>
          <p className="text-dark-100 text-xs">Made with ❤️ for college students</p>
        </div>
      </div>
    </footer>
  );
}
