import { cn } from '../../components/ui/utils';

interface SequoiaLoaderProps {
  label?: string;
  size?: 'sm' | 'md';
  mode?: 'inline' | 'block';
  className?: string;
}

const sizeMap = {
  sm: {
    dot: 'h-1.5 w-1.5',
    text: 'text-xs',
  },
  md: {
    dot: 'h-2 w-2',
    text: 'text-sm',
  },
};

export function SequoiaLoader({
  label = 'Loading',
  size = 'md',
  mode = 'block',
  className,
}: SequoiaLoaderProps) {
  const styles = sizeMap[size];

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-[var(--cms-muted-foreground)]',
        mode === 'block'
          ? 'justify-center rounded-2xl border border-slate-200/70 bg-white/90 px-6 py-8 shadow-sm'
          : 'justify-start',
        className
      )}
      aria-live="polite"
    >
      {label && <span className={cn(styles.text)}>{label}</span>}
      <div className="flex items-center gap-1">
        <span className={cn(styles.dot, 'rounded-full bg-[var(--cms-primary)] animate-bounce')} />
        <span
          className={cn(
            styles.dot,
            'rounded-full bg-[var(--cms-primary)]/80 animate-bounce [animation-delay:120ms]'
          )}
        />
        <span
          className={cn(
            styles.dot,
            'rounded-full bg-[var(--cms-primary)]/60 animate-bounce [animation-delay:240ms]'
          )}
        />
      </div>
    </div>
  );
}
