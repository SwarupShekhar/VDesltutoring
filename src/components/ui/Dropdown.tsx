'use client';

import React, { useState, useRef, useEffect } from 'react';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
}

const Dropdown = ({ trigger, children, align = 'right' }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const getAlignmentClasses = () => {
    switch (align) {
      case 'left': return 'left-0 origin-top-left';
      case 'center': return 'left-1/2 -translate-x-1/2 origin-top';
      case 'right': default: return 'right-0 origin-top-right';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={toggleDropdown}
        // Stop propagation of touch events to prevent immediate closing via document listener
        onTouchStart={(e) => e.stopPropagation()}
        className="cursor-pointer"
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-[1000] ${getAlignmentClasses()}`}
        >
          <div className="py-1" role="menu">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

interface DropdownItemProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
  asChild?: boolean;
}

const DropdownItem = React.forwardRef<HTMLDivElement, DropdownItemProps>(
  ({ className = '', variant = 'default', asChild = false, children, ...props }, ref) => {
    const baseClasses = 'block px-4 py-2 text-sm cursor-pointer transition-colors';

    const variantClasses = {
      default: 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700',
      destructive: 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
    };

    const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

    if (asChild) {
      return (
        <div ref={ref} className={classes} role="menuitem" {...props}>
          {children}
        </div>
      );
    }

    return <div ref={ref} className={classes} role="menuitem" {...props}>{children}</div>;
  }
);

DropdownItem.displayName = 'DropdownItem';

export { Dropdown, DropdownItem };