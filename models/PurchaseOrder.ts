import mongoose, { Document, Schema } from 'mongoose';

export interface IPurchaseOrder extends Document {
  poNumber: string;
  supplier: string;
  chemicals: {
    chemicalId: string;
    chemicalName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  totalAmount: number;
  orderDate: Date;
  expectedDelivery: Date;
  actualDelivery?: Date;
  status: 'pending' | 'approved' | 'shipped' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseOrderSchema: Schema = new Schema({
  poNumber: {
    type: String,
    required: [true, 'PO number is required'],
    unique: true,
    trim: true
  },
  supplier: {
    type: String,
    required: [true, 'Supplier is required'],
    trim: true
  },
  chemicals: [{
    chemicalId: {
      type: String,
      required: [true, 'Chemical ID is required']
    },
    chemicalName: {
      type: String,
      required: [true, 'Chemical name is required'],
      trim: true
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative']
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative']
    },
    total: {
      type: Number,
      required: [true, 'Total is required'],
      min: [0, 'Total cannot be negative']
    }
  }],
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  orderDate: {
    type: Date,
    required: [true, 'Order date is required'],
    default: Date.now
  },
  expectedDelivery: {
    type: Date,
    required: [true, 'Expected delivery date is required']
  },
  actualDelivery: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient queries
PurchaseOrderSchema.index({ poNumber: 1 });
PurchaseOrderSchema.index({ supplier: 1 });
PurchaseOrderSchema.index({ status: 1 });
PurchaseOrderSchema.index({ orderDate: -1 });
PurchaseOrderSchema.index({ expectedDelivery: 1 });

// Virtual for delivery status
PurchaseOrderSchema.virtual('isOverdue').get(function() {
  if (this.status === 'delivered' || this.status === 'cancelled') {
    return false;
  }
  return this.expectedDelivery < new Date();
});

// Pre-save middleware to calculate total amount
PurchaseOrderSchema.pre('save', function(next) {
  this.totalAmount = this.chemicals.reduce((sum, chemical) => sum + chemical.total, 0);
  next();
});

export default mongoose.models.PurchaseOrder || mongoose.model<IPurchaseOrder>('PurchaseOrder', PurchaseOrderSchema);
