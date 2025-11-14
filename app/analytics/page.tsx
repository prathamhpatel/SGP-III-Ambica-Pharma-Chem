'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import { 
  BarChart3, 
  TrendingUp, 
  Package,
  Users,
  ShoppingCart,
  AlertTriangle
} from 'lucide-react';

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalChemicals: 0,
    lowStockItems: 0,
    totalSuppliers: 0,
    pendingOrders: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      
      // Fetch real data from database
      const [chemicalsRes, suppliersRes] = await Promise.all([
        fetch('/api/chemicals'),
        fetch('/api/suppliers')
      ]);

      const chemicalsData = await chemicalsRes.json();
      const suppliersData = await suppliersRes.json();

      if (chemicalsData.success && suppliersData.success) {
        const chemicals = chemicalsData.data || [];
        const suppliers = suppliersData.data || [];
        
        setStats({
          totalChemicals: chemicals.length,
          lowStockItems: chemicals.filter((c: any) => c.status === 'low_stock' || c.status === 'out_of_stock').length,
          totalSuppliers: suppliers.length,
          pendingOrders: 0 // Will be updated when PO API is ready
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time insights and inventory statistics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Chemicals */}
          <Card>
            <div className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Chemicals</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {isLoading ? '...' : stats.totalChemicals}
                </p>
                <p className="text-sm text-gray-500 mt-1">In inventory</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </Card>

          {/* Low Stock Items */}
          <Card>
            <div className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-3xl font-bold text-warning-600 mt-2">
                  {isLoading ? '...' : stats.lowStockItems}
                </p>
                <p className="text-sm text-gray-500 mt-1">Need attention</p>
              </div>
              <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-warning-600" />
              </div>
            </div>
          </Card>

          {/* Total Suppliers */}
          <Card>
            <div className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {isLoading ? '...' : stats.totalSuppliers}
                </p>
                <p className="text-sm text-gray-500 mt-1">Active suppliers</p>
              </div>
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-success-600" />
              </div>
            </div>
          </Card>

          {/* Pending Orders */}
          <Card>
            <div className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {isLoading ? '...' : stats.pendingOrders}
                </p>
                <p className="text-sm text-gray-500 mt-1">To be fulfilled</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Coming Soon Section */}
        <Card>
          <div className="text-center py-16">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                <BarChart3 className="h-10 w-10 text-primary-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Advanced Analytics Coming Soon
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              We're working on detailed charts and insights including inventory trends, 
              consumption patterns, supplier performance, and predictive analytics.
            </p>
            <div className="flex flex-wrap gap-4 justify-center text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Inventory Trends</span>
              </div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Category Distribution</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Supplier Performance</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-4 w-4" />
                <span>Order Analytics</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="text-center py-6">
              <p className="text-sm text-gray-600 mb-2">Inventory Value</p>
              <p className="text-2xl font-bold text-gray-900">Coming Soon</p>
            </div>
          </Card>
          <Card>
            <div className="text-center py-6">
              <p className="text-sm text-gray-600 mb-2">Average Lead Time</p>
              <p className="text-2xl font-bold text-gray-900">Coming Soon</p>
            </div>
          </Card>
          <Card>
            <div className="text-center py-6">
              <p className="text-sm text-gray-600 mb-2">Reorder Rate</p>
              <p className="text-2xl font-bold text-gray-900">Coming Soon</p>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
