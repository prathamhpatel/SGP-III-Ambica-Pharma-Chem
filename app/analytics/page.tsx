'use client';

import { useState, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Package,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { mockChemicals, mockPurchaseOrders, mockSuppliers } from '@/lib/mockData';
import { formatCurrency, generateReport } from '@/lib/utils';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<string>('6months');
  const [chartType, setChartType] = useState<string>('inventory');
  const [isLoading, setIsLoading] = useState(false);

  // Generate mock data for charts
  const inventoryTrendData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      totalValue: Math.floor(Math.random() * 50000) + 30000,
      totalQuantity: Math.floor(Math.random() * 1000) + 500,
      chemicals: Math.floor(Math.random() * 10) + 15,
    }));
  }, []);

  const consumptionData = useMemo(() => {
    return mockChemicals.map(chemical => ({
      name: chemical.name.substring(0, 10) + (chemical.name.length > 10 ? '...' : ''),
      consumed: Math.floor(Math.random() * 100) + 20,
      remaining: chemical.quantity,
      category: chemical.category,
    }));
  }, []);

  const categoryDistribution = useMemo(() => {
    const categories = mockChemicals.reduce((acc, chemical) => {
      acc[chemical.category] = (acc[chemical.category] || 0) + chemical.quantity;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categories).map(([category, quantity]) => ({
      name: category,
      value: quantity,
      chemicals: mockChemicals.filter(c => c.category === category).length,
    }));
  }, []);

  const supplierPerformance = useMemo(() => {
    return mockSuppliers.map(supplier => ({
      name: supplier.name.substring(0, 15) + (supplier.name.length > 15 ? '...' : ''),
      rating: supplier.rating,
      orders: supplier.totalOrders,
      onTimeDelivery: Math.floor(Math.random() * 30) + 70,
    }));
  }, []);

  const orderTrends = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      orders: Math.floor(Math.random() * 10) + 5,
      value: Math.floor(Math.random() * 20000) + 10000,
      avgOrderSize: Math.floor(Math.random() * 5000) + 2000,
    }));
  }, []);

  const stockLevels = useMemo(() => {
    return mockChemicals.map(chemical => ({
      name: chemical.name.substring(0, 12) + (chemical.name.length > 12 ? '...' : ''),
      current: chemical.quantity,
      threshold: chemical.reorderThreshold,
      optimal: chemical.reorderThreshold * 2,
      status: chemical.status,
    }));
  }, []);

  const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#f97316'];

  const handleGenerateReport = async () => {
    setIsLoading(true);
    try {
      const result = await generateReport('inventory');
      if (result.success) {
        alert(`${result.message}${result.reportUrl ? ` - ${result.reportUrl}` : ''}`);
      }
    } catch (error) {
      alert('Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  };

  const renderChart = () => {
    switch (chartType) {
      case 'inventory':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={inventoryTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Total Value']} />
              <Area type="monotone" dataKey="totalValue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'consumption':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={consumptionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="consumed" fill="#ef4444" name="Consumed" />
              <Bar dataKey="remaining" fill="#10b981" name="Remaining" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'categories':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={categoryDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} units`, 'Quantity']} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'suppliers':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={supplierPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="rating" fill="#f59e0b" name="Rating (0-5)" />
              <Bar dataKey="onTimeDelivery" fill="#10b981" name="On-time Delivery %" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'orders':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={orderTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Order Value']} />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} name="Order Value" />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'stock-levels':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={stockLevels}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="current" fill="#3b82f6" name="Current Stock" />
              <Bar dataKey="threshold" fill="#ef4444" name="Reorder Threshold" />
              <Bar dataKey="optimal" fill="#10b981" name="Optimal Level" />
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return <div className="text-center py-8 text-gray-500">Select a chart type</div>;
    }
  };

  const getChartTitle = () => {
    switch (chartType) {
      case 'inventory': return 'Inventory Value Trend';
      case 'consumption': return 'Chemical Consumption Analysis';
      case 'categories': return 'Inventory by Category';
      case 'suppliers': return 'Supplier Performance';
      case 'orders': return 'Purchase Order Trends';
      case 'stock-levels': return 'Stock Levels vs Thresholds';
      default: return 'Analytics Chart';
    }
  };

  // Key metrics
  const totalInventoryValue = mockChemicals.reduce((sum, c) => sum + (c.quantity * c.costPerUnit), 0);
  const lowStockCount = mockChemicals.filter(c => c.quantity <= c.reorderThreshold).length;
  const totalOrders = mockPurchaseOrders.length;
  const avgOrderValue = mockPurchaseOrders.reduce((sum, o) => sum + o.totalAmount, 0) / mockPurchaseOrders.length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Insights and trends for your inventory management</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleGenerateReport} isLoading={isLoading}>
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalInventoryValue)}</p>
                <p className="text-sm text-gray-600">Total Inventory Value</p>
                <p className="text-xs text-success-600">+5.2% from last month</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-warning-100 rounded-lg">
                <Package className="h-6 w-6 text-warning-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{lowStockCount}</p>
                <p className="text-sm text-gray-600">Low Stock Items</p>
                <p className="text-xs text-danger-600">Needs attention</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-xs text-blue-600">This period</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-success-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-success-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(avgOrderValue)}</p>
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-xs text-success-600">+12% increase</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Chart Controls */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="inventory">Inventory Value Trend</option>
                <option value="consumption">Consumption Analysis</option>
                <option value="categories">Category Distribution</option>
                <option value="suppliers">Supplier Performance</option>
                <option value="orders">Order Trends</option>
                <option value="stock-levels">Stock Levels</option>
              </select>
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="1month">Last 1 Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last 1 Year</option>
              </select>
            </div>

            <div className="text-sm text-gray-600 flex items-center">
              Showing data for: {timeRange.replace(/(\d+)/, '$1 ').replace(/([a-z])([A-Z])/, '$1 $2')}
            </div>
          </div>
        </Card>

        {/* Main Chart */}
        <Card title={getChartTitle()} subtitle={`Analysis for the selected time period`}>
          {renderChart()}
        </Card>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Consuming Chemicals */}
          <Card title="Top Consuming Chemicals" subtitle="Chemicals with highest usage">
            <div className="space-y-3">
              {consumptionData.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{item.consumed} units</p>
                    <p className="text-sm text-gray-600">{item.remaining} remaining</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Supplier Ratings */}
          <Card title="Supplier Ratings" subtitle="Performance metrics">
            <div className="space-y-3">
              {supplierPerformance.slice(0, 5).map((supplier, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{supplier.name}</p>
                    <p className="text-sm text-gray-600">{supplier.orders} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">⭐ {supplier.rating.toFixed(1)}</p>
                    <p className="text-sm text-gray-600">{supplier.onTimeDelivery}% on-time</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Category Breakdown */}
        <Card title="Inventory Categories" subtitle="Detailed breakdown by chemical categories">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categoryDistribution.map((category, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                </div>
                <p className="text-2xl font-bold text-gray-900">{category.value}</p>
                <p className="text-sm text-gray-600">units across {category.chemicals} chemicals</p>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      backgroundColor: COLORS[index % COLORS.length],
                      width: `${(category.value / Math.max(...categoryDistribution.map(c => c.value))) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
}