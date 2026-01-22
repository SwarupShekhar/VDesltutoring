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

    // The provided Code Edit seems to be a complete refactor of the rendering logic.
    // It introduces `cn` and `avatarVariants` which are not defined in the original code.
    // To make the change faithfully, I will apply the structure of the provided Code Edit
    // but adapt it to use the existing `classes` variable and the original fallback logic
    // if `fallback` is not directly provided.

    let content = fallback;
    if (!content && alt) {
      const names = alt.split(' ');
      content = names[0].charAt(0) + (names.length > 1 ? names[names.length - 1].charAt(0) : '');
    }

    return (
      <span
        ref={ref}
        className={classes} // Using existing 'classes' variable
        suppressHydrationWarning
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          // Using the calculated 'content' or 'U' if still empty
          <span className="flex h-full w-full items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium">
            {content || 'U'}
          </span>
        )}
      </span>
    );
  }
);

Avatar.displayName = 'Avatar';

export { Avatar };