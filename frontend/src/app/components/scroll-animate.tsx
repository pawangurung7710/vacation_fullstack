import { useEffect, useRef, useState, ReactNode, CSSProperties } from 'react';

interface ScrollAnimateProps {
  children: ReactNode;
  animation?: 'fade-in' | 'fade-in-up' | 'slide-in-left' | 'slide-in-right' | 'scale-in';
  delay?: number;
  className?: string;
  threshold?: number; // 0-1, percentage of element that needs to be visible
}

export function ScrollAnimate({
  children,
  animation = 'fade-in-up',
  delay = 0,
  className = '',
  threshold = 0.15
}: ScrollAnimateProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Show immediately for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      setIsDone(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold]);

  // Once visible: play the animation class (fill-mode: both keeps opacity:0 during delay)
  // Once done: clear will-change so the browser can free the compositing layer
  const animationClass = isVisible ? `animate-${animation}` : 'opacity-0';

  const style: CSSProperties = {
    // Promote to its own compositing layer before animation starts to avoid
    // the browser doing a last-minute layer promotion mid-paint (which causes the flicker)
    willChange: isDone ? 'auto' : 'transform, opacity',
    ...(isVisible && delay > 0 ? { animationDelay: `${delay}ms` } : {}),
  };

  return (
    <div
      ref={elementRef}
      className={`${animationClass} ${className}`}
      style={style}
      onAnimationEnd={() => setIsDone(true)}
    >
      {children}
    </div>
  );
}

interface ScrollAnimateGroupProps {
  children: ReactNode[];
  staggerDelay?: number; // milliseconds between each child animation
  animation?: 'fade-in' | 'fade-in-up' | 'slide-in-left' | 'slide-in-right' | 'scale-in';
  className?: string;
}

export function ScrollAnimateGroup({
  children,
  staggerDelay = 100,
  animation = 'fade-in-up',
  className = ''
}: ScrollAnimateGroupProps) {
  return (
    <>
      {children.map((child, index) => (
        <ScrollAnimate
          key={index}
          animation={animation}
          delay={index * staggerDelay}
          className={className}
        >
          {child}
        </ScrollAnimate>
      ))}
    </>
  );
}
