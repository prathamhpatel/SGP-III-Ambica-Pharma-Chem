import mongoose, { Document, Schema } from 'mongoose';

export interface IActivityLog extends Document {
  action: string;
  category: 'stock_update' | 'purchase_order' | 'supplier' | 'alert' | 'user' | 'system';
  severity: 'info' | 'warning' | 'error' | 'success';
  user: string;
  details: string;
  metadata?: {
    chemicalId?: string;
    chemicalName?: string;
    poNumber?: string;
    supplierId?: string;
    quantityChange?: number;
    oldValue?: any;
    newValue?: any;
    [key: string]: any;
  };
  timestamp: Date;
  ipAddress?: string;
}

const ActivityLogSchema: Schema = new Schema({
  action: {
    type: String,
    required: [true, 'Action is required'],
    trim: true,
    maxlength: [200, 'Action cannot exceed 200 characters']
  },
  category: {
    type: String,
    enum: ['stock_update', 'purchase_order', 'supplier', 'alert', 'user', 'system'],
    required: [true, 'Category is required']
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'error', 'success'],
    default: 'info'
  },
  user: {
    type: String,
    required: [true, 'User is required'],
    trim: true
  },
  details: {
    type: String,
    required: [true, 'Details are required'],
    trim: true,
    maxlength: [1000, 'Details cannot exceed 1000 characters']
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  ipAddress: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient queries
ActivityLogSchema.index({ timestamp: -1 });
ActivityLogSchema.index({ category: 1, timestamp: -1 });
ActivityLogSchema.index({ user: 1, timestamp: -1 });
ActivityLogSchema.index({ severity: 1, timestamp: -1 });

// Compound index for common query patterns
ActivityLogSchema.index({ category: 1, severity: 1, timestamp: -1 });

export default mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);

