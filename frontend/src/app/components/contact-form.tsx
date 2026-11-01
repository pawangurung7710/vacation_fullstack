import { useState, useEffect } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { contactApi } from '../services/api';

export const CONTACT_REASONS = [
  'Trip Inquiry',
  'Booking Assistance',
  'Group Booking',
  'Custom Itinerary',
  'Open Positions Enquiry',
  'Sustainability Questions',
  'Partnership Opportunity',
  'Media Inquiry',
  'Other',
] as const;

export type ContactReason = (typeof CONTACT_REASONS)[number];

interface FormData {
  name: string;
  email: string;
  phone: string;
  reason: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  reason?: string;
  message?: string;
}

export interface ContactFormProps {
  /** Pre-select this reason in the dropdown (must match one of CONTACT_REASONS) */
  defaultReason?: string;
  /** Called after successful submit (e.g. close modal) */
  onSuccess?: () => void;
  /** Optional class for the form container */
  className?: string;
  /** Show compact layout (e.g. inside modal) */
  compact?: boolean;
}

export function ContactForm({
  defaultReason,
  onSuccess,
  className,
  compact = false,
}: ContactFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    reason: defaultReason || '',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (defaultReason && CONTACT_REASONS.includes(defaultReason as ContactReason)) {
      setFormData((prev) => ({ ...prev, reason: defaultReason }));
    }
  }, [defaultReason]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Please select a reason';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    try {
      await contactApi.submit({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        subject: formData.reason || undefined,
        message: formData.message,
      });

      setIsSuccess(true);
      toast.success("Message sent successfully! We'll get back to you within 24 hours.");

      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          reason: defaultReason || '',
          message: '',
        });
        setIsSuccess(false);
        onSuccess?.();
      }, 2000);
    } catch {
      toast.error('Unable to send your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const labelClass = compact
    ? 'text-sm font-medium mb-1.5 block'
    : 'text-base font-semibold mb-2 block';
  const inputClass = compact ? 'h-9 text-sm' : 'h-12';
  const errorClass = compact ? 'text-red-600 text-xs mt-0.5 flex items-center gap-1' : 'text-red-600 text-sm mt-1 flex items-center gap-1';
  const hintClass = compact ? 'text-xs text-gray-500 mt-0.5' : 'text-sm text-gray-500 mt-1';

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className={compact ? 'space-y-3' : 'space-y-6'}>
        <div>
          <Label htmlFor="contact-name" className={labelClass}>
            Full Name <span className="text-red-600">*</span>
          </Label>
          <Input
            id="contact-name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`${inputClass} border-slate-200/80 bg-white focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[var(--color-navy-600)] ${
              errors.name
                ? 'border-red-500 focus-visible:border-red-500'
                : isSuccess && formData.name
                  ? 'border-green-500 focus-visible:border-green-600'
                  : ''
            }`}
            placeholder="John Doe"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className={errorClass}>
              <span className="font-medium">⚠</span> {errors.name}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="contact-email" className={labelClass}>
            Email Address <span className="text-red-600">*</span>
          </Label>
          <Input
            id="contact-email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`${inputClass} border-slate-200/80 bg-white focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[var(--color-navy-600)] ${
              errors.email
                ? 'border-red-500 focus-visible:border-red-500'
                : isSuccess && formData.email
                  ? 'border-green-500 focus-visible:border-green-600'
                  : ''
            }`}
            placeholder="john@example.com"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className={errorClass}>
              <span className="font-medium">⚠</span> {errors.email}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="contact-phone" className={labelClass}>
            Phone Number <span className={compact ? 'text-gray-500 text-xs font-normal' : 'text-gray-500 text-sm font-normal'}>(Optional)</span>
          </Label>
          <Input
            id="contact-phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={`${inputClass} border-slate-200/80 bg-white focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[var(--color-navy-600)]`}
            placeholder="+977 98XXXXXXXX"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label htmlFor="contact-reason" className={labelClass}>
            Reason for Contact <span className="text-red-600">*</span>
          </Label>
          <Select
            value={formData.reason || undefined}
            onValueChange={(value) => handleChange('reason', value)}
            disabled={isSubmitting}
          >
            <SelectTrigger
              id="contact-reason"
              className={`${inputClass} ${compact ? 'rounded-lg px-3' : 'rounded-xl px-4'} border text-left text-slate-700 shadow-none transition-all focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[var(--color-navy-600)] ${
                errors.reason
                  ? 'border-red-500 focus-visible:border-red-500'
                  : 'border-slate-200/80 bg-white hover:border-slate-300/80'
              }`}
            >
              <SelectValue placeholder="Select a reason..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl border border-slate-200/80 bg-white/95 shadow-xl backdrop-blur">
              {CONTACT_REASONS.map((reason) => (
                <SelectItem
                  key={reason}
                  value={reason}
                  className="rounded-lg py-2.5 text-sm focus:bg-[var(--color-navy-50)] focus:text-slate-900"
                >
                  {reason}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.reason && (
            <p className={errorClass}>
              <span className="font-medium">⚠</span> {errors.reason}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="contact-message" className={labelClass}>
            Your Message <span className="text-red-600">*</span>
          </Label>
          <Textarea
            id="contact-message"
            value={formData.message}
            onChange={(e) => handleChange('message', e.target.value)}
            className={`${compact ? 'min-h-[100px] text-sm' : 'min-h-[150px]'} border-slate-200/80 bg-white focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[var(--color-navy-600)] ${
              errors.message
                ? 'border-red-500 focus-visible:border-red-500'
                : isSuccess && formData.message
                  ? 'border-green-500 focus-visible:border-green-600'
                  : ''
            }`}
            placeholder="Tell us about your adventure plans, questions, or special requirements..."
            disabled={isSubmitting}
          />
          {errors.message && (
            <p className={errorClass}>
              <span className="font-medium">⚠</span> {errors.message}
            </p>
          )}
          <p className={hintClass}>Minimum 10 characters</p>
        </div>

        <div className={compact ? 'pt-1' : 'pt-4'}>
          <Button
            type="submit"
            size={compact ? 'default' : 'lg'}
            className={`w-full bg-[var(--color-navy-600)] hover:bg-[var(--color-navy-700)] glow-navy ${compact ? 'min-h-[40px] text-sm font-semibold' : 'min-h-[56px] text-lg uppercase font-semibold tracking-wide'}`}
            disabled={isSubmitting || isSuccess}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Sending...
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle size={compact ? 16 : 20} className="mr-2" />
                Message Sent!
              </>
            ) : (
              <>
                <Send size={compact ? 16 : 20} className="mr-2" />
                Send Message
              </>
            )}
          </Button>
        </div>

        {!compact && (
          <p className="text-sm text-gray-500 text-center">
            By submitting this form, you agree to our Privacy Policy and Terms of Service.
          </p>
        )}
      </div>
    </form>
  );
}
