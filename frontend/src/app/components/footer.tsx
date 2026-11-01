import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { WhatsAppIcon } from './icons/whatsapp-icon';
import { Instagram, Linkedin, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';
import { categoriesApi } from '../services/api';
import logoImage from '../../assets/trekkers-logo.png';

const COMPANY_LINKS = [
  { label: 'About us', to: '/about' },
  { label: 'Meet the team', to: '/about/team' },
  { label: 'Blog', to: '/blog' },
  { label: 'Reviews', to: '/reviews' },
  { label: 'FAQ', to: '/faq' },
];

export function Footer() {
  const [categories, setCategories] = useState<Array<{ _id: string; label: string; slug: string; order?: number }>>([]);

  useEffect(() => {
    let cancelled = false;
    const loadCategories = async () => {
      try {
        const data = await categoriesApi.getAll({ level: 0, isActive: true });
        if (!cancelled && Array.isArray(data)) {
          const sorted = [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          setCategories(sorted);
        }
      } catch {
        if (!cancelled) setCategories([]);
      }
    };
    loadCategories();
    return () => { cancelled = true; };
  }, []);

  const socials = [
    { href: 'https://www.instagram.com/thetrekkerssquad', label: 'Instagram', icon: <Instagram size={18} /> },
    { href: 'https://www.linkedin.com/company/thetrekkerssquad', label: 'LinkedIn', icon: <Linkedin size={18} /> },
    { href: 'https://wa.me/9779800000000', label: 'WhatsApp', icon: <WhatsAppIcon size={18} /> },
  ];

  return (
    <footer className="bg-[var(--color-navy-900)] text-slate-300 relative overflow-hidden">
      {/* Call-to-action band */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="rounded-3xl bg-gradient-to-r from-[var(--color-forest-400)] to-[var(--color-forest-300)] px-8 py-10 md:px-14 md:py-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-4xl font-semibold !text-[var(--color-navy-900)] leading-tight">
              Your next summit is waiting.
            </h2>
            <p className="text-[var(--color-navy-900)] mt-2">Join a small group, walk with local guides, and come home with stories.</p>
          </div>
          <Link
            to="/all-trips"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-navy-900)] text-white px-8 py-3.5 font-medium hover:bg-black transition-colors flex-shrink-0"
          >
            Find a trip <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr] gap-10">
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-3 mb-5">
              <img src={logoImage} alt="" width={48} height={48} className="w-12 h-12 rounded-full" />
              <span className="text-white text-lg font-semibold">The Trekkers Squad</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 max-w-xs mb-6">
              Small-group treks and adventures led by local guides across the mountains and beyond.
            </p>
            <div className="flex items-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`The Trekkers Squad on ${s.label}`}
                  className="w-10 h-10 rounded-full border border-white/15 inline-flex items-center justify-center hover:bg-[var(--color-forest-500)] hover:border-transparent hover:text-white transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-[var(--color-forest-400)] mb-5 !text-[var(--color-forest-400)]">Company</h3>
            <ul className="space-y-3 text-sm">
              {COMPANY_LINKS.map((l) => (
                <li key={l.to}><Link to={l.to} className="hover:text-white transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] mb-5 !text-[var(--color-forest-400)]">Explore</h3>
            <ul className="space-y-3 text-sm">
              {categories.map((cat) => (
                <li key={cat._id}>
                  <Link to={`/trips/${cat.slug}`} className="hover:text-white transition-colors">{cat.label}</Link>
                </li>
              ))}
              <li><Link to="/calendar" className="hover:text-white transition-colors">Trip calendar</Link></li>
              <li><Link to="/all-trips" className="hover:text-white transition-colors">All trips</Link></li>
            </ul>
          </div>

          <div className="col-span-2 lg:col-span-1">
            <h3 className="text-xs uppercase tracking-[0.2em] mb-5 !text-[var(--color-forest-400)]">Get in touch</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-[var(--color-forest-400)] flex-shrink-0" />
                <a href="mailto:hello@trekkerssquad.example" className="hover:text-white transition-colors">hello@trekkerssquad.example</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-[var(--color-forest-400)] flex-shrink-0" />
                <a href="tel:+977-98-0000-0000" className="hover:text-white transition-colors">+977-98-0000-0000</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-[var(--color-forest-400)] flex-shrink-0 mt-0.5" />
                <span className="leading-snug">
                  12 Summit Street, Interlaken
                  <br />
                  Switzerland
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-slate-400">
          <div>© {new Date().getFullYear()} The Trekkers Squad. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
