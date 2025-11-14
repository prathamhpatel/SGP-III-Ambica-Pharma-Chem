import mongoose, { Document, Schema } from 'mongoose';

export interface IAlert extends Document {
  type: 'low_stock' | 'expiry_warning' | 'out_of_stock' | 'system';
  title: string;
  message: string;
  chemicalId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  timestamp: Date;
  actionRequired: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema: Schema = new Schema({
  type: {
    type: String,
    required: [true, 'Alert type is required'],
    enum: ['low_stock', 'expiry_warning', 'out_of_stock', 'system']
  },
  title: {
    type: String,
    required: [true, 'Alert title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Alert message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  chemicalId: {
    type: String,
    trim: true
  },
  severity: {
    type: String,
    required: [true, 'Severity is required'],
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  actionRequired: {
    type: Boolean,
    default: false
  },
  resolvedAt: {
    type: Date
  },
  resolvedBy: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient queries
AlertSchema.index({ type: 1 });
AlertSchema.index({ severity: 1 });
AlertSchema.index({ isRead: 1 });
AlertSchema.index({ timestamp: -1 });
AlertSchema.index({ chemicalId: 1 });

// Virtual for alert age
AlertSchema.virtual('ageInHours').get(function() {
  return Math.floor((new Date().getTime() - this.timestamp.getTime()) / (1000 * 60 * 60));
});

export default mongoose.models.Alert || mongoose.model<IAlert>('Alert', AlertSchema);
