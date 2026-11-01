import { Badge } from '../../components/ui/badge';
import { cn } from '../../components/ui/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusColors: Record<string, { variant: string; className?: string }> = {
  published: { variant: 'sustainability', className: 'bg-green-100 text-green-800 border-green-300' },
  draft: { variant: 'meta', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  archived: { variant: 'default', className: 'bg-gray-100 text-gray-800 border-gray-300' },
  confirmed: { variant: 'sustainability', className: 'bg-green-100 text-green-800 border-green-300' },
  pending: { variant: 'meta', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  cancelled: { variant: 'default', className: 'bg-red-100 text-red-800 border-red-300' },
  completed: { variant: 'sustainability', className: 'bg-blue-100 text-blue-800 border-blue-300' },
  new: { variant: 'meta', className: 'bg-blue-100 text-blue-800 border-blue-300' },
  read: { variant: 'default', className: 'bg-gray-100 text-gray-800 border-gray-300' },
  replied: { variant: 'sustainability', className: 'bg-green-100 text-green-800 border-green-300' },
  approved: { variant: 'sustainability', className: 'bg-green-100 text-green-800 border-green-300' },
  rejected: { variant: 'default', className: 'bg-red-100 text-red-800 border-red-300' },
  partial: { variant: 'meta', className: 'bg-amber-100 text-amber-800 border-amber-300' },
  paid: { variant: 'sustainability', className: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  refunded: { variant: 'default', className: 'bg-rose-100 text-rose-800 border-rose-300' },
  subscribed: { variant: 'sustainability', className: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  unsubscribed: { variant: 'default', className: 'bg-gray-100 text-gray-800 border-gray-300' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusColors[status.toLowerCase()] || { variant: 'default' };
  
  return (
    <Badge
      variant={config.variant as any}
      className={cn(config.className, className)}
      size="sm"
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
