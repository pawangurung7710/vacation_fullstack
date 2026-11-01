import mongoose from 'mongoose';

// Each line item carries its own delivery/return window (chosen on the product page
// before add-to-cart), not one shared per order — a cart can mix items with different
// rental windows, matching the reference rental flow.
const rentalOrderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RentalProduct',
      required: [true, 'Product is required'],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    pricePerDay: {
      type: Number,
      required: true,
      min: [0, 'Price must be positive'],
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    deliveryDate: {
      type: Date,
      required: [true, 'Delivery date is required'],
    },
    returnDate: {
      type: Date,
      required: [true, 'Return date is required'],
    },
    days: {
      type: Number,
      required: true,
      min: [1, 'Rental must be at least 1 day'],
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal must be positive'],
    },
  },
  { _id: false }
);

const rentalOrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Guest information (if not logged in) — same shape as Booking.guestInfo.
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
    items: {
      type: [rentalOrderItemSchema],
      validate: [(items) => items.length > 0, 'Order must have at least one item'],
    },
    deliveryMethod: {
      type: String,
      enum: ['pickup', 'delivery'],
      default: 'pickup',
    },
    deliveryAddress: {
      line1: { type: String, trim: true },
      line2: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      country: { type: String, trim: true },
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Price must be positive'],
    },
    depositTotal: {
      type: Number,
      min: [0, 'Deposit must be positive'],
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'delivered', 'returned', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'refunded'],
      default: 'pending',
    },
    consents: {
      termsAccepted: {
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
  },
  {
    timestamps: true,
  }
);

rentalOrderSchema.index({ user: 1 });
rentalOrderSchema.index({ status: 1 });
rentalOrderSchema.index({ 'items.product': 1 });
rentalOrderSchema.index({ createdAt: -1 });

const RentalOrder = mongoose.model('RentalOrder', rentalOrderSchema);

export default RentalOrder;
