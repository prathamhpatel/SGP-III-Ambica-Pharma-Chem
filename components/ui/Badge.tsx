import { ReactNode } from 'react';
import { cn, getStatusColor } from '@/lib/utils';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'status';
  status?: string;
  className?: string;
}

export default function Badge({ children, variant = 'default', status, className }: BadgeProps) {
  if (variant === 'status' && status) {
    return (
      <span className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        getStatusColor(status),
        className
      )}>
        {children}
      </span>
    );
  }

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800',
      className
    )}>
      {children}
    </span>
  );
}