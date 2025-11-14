'use client';

import { useState, useMemo, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit,
  Calendar,
  Truck,
  DollarSign,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { formatCurrency, formatDate, exportToCSV } from '@/lib/utils';
import { PurchaseOrder } from '@/types';
import { sendPO, trackDelivery } from '@/lib/automation';
import { apiService } from '@/lib/api';
import AddPurchaseOrderModal from '@/components/modals/AddPurchaseOrderModal';

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch purchase orders from database
  const fetchOrders = async () => {
    setDataLoading(true);
    try {
      const response = await apiService.getPurchaseOrders();
      if (response.success && response.data) {
        setOrders(response.data as PurchaseOrder[]);
      } else {
        console.error('Failed to fetch purchase orders:', response.error);
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      setOrders([]);
    } finally {
      setDataLoading(false);
    }
  };

  // Auto-update PO statuses based on delivery dates
  const autoUpdateStatuses = async () => {
    try {
      const response = await apiService.autoUpdatePOStatus();
      if (response.success && response.data) {
        const { ordersUpdated, stockUpdates } = response.data as any;
        if (ordersUpdated > 0) {
          console.log(`Auto-updated ${ordersUpdated} purchase orders to delivered`);
          if (stockUpdates && stockUpdates.length > 0) {
            console.log('Stock updated for:', stockUpdates);
          }
          // Refresh the orders list
          await fetchOrders();
        }
      }
    } catch (error) {
      console.error('Error auto-updating PO statuses:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      await fetchOrders();
      // Auto-update statuses on page load
      await autoUpdateStatuses();
    };
    loadData();
  }, []);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.chemicals.some(c => c.chemicalName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [orders, searchTerm, statusFilter, priorityFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const approved = orders.filter(o => o.status === 'approved').length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const totalValue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    
    return { total, pending, approved, delivered, totalValue };
  }, [orders]);

  const handleCreatePO = async (newPO: Omit<PurchaseOrder, 'id'>) => {
    try {
      await fetchOrders();
    } catch (error) {
      console.error('Error refreshing purchase orders:', error);
    }
  };

  const handleMarkAsDelivered = async (order: PurchaseOrder) => {
    if (!window.confirm(`Mark PO ${order.poNumber} as delivered?\n\nThis will:\n- Update order status to 'delivered'\n- Update stock quantities for all chemicals\n- Update chemical prices\n- Re-sync alerts`)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.updatePurchaseOrder(order.id, {
        status: 'delivered',
        actualDelivery: new Date()
      });
      
      if (response.success) {
        const stockUpdates = (response as any).stockUpdates || [];
        let message = `✅ Purchase Order ${order.poNumber} marked as delivered!`;
        
        if (stockUpdates.length > 0) {
          message += `\n\n📦 Stock Updated:`;
          stockUpdates.forEach((update: any) => {
            message += `\n• ${update.chemicalName}: +${update.quantityAdded} (Total: ${update.newQuantity})`;
          });
        }
        
        window.alert(message);
        await fetchOrders();
      } else {
        window.alert(`Failed to mark as delivered: ${response.error}`);
      }
    } catch (error) {
      console.error('Error marking order as delivered:', error);
      window.alert('Failed to mark order as delivered. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendPO = async (order: PurchaseOrder) => {
    setIsLoading(true);
    try {
      const result = await sendPO(order);
      if (result.success) {
        window.alert(result.message);
        setOrders(prev => prev.map(o => 
          o.id === order.id 
            ? { ...o, status: 'approved' as any }
            : o
        ));
      }
    } catch (error) {
      window.alert('Failed to send purchase order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackDelivery = async (order: PurchaseOrder) => {
    setIsLoading(true);
    try {
      const result = await trackDelivery(order.poNumber);
      if (result.success) {
        window.alert(`Delivery Status: ${result.status.toUpperCase()}${result.eta ? ` - ETA: ${formatDate(result.eta)}` : ''}${result.location ? ` - Location: ${result.location}` : ''}`);
      }
    } catch (error) {
      window.alert('Failed to track delivery');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoUpdate = async () => {
    setIsLoading(true);
    try {
      await autoUpdateStatuses();
      window.alert('PO statuses updated based on delivery dates!');
    } catch (error) {
      window.alert('Failed to auto-update statuses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    exportToCSV(filteredOrders, `purchase-orders-${Date.now()}.csv`);
  };


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-danger-100 text-danger-600';
      case 'high': return 'bg-orange-100 text-orange-600';
      case 'medium': return 'bg-warning-100 text-warning-600';
      case 'low': return 'bg-blue-100 text-blue-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (dataLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading purchase orders...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
            <p className="text-gray-600">Manage and track all purchase orders</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button 
              variant="outline" 
              onClick={handleAutoUpdate}
              disabled={isLoading}
              title="Auto-update PO statuses based on delivery dates"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Auto-Update
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create PO
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-warning-100 rounded-lg">
                <Clock className="h-6 w-6 text-warning-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{stats.pending}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{stats.approved}</p>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-success-100 rounded-lg">
                <Truck className="h-6 w-6 text-success-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{stats.delivered}</p>
                <p className="text-sm text-gray-600">Delivered</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
                <p className="text-sm text-gray-600">Total Value</p>
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
                placeholder="Search orders..."
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
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="relative">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="text-sm text-gray-600 flex items-center">
              Showing {filteredOrders.length} of {orders.length} orders
            </div>
          </div>
        </Card>

        {/* Orders Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell header>PO Details</TableCell>
                <TableCell header>Supplier</TableCell>
                <TableCell header>Items</TableCell>
                <TableCell header>Amount</TableCell>
                <TableCell header>Dates</TableCell>
                <TableCell header>Priority</TableCell>
                <TableCell header>Status</TableCell>
                <TableCell header>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{order.poNumber}</p>
                      <p className="text-sm text-gray-600">ID: {order.id}</p>
                      {order.notes && (
                        <p className="text-xs text-gray-500 mt-1">{order.notes}</p>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{order.supplier}</p>
                      <p className="text-sm text-gray-600">Supplier Contact</p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{order.chemicals.length} item{order.chemicals.length > 1 ? 's' : ''}</p>
                      <div className="text-sm text-gray-600">
                        {order.chemicals.slice(0, 2).map((item, index) => (
                          <div key={index}>
                            {item.chemicalName} ({item.quantity})
                          </div>
                        ))}
                        {order.chemicals.length > 2 && (
                          <p className="text-xs text-gray-500">+{order.chemicals.length - 2} more</p>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <p className="font-medium text-gray-900">{formatCurrency(order.totalAmount)}</p>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center text-gray-600 mb-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Ordered: {formatDate(order.orderDate)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Truck className="h-3 w-3 mr-1" />
                        <span>Expected: {formatDate(order.expectedDelivery)}</span>
                      </div>
                      {order.actualDelivery && (
                        <div className="flex items-center text-success-600 mt-1">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          <span>Delivered: {formatDate(order.actualDelivery)}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge className={getPriorityColor(order.priority)}>
                      {order.priority.toUpperCase()}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <Badge variant="status" status={order.status}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)}>
                        <Eye className="h-3 w-3" />
                      </Button>
                      
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                      
                      {order.status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleSendPO(order)}
                          disabled={isLoading}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Send className="h-3 w-3" />
                        </Button>
                      )}
                      
                      {(order.status === 'shipped' || order.status === 'approved') && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleTrackDelivery(order)}
                          disabled={isLoading}
                          title="Track Delivery"
                        >
                          <Truck className="h-3 w-3" />
                        </Button>
                      )}
                      
                      {(order.status === 'shipped' || order.status === 'approved' || order.status === 'pending') && (
                        <Button 
                          size="sm" 
                          onClick={() => handleMarkAsDelivered(order)}
                          disabled={isLoading}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          title="Mark as Delivered"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900">No purchase orders found</p>
              <p className="text-gray-600">Create your first purchase order to get started</p>
              <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Purchase Order
              </Button>
            </div>
          )}
        </Card>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    Purchase Order Details - {selectedOrder.poNumber}
                  </h2>
                  <Button variant="ghost" onClick={() => setSelectedOrder(null)}>
                    <XCircle className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Order Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Supplier</h3>
                    <p className="text-lg font-medium text-gray-900">{selectedOrder.supplier}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
                    <p className="text-lg font-medium text-gray-900">{formatCurrency(selectedOrder.totalAmount)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <Badge variant="status" status={selectedOrder.status}>
                      {selectedOrder.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Items Ordered</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chemical</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedOrder.chemicals.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.chemicalName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(item.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create Purchase Order Modal */}
        <AddPurchaseOrderModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreatePO}
        />
      </div>
    </Layout>
  );
}