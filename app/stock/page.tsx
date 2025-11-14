'use client';

import { useState, useMemo, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2,
  AlertTriangle,
  Calendar,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { formatCurrency, formatDate, calculateDaysUntilExpiry, exportToCSV } from '@/lib/utils';
import { Chemical } from '@/types';
import { triggerReorder } from '@/lib/automation';
import { apiService } from '@/lib/api';
import AddChemicalModal from '@/components/modals/AddChemicalModal';

export default function StockManagement() {
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingChemical, setEditingChemical] = useState<Chemical | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch chemicals data
  const fetchChemicals = async () => {
    setDataLoading(true);
    try {
      const response = await apiService.getChemicals();
      if (response.success && response.data) {
        setChemicals(response.data as Chemical[]);
      } else {
        console.error('Failed to fetch chemicals:', response.error);
        // Fallback to empty array if API fails
        setChemicals([]);
      }
    } catch (error) {
      console.error('Error fetching chemicals:', error);
      setChemicals([]);
    } finally {
      setDataLoading(false);
    }
  };

  // Auto-sync alerts with stock status
  const syncAlertsWithStock = async () => {
    try {
      await fetch('/api/alerts/sync', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error syncing alerts:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      await fetchChemicals();
      // Auto-sync alerts after loading chemicals
      await syncAlertsWithStock();
    };
    loadData();
  }, []);

  // Filter and search logic
  const filteredChemicals = useMemo(() => {
    return chemicals.filter(chemical => {
      const matchesSearch = chemical.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           chemical.formula?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           chemical.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           chemical.batchNo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || chemical.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || chemical.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [chemicals, searchTerm, statusFilter, categoryFilter]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(chemicals.map(c => c.category)));
    return uniqueCategories.sort();
  }, [chemicals]);

  const handleReorderClick = async (chemical: Chemical) => {
    setIsLoading(true);
    try {
      const result = await triggerReorder(chemical);
      if (result.success) {
        alert(result.message);
        // Update chemical status to show reorder in progress
        setChemicals(prev => prev.map(c => 
          c.id === chemical.id 
            ? { ...c, status: 'pending_reorder' as any } 
            : c
        ));
      }
    } catch (error) {
      alert('Failed to trigger reorder');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    exportToCSV(filteredChemicals, `chemical-inventory-${Date.now()}.csv`);
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredChemicals.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredChemicals.map(c => c.id));
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const handleAddChemical = async (newChemical: Omit<Chemical, 'id'>) => {
    try {
      // The modal already saved the chemical to the database
      // We just need to refresh the list to show it
      await fetchChemicals();
      // Sync alerts after adding chemical
      await syncAlertsWithStock();
    } catch (error) {
      console.error('Error refreshing chemicals:', error);
    }
  };

  const handleEditChemical = async (updatedChemical: Omit<Chemical, 'id'>) => {
    try {
      // The modal already updated the chemical in the database
      // We just need to refresh the list to show it
      await fetchChemicals();
      // Sync alerts after updating chemical
      await syncAlertsWithStock();
      setEditingChemical(null);
    } catch (error) {
      console.error('Error refreshing chemicals:', error);
    }
  };

  const handleDeleteChemical = async (chemical: Chemical) => {
    if (!window.confirm(`Are you sure you want to delete "${chemical.name}" (Batch: ${chemical.batchNo})?\n\nThis action cannot be undone.\nAll related alerts will also be deleted.`)) {
      return;
    }

    try {
      const response = await apiService.deleteChemical(chemical.id);
      
      if (response.success) {
        const alertMsg = (response as any).deletedAlerts 
          ? `Chemical "${chemical.name}" and ${(response as any).deletedAlerts} related alert(s) deleted successfully!`
          : `Chemical "${chemical.name}" deleted successfully!`;
        window.alert(alertMsg);
        // Refresh the list
        await fetchChemicals();
        // Sync alerts after deleting chemical
        await syncAlertsWithStock();
      } else {
        window.alert(`Failed to delete chemical: ${response.error}`);
      }
    } catch (error) {
      console.error('Error deleting chemical:', error);
      window.alert('Failed to delete chemical. Please try again.');
    }
  };

  const getStockStatus = (chemical: Chemical) => {
    if (chemical.quantity === 0) return 'out_of_stock';
    if (chemical.quantity <= chemical.reorderThreshold) return 'low_stock';
    
    const daysUntilExpiry = calculateDaysUntilExpiry(chemical.expiryDate);
    if (daysUntilExpiry <= 0) return 'expired';
    if (daysUntilExpiry <= 30) return 'expiring_soon';
    
    return 'active';
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
            <p className="text-gray-600">Manage your chemical inventory and track stock levels</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Chemical
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search chemicals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 w-full border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Results count */}
            <div className="flex items-center text-sm text-gray-600">
              Showing {filteredChemicals.length} of {chemicals.length} chemicals
            </div>
          </div>
        </Card>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-blue-900">
                  {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
                </span>
                <Button size="sm" variant="outline">
                  Bulk Update
                </Button>
                <Button size="sm" variant="outline">
                  Export Selected
                </Button>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setSelectedItems([])}>
                Clear Selection
              </Button>
            </div>
          </Card>
        )}

        {/* Stock Table */}
        <Card>
          {dataLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading chemicals...</p>
              </div>
            </div>
          ) : (
            <>
              <Table>
            <TableHeader>
              <TableRow>
                <TableCell header>
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredChemicals.length && filteredChemicals.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </TableCell>
                <TableCell header>Chemical</TableCell>
                <TableCell header>Category</TableCell>
                <TableCell header>Stock Level</TableCell>
                <TableCell header>Batch Info</TableCell>
                <TableCell header>Location</TableCell>
                <TableCell header>Status</TableCell>
                <TableCell header>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChemicals.map((chemical) => {
                const stockStatus = getStockStatus(chemical);
                const daysUntilExpiry = calculateDaysUntilExpiry(chemical.expiryDate);
                
                return (
                  <TableRow key={chemical.id} className="hover:bg-gray-50">
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(chemical.id)}
                        onChange={() => handleSelectItem(chemical.id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{chemical.name}</p>
                        <p className="text-sm text-gray-600">{chemical.formula}</p>
                        <p className="text-xs text-gray-500">ID: {chemical.id}</p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge>{chemical.category}</Badge>
                    </TableCell>

                    <TableCell>
                      <div>
                        <p className={`font-medium ${
                          chemical.quantity === 0 ? 'text-danger-600' :
                          chemical.quantity <= chemical.reorderThreshold ? 'text-warning-600' :
                          'text-gray-900'
                        }`}>
                          {chemical.quantity} {chemical.unit}
                        </p>
                        <p className="text-xs text-gray-500">
                          Reorder at: {chemical.reorderThreshold} {chemical.unit}
                        </p>
                        <p className="text-xs text-gray-500">
                          Value: {formatCurrency(chemical.quantity * chemical.costPerUnit)}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{chemical.batchNo}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span className={
                            daysUntilExpiry <= 0 ? 'text-danger-600' :
                            daysUntilExpiry <= 30 ? 'text-warning-600' : ''
                          }>
                            {formatDate(chemical.expiryDate)}
                          </span>
                        </div>
                        {daysUntilExpiry <= 90 && daysUntilExpiry > 0 && (
                          <p className="text-xs text-warning-600">
                            Expires in {daysUntilExpiry} days
                          </p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-3 w-3 mr-1" />
                        {chemical.location}
                      </div>
                      <p className="text-xs text-gray-500">
                        Supplier: {chemical.supplier}
                      </p>
                    </TableCell>

                    <TableCell>
                      <Badge variant="status" status={stockStatus}>
                        {stockStatus.replace('_', ' ')}
                      </Badge>
                      {chemical.quantity <= chemical.reorderThreshold && (
                        <div className="flex items-center mt-1">
                          <AlertTriangle className="h-3 w-3 text-warning-600 mr-1" />
                          <span className="text-xs text-warning-600">Reorder needed</span>
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setEditingChemical(chemical)}
                          title="Edit Chemical"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        
                        {chemical.quantity <= chemical.reorderThreshold && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleReorderClick(chemical)}
                            disabled={isLoading}
                            className="text-warning-600 border-warning-300 hover:bg-warning-50"
                            title="Trigger Reorder"
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        )}
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-danger-600 border-danger-300 hover:bg-danger-50"
                          onClick={() => handleDeleteChemical(chemical)}
                          title="Delete Chemical"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
              {filteredChemicals.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900">No chemicals found</p>
                  <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Add Chemical Modal */}
        <AddChemicalModal 
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddChemical}
        />

        {/* Edit Chemical Modal */}
        <AddChemicalModal 
          isOpen={!!editingChemical}
          onClose={() => setEditingChemical(null)}
          onSave={handleEditChemical}
          chemical={editingChemical}
          isEdit={true}
        />
      </div>
    </Layout>
  );
}