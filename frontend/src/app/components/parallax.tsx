import { useEffect, useRef, ReactNode } from 'react';

interface ParallaxSectionProps {
  children: ReactNode;
  speed?: number; // 0 = no movement, 0.5 = slower, 1 = same speed, 2 = faster
  className?: string;
}

export function ParallaxSection({ children, speed = 0.5, className = '' }: ParallaxSectionProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    
    const handleScroll = () => {
      if (!element) return;
      
      const scrolled = window.scrollY;
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + scrolled;
      const elementHeight = rect.height;
      const windowHeight = window.innerHeight;
      
      // Only apply parallax when element is in viewport
      if (scrolled + windowHeight > elementTop && scrolled < elementTop + elementHeight) {
        const yPos = (scrolled - elementTop) * speed;
        element.style.transform = `translate3d(0, ${yPos}px, 0)`;
      }
    };
    
    handleScroll(); // Initial position
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);
  
  return (
    <div ref={elementRef} className={className} style={{ willChange: 'transform' }}>
      {children}
    </div>
  );
}

interface ParallaxImageProps {
  src: string;
  alt: string;
  speed?: number;
  className?: string;
  overlayClassName?: string;
}

export function ParallaxImage({ 
  src, 
  alt, 
  speed = 0.5, 
  className = '', 
  overlayClassName = '' 
}: ParallaxImageProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <div className="parallax-container w-full h-full">
        <ParallaxSection speed={speed} className="parallax-bg">
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover scale-110"
          />
        </ParallaxSection>
        {overlayClassName && (
          <div className={`absolute inset-0 ${overlayClassName}`} />
        )}
      </div>
    </div>
  );
}
