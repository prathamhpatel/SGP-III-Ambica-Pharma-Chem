'use client';

import { useState, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { 
  Activity, 
  Search, 
  Filter, 
  Download, 
  Calendar,
  User,
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
  Settings,
  RefreshCw,
  FileText
} from 'lucide-react';
import { formatDateTime, exportToCSV } from '@/lib/utils';
import { ActivityLog } from '@/types';
import AddActivityLogModal from '@/components/modals/AddActivityLogModal';

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           log.user.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
      const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
      const matchesUser = userFilter === 'all' || log.user === userFilter;
      
      let matchesDate = true;
      if (dateRange !== 'all') {
        const logDate = new Date(log.timestamp);
        const now = new Date();
        const daysAgo = parseInt(dateRange);
        const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
        matchesDate = logDate >= cutoffDate;
      }
      
      return matchesSearch && matchesCategory && matchesSeverity && matchesUser && matchesDate;
    });
  }, [logs, searchTerm, categoryFilter, severityFilter, userFilter, dateRange]);

  // Get unique users for filter
  const users = useMemo(() => {
    const uniqueUsers = [...new Set(logs.map(log => log.user))];
    return uniqueUsers.sort();
  }, [logs]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = logs.length;
    const today = logs.filter(log => {
      const logDate = new Date(log.timestamp);
      const today = new Date();
      return logDate.toDateString() === today.toDateString();
    }).length;
    const errors = logs.filter(log => log.severity === 'error').length;
    const warnings = logs.filter(log => log.severity === 'warning').length;
    
    return { total, today, errors, warnings };
  }, [logs]);

  const handleExport = () => {
    exportToCSV(filteredLogs, `activity-logs-${Date.now()}.csv`);
  };

  const handleCreateActivityLog = (newLog: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const activityLog: ActivityLog = {
      ...newLog,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    setLogs(prev => [activityLog, ...prev]);
    alert(`Activity log "${activityLog.action}" created successfully!`);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'stock_update': return <Package className="h-4 w-4" />;
      case 'purchase_order': return <ShoppingCart className="h-4 w-4" />;
      case 'supplier': return <Users className="h-4 w-4" />;
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-danger-600 bg-danger-50';
      case 'warning': return 'text-warning-600 bg-warning-50';
      case 'success': return 'text-success-600 bg-success-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
            <p className="text-gray-600">Track all system activities and user actions</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Activity className="h-4 w-4 mr-2" />
              Add Log Entry
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Activity className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Activities</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{stats.today}</p>
                <p className="text-sm text-gray-600">Today's Activities</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-danger-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-danger-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{stats.errors}</p>
                <p className="text-sm text-gray-600">Errors</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-warning-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-warning-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{stats.warnings}</p>
                <p className="text-sm text-gray-600">Warnings</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Categories</option>
                <option value="stock_update">Stock Updates</option>
                <option value="purchase_order">Purchase Orders</option>
                <option value="supplier">Suppliers</option>
                <option value="alert">Alerts</option>
                <option value="system">System</option>
              </select>
            </div>

            <div className="relative">
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Severities</option>
                <option value="error">Error</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
                <option value="info">Info</option>
              </select>
            </div>

            <div className="relative">
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Users</option>
                {users.map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Time</option>
                <option value="1">Last 24 hours</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredLogs.length} of {logs.length} activities
          </div>
        </Card>

        {/* Activity Logs */}
        <Card>
          <div className="space-y-4">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900">No activities found</p>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className={`p-2 rounded-lg ${getSeverityColor(log.severity)}`}>
                      {getCategoryIcon(log.category)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{log.action}</h3>
                        <div className="flex items-center space-x-3">
                          <Badge variant="status" status={log.severity}>
                            {log.severity.toUpperCase()}
                          </Badge>
                          <Badge>
                            {log.category.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{log.details}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{log.user}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDateTime(log.timestamp)}</span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">ID: {log.id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Create Activity Log Modal */}
        <AddActivityLogModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateActivityLog}
        />
      </div>
    </Layout>
  );
}