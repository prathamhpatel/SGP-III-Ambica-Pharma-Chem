'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { X, Save, AlertTriangle, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, Chemical } from '@/types';
import { apiService } from '@/lib/api';

interface AddAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (alert: Omit<Alert, 'id' | 'timestamp'>) => void;
}

export default function AddAlertModal({ isOpen, onClose, onSave }: AddAlertModalProps) {
  const [formData, setFormData] = useState({
    type: 'general' as Alert['type'],
    title: '',
    message: '',
    chemicalId: '',
    severity: 'medium' as Alert['severity'],
    actionRequired: false,
    isRead: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [loadingChemicals, setLoadingChemicals] = useState(false);

  // Fetch chemicals when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchChemicals();
    }
  }, [isOpen]);

  const fetchChemicals = async () => {
    setLoadingChemicals(true);
    try {
      const response = await apiService.getChemicals();
      if (response.success && response.data) {
        setChemicals(response.data as Chemical[]);
      }
    } catch (error) {
      console.error('Error fetching chemicals:', error);
    } finally {
      setLoadingChemicals(false);
    }
  };

  const alertTypes = [
    { value: 'low_stock', label: 'Low Stock', icon: AlertTriangle },
    { value: 'out_of_stock', label: 'Out of Stock', icon: AlertCircle },
    { value: 'expiry_warning', label: 'Expiry Warning', icon: AlertTriangle },
    { value: 'quality_issue', label: 'Quality Issue', icon: AlertCircle },
    { value: 'delivery_delay', label: 'Delivery Delay', icon: Info },
    { value: 'general', label: 'General Alert', icon: Info },
    { value: 'system', label: 'System Alert', icon: CheckCircle }
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', color: 'text-green-600', bgColor: 'bg-green-50 border-green-200' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-50 border-yellow-200' },
    { value: 'high', label: 'High', color: 'text-orange-600', bgColor: 'bg-orange-50 border-orange-200' },
    { value: 'critical', label: 'Critical', color: 'text-red-600', bgColor: 'bg-red-50 border-red-200' }
  ];

  const handleTypeChange = (type: Alert['type']) => {
    setFormData({ ...formData, type });
    
    // Auto-generate title based on type
    const typeLabels = {
      low_stock: 'Low Stock Alert',
      out_of_stock: 'Out of Stock Alert',
      expiry_warning: 'Expiry Warning',
      quality_issue: 'Quality Issue Alert',
      delivery_delay: 'Delivery Delay Notice',
      general: 'General Alert',
      system: 'System Notification'
    };
    
    setFormData(prev => ({ 
      ...prev, 
      type, 
      title: typeLabels[type] || 'Alert'
    }));
  };

  const handleChemicalChange = (chemicalId: string) => {
    const chemical = chemicals.find(c => c.id === chemicalId);
    setFormData({ ...formData, chemicalId });
    
    if (chemical && formData.type !== 'general' && formData.type !== 'system') {
      // Auto-generate message based on chemical and alert type
      let message = '';
      switch (formData.type) {
        case 'low_stock':
          message = `${chemical.name} is below reorder threshold. Current stock: ${chemical.quantity} ${chemical.unit}, Threshold: ${chemical.reorderThreshold} ${chemical.unit}`;
          break;
        case 'out_of_stock':
          message = `${chemical.name} is completely out of stock. Immediate reorder required.`;
          break;
        case 'expiry_warning':
          message = `${chemical.name} batch ${chemical.batchNo} expires on ${chemical.expiryDate}`;
          break;
        case 'quality_issue':
          message = `Quality issue reported for ${chemical.name} batch ${chemical.batchNo}`;
          break;
        default:
          message = `Alert for ${chemical.name}`;
      }
      setFormData(prev => ({ ...prev, message }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newAlert: Omit<Alert, 'id' | 'timestamp'> = {
        ...formData,
        chemicalId: formData.chemicalId || undefined
      };

      onSave(newAlert);
      
      // Reset form
      setFormData({
        type: 'general',
        title: '',
        message: '',
        chemicalId: '',
        severity: 'medium',
        actionRequired: false,
        isRead: false
      });
      
      onClose();
    } catch (error) {
      console.error('Error creating alert:', error);
      alert('Failed to create alert. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedSeverity = severityLevels.find(s => s.value === formData.severity);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Create Alert</h2>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Alert Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Alert Type *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {alertTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleTypeChange(type.value as Alert['type'])}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      formData.type === type.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Icon className="h-5 w-5 mb-2" />
                    <div className="text-sm font-medium">{type.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Severity Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Severity Level *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {severityLevels.map((severity) => (
                <button
                  key={severity.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, severity: severity.value as Alert['severity'] })}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    formData.severity === severity.value
                      ? severity.bgColor
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className={`text-sm font-medium ${
                    formData.severity === severity.value ? severity.color : 'text-gray-700'
                  }`}>
                    {severity.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chemical Selection (if applicable) */}
          {formData.type !== 'general' && formData.type !== 'system' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Related Chemical</label>
              <select
                value={formData.chemicalId}
                onChange={(e) => handleChemicalChange(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loadingChemicals}
              >
                <option value="">
                  {loadingChemicals ? 'Loading chemicals...' : 'Select Chemical (Optional)'}
                </option>
                {chemicals.map((chemical) => (
                  <option key={chemical.id} value={chemical.id}>
                    {chemical.name} ({chemical.formula}) - {chemical.batchNo}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Alert Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter alert title"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Alert Message *</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter detailed alert message"
              required
            />
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="actionRequired"
                checked={formData.actionRequired}
                onChange={(e) => setFormData({ ...formData, actionRequired: e.target.checked })}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="actionRequired" className="ml-2 text-sm text-gray-700">
                Action Required - This alert needs immediate attention
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRead"
                checked={formData.isRead}
                onChange={(e) => setFormData({ ...formData, isRead: e.target.checked })}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="isRead" className="ml-2 text-sm text-gray-700">
                Mark as read
              </label>
            </div>
          </div>

          {/* Preview */}
          {formData.title && formData.message && (
            <div className={`p-4 rounded-lg border ${selectedSeverity?.bgColor || 'bg-gray-50 border-gray-200'}`}>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Preview:</h4>
              <div className={`font-medium ${selectedSeverity?.color || 'text-gray-700'}`}>
                {formData.title}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {formData.message}
              </div>
              {formData.actionRequired && (
                <div className="text-xs text-orange-600 mt-2 font-medium">
                  ⚠️ Action Required
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

