import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Breadcrumbs } from '../../components/breadcrumbs';
import { Mail, Award, Linkedin, Instagram, Twitter, Globe } from 'lucide-react';
import { useTeam } from '../../hooks/useTeam';
import { ScrollAnimate } from '../../components/scroll-animate';

export function TeamPage() {
  const { members: teamMembers, loading } = useTeam();
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[600px] overflow-hidden bg-gray-900">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2000"
            alt="Our Team"
            fetchPriority="high"
            className="w-full h-full object-cover animate-hero-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-forest-900)]/85 to-[var(--color-navy-900)]/75" />
        </div>

        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              <Breadcrumbs
                items={[
                  { label: 'About Us', href: '/about' },
                  { label: 'Our Team' }
                ]}
                className="mb-8 [&_a]:text-white/80 [&_a:hover]:text-white [&_span]:text-white/60"
              />
            </div>
            <div className="max-w-3xl">
              <h1
                className="text-5xl sm:text-6xl md:text-7xl mb-6 text-white glass-text-contrast-heavy animate-fade-in-up"
                style={{ animationDelay: '200ms' }}
              >
                Meet Our Team
              </h1>
              <p
                className="text-xl sm:text-2xl text-white/95 glass-text-contrast leading-relaxed animate-fade-in-up"
                style={{ animationDelay: '380ms' }}
              >
                Local experts dedicated to responsible travel and unforgettable experiences
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Introduction */}
        <ScrollAnimate animation="fade-in-up">
          <div className="mb-16 text-center max-w-3xl mx-auto">
            <Badge className="mb-4">Locally Led</Badge>
            <p className="text-lg text-gray-700 leading-relaxed">
              Our team is made up of local guides, trip designers and mountain lovers. We are not just guides: we are storytellers, planners and neighbours who care about the places we take you.
            </p>
          </div>
        </ScrollAnimate>

        {/* Team Grid */}
        {loading ? (
          <div className="text-center py-16 mb-16">
            <p className="text-gray-600 text-lg">Loading team members...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {teamMembers.map((member, index) => (
              <ScrollAnimate key={member.name} animation="fade-in-up" delay={index * 100}>
                <Card className="group overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                    <p className="text-[var(--color-navy-600)] font-medium mb-2">{member.role}</p>

                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <Award size={14} className="text-[var(--color-sun-600)]" />
                        <span className="font-medium">Expertise</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(member.expertise || []).map((cert) => (
                          <Badge key={cert} variant="secondary" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 leading-relaxed mb-4">
                      {member.bio || 'More details coming soon.'}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-navy-600)]">
                      {member.email && (
                        <a href={`mailto:${member.email}`} className="inline-flex items-center gap-2 hover:underline">
                          <Mail size={14} />
                          Contact
                        </a>
                      )}
                      {member.socialLinks?.instagram && (
                        <a
                          href={member.socialLinks.instagram}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 hover:underline"
                        >
                          <Instagram size={14} />
                          Instagram
                        </a>
                      )}
                      {member.socialLinks?.linkedin && (
                        <a
                          href={member.socialLinks.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 hover:underline"
                        >
                          <Linkedin size={14} />
                          LinkedIn
                        </a>
                      )}
                      {member.socialLinks?.twitter && (
                        <a
                          href={member.socialLinks.twitter}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 hover:underline"
                        >
                          <Twitter size={14} />
                          Twitter
                        </a>
                      )}
                      {member.socialLinks?.website && (
                        <a
                          href={member.socialLinks.website}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 hover:underline"
                        >
                          <Globe size={14} />
                          Website
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </ScrollAnimate>
            ))}
          </div>
        )}

        {/* Values Section */}
        <div className="bg-gradient-to-br from-[var(--color-forest-50)] to-[var(--color-navy-50)] rounded-2xl p-12">
          <ScrollAnimate animation="fade-in-up">
            <h2 className="text-3xl font-semibold mb-8 text-center">What Drives Us</h2>
          </ScrollAnimate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'Local Ownership Matters',
                color: 'text-[var(--color-forest-600)]',
                body: "We hire locally wherever we run trips, pay guides, drivers and cooks fairly and keep long-term relationships with the lodges and families we work with.",
              },
              {
                title: 'Cultural Preservation',
                color: 'text-[var(--color-navy-600)]',
                body: "We share local history and traditions respectfully, and brief every group on how to be a good guest.",
              },
              {
                title: 'Environmental Stewardship',
                color: 'text-[var(--color-sun-600)]',
                body: "Every guide is trained in Leave No Trace ethics, waste management, and climate action. We've removed over 2 tons of trash from trekking routes since 2020.",
              },
              {
                title: 'Fair Wages & Benefits',
                color: 'text-[var(--color-forest-600)]',
                body: "Our guides earn 40% above industry average, with health insurance, retirement plans, and paid training. Porter welfare is non-negotiable—proper equipment, weight limits, insurance.",
              },
            ].map((item, index) => (
              <ScrollAnimate key={item.title} animation="fade-in-up" delay={index * 100}>
                <div>
                  <h3 className={`text-xl font-semibold mb-3 ${item.color}`}>
                    {item.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{item.body}</p>
                </div>
              </ScrollAnimate>
            ))}
          </div>
        </div>

        {/* Join Us CTA */}
        <ScrollAnimate animation="fade-in-up">
          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <h2 className="text-2xl font-semibold mb-4">Want to Join Our Team?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              We're always looking for passionate guides, drivers, cooks, and support staff who share
              our vision for responsible travel.
            </p>
            <div className="flex flex-col items-center gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-8 py-3 bg-[var(--color-forest-600)] text-white rounded-lg hover:bg-[var(--color-forest-700)] transition-colors"
              >
                Enquire Open Positions
              </Link>
              <div className="text-sm text-gray-600">
                Or email us at{' '}
                <a href="mailto:journey@trekkerssquad.example" className="text-[var(--color-navy-600)] hover:underline">
                  journey@trekkerssquad.example
                </a>
              </div>
            </div>
          </div>
        </ScrollAnimate>
      </div>
    </div>
  );
}
