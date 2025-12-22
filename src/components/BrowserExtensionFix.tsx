'use client';

import { useEffect } from 'react';

/**
 * Component to clean up browser extension attributes that cause hydration mismatches
 * This should be included in the root layout
 */
export function BrowserExtensionFix() {
  useEffect(() => {
    // Clean up common browser extension attributes that cause hydration issues
    const cleanupAttributes = () => {
      const body = document.body;
      if (body) {
        // Grammarly and other extensions commonly add these attributes
        body.removeAttribute('data-new-gr-c-s-check-loaded');
        body.removeAttribute('data-gr-ext-installed');
        body.removeAttribute('data-new-gr-c-s');
        body.removeAttribute('data-new-gr-c');
        // Add other known problematic attributes here if needed
      }
    };

    // Run immediately
    cleanupAttributes();
    
    // Run again after a short delay to catch extensions that load slowly
    const timeoutId = setTimeout(cleanupAttributes, 1000);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return null; // This component doesn't render anything
}