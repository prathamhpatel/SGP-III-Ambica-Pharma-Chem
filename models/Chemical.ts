import mongoose, { Document, Schema } from 'mongoose';

export interface IChemical extends Document {
  name: string;
  formula?: string;
  category: string;
  quantity: number;
  unit: string;
  batchNo: string;
  expiryDate: Date;
  reorderThreshold: number;
  supplier: string;
  costPerUnit: number;
  location: string;
  lastUpdated: Date;
  status: 'active' | 'expired' | 'low_stock' | 'out_of_stock';
  createdAt: Date;
  updatedAt: Date;
}

const ChemicalSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Chemical name is required'],
    trim: true,
    maxlength: [100, 'Chemical name cannot exceed 100 characters']
  },
  formula: {
    type: String,
    trim: true,
    maxlength: [50, 'Formula cannot exceed 50 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Inorganic Salt',
      'Organic Solvent', 
      'Acid',
      'Base',
      'Alcohol',
      'Polymer',
      'Catalyst',
      'Dye',
      'Specialty Chemical'
    ]
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['kg', 'L', 'g', 'mL', 'tons']
  },
  batchNo: {
    type: String,
    required: [true, 'Batch number is required'],
    trim: true,
    unique: true
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  reorderThreshold: {
    type: Number,
    required: [true, 'Reorder threshold is required'],
    min: [0, 'Reorder threshold cannot be negative']
  },
  supplier: {
    type: String,
    required: [true, 'Supplier is required'],
    trim: true
  },
  costPerUnit: {
    type: Number,
    required: [true, 'Cost per unit is required'],
    min: [0, 'Cost per unit cannot be negative']
  },
  location: {
    type: String,
    required: [true, 'Storage location is required'],
    trim: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'low_stock', 'out_of_stock'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient queries
ChemicalSchema.index({ name: 1 });
ChemicalSchema.index({ category: 1 });
ChemicalSchema.index({ supplier: 1 });
ChemicalSchema.index({ status: 1 });
ChemicalSchema.index({ expiryDate: 1 });

// Virtual for checking if chemical is expired
ChemicalSchema.virtual('isExpired').get(function() {
  return this.expiryDate < new Date();
});

// Virtual for checking if reorder is needed
ChemicalSchema.virtual('needsReorder').get(function() {
  return this.quantity <= this.reorderThreshold;
});

// Pre-save middleware to update status
ChemicalSchema.pre('save', function(next) {
  if (this.quantity === 0) {
    this.status = 'out_of_stock';
  } else if (this.quantity <= this.reorderThreshold) {
    this.status = 'low_stock';
  } else if (this.expiryDate < new Date()) {
    this.status = 'expired';
  } else {
    this.status = 'active';
  }
  
  this.lastUpdated = new Date();
  next();
});

export default mongoose.models.Chemical || mongoose.model<IChemical>('Chemical', ChemicalSchema);
