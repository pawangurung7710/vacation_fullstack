import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState<'fade-in' | 'fade-out'>('fade-in');

  useEffect(() => {
    if (location !== displayLocation) {
      // Start fade out
      setTransitionStage('fade-out');
    }
  }, [location, displayLocation]);

  useEffect(() => {
    if (transitionStage === 'fade-out') {
      const timer = setTimeout(() => {
        // Update content
        setDisplayLocation(location);
        setTransitionStage('fade-in');
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [transitionStage, location]);

  return (
    <div
      className={`page-transition ${transitionStage}`}
      style={{
        animation: transitionStage === 'fade-in' 
          ? 'pageEnter 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
          : 'pageExit 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards'
      }}
    >
      {children}
    </div>
  );
}

// Add styles to glassmorphism.css for these animations
