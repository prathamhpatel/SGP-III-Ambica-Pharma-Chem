import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function Card({ children, className, title, subtitle, action }: CardProps) {
  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200', className)}>
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={cn(title || subtitle || action ? 'p-6' : 'p-0')}>
        {children}
      </div>
    </div>
  );
}

export function StatCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon, 
  className 
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className={cn(
              'text-sm mt-2',
              changeType === 'positive' && 'text-success-600',
              changeType === 'negative' && 'text-danger-600',
              changeType === 'neutral' && 'text-gray-600'
            )}>
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-primary-50 rounded-lg">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}