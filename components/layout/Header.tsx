'use client';

import { useState } from 'react';
import { Bell, Search, User, LogOut, Menu } from 'lucide-react';
import { mockAlerts } from '@/lib/mockData';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  const unreadAlerts = mockAlerts.filter(alert => !alert.isRead);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search chemicals, suppliers, orders..."
              className="pl-10 pr-4 py-2 w-96 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              {unreadAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadAlerts.length > 9 ? '9+' : unreadAlerts.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                  <p className="text-xs text-gray-500">You have {unreadAlerts.length} unread alerts</p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {mockAlerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                        !alert.isRead ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          alert.severity === 'critical' ? 'bg-danger-500' :
                          alert.severity === 'high' ? 'bg-orange-500' :
                          alert.severity === 'medium' ? 'bg-warning-500' : 'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-200">
                  <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">John Doe</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
            </button>

            {/* Profile Dropdown */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">John Doe</p>
                  <p className="text-xs text-gray-500">john.doe@ambicapharma.com</p>
                </div>
                <div className="p-2">
                  <button className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </button>
                  <button className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="mt-4 md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Close dropdowns when clicking outside */}
      {(showNotifications || showProfile) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false);
            setShowProfile(false);
          }}
        />
      )}
    </header>
  );
}