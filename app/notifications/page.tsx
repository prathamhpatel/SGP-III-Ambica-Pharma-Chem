'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { 
  Bell, 
  Settings, 
  Check, 
  X,
  Volume2,
  VolumeX,
  Mail,
  MessageSquare,
  Phone,
  Smartphone,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { mockAlerts } from '@/lib/mockData';
import { formatDateTime } from '@/lib/utils';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockAlerts);
  const [settings, setSettings] = useState({
    email: true,
    sms: false,
    push: true,
    slack: true,
    whatsapp: false,
    sound: true,
    lowStock: true,
    expiry: true,
    orders: true,
    system: false,
  });

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">
              Manage your alerts and notification preferences ({unreadCount} unread)
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notifications List */}
          <div className="lg:col-span-2 space-y-4">
            <Card title="Recent Notifications">
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900">No notifications</p>
                    <p className="text-gray-600">You're all caught up!</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 border rounded-lg transition-colors ${
                        !notification.isRead 
                          ? 'border-blue-200 bg-blue-50' 
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium text-gray-900">{notification.title}</h3>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                            <Badge variant="status" status={notification.severity}>
                              {notification.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-gray-700 mb-2">{notification.message}</p>
                          <p className="text-sm text-gray-500">
                            {formatDateTime(notification.timestamp)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.isRead && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="text-danger-600 border-danger-300 hover:bg-danger-50"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Notification Settings */}
          <div className="space-y-6">
            {/* Delivery Methods */}
            <Card title="Delivery Methods" subtitle="Choose how you want to receive notifications">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">Receive notifications via email</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSettingChange('email', !settings.email)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.email ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.email ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">SMS</p>
                      <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSettingChange('sms', !settings.sms)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.sms ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.sms ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Push Notifications</p>
                      <p className="text-sm text-gray-600">Browser notifications</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSettingChange('push', !settings.push)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.push ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.push ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Slack</p>
                      <p className="text-sm text-gray-600">Team notifications via Slack</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSettingChange('slack', !settings.slack)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.slack ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.slack ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">WhatsApp</p>
                      <p className="text-sm text-gray-600">Instant messaging alerts</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSettingChange('whatsapp', !settings.whatsapp)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.whatsapp ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.whatsapp ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </Card>

            {/* Notification Types */}
            <Card title="Notification Types" subtitle="Choose what you want to be notified about">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Low Stock Alerts</p>
                    <p className="text-sm text-gray-600">When items drop below threshold</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('lowStock', !settings.lowStock)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.lowStock ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.lowStock ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Expiry Warnings</p>
                    <p className="text-sm text-gray-600">When chemicals are expiring soon</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('expiry', !settings.expiry)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.expiry ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.expiry ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Order Updates</p>
                    <p className="text-sm text-gray-600">Purchase order status changes</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('orders', !settings.orders)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.orders ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.orders ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">System Notifications</p>
                    <p className="text-sm text-gray-600">System updates and maintenance</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('system', !settings.system)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.system ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.system ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </Card>

            {/* Sound Settings */}
            <Card title="Sound Settings" subtitle="Audio notification preferences">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {settings.sound ? (
                    <Volume2 className="h-5 w-5 text-gray-600" />
                  ) : (
                    <VolumeX className="h-5 w-5 text-gray-600" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">Sound Effects</p>
                    <p className="text-sm text-gray-600">Play sound for notifications</p>
                  </div>
                </div>
                <button
                  onClick={() => handleSettingChange('sound', !settings.sound)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.sound ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.sound ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}