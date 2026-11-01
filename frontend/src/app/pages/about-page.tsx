import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Backpack,
  Compass,
  Flag,
  HeartHandshake,
  Instagram,
  Linkedin,
  Map,
  Mountain,
  ShieldCheck,
  Sparkles,
  Twitter,
  Users,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { ScrollAnimate } from '../components/scroll-animate';
import { SeoHead } from '../components/SeoHead';
import { useTeam } from '../hooks/useTeam';
import { resolveMediaUrl } from '../services/api';
import { getBaseUrl } from '../config/seo';

const img = (id: string, w = 1600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=85`;

const HERO_IMAGE = img('1464822759023-fed622ff2c3b', 2000);

const ABOUT_SEO = {
  title: 'About The Trekkers Squad',
  description:
    'Meet The Trekkers Squad: a crew of guides, planners and mountain lovers running small-group treks and adventures with care.',
};

const STATS = [
  { value: 2018, label: 'Year we started', plain: true },
  { value: 40, suffix: '+', label: 'Routes we run' },
  { value: 3200, suffix: '+', label: 'Travellers guided' },
  { value: 18, label: 'Local guides on the team' },
];

const MILESTONES = [
  { year: '2018', title: 'Five friends, one trail', body: 'We started by guiding weekend treks for friends and quickly ran out of space in the van.' },
  { year: '2020', title: 'Going small on purpose', body: 'We capped every group at twelve people so every traveller gets time with the guide.' },
  { year: '2022', title: 'The squad grows', body: 'Cooks, porters, photographers and planners joined, and we opened our first office.' },
  { year: '2025', title: 'More mountains, same crew', body: 'New regions, new itineraries, and the same people welcoming you at the trailhead.' },
];

const VALUES = [
  { icon: Users, title: 'Small groups', body: 'Twelve people at most. You will know everyone by day two.' },
  { icon: ShieldCheck, title: 'Safety is the plan', body: 'Trained leaders, tested gear and a team on call around the clock.' },
  { icon: HeartHandshake, title: 'Fair to everyone', body: 'Guides and porters are paid well, insured and treated as teammates.' },
  { icon: Compass, title: 'Honest itineraries', body: 'We tell you what a day really looks like, hard bits included.' },
];

const STEPS = [
  { icon: Map, title: 'We plan', body: 'Routes, permits, lodges and fallback options sorted well before you arrive.' },
  { icon: Backpack, title: 'You pack light', body: 'A clear gear list and rental help so you only carry what matters.' },
  { icon: Flag, title: 'We walk together', body: 'Steady pace, long lunches and plenty of time for photos.' },
];

function AnimatedCounter({ end, suffix = '', plain = false }: { end: number; suffix?: string; plain?: boolean }) {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setVisible(true), { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let frame: number;
    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) start = now;
      const progress = Math.min((now - start) / 1600, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible, end]);

  return (
    <div ref={ref}>
      {plain ? count : count.toLocaleString()}
      {suffix}
    </div>
  );
}

export function AboutPage() {
  const { members, loading } = useTeam();
  const baseUrl = getBaseUrl();
  const canonicalUrl = baseUrl ? `${baseUrl}/about` : undefined;

  return (
    <div className="min-h-screen bg-white">
      <SeoHead
        title={ABOUT_SEO.title}
        description={ABOUT_SEO.description}
        image={HERO_IMAGE}
        canonicalUrl={canonicalUrl}
        type="website"
        jsonLd={{ '@context': 'https://schema.org', '@type': 'AboutPage', name: ABOUT_SEO.title, description: ABOUT_SEO.description, url: canonicalUrl }}
      />

      {/* Hero: split layout with an image collage */}
      <section className="bg-[var(--color-navy-900)] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-forest-400)] mb-4 font-medium">About the squad</p>
            <h1 className="text-5xl md:text-7xl font-semibold !text-white leading-[1.05] mb-6">
              Guides first.
              <br />
              <span className="text-[var(--color-forest-400)]">Mountain lovers always.</span>
            </h1>
            <p className="text-lg text-white/70 max-w-xl mb-8 leading-relaxed">
              We are a crew of local guides, planners and trekkers building small-group trips we would happily book ourselves.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/all-trips">
                <Button size="lg" className="px-8 bg-[var(--color-forest-500)] hover:bg-[var(--color-forest-600)]">
                  Explore trips <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="ghost" className="px-8 text-white border border-white/30 hover:bg-white/10">
                  Talk to us
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-6 grid-rows-6 gap-3 h-[420px] md:h-[520px]">
            <img src={img('1551632811-561732d1e306', 1000)} alt="Hikers on a mountain trail" className="col-span-4 row-span-4 w-full h-full object-cover rounded-3xl" />
            <img src={img('1526772662000-3f88f10405ff', 700)} alt="Trekker at a summit cairn" className="col-span-2 row-span-3 w-full h-full object-cover rounded-3xl" />
            <img src={img('1506905925346-21bda4d32df4', 700)} alt="Sunrise above the clouds" className="col-span-2 row-span-3 w-full h-full object-cover rounded-3xl" />
            <img src={img('1519681393784-d120267933ba', 900)} alt="Stars above the peaks" className="col-span-4 row-span-2 w-full h-full object-cover rounded-3xl" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[var(--color-forest-400)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-4xl md:text-5xl font-semibold text-[var(--color-navy-900)]">
                <AnimatedCounter end={s.value} suffix={s.suffix} plain={s.plain} />
              </div>
              <div className="text-sm text-[var(--color-navy-900)] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollAnimate animation="fade-in-up">
            <Sparkles className="mx-auto mb-6 text-[var(--color-forest-500)]" size={32} />
            <p className="text-2xl md:text-4xl leading-snug font-medium text-[var(--color-navy-900)]">
              Our job is simple: get you to wild places safely, keep the group small, and make sure everyone who works with us is looked after.
            </p>
          </ScrollAnimate>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-[var(--color-navy-50)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimate animation="fade-in-up">
            <h2 className="text-3xl md:text-5xl font-semibold text-center mb-16 text-[var(--color-navy-900)]">How we got here</h2>
          </ScrollAnimate>
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-[var(--color-forest-300)]" aria-hidden />
            <div className="space-y-12">
              {MILESTONES.map((m, i) => (
                <ScrollAnimate key={m.year} animation="fade-in-up" delay={i * 80}>
                  <div className={`relative pl-12 md:pl-0 md:grid md:grid-cols-2 md:gap-16 ${i % 2 ? 'md:[&>div:first-child]:order-2' : ''}`}>
                    <span className="absolute left-[10px] md:left-1/2 md:-translate-x-1/2 top-2 w-3.5 h-3.5 rounded-full bg-[var(--color-forest-500)] ring-4 ring-[var(--color-navy-50)]" />
                    <div className={i % 2 ? 'md:text-left' : 'md:text-right'}>
                      <div className="text-4xl font-semibold text-[var(--color-forest-600)]">{m.year}</div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{m.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{m.body}</p>
                    </div>
                  </div>
                </ScrollAnimate>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimate animation="fade-in-up">
            <div className="max-w-2xl mb-12">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-forest-600)] mb-3 font-medium">What we stand for</p>
              <h2 className="text-3xl md:text-5xl font-semibold text-[var(--color-navy-900)]">Four things we will not compromise on</h2>
            </div>
          </ScrollAnimate>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-3xl border border-[var(--color-navy-100)] p-7 hover:shadow-xl hover:-translate-y-1 transition-all bg-white">
                <div className="w-12 h-12 rounded-2xl bg-[var(--color-navy-900)] text-[var(--color-forest-400)] flex items-center justify-center mb-5">
                  <v.icon size={22} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{v.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How we travel */}
      <section className="py-20 bg-[var(--color-navy-900)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <img src={img('1519904981063-b0cf448d479e', 1400)} alt="Trekker overlooking a misty valley" loading="lazy" className="w-full h-[460px] object-cover rounded-3xl" />
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-forest-400)] mb-3 font-medium">On the trail</p>
            <h2 className="text-3xl md:text-5xl font-semibold !text-white mb-8">How a trip with us feels</h2>
            <div className="space-y-6">
              {STEPS.map((s) => (
                <div key={s.title} className="flex gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 text-[var(--color-forest-400)] flex items-center justify-center flex-shrink-0">
                    <s.icon size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1 !text-white">{s.title}</h3>
                    <p className="text-white/70 leading-relaxed">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team-section" className="py-24 bg-[var(--color-navy-50)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimate animation="fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-forest-600)] mb-3 font-medium">The crew</p>
                <h2 className="text-3xl md:text-5xl font-semibold text-[var(--color-navy-900)]">Meet your guides and planners</h2>
              </div>
              <Link to="/about/team">
                <Button variant="outline" className="gap-2">Full team <ArrowRight size={16} /></Button>
              </Link>
            </div>
          </ScrollAnimate>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-3xl bg-gray-200 animate-pulse" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <p className="text-gray-600">Team profiles are coming soon.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {members.slice(0, 8).map((member) => (
                <div key={member.id || member.name} className="group relative aspect-[3/4] rounded-3xl overflow-hidden bg-[var(--color-navy-800)]">
                  {member.image ? (
                    <img
                      src={resolveMediaUrl(member.image, { width: 600, ar: '3:4', crop: 'c_fill' })}
                      alt={member.name}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <Mountain className="absolute inset-0 m-auto text-white/20" size={64} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <h3 className="text-lg font-semibold !text-white">{member.name}</h3>
                    <p className="text-sm text-[var(--color-forest-300)]">{member.role}</p>
                    <div className="flex gap-3 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      {member.socialLinks?.instagram && (
                        <a href={member.socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on Instagram`}><Instagram size={16} /></a>
                      )}
                      {member.socialLinks?.linkedin && (
                        <a href={member.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on LinkedIn`}><Linkedin size={16} /></a>
                      )}
                      {member.socialLinks?.twitter && (
                        <a href={member.socialLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on Twitter`}><Twitter size={16} /></a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] bg-gradient-to-br from-[var(--color-forest-400)] to-[var(--color-forest-300)] p-10 md:p-16 text-center">
            <h2 className="text-3xl md:text-5xl font-semibold !text-[var(--color-navy-900)] mb-4">Ready to join the squad?</h2>
            <p className="text-[var(--color-navy-900)] max-w-xl mx-auto mb-8">Pick a trip, grab a date, and we will take care of the rest.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/all-trips"><Button size="lg" className="px-8 bg-[var(--color-navy-900)] hover:bg-black text-white">Browse trips</Button></Link>
              <Link to="/about/careers-partnerships"><Button size="lg" variant="ghost" className="px-8 text-[var(--color-navy-900)] border border-[var(--color-navy-900)]/30 hover:bg-white/30">Work with us</Button></Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
