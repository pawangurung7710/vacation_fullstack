import { useState } from 'react';
import { Calendar, Users, TrendingUp, Check, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';

interface BookingWidgetProps {
  trip: {
    id: string;
    title: string;
    price: number;
    maxGroupSize: number;
  };
  className?: string;
}

export function BookingWidget({ trip, className }: BookingWidgetProps) {
  const [formData, setFormData] = useState({
    date: '',
    guests: 1,
    fitnessLevel: '',
  });

  const [errors, setErrors] = useState({
    date: '',
    guests: '',
    fitnessLevel: '',
  });

  const [touched, setTouched] = useState({
    date: false,
    guests: false,
    fitnessLevel: false,
  });

  // Validation functions
  const validateDate = (date: string): string => {
    if (!date) return 'Departure date is required';
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) return 'Date must be in the future';
    return '';
  };

  const validateGuests = (guests: number): string => {
    if (!guests || guests < 1) return 'At least 1 guest required';
    if (guests > trip.maxGroupSize) return `Maximum ${trip.maxGroupSize} guests for this trip`;
    return '';
  };

  const validateFitnessLevel = (level: string): string => {
    if (!level) return 'Please select your fitness level';
    return '';
  };

  // Handle field changes with validation
  const handleDateChange = (value: string) => {
    setFormData({ ...formData, date: value });
    if (touched.date) {
      setErrors({ ...errors, date: validateDate(value) });
    }
  };

  const handleGuestsChange = (value: string) => {
    const guests = parseInt(value) || 0;
    setFormData({ ...formData, guests });
    if (touched.guests) {
      setErrors({ ...errors, guests: validateGuests(guests) });
    }
  };

  const handleFitnessLevelChange = (value: string) => {
    setFormData({ ...formData, fitnessLevel: value });
    if (touched.fitnessLevel) {
      setErrors({ ...errors, fitnessLevel: validateFitnessLevel(value) });
    }
  };

  // Handle blur events
  const handleBlur = (field: 'date' | 'guests' | 'fitnessLevel') => {
    setTouched({ ...touched, [field]: true });
    
    // Validate on blur
    const newErrors = { ...errors };
    if (field === 'date') newErrors.date = validateDate(formData.date);
    if (field === 'guests') newErrors.guests = validateGuests(formData.guests);
    if (field === 'fitnessLevel') newErrors.fitnessLevel = validateFitnessLevel(formData.fitnessLevel);
    setErrors(newErrors);
  };

  // Calculate total price
  const totalPrice = trip.price * formData.guests;

  // Check if form is valid
  const isValid = 
    formData.date && 
    formData.guests >= 1 && 
    formData.guests <= trip.maxGroupSize &&
    formData.fitnessLevel &&
    !errors.date &&
    !errors.guests &&
    !errors.fitnessLevel;

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ date: true, guests: true, fitnessLevel: true });

    // Validate all fields
    const dateError = validateDate(formData.date);
    const guestsError = validateGuests(formData.guests);
    const fitnessError = validateFitnessLevel(formData.fitnessLevel);

    setErrors({
      date: dateError,
      guests: guestsError,
      fitnessLevel: fitnessError,
    });

    // If any errors, show error toast
    if (dateError || guestsError || fitnessError) {
      toast.error('Please fix the errors in the form');
      return;
    }

    // Success! Show toast
    toast.success('Booking request sent!', {
      description: "We'll email you within 24 hours to confirm availability and next steps.",
      duration: 5000,
    });

    // Reset form
    setFormData({ date: '', guests: 1, fitnessLevel: '' });
    setTouched({ date: false, guests: false, fitnessLevel: false });
    setErrors({ date: '', guests: '', fitnessLevel: '' });
  };

  return (
    <Card className={`${className} relative overflow-hidden glass-card`}>
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1733902437666-44c9fe7dfb55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"
          alt="Booking background"
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/98 via-white/95 to-[var(--color-navy-50)]/90" />
      </div>

      <CardHeader className="relative z-10">
        <CardTitle>Book This Trip</CardTitle>
        <div className="text-3xl font-bold text-[var(--color-forest-600)]">
          US ${trip.price}
          <span className="text-base font-normal text-gray-600"> / person</span>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Departure Date */}
          <div>
            <Label htmlFor="date" className="flex items-center gap-2 mb-2">
              <Calendar size={16} />
              Departure Date
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleDateChange(e.target.value)}
              onBlur={() => handleBlur('date')}
              className={`${
                errors.date && touched.date
                  ? 'border-red-500 focus-visible:ring-red-500'
                  : formData.date && !errors.date
                  ? 'border-green-500'
                  : ''
              }`}
              aria-invalid={errors.date && touched.date ? 'true' : 'false'}
              aria-describedby={errors.date && touched.date ? 'date-error' : undefined}
            />
            {errors.date && touched.date && (
              <div 
                id="date-error" 
                className="flex items-center gap-1 mt-1 text-sm text-red-600"
                role="alert"
              >
                <AlertCircle size={14} />
                {errors.date}
              </div>
            )}
            {formData.date && !errors.date && (
              <div className="flex items-center gap-1 mt-1 text-sm text-green-600">
                <Check size={14} />
                Date selected
              </div>
            )}
          </div>

          {/* Number of Guests */}
          <div>
            <Label htmlFor="guests" className="flex items-center gap-2 mb-2">
              <Users size={16} />
              Number of Guests
              <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleGuestsChange(String(Math.max(1, formData.guests - 1)))}
                disabled={formData.guests <= 1}
                className="h-10 w-10"
              >
                -
              </Button>
              <Input
                id="guests"
                type="number"
                min="1"
                max={trip.maxGroupSize}
                value={formData.guests}
                onChange={(e) => handleGuestsChange(e.target.value)}
                onBlur={() => handleBlur('guests')}
                className={`text-center ${
                  errors.guests && touched.guests
                    ? 'border-red-500'
                    : formData.guests >= 1 && !errors.guests
                    ? 'border-green-500'
                    : ''
                }`}
                aria-invalid={errors.guests && touched.guests ? 'true' : 'false'}
                aria-describedby={errors.guests && touched.guests ? 'guests-error' : undefined}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleGuestsChange(String(Math.min(trip.maxGroupSize, formData.guests + 1)))}
                disabled={formData.guests >= trip.maxGroupSize}
                className="h-10 w-10"
              >
                +
              </Button>
            </div>
            <p className="text-xs text-gray-600 mt-1">Max {trip.maxGroupSize} guests</p>
            {errors.guests && touched.guests && (
              <div 
                id="guests-error" 
                className="flex items-center gap-1 mt-1 text-sm text-red-600"
                role="alert"
              >
                <AlertCircle size={14} />
                {errors.guests}
              </div>
            )}
          </div>

          {/* Fitness Level */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} />
              Fitness Level
              <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-2">
              {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                <label
                  key={level}
                  className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="fitness"
                    value={level}
                    checked={formData.fitnessLevel === level}
                    onChange={(e) => handleFitnessLevelChange(e.target.value)}
                    onBlur={() => handleBlur('fitnessLevel')}
                    className="w-4 h-4 text-[var(--color-forest-600)] focus:ring-[var(--color-navy-500)]"
                  />
                  <span className="flex-1">{level}</span>
                  {formData.fitnessLevel === level && (
                    <Check size={16} className="text-green-600" />
                  )}
                </label>
              ))}
            </div>
            {errors.fitnessLevel && touched.fitnessLevel && (
              <div 
                className="flex items-center gap-1 mt-1 text-sm text-red-600"
                role="alert"
              >
                <AlertCircle size={14} />
                {errors.fitnessLevel}
              </div>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                US ${trip.price} × {formData.guests} {formData.guests === 1 ? 'guest' : 'guests'}
              </span>
              <span className="font-semibold">US ${totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-[var(--color-forest-600)]">
                US ${totalPrice.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={!isValid}
          >
            {isValid ? 'Book Now' : 'Complete All Fields'}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
          >
            Contact Expert
          </Button>

          <p className="text-xs text-gray-600 text-center">
            No payment required. We'll confirm availability first.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}