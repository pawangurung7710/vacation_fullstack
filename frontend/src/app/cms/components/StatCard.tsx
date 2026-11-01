import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { cn } from '../../components/ui/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, description, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card
      className={cn(
        'rounded-2xl border border-slate-200/70 bg-white/90 shadow-sm transition-colors hover:bg-white',
        className
      )}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif' }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-[var(--cms-muted-foreground)]">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-[var(--cms-muted-foreground)]" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-[var(--cms-foreground)]" style={{ fontSize: `calc(1.5rem * var(--cms-font-scale, 1))`, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif' }}>
          {value}
        </div>
        {description && <p className="text-xs text-[var(--cms-muted-foreground)] mt-1">{description}</p>}
        {trend && (
          <p className={cn('text-xs mt-1', trend.isPositive ? 'text-green-600' : 'text-red-500')}>
            {trend.isPositive ? '+' : ''}
            {trend.value}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
}
