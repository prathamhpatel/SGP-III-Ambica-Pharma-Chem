'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  AlertTriangle, 
  ShoppingCart, 
  Users, 
  Activity, 
  BarChart3, 
  Bell,
  ChevronLeft,
  ChevronRight,
  Home,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Stock Management',
    href: '/stock',
    icon: Package,
  },
  {
    title: 'Low Stock Alerts',
    href: '/alerts',
    icon: AlertTriangle,
  },
  {
    title: 'Purchase Orders',
    href: '/purchase-orders',
    icon: ShoppingCart,
  },
  {
    title: 'Suppliers',
    href: '/suppliers',
    icon: Users,
  },
  {
    title: 'Activity Logs',
    href: '/logs',
    icon: Activity,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: Bell,
  },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className={cn(
      'bg-white border-r border-gray-200 transition-all duration-300 ease-in-out',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className={cn(
          'flex items-center p-4 border-b border-gray-200',
          isCollapsed ? 'justify-center' : 'justify-between'
        )}>
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <Home className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Ambica Pharma</h1>
                <p className="text-xs text-gray-500">Inventory System</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive 
                    ? 'bg-primary-50 text-primary-700 border border-primary-200' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  isCollapsed ? 'justify-center' : 'space-x-3'
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <Icon className={cn(
                  'flex-shrink-0',
                  isCollapsed ? 'h-6 w-6' : 'h-5 w-5',
                  isActive && 'text-primary-600'
                )} />
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <Link
            href="/settings"
            className={cn(
              'flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors',
              isCollapsed ? 'justify-center' : 'space-x-3'
            )}
            title={isCollapsed ? 'Settings' : undefined}
          >
            <Settings className={cn(
              'flex-shrink-0',
              isCollapsed ? 'h-6 w-6' : 'h-5 w-5'
            )} />
            {!isCollapsed && <span>Settings</span>}
          </Link>
        </div>
      </div>
    </div>
  );
}