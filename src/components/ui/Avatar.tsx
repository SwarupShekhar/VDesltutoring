'use client';

import React from 'react';

interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ src, alt = '', fallback, size = 'md', className = '', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base',
    };
    
    const baseClasses = `inline-flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium`;
    const classes = `${baseClasses} ${sizeClasses[size]} ${className}`;
    
    if (src) {
      return (
        <span ref={ref} className={classes} {...props}>
          <img 
            src={src} 
            alt={alt} 
            className="h-full w-full rounded-full object-cover" 
          />
        </span>
      );
    }
    
    // Fallback to initials or icon
    let content = fallback;
    if (!content && alt) {
      const names = alt.split(' ');
      content = names[0].charAt(0) + (names.length > 1 ? names[names.length - 1].charAt(0) : '');
    }
    
    return (
      <span ref={ref} className={classes} {...props}>
        {content || 'U'}
      </span>
    );
  }
);

Avatar.displayName = 'Avatar';

export { Avatar };