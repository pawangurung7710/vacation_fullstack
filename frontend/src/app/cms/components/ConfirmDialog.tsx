import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { SequoiaLoader } from './SequoiaLoader';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: 'default' | 'destructive';
  loading?: boolean;
  closeOnConfirm?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  variant = 'default',
  loading = false,
  closeOnConfirm = true,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    if (closeOnConfirm) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {variant === 'destructive' && <AlertTriangle className="h-5 w-5 text-destructive" />}
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-[var(--cms-border)] bg-white hover:bg-[var(--cms-muted)]"
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            style={
              variant === 'destructive'
                ? { backgroundColor: 'var(--cms-destructive)', color: 'var(--cms-destructive-foreground)' }
                : { backgroundColor: 'var(--cms-primary)', color: 'var(--cms-primary-foreground)' }
            }
            className="border-0"
          >
            {loading ? <SequoiaLoader label={confirmLabel} size="sm" mode="inline" /> : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
