'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { X, Save, User, Activity, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { ActivityLog } from '@/types';

interface AddActivityLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activityLog: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
}

export default function AddActivityLogModal({ isOpen, onClose, onSave }: AddActivityLogModalProps) {
  const [formData, setFormData] = useState({
    user: '',
    action: '',
    details: '',
    category: 'general' as ActivityLog['category'],
    severity: 'info' as ActivityLog['severity']
  });

  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { value: 'stock_update', label: 'Stock Update', icon: Activity },
    { value: 'purchase_order', label: 'Purchase Order', icon: CheckCircle },
    { value: 'supplier', label: 'Supplier Management', icon: User },
    { value: 'alert', label: 'Alert/Notification', icon: AlertTriangle },
    { value: 'system', label: 'System Activity', icon: Info },
    { value: 'general', label: 'General Activity', icon: Activity }
  ];

  const severityLevels = [
    { value: 'info', label: 'Info', color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200', icon: Info },
    { value: 'success', label: 'Success', color: 'text-green-600', bgColor: 'bg-green-50 border-green-200', icon: CheckCircle },
    { value: 'warning', label: 'Warning', color: 'text-yellow-600', bgColor: 'bg-yellow-50 border-yellow-200', icon: AlertTriangle },
    { value: 'error', label: 'Error', color: 'text-red-600', bgColor: 'bg-red-50 border-red-200', icon: AlertCircle }
  ];

  const actionTemplates = {
    stock_update: [
      'Stock quantity updated',
      'New chemical added',
      'Chemical information modified',
      'Batch information updated',
      'Reorder threshold changed'
    ],
    purchase_order: [
      'Purchase order created',
      'Purchase order approved',
      'Purchase order cancelled',
      'Purchase order delivered',
      'Purchase order modified'
    ],
    supplier: [
      'New supplier added',
      'Supplier information updated',
      'Supplier status changed',
      'Supplier rating updated',
      'Supplier contact modified'
    ],
    alert: [
      'Low stock alert triggered',
      'Out of stock alert created',
      'Expiry warning generated',
      'Quality issue reported',
      'Alert acknowledged'
    ],
    system: [
      'System backup completed',
      'Database maintenance',
      'User login recorded',
      'System configuration changed',
      'Automated process executed'
    ],
    general: [
      'Manual entry recorded',
      'Data import completed',
      'Report generated',
      'Audit trail entry',
      'Custom activity logged'
    ]
  };

  const handleCategoryChange = (category: ActivityLog['category']) => {
    setFormData({ ...formData, category, action: '' });
  };

  const handleActionSelect = (action: string) => {
    setFormData({ ...formData, action });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newActivityLog: Omit<ActivityLog, 'id' | 'timestamp'> = {
        ...formData,
        user: formData.user || 'Manual Entry'
      };

      onSave(newActivityLog);
      
      // Reset form
      setFormData({
        user: '',
        action: '',
        details: '',
        category: 'general',
        severity: 'info'
      });
      
      onClose();
    } catch (error) {
      console.error('Error creating activity log:', error);
      alert('Failed to create activity log. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedSeverity = severityLevels.find(s => s.value === formData.severity);
  const SeverityIcon = selectedSeverity?.icon || Info;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Add Activity Log</h2>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* User Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">User/Performer</label>
              <input
                type="text"
                value={formData.user}
                onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter username or 'System' for automated actions"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Severity Level *</label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                {severityLevels.map((severity) => {
                  const Icon = severity.icon;
                  return (
                    <button
                      key={severity.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, severity: severity.value as ActivityLog['severity'] })}
                      className={`p-2 border rounded-lg text-center transition-colors flex items-center justify-center space-x-2 ${
                        formData.severity === severity.value
                          ? severity.bgColor
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${
                        formData.severity === severity.value ? severity.color : 'text-gray-500'
                      }`} />
                      <span className={`text-sm font-medium ${
                        formData.severity === severity.value ? severity.color : 'text-gray-700'
                      }`}>
                        {severity.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Activity Category *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => handleCategoryChange(category.value as ActivityLog['category'])}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      formData.category === category.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Icon className="h-5 w-5 mb-2" />
                    <div className="text-sm font-medium">{category.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Templates */}
          {formData.category && actionTemplates[formData.category] && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Common Actions</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {actionTemplates[formData.category].map((action, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleActionSelect(action)}
                    className={`p-2 text-left border rounded text-sm transition-colors ${
                      formData.action === action
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Action Performed *</label>
            <input
              type="text"
              value={formData.action}
              onChange={(e) => setFormData({ ...formData, action: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Describe the action that was performed"
              required
            />
          </div>

          {/* Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Details *</label>
            <textarea
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              rows={4}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Provide detailed information about what happened, including specific values, changes made, or outcomes"
              required
            />
          </div>

          {/* Preview */}
          {formData.action && formData.details && (
            <div className={`p-4 rounded-lg border ${selectedSeverity?.bgColor || 'bg-gray-50 border-gray-200'}`}>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Preview:</h4>
              <div className="flex items-start space-x-3">
                <SeverityIcon className={`h-5 w-5 mt-0.5 ${selectedSeverity?.color || 'text-gray-500'}`} />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="font-medium text-gray-900">{formData.user || 'Manual Entry'}</span>
                    <span className="text-gray-500">•</span>
                    <span className={`font-medium ${selectedSeverity?.color || 'text-gray-700'}`}>
                      {formData.action}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-500 capitalize">{formData.category.replace('_', ' ')}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {formData.details}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date().toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              Add Activity Log
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

