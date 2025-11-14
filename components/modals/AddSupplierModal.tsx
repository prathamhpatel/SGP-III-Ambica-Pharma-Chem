'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { X, Save } from 'lucide-react';
import { Supplier } from '@/types';

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (supplier: Omit<Supplier, 'id' | 'totalOrders'>) => void;
  supplier?: Supplier | null;
  isEdit?: boolean;
}

export default function AddSupplierModal({ 
  isOpen, 
  onClose, 
  onSave, 
  supplier, 
  isEdit = false 
}: AddSupplierModalProps) {
  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    contact: supplier?.contact || '',
    email: supplier?.email || '',
    phone: supplier?.phone || '',
    address: supplier?.address || '',
    rating: supplier?.rating || 0,
    chemicals: supplier?.chemicals || [],
    status: supplier?.status || ('active' as Supplier['status'])
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supplierData = {
        ...formData,
        totalOrders: supplier?.totalOrders || 0,
        lastOrderDate: supplier?.lastOrderDate
      };

      // Save to MongoDB via API
      const url = isEdit && supplier?.id 
        ? `/api/suppliers/${supplier.id}`
        : '/api/suppliers';
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supplierData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(isEdit ? 'Supplier updated successfully!' : 'Supplier added successfully!');
        
        // Reset form if not editing
        if (!isEdit) {
          setFormData({
            name: '',
            contact: '',
            email: '',
            phone: '',
            address: '',
            rating: 0,
            chemicals: [],
            status: 'active'
          });
        }
        
        // Call onSave to refresh parent component and wait for it to complete
        await onSave(data.data);
        
        // Close modal after parent has refreshed
        onClose();
      } else {
        alert(data.error || 'Failed to save supplier. Please try again.');
      }
    } catch (error) {
      console.error('Error saving supplier:', error);
      alert('Failed to save supplier. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {isEdit ? `Edit ${supplier?.name}` : 'Add New Supplier'}
            </h2>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., ABC Chemicals Ltd"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Person *</label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., John Doe"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="contact@supplier.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="+91-9876543210"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Business Address *</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Complete business address with city, state, and postal code"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Rating (0-5)</label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="4.5"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Supplier['status'] })}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Chemical Categories Supplied</label>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                'Inorganic Salts',
                'Organic Solvents', 
                'Acids',
                'Bases',
                'Alcohols',
                'Polymers',
                'Catalysts',
                'Dyes',
                'Specialty Chemicals'
              ].map((category) => (
                <label key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
              <div>
                <strong>Payment Terms:</strong>
                <p>Net 30 days (default)</p>
              </div>
              <div>
                <strong>Delivery Time:</strong>
                <p>5-7 business days</p>
              </div>
              <div>
                <strong>Quality Certification:</strong>
                <p>Required with delivery</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isEdit ? 'Update Supplier' : 'Add Supplier'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}