'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div 
              className="absolute inset-0 bg-black opacity-50"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative w-64 h-full">
              <Sidebar />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}