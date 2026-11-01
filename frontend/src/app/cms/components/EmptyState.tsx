import { Button } from '../../components/ui/button';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../components/ui/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-slate-200/70 bg-white/90 py-12 px-4 shadow-sm',
        className
      )}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif' }}
    >
      {Icon && (
        <div className="relative mb-4">
          <div
            className="absolute -inset-6 rounded-full opacity-20 blur-2xl"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=600&q=80')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="relative rounded-full bg-[var(--cms-muted)] p-4">
            <Icon className="h-8 w-8 text-[var(--cms-muted-foreground)]" />
          </div>
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2 text-[var(--cms-foreground)]">{title}</h3>
      {description && <p className="text-sm text-[var(--cms-muted-foreground)] text-center max-w-sm mb-4">{description}</p>}
      {action && (
        <Button 
          onClick={action.onClick} 
          style={{ backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' }}
          className="border-0"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
