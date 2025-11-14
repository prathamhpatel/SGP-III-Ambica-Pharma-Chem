'use client';

import { useState, useMemo, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { 
  AlertTriangle, 
  Clock, 
  Package, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Filter,
  Bell,
  ExternalLink,
  MessageSquare,
  Phone,
  Mail
} from 'lucide-react';
import { formatDateTime, getAlertIcon } from '@/lib/utils';
import { Alert } from '@/types';
import { triggerReorder, notifyManager } from '@/lib/automation';
import { apiService } from '@/lib/api';
import AddAlertModal from '@/components/modals/AddAlertModal';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [showRead, setShowRead] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [syncingAlerts, setSyncingAlerts] = useState(false);

  // Fetch alerts from database
  const fetchAlerts = async () => {
    setDataLoading(true);
    try {
      const response = await apiService.getAlerts();
      if (response.success && response.data) {
        setAlerts(response.data as Alert[]);
      } else {
        console.error('Failed to fetch alerts:', response.error);
        setAlerts([]);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setAlerts([]);
    } finally {
      setDataLoading(false);
    }
  };

  // Sync alerts with current stock status
  const syncAlerts = async () => {
    setSyncingAlerts(true);
    try {
      const response = await fetch('/api/alerts/sync', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        window.alert(`Alert sync completed! ${data.data.newAlerts} new alerts created.`);
        // Refresh alerts after sync
        await fetchAlerts();
      } else {
        window.alert('Failed to sync alerts');
      }
    } catch (error) {
      console.error('Error syncing alerts:', error);
      window.alert('Failed to sync alerts');
    } finally {
      setSyncingAlerts(false);
    }
  };

  // Clean up orphaned alerts (alerts for deleted chemicals)
  const cleanupOrphanedAlerts = async () => {
    if (!window.confirm('Clean up orphaned alerts?\n\nThis will remove alerts for chemicals that no longer exist.')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.cleanupOrphanedAlerts();
      
      if (response.success) {
        const data = response as any;
        window.alert(`✅ Cleaned up ${data.deletedCount || 0} orphaned alert(s)!`);
        await fetchAlerts();
      } else {
        window.alert(`Failed to cleanup alerts: ${response.error}`);
      }
    } catch (error) {
      console.error('Error cleaning up alerts:', error);
      window.alert('Failed to cleanup alerts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete ALL alerts
  const deleteAllAlerts = async () => {
    if (!window.confirm('⚠️ DELETE ALL ALERTS?\n\nThis will permanently delete ALL alerts from the database.\n\nThis action CANNOT be undone!\n\nClick OK to proceed.')) {
      return;
    }

    // Double confirmation
    if (!window.confirm('Are you ABSOLUTELY SURE?\n\nThis will delete ALL alerts permanently!')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.deleteAllAlerts();
      
      if (response.success) {
        const data = response as any;
        window.alert(`✅ Deleted all ${data.deletedCount || 0} alert(s)!`);
        await fetchAlerts();
      } else {
        window.alert(`Failed to delete alerts: ${response.error}`);
      }
    } catch (error) {
      console.error('Error deleting all alerts:', error);
      window.alert('Failed to delete alerts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load alerts on component mount
  useEffect(() => {
    fetchAlerts();
  }, []);

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchesType = filterType === 'all' || alert.type === filterType;
      const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
      const matchesRead = showRead || !alert.isRead;
      
      return matchesType && matchesSeverity && matchesRead;
    });
  }, [alerts, filterType, filterSeverity, showRead]);

  // Group alerts by severity
  const alertsByCategory = useMemo(() => {
    const categories = {
      critical: filteredAlerts.filter(a => a.severity === 'critical'),
      high: filteredAlerts.filter(a => a.severity === 'high'),
      medium: filteredAlerts.filter(a => a.severity === 'medium'),
      low: filteredAlerts.filter(a => a.severity === 'low'),
    };
    return categories;
  }, [filteredAlerts]);

  const unreadCount = alerts.filter(a => !a.isRead).length;

  const handleMarkAsRead = async (alertId: string) => {
    try {
      const response = await apiService.markAlertAsRead(alertId);
      if (response.success) {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId ? { ...alert, isRead: true } : alert
        ));
      }
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Mark all alerts as read
      const updatePromises = alerts
        .filter(a => !a.isRead)
        .map(alert => apiService.markAlertAsRead(alert.id));
      
      await Promise.all(updatePromises);
      
      setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })));
    } catch (error) {
      console.error('Error marking all alerts as read:', error);
    }
  };

  const handleCreateAlert = async (newAlert: Omit<Alert, 'id' | 'timestamp'>) => {
    try {
      // Refresh alerts after creation
      await fetchAlerts();
    } catch (error) {
      console.error('Error refreshing alerts:', error);
    }
  };

  const handleTriggerReorder = async (alertItem: Alert) => {
    if (!alertItem.chemicalId) return;
    
    // Note: This would need to fetch chemical data from API in real implementation
    // const chemical = mockChemicals.find(c => c.id === alertItem.chemicalId);
    // if (!chemical) return;

    setIsLoading(true);
    try {
      // This would trigger reorder for the chemical in real implementation
      window.alert('Reorder functionality would be triggered here');
      handleMarkAsRead(alertItem.id);
    } catch (error) {
      window.alert('Failed to trigger reorder');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotifyManager = async (alertItem: Alert) => {
    setIsLoading(true);
    try {
      const result = await notifyManager({
        type: alertItem.type,
        title: alertItem.title,
        message: alertItem.message,
        severity: alertItem.severity,
        chemicalId: alertItem.chemicalId
      });
      
      if (result.success) {
        window.alert(`${result.message}`);
        handleMarkAsRead(alertItem.id);
      }
    } catch (error) {
      window.alert('Failed to notify manager');
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: 'border-l-danger-500 bg-danger-50',
      high: 'border-l-orange-500 bg-orange-50',
      medium: 'border-l-warning-500 bg-warning-50',
      low: 'border-l-blue-500 bg-blue-50',
    };
    return colors[severity as keyof typeof colors] || 'border-l-gray-500 bg-gray-50';
  };

  const AlertCard = ({ alert }: { alert: Alert }) => {
    return (
      <div className={`border-l-4 rounded-lg p-4 ${getSeverityColor(alert.severity)} ${
        !alert.isRead ? 'ring-2 ring-blue-200' : ''
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="flex-shrink-0">
              <span className="text-2xl">{getAlertIcon(alert.type)}</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{alert.title}</h3>
                {!alert.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
              
              <p className="text-gray-700 mb-3">{alert.message}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge variant="status" status={alert.severity}>
                    {alert.severity.toUpperCase()}
                  </Badge>
                  <Badge>
                    {alert.type.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {formatDateTime(alert.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            {!alert.isRead && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleMarkAsRead(alert.id)}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Mark Read
              </Button>
            )}
          </div>
        </div>
        
        {alert.actionRequired && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {alert.type === 'low_stock' || alert.type === 'out_of_stock' ? (
                <Button
                  size="sm"
                  onClick={() => handleTriggerReorder(alert)}
                  disabled={isLoading}
                  className="bg-warning-600 hover:bg-warning-700 text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Trigger Reorder
                </Button>
              ) : null}
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleNotifyManager(alert)}
                disabled={isLoading}
              >
                <Bell className="h-4 w-4 mr-2" />
                Notify Manager
              </Button>
              
              <Button size="sm" variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Alert Center</h1>
            <p className="text-gray-600">
              Monitor and manage critical inventory alerts ({unreadCount} unread)
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={syncAlerts}
              disabled={syncingAlerts || dataLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncingAlerts ? 'animate-spin' : ''}`} />
              {syncingAlerts ? 'Syncing...' : 'Sync Alerts'}
            </Button>
            <Button 
              variant="outline" 
              onClick={cleanupOrphanedAlerts}
              disabled={isLoading || dataLoading}
              title="Remove alerts for deleted chemicals"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cleanup
            </Button>
            <Button 
              variant="outline" 
              onClick={deleteAllAlerts}
              disabled={isLoading || dataLoading}
              className="text-red-600 border-red-600 hover:bg-red-50"
              title="Delete ALL alerts (use with caution)"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Delete All
            </Button>
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
            <Button variant="outline" onClick={() => setShowCreateModal(true)}>
              <Bell className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-danger-100 rounded-lg">
                <XCircle className="h-6 w-6 text-danger-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{alertsByCategory.critical.length}</p>
                <p className="text-sm text-gray-600">Critical Alerts</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{alertsByCategory.high.length}</p>
                <p className="text-sm text-gray-600">High Priority</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-warning-100 rounded-lg">
                <Clock className="h-6 w-6 text-warning-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{alertsByCategory.medium.length}</p>
                <p className="text-sm text-gray-600">Medium Priority</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{alertsByCategory.low.length}</p>
                <p className="text-sm text-gray-600">Low Priority</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Types</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="expiry_warning">Expiry Warning</option>
                <option value="system">System</option>
              </select>
            </div>

            <div className="relative">
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="showRead"
                checked={showRead}
                onChange={(e) => setShowRead(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="showRead" className="ml-2 text-sm text-gray-700">
                Show read alerts
              </label>
            </div>

            <div className="text-sm text-gray-600 flex items-center">
              Showing {filteredAlerts.length} alerts
            </div>
          </div>
        </Card>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <Card className="p-12 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
              <p className="text-gray-600">
                {alerts.length === 0 
                  ? "Great! No active alerts at the moment."
                  : "Try adjusting your filter criteria to see more alerts."
                }
              </p>
            </Card>
          ) : (
            filteredAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))
          )}
        </div>

        {/* Create Alert Modal */}
        <AddAlertModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateAlert}
        />
      </div>
    </Layout>
  );
}