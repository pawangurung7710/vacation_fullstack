import { ReactNode } from 'react';
import { Button } from '../../components/ui/button';
import { cn } from '../../components/ui/utils';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontSize: `calc(1.875rem * var(--cms-font-scale, 1))` }}>
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground mt-1" style={{ fontSize: `calc(0.875rem * var(--cms-font-scale, 1))` }}>
              {description}
            </p>
          )}
        </div>
        {action && (
          <Button
            onClick={action.onClick}
            style={{ backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' }}
          >
            {action.icon && <action.icon className="mr-2 h-4 w-4" />}
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}

