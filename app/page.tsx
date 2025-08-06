'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { StatCard } from '@/components/ui/Card';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { 
  Package, 
  AlertTriangle, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Clock,
  DollarSign,
  Bell,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { mockDashboardStats, mockChemicals, mockAlerts, mockPurchaseOrders } from '@/lib/mockData';
import { formatCurrency, formatDate, calculateDaysUntilExpiry } from '@/lib/utils';

export default function Dashboard() {
  const [stats, setStats] = useState(mockDashboardStats);
  const [isLoading, setIsLoading] = useState(false);

  const lowStockChemicals = mockChemicals.filter(chemical => 
    chemical.quantity <= chemical.reorderThreshold
  );

  const recentOrders = mockPurchaseOrders
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
    .slice(0, 5);

  const criticalAlerts = mockAlerts
    .filter(alert => alert.severity === 'critical' || alert.severity === 'high')
    .slice(0, 3);

  const expiringSoon = mockChemicals.filter(chemical => {
    const daysUntilExpiry = calculateDaysUntilExpiry(chemical.expiryDate);
    return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
  });

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening with your inventory.</p>
          </div>
          <Button 
            onClick={refreshData} 
            isLoading={isLoading}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Chemicals"
            value={stats.totalChemicals}
            change="+2 this month"
            changeType="positive"
            icon={<Package className="h-6 w-6 text-primary-600" />}
          />
          <StatCard
            title="Low Stock Items"
            value={stats.lowStockItems}
            change="3 need attention"
            changeType="negative"
            icon={<AlertTriangle className="h-6 w-6 text-warning-600" />}
          />
          <StatCard
            title="Orders This Month"
            value={stats.ordersThisMonth}
            change="+1 from last month"
            changeType="positive"
            icon={<ShoppingCart className="h-6 w-6 text-blue-600" />}
          />
          <StatCard
            title="Total Inventory Value"
            value={formatCurrency(stats.totalValue)}
            change="+5.2% from last month"
            changeType="positive"
            icon={<DollarSign className="h-6 w-6 text-success-600" />}
          />
        </div>

        {/* Alert Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Suppliers"
            value={stats.activeSuppliers}
            icon={<Users className="h-6 w-6 text-purple-600" />}
          />
          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders}
            change="1 urgent"
            changeType="neutral"
            icon={<Clock className="h-6 w-6 text-orange-600" />}
          />
          <StatCard
            title="Expiring Soon"
            value={stats.expiringSoon}
            change="Within 90 days"
            changeType="neutral"
            icon={<TrendingUp className="h-6 w-6 text-red-600" />}
          />
          <StatCard
            title="Critical Alerts"
            value={stats.criticalAlerts}
            change="Require action"
            changeType="negative"
            icon={<Bell className="h-6 w-6 text-danger-600" />}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Critical Alerts */}
          <Card 
            title="Critical Alerts" 
            subtitle="Issues requiring immediate attention"
            action={
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                View All
              </Button>
            }
          >
            <div className="space-y-4">
              {criticalAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex-shrink-0">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      alert.severity === 'critical' ? 'bg-danger-500' : 'bg-orange-500'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="status" status={alert.severity}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatDate(alert.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {criticalAlerts.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No critical alerts</p>
              )}
            </div>
          </Card>

          {/* Low Stock Items */}
          <Card 
            title="Low Stock Items" 
            subtitle="Chemicals below reorder threshold"
            action={
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Stock
              </Button>
            }
          >
            <div className="space-y-3">
              {lowStockChemicals.slice(0, 5).map((chemical) => (
                <div key={chemical.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{chemical.name}</p>
                    <p className="text-xs text-gray-500">{chemical.formula}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {chemical.quantity} {chemical.unit}
                    </p>
                    <p className="text-xs text-gray-500">
                      Threshold: {chemical.reorderThreshold} {chemical.unit}
                    </p>
                  </div>
                  <Badge variant="status" status={chemical.status}>
                    {chemical.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
              {lowStockChemicals.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">All items well stocked</p>
              )}
            </div>
          </Card>
        </div>

        {/* Recent Orders and Expiring Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Purchase Orders */}
          <Card 
            title="Recent Purchase Orders" 
            subtitle="Latest ordering activity"
            action={
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                View All Orders
              </Button>
            }
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell header>PO Number</TableCell>
                  <TableCell header>Supplier</TableCell>
                  <TableCell header>Amount</TableCell>
                  <TableCell header>Status</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <p className="font-medium text-gray-900">{order.poNumber}</p>
                      <p className="text-xs text-gray-500">{formatDate(order.orderDate)}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-gray-900">{order.supplier}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900">{formatCurrency(order.totalAmount)}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="status" status={order.status}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Expiring Items */}
          <Card 
            title="Items Expiring Soon" 
            subtitle="Chemicals expiring within 90 days"
            action={
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                View All
              </Button>
            }
          >
            <div className="space-y-3">
              {expiringSoon.slice(0, 5).map((chemical) => {
                const daysUntilExpiry = calculateDaysUntilExpiry(chemical.expiryDate);
                return (
                  <div key={chemical.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{chemical.name}</p>
                      <p className="text-xs text-gray-500">Batch: {chemical.batchNo}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(chemical.expiryDate)}
                      </p>
                      <p className={`text-xs ${
                        daysUntilExpiry <= 30 ? 'text-danger-600' :
                        daysUntilExpiry <= 60 ? 'text-warning-600' : 'text-gray-500'
                      }`}>
                        {daysUntilExpiry} days left
                      </p>
                    </div>
                  </div>
                );
              })}
              {expiringSoon.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No items expiring soon</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}