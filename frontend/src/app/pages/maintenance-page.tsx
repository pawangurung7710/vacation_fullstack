import { Mail, Phone, MapPin, Instagram } from 'lucide-react';
import logoImage from '../../assets/trekkers-logo.png';
import { InstagramEmbed } from '../components/instagram-embed';

const BACKGROUND_IMAGE_URL =
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80';
const INSTAGRAM_URL = 'https://www.instagram.com/thetrekkerssquad';

interface MaintenancePageProps {
  instagramEmbeds?: string[];
}

export function MaintenancePage({ instagramEmbeds }: MaintenancePageProps) {
  const featuredPosts = instagramEmbeds || [];

  return (
    <div
      className="relative min-h-screen w-full flex flex-col items-center text-white px-4 sm:px-6 pt-24 sm:pt-28 pb-12 sm:pb-16 text-center bg-cover bg-center"
      style={{ backgroundImage: `url(${BACKGROUND_IMAGE_URL})` }}
    >
      <div className="absolute inset-0 bg-black/60" />

      <div className="absolute top-0 left-0 w-full px-4 sm:px-8 py-4 sm:py-5 z-20">
        <img src={logoImage} alt="Trekkers Squad Logo" width={44} height={44} className="h-9 w-9 sm:h-11 sm:w-11" />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-medium mb-3 text-white px-1">
          The site is under maintenance, we'll be back soon.
        </h1>

        <div className="mt-6 sm:mt-8 w-full max-w-2xl flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
          <div className="w-full sm:flex-1 text-left bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
            <h2 className="text-white text-sm uppercase tracking-wide mb-4">Contact</h2>
            <ul className="space-y-3 text-sm text-white/80">
              <li className="flex items-center gap-2">
                <Mail size={16} className="flex-shrink-0" />
                <a href="mailto:hello@trekkerssquad.example" className="hover:text-white transition-colors break-all">
                  hello@trekkerssquad.example
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="flex-shrink-0" />
                <a href="tel:+977-98-0000-0000" className="hover:text-white transition-colors">
                  +977-98-0000-0000
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                <span className="leading-snug">
                  12 Summit Street, Interlaken
                  <br />
                  Switzerland
                </span>
              </li>
            </ul>
          </div>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:flex-1 flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/10 transition-colors"
          >
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Instagram size={18} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white">@thetrekkerssquad</p>
              <p className="text-xs text-white/70">Follow us on Instagram</p>
            </div>
          </a>
        </div>

        {featuredPosts.length > 0 && (
          <div className="mt-8 sm:mt-10 w-full max-w-5xl">
            <p className="text-sm uppercase tracking-wide text-white/70 mb-3 sm:mb-4">Recent posts</p>
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 px-1 snap-x snap-mandatory justify-start md:justify-center">
              {featuredPosts.map((permalink) => (
                <InstagramEmbed
                  key={permalink}
                  permalink={permalink}
                  className="flex-shrink-0 w-[80vw] max-w-[320px] sm:w-[320px] snap-center rounded-xl overflow-hidden"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
