import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'default', ...props }, ref) => {
    const baseClasses = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
    
    const variantClasses = {
      default: 'border-transparent bg-primary text-primary-foreground',
      secondary: 'border-transparent bg-secondary text-secondary-foreground',
      destructive: 'border-transparent bg-destructive text-destructive-foreground',
      outline: 'text-foreground',
    };
    
    const statusVariantMap: Record<string, string> = {
      'SCHEDULED': 'secondary',
      'LIVE': 'default',
      'COMPLETED': 'default',
      'NO_SHOW': 'destructive',
      'CANCELLED': 'destructive',
    };
    
    // If variant is 'default' but we have a status-like string, use the mapped variant
    let finalVariant = variant;
    if (variant === 'default' && props.children && typeof props.children === 'string') {
      const childStr = props.children.toUpperCase();
      if (childStr in statusVariantMap) {
        finalVariant = statusVariantMap[childStr] as 'default' | 'secondary' | 'destructive' | 'outline';
      }
    }
    
    const classes = `${baseClasses} ${variantClasses[finalVariant]} ${className}`;
    
    return <span ref={ref} className={classes} {...props} />;
  }
);

Badge.displayName = 'Badge';

export { Badge };