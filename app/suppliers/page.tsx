'use client';

import { useState, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2,
  Star,
  Phone,
  Mail,
  MapPin,
  Package,
  Calendar,
  X,
  Save,
  Building
} from 'lucide-react';
import { mockSuppliers, mockChemicals } from '@/lib/mockData';
import { formatDate, exportToCSV } from '@/lib/utils';
import { Supplier } from '@/types';
import { syncSupplierData } from '@/lib/automation';
import AddSupplierModal from '@/components/modals/AddSupplierModal';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const handleAddSupplier = (newSupplierData: Omit<Supplier, 'id' | 'totalOrders'>) => {
    const supplier: Supplier = {
      ...newSupplierData,
      id: `supplier-${Date.now()}`,
      totalOrders: 0,
    };
    
    setSuppliers(prev => [...prev, supplier]);
    alert(`Supplier "${supplier.name}" added successfully!`);
  };

  const handleEditSupplier = (updatedSupplierData: Omit<Supplier, 'id' | 'totalOrders'>) => {
    if (!editingSupplier) return;
    
    setSuppliers(prev => prev.map(s => 
      s.id === editingSupplier.id 
        ? { ...s, ...updatedSupplierData }
        : s
    ));
    
    alert(`Supplier "${updatedSupplierData.name}" updated successfully!`);
    setEditingSupplier(null);
  };

  // Filter suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
      const matchesRating = ratingFilter === 'all' || 
                           (ratingFilter === '4+' && supplier.rating >= 4) ||
                           (ratingFilter === '3-4' && supplier.rating >= 3 && supplier.rating < 4) ||
                           (ratingFilter === '<3' && supplier.rating < 3);
      
      return matchesSearch && matchesStatus && matchesRating;
    });
  }, [suppliers, searchTerm, statusFilter, ratingFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = suppliers.length;
    const active = suppliers.filter(s => s.status === 'active').length;
    const highRated = suppliers.filter(s => s.rating >= 4).length;
    const totalOrders = suppliers.reduce((sum, s) => sum + s.totalOrders, 0);
    
    return { total, active, highRated, totalOrders };
  }, [suppliers]);

  const handleSyncSupplier = async (supplier: Supplier) => {
    setIsLoading(true);
    try {
      const result = await syncSupplierData(supplier);
      if (result.success) {
        alert(result.message);
      }
    } catch (error) {
      alert('Failed to sync supplier data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSupplier = (supplierId: string) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      setSuppliers(prev => prev.filter(s => s.id !== supplierId));
    }
  };



  const handleExport = () => {
    exportToCSV(filteredSuppliers, `suppliers-${Date.now()}.csv`);
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : i < rating 
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
  };



  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
            <p className="text-gray-600">Manage your chemical suppliers and their information</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => {
              setEditingSupplier(null);
              setShowCreateModal(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Building className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Suppliers</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-success-100 rounded-lg">
                <Users className="h-6 w-6 text-success-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{stats.active}</p>
                <p className="text-sm text-gray-600">Active Suppliers</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{stats.highRated}</p>
                <p className="text-sm text-gray-600">High Rated (4+)</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{stats.totalOrders}</p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="relative">
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Ratings</option>
                <option value="4+">4+ Stars</option>
                <option value="3-4">3-4 Stars</option>
                <option value="<3">Below 3 Stars</option>
              </select>
            </div>

            <div className="text-sm text-gray-600 flex items-center">
              Showing {filteredSuppliers.length} of {suppliers.length} suppliers
            </div>
          </div>
        </Card>

        {/* Suppliers Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell header>Supplier</TableCell>
                <TableCell header>Contact</TableCell>
                <TableCell header>Rating</TableCell>
                <TableCell header>Orders</TableCell>
                <TableCell header>Chemicals</TableCell>
                <TableCell header>Status</TableCell>
                <TableCell header>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{supplier.name}</p>
                      <p className="text-sm text-gray-600">{supplier.contact}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="truncate">{supplier.address}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-3 w-3 mr-2" />
                        <span>{supplier.email}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-3 w-3 mr-2" />
                        <span>{supplier.phone}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {getRatingStars(supplier.rating)}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {supplier.rating.toFixed(1)}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{supplier.totalOrders}</p>
                      {supplier.lastOrderDate && (
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Last: {formatDate(supplier.lastOrderDate)}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{supplier.chemicals.length} chemicals</p>
                      <div className="text-xs text-gray-500 mt-1">
                        {supplier.chemicals.slice(0, 3).map(chemId => {
                          const chemical = mockChemicals.find(c => c.id === chemId);
                          return chemical?.name;
                        }).filter(Boolean).join(', ')}
                        {supplier.chemicals.length > 3 && ` +${supplier.chemicals.length - 3} more`}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="status" status={supplier.status}>
                      {supplier.status.toUpperCase()}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setSelectedSupplier(supplier)}
                      >
                        View
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setEditingSupplier(supplier);
                          setShowCreateModal(true);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleSyncSupplier(supplier)}
                        disabled={isLoading}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        Sync
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDeleteSupplier(supplier.id)}
                        className="text-danger-600 border-danger-300 hover:bg-danger-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredSuppliers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900">No suppliers found</p>
              <p className="text-gray-600">Add your first supplier to get started</p>
              <Button className="mt-4" onClick={() => {
                setEditingSupplier(null);
                setShowCreateModal(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Supplier
              </Button>
            </div>
          )}
        </Card>

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <AddSupplierModal 
            isOpen={showCreateModal}
            onClose={() => {
              setShowCreateModal(false);
              setEditingSupplier(null);
            }}
            onSave={editingSupplier ? handleEditSupplier : handleAddSupplier}
            supplier={editingSupplier}
            isEdit={!!editingSupplier}
          />
        )}

        {/* Supplier Details Modal */}
        {selectedSupplier && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedSupplier.name}
                  </h2>
                  <Button variant="ghost" onClick={() => setSelectedSupplier(null)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Supplier Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{selectedSupplier.contact}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{selectedSupplier.email}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{selectedSupplier.phone}</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <span className="text-gray-900">{selectedSupplier.address}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Performance</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Rating</span>
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {getRatingStars(selectedSupplier.rating)}
                          </div>
                          <span className="font-medium">{selectedSupplier.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total Orders</span>
                        <span className="font-medium">{selectedSupplier.totalOrders}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Status</span>
                        <Badge variant="status" status={selectedSupplier.status}>
                          {selectedSupplier.status.toUpperCase()}
                        </Badge>
                      </div>
                      {selectedSupplier.lastOrderDate && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Last Order</span>
                          <span className="font-medium">{formatDate(selectedSupplier.lastOrderDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Supplied Chemicals */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Supplied Chemicals</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedSupplier.chemicals.map(chemId => {
                      const chemical = mockChemicals.find(c => c.id === chemId);
                      return chemical ? (
                        <div key={chemId} className="bg-gray-50 rounded-lg p-3">
                          <p className="font-medium text-gray-900">{chemical.name}</p>
                          <p className="text-sm text-gray-600">{chemical.formula}</p>
                          <p className="text-xs text-gray-500">{chemical.category}</p>
                        </div>
                      ) : null;
                    })}
                  </div>
                  {selectedSupplier.chemicals.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No chemicals assigned</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}