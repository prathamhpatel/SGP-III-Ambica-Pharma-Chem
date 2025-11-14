'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { X, Save } from 'lucide-react';
import { Chemical, Supplier } from '@/types';
import { apiService } from '@/lib/api';

interface AddChemicalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (chemical: Omit<Chemical, 'id'>) => void;
}

export default function AddChemicalModal({ isOpen, onClose, onSave }: AddChemicalModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    formula: '',
    category: '',
    quantity: 0,
    unit: 'kg',
    batchNo: '',
    expiryDate: '',
    reorderThreshold: 0,
    supplier: '',
    costPerUnit: 0,
    location: '',
    status: 'active' as Chemical['status']
  });

  const [isLoading, setIsLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);

  // Fetch suppliers when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchSuppliers();
    }
  }, [isOpen]);

  const fetchSuppliers = async () => {
    setLoadingSuppliers(true);
    try {
      const response = await apiService.getSuppliers();
      if (response.success && response.data) {
        setSuppliers(response.data as Supplier[]);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newChemical: Omit<Chemical, 'id'> = {
        ...formData,
        lastUpdated: new Date().toISOString().split('T')[0]
      };

      onSave(newChemical);
      
      // Reset form
      setFormData({
        name: '',
        formula: '',
        category: '',
        quantity: 0,
        unit: 'kg',
        batchNo: '',
        expiryDate: '',
        reorderThreshold: 0,
        supplier: '',
        costPerUnit: 0,
        location: '',
        status: 'active'
      });
      
      onClose();
    } catch (error) {
      console.error('Error adding chemical:', error);
      alert('Failed to add chemical. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Add New Chemical</h2>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Chemical Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Chemical Formula</label>
              <input
                type="text"
                value={formData.formula}
                onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., NaCl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">Select Category</option>
                <option value="Inorganic Salt">Inorganic Salt</option>
                <option value="Organic Solvent">Organic Solvent</option>
                <option value="Acid">Acid</option>
                <option value="Base">Base</option>
                <option value="Alcohol">Alcohol</option>
                <option value="Polymer">Polymer</option>
                <option value="Catalyst">Catalyst</option>
                <option value="Dye">Dye</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Supplier *</label>
              <select
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                disabled={loadingSuppliers}
              >
                <option value="">
                  {loadingSuppliers ? 'Loading suppliers...' : 'Select Supplier'}
                </option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.name}>
                    {supplier.name}
                  </option>
                ))}
                {suppliers.length === 0 && !loadingSuppliers && (
                  <option value="" disabled>No suppliers available - Add suppliers first</option>
                )}
              </select>
              {suppliers.length === 0 && !loadingSuppliers && (
                <p className="mt-1 text-sm text-orange-600">
                  No suppliers found. Please add suppliers first from the Suppliers page.
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Unit *</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="kg">kg</option>
                <option value="L">L</option>
                <option value="g">g</option>
                <option value="mL">mL</option>
                <option value="tons">tons</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Reorder Threshold *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.reorderThreshold}
                onChange={(e) => setFormData({ ...formData, reorderThreshold: parseFloat(e.target.value) || 0 })}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Batch Number *</label>
              <input
                type="text"
                value={formData.batchNo}
                onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., BATCH-2024-001"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Expiry Date *</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Cost Per Unit *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.costPerUnit}
                onChange={(e) => setFormData({ ...formData, costPerUnit: parseFloat(e.target.value) || 0 })}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Storage Location *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Warehouse A-1"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              Add Chemical
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}