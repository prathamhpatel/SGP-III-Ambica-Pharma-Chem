import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    active: 'bg-success-100 text-success-600',
    inactive: 'bg-gray-100 text-gray-600',
    pending: 'bg-warning-100 text-warning-600',
    approved: 'bg-primary-100 text-primary-600',
    shipped: 'bg-blue-100 text-blue-600',
    delivered: 'bg-success-100 text-success-600',
    cancelled: 'bg-danger-100 text-danger-600',
    low_stock: 'bg-warning-100 text-warning-600',
    out_of_stock: 'bg-danger-100 text-danger-600',
    expired: 'bg-red-100 text-red-600',
    critical: 'bg-danger-100 text-danger-600',
    high: 'bg-orange-100 text-orange-600',
    medium: 'bg-warning-100 text-warning-600',
    low: 'bg-yellow-100 text-yellow-600',
    info: 'bg-blue-100 text-blue-600',
    success: 'bg-success-100 text-success-600',
    warning: 'bg-warning-100 text-warning-600',
    error: 'bg-danger-100 text-danger-600',
  };

  return statusColors[status] || 'bg-gray-100 text-gray-600';
}

export function getAlertIcon(type: string): string {
  const alertIcons: Record<string, string> = {
    low_stock: '⚠️',
    out_of_stock: '🚨',
    expiry_warning: '⏰',
    system: '🔧',
  };

  return alertIcons[type] || '📢';
}

export function calculateDaysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function isExpiringSoon(expiryDate: string, warningDays: number = 90): boolean {
  const daysUntilExpiry = calculateDaysUntilExpiry(expiryDate);
  return daysUntilExpiry <= warningDays && daysUntilExpiry > 0;
}

export function isExpired(expiryDate: string): boolean {
  return calculateDaysUntilExpiry(expiryDate) <= 0;
}

export function generateReportName(type: string): string {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  return `${type}-report-${dateStr}.pdf`;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function exportToCSV(data: any[], filename: string): void {
  if (!data.length) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}