import { Mail, Phone, MapPin } from 'lucide-react';
import { ParallaxImage } from '../components/parallax';
import { ScrollAnimate } from '../components/scroll-animate';
import { ContactForm } from '../components/contact-form';

export function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Banner */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-gray-900">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920"
            alt="Contact Us"
            fetchPriority="high"
            className="w-full h-full object-cover animate-hero-zoom"
          />
          {/* Dark gradient overlay for text contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-light rounded-3xl p-10 md:p-12">
            <h1 className="text-5xl sm:text-6xl md:text-7xl mb-6 text-white glass-text-contrast-heavy animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              Get in Touch
            </h1>
            <p className="text-xl md:text-2xl text-white/95 glass-text-contrast max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '380ms' }}>
              Have questions about your next adventure? Our team is here to help you plan the perfect memorable journey.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 -mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information - Left Side */}
            <div className="lg:col-span-1">
              <ScrollAnimate animation="slide-in-left">
                <div className="glass-card rounded-3xl p-8 sticky top-24">
                  <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-navy-600)] to-[var(--color-forest-600)] flex items-center justify-center flex-shrink-0">
                        <Mail className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Email</h3>
                        <a 
                          href="mailto:hello@trekkerssquad.example" 
                          className="text-[var(--color-navy-600)] hover:underline"
                        >
                          hello@trekkerssquad.example
                        </a>
                        <p className="text-sm text-gray-600 mt-1">
                          We respond within 24 hours
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-navy-600)] to-[var(--color-forest-600)] flex items-center justify-center flex-shrink-0">
                        <Phone className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Phone</h3>
                        <a 
												  href="tel:+977-98-0000-0000" 
                          className="text-[var(--color-navy-600)] hover:underline"
                        >
												  +977-98-0000-0000
                        </a>
                        <p className="text-sm text-gray-600 mt-1">
                          Mon-Fri, 9AM-6PM NPT
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-navy-600)] to-[var(--color-forest-600)] flex items-center justify-center flex-shrink-0">
                        <MapPin className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Office</h3>
                        <p className="text-gray-700">
                          12 Summit Street, Interlaken<br />
                          Switzerland
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Visit by appointment
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="font-semibold mb-4">Office Hours</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monday - Friday</span>
                        <span className="font-medium">9AM - 6PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Saturday</span>
                        <span className="font-medium">10AM - 4PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sunday</span>
                        <span className="font-medium">Closed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollAnimate>
            </div>

            {/* Contact Form - Right Side */}
            <div className="lg:col-span-2">
              <ScrollAnimate animation="slide-in-right">
                <div className="glass-card rounded-3xl p-8 md:p-10">
                  <h2 className="text-3xl font-semibold mb-2">Send Us a Message</h2>
                  <p className="text-gray-600 mb-8">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>

                  <ContactForm />
                </div>
              </ScrollAnimate>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimate animation="fade-in-up">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-semibold mb-4">
                Quick Answers
              </h2>
              <p className="text-gray-600 text-lg">
                Common questions we receive from travelers
              </p>
            </div>
          </ScrollAnimate>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                q: 'How far in advance should I book?',
                a: 'We recommend booking 2-3 months in advance for popular treks during peak season (March-May, September-November).',
              },
              {
                q: 'Do you offer customized trips?',
                a: 'Absolutely! We specialize in custom itineraries tailored to your interests, fitness level, and schedule.',
              },
              {
                q: 'What is your cancellation policy?',
                a: 'Full refund if cancelled 30+ days before departure. 50% refund for 15-29 days. Contact us for emergency situations.',
              },
              {
                q: 'Are solo travelers welcome?',
                a: 'Yes! We welcome solo travelers and can match you with groups or arrange private experiences.',
              },
            ].map((faq, index) => (
              <ScrollAnimate key={index} animation="fade-in-up" delay={index * 100}>
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="font-semibold mb-2 text-lg">{faq.q}</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </ScrollAnimate>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
