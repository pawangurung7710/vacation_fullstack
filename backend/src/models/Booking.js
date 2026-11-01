import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Trip is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Guest information (if not logged in)
    guestInfo: {
      name: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
      phone: {
        type: String,
        trim: true,
      },
    },
    emergencyContact: {
      name: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
    },
    party: {
      adults: {
        type: Number,
        min: [0, 'Adults must be zero or more'],
      },
      children: {
        type: Number,
        min: [0, 'Children must be zero or more'],
      },
    },
    numberOfParticipants: {
      type: Number,
      required: [true, 'Number of participants is required'],
      min: [1, 'Must have at least 1 participant'],
    },
    departureDate: {
      type: Date,
      required: [true, 'Departure date is required'],
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Price must be positive'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'refunded'],
      default: 'pending',
    },
    specialRequests: {
      type: String,
      trim: true,
    },
    promoCode: {
      type: String,
      trim: true,
    },
    addOns: [
      {
        id: {
          type: String,
          trim: true,
        },
        title: {
          type: String,
          trim: true,
        },
        kind: {
          type: String,
          trim: true,
        },
        type: {
          type: String,
          trim: true,
        },
        optionLabel: {
          type: String,
          trim: true,
        },
        duration: {
          type: String,
          trim: true,
        },
        location: {
          type: String,
          trim: true,
        },
        discountEligible: {
          type: Boolean,
          default: true,
        },
        price: {
          type: Number,
          min: [0, 'Price must be positive'],
        },
      },
    ],
    consents: {
      termsAccepted: {
        type: Boolean,
        default: false,
      },
      marketingOptIn: {
        type: Boolean,
        default: false,
      },
      travelInsuranceAcknowledged: {
        type: Boolean,
        default: false,
      },
    },
    notes: {
      type: String,
      trim: true,
    },
    // Admin notes (internal)
    adminNotes: {
      type: String,
      trim: true,
    },
    promotion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Promotion',
    },
    promoDiscount: {
      type: Number,
      min: [0, 'Promo discount must be positive'],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
bookingSchema.index({ trip: 1, status: 1 });
bookingSchema.index({ user: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ departureDate: 1 });
bookingSchema.index({ createdAt: -1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
