import mongoose, { Document, Schema } from 'mongoose';

export interface ISupplier extends Document {
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  rating: number;
  chemicals: string[];
  lastOrderDate?: Date;
  totalOrders: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Supplier name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Supplier name cannot exceed 100 characters']
  },
  contact: {
    type: String,
    required: [true, 'Contact person is required'],
    trim: true,
    maxlength: [50, 'Contact name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  rating: {
    type: Number,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5'],
    default: 0
  },
  chemicals: [{
    type: String,
    trim: true
  }],
  lastOrderDate: {
    type: Date
  },
  totalOrders: {
    type: Number,
    default: 0,
    min: [0, 'Total orders cannot be negative']
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient queries
SupplierSchema.index({ name: 1 });
SupplierSchema.index({ status: 1 });
SupplierSchema.index({ email: 1 });

// Virtual for supplier performance score
SupplierSchema.virtual('performanceScore').get(function() {
  const recentOrdersWeight = this.totalOrders > 10 ? 1 : this.totalOrders / 10;
  const ratingWeight = this.rating / 5;
  return Math.round((recentOrdersWeight * 0.3 + ratingWeight * 0.7) * 100);
});

export default mongoose.models.Supplier || mongoose.model<ISupplier>('Supplier', SupplierSchema);
