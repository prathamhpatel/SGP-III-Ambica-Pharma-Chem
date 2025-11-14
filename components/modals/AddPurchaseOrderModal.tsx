'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { PurchaseOrder, Supplier, Chemical } from '@/types';
import { apiService } from '@/lib/api';

interface AddPurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (purchaseOrder: Omit<PurchaseOrder, 'id'>) => void;
}

interface OrderItem {
  chemicalId: string;
  chemicalName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export default function AddPurchaseOrderModal({ isOpen, onClose, onSave }: AddPurchaseOrderModalProps) {
  const [formData, setFormData] = useState({
    poNumber: '',
    supplier: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDelivery: '',
    status: 'draft' as PurchaseOrder['status'],
    priority: 'medium' as PurchaseOrder['priority'],
    notes: ''
  });

  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    { chemicalId: '', chemicalName: '', quantity: 0, unitPrice: 0, total: 0 }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Fetch suppliers and chemicals when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchData();
      generatePONumber();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [suppliersRes, chemicalsRes] = await Promise.all([
        apiService.getSuppliers(),
        apiService.getChemicals()
      ]);

      if (suppliersRes.success && suppliersRes.data) {
        setSuppliers(suppliersRes.data as Supplier[]);
      }
      if (chemicalsRes.success && chemicalsRes.data) {
        setChemicals(chemicalsRes.data as Chemical[]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const generatePONumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const poNumber = `PO-${year}${month}${day}-${random}`;
    setFormData(prev => ({ ...prev, poNumber }));
  };

  const addOrderItem = () => {
    setOrderItems([...orderItems, { chemicalId: '', chemicalName: '', quantity: 0, unitPrice: 0, total: 0 }]);
  };

  const removeOrderItem = (index: number) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, i) => i !== index));
    }
  };

  const updateOrderItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const updatedItems = [...orderItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // If chemical is selected, auto-fill name and price
    if (field === 'chemicalId') {
      const chemical = chemicals.find(c => c.id === value);
      if (chemical) {
        updatedItems[index].chemicalName = chemical.name;
        updatedItems[index].unitPrice = chemical.costPerUnit;
      }
    }

    // Calculate total
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unitPrice;
    }

    setOrderItems(updatedItems);
  };

  const calculateTotalAmount = () => {
    return orderItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const totalAmount = calculateTotalAmount();
      
      const newPurchaseOrder: Omit<PurchaseOrder, 'id'> = {
        ...formData,
        chemicals: orderItems.map(item => ({
          chemicalId: item.chemicalId,
          chemicalName: item.chemicalName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total
        })),
        totalAmount
      };

      onSave(newPurchaseOrder);
      
      // Reset form
      setFormData({
        poNumber: '',
        supplier: '',
        orderDate: new Date().toISOString().split('T')[0],
        expectedDelivery: '',
        status: 'draft',
        priority: 'medium',
        notes: ''
      });
      setOrderItems([{ chemicalId: '', chemicalName: '', quantity: 0, unitPrice: 0, total: 0 }]);
      
      onClose();
    } catch (error) {
      console.error('Error creating purchase order:', error);
      alert('Failed to create purchase order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Create Purchase Order</h2>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">PO Number *</label>
              <input
                type="text"
                value={formData.poNumber}
                onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                readOnly
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Supplier *</label>
              <select
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                disabled={loadingData}
              >
                <option value="">
                  {loadingData ? 'Loading suppliers...' : 'Select Supplier'}
                </option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.name}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as PurchaseOrder['priority'] })}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Order Date *</label>
              <input
                type="date"
                value={formData.orderDate}
                onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Expected Delivery *</label>
              <input
                type="date"
                value={formData.expectedDelivery}
                onChange={(e) => setFormData({ ...formData, expectedDelivery: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                min={formData.orderDate}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as PurchaseOrder['status'] })}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="ordered">Ordered</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
              <Button type="button" variant="outline" onClick={addOrderItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {orderItems.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Chemical *</label>
                    <select
                      value={item.chemicalId}
                      onChange={(e) => updateOrderItem(index, 'chemicalId', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Chemical</option>
                      {chemicals.map((chemical) => (
                        <option key={chemical.id} value={chemical.id}>
                          {chemical.name} ({chemical.formula})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => updateOrderItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Unit Price *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateOrderItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total</label>
                    <input
                      type="number"
                      value={item.total.toFixed(2)}
                      className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500 bg-gray-50"
                      readOnly
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeOrderItem(index)}
                      disabled={orderItems.length === 1}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Amount */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">Total Amount:</span>
                <span className="text-xl font-bold text-primary-600">
                  ₹{calculateTotalAmount().toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Additional notes or special instructions..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} disabled={orderItems.length === 0 || calculateTotalAmount() === 0}>
              <Save className="h-4 w-4 mr-2" />
              Create Purchase Order
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

