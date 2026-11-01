import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { newsletterSubscriptionsApi } from '../services/api';

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export function NewsletterSubscribeForm({
  source,
  defaultEmail,
  placeholder = 'your.email@example.com',
  buttonLabel = 'Subscribe',
  containerClassName = 'flex flex-col sm:flex-row gap-3',
  inputClassName,
  buttonClassName,
  errorClassName = 'text-sm text-red-600',
}: {
  source: string;
  defaultEmail?: string;
  placeholder?: string;
  buttonLabel?: ReactNode;
  containerClassName?: string;
  inputClassName?: string;
  buttonClassName?: string;
  errorClassName?: string;
}) {
  const [email, setEmail] = useState(defaultEmail || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const normalizedEmail = useMemo(() => email.trim(), [email]);

  useEffect(() => {
    if (!defaultEmail) return;
    if (normalizedEmail.length > 0) return;
    setEmail(defaultEmail);
  }, [defaultEmail, normalizedEmail.length]);

  const submit = async () => {
    const nextEmail = normalizedEmail;
    if (!nextEmail) {
      setError('Email is required.');
      return;
    }
    if (!isValidEmail(nextEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await newsletterSubscriptionsApi.subscribe({ email: nextEmail, source });
      setSuccessOpen(true);
      setEmail('');
    } catch (e: any) {
      const message = e?.message || 'Failed to subscribe. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!submitting) submit();
        }}
      >
        <div className={containerClassName}>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            className={inputClassName}
            aria-invalid={Boolean(error)}
          />
          <Button
            type="submit"
            disabled={submitting}
            className={buttonClassName}
          >
            {submitting ? 'Subscribing…' : buttonLabel}
          </Button>
        </div>
        {error ? (
          <div className={errorClassName} role="status" aria-live="polite">
            {error}
          </div>
        ) : null}
      </form>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              Thank you for subscribing
            </DialogTitle>
            <DialogDescription>
              You’re on the list. We’ll send monthly stories, impact updates, and trip announcements to your inbox.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setSuccessOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
