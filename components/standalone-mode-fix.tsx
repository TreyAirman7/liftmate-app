'use client';

import { useEffect } from 'react';

/**
 * StandaloneModeFix component
 * 
 * This component handles various fixes for iOS standalone mode (when added to home screen):
 * 1. Prevents links from opening in Safari, keeping the app in standalone mode
 * 2. Handles the status bar appearance and safe areas properly
 * 3. Adds proper viewport handling for notched devices
 */
export function StandaloneModeFix() {
  useEffect(() => {
    // Only run in the browser
    if (typeof window === 'undefined') return;

    // Check if the app is running in standalone mode (added to home screen)
    const isInStandaloneMode = () => 
      ('standalone' in window.navigator) && 
      (window.navigator['standalone'] === true);

    // If we're in standalone mode, handle links to keep them in the app
    if (isInStandaloneMode()) {
      // Handle all link clicks
      document.addEventListener('click', (event) => {
        // Find the closest anchor element
        let target = event.target as HTMLElement;
        let anchor: HTMLAnchorElement | null = null;
        
        // Traverse up to find the closest anchor
        while (target && target !== document.body) {
          if (target.tagName === 'A') {
            anchor = target as HTMLAnchorElement;
            break;
          }
          target = target.parentElement as HTMLElement;
        }

        // If we found an anchor and it has an href
        if (anchor && anchor.href) {
          // Check if it's an internal link (same origin)
          const isSameOrigin = anchor.href.startsWith(window.location.origin) || 
                              anchor.href.startsWith('/') ||
                              !anchor.href.startsWith('http');
          
          // If it's an internal link, prevent default and handle navigation
          if (isSameOrigin && !anchor.hasAttribute('data-standalone-ignore')) {
            event.preventDefault();
            
            // Use Next.js router or window.location for navigation
            window.location.href = anchor.href;
          } else if (!anchor.hasAttribute('target') && !anchor.hasAttribute('data-standalone-ignore')) {
            // For external links, open in a new tab unless they have a target or data-standalone-ignore
            event.preventDefault();
            window.open(anchor.href, '_blank');
          }
        }
      });

      // Add a class to the body for standalone mode specific styling
      document.body.classList.add('standalone-mode');

      // Apply status bar styling
      applyStatusBarStyling();
    }

    // Apply status bar styling for iOS devices
    function applyStatusBarStyling() {
      // Create a style element for dynamic CSS
      const style = document.createElement('style');
      
      // Add CSS to handle the status bar and safe areas
      style.textContent = `
        /* Status bar styling for iOS standalone mode */
        body.standalone-mode {
          /* Only add padding for side and bottom safe areas, not top */
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);
          padding-bottom: env(safe-area-inset-bottom);
        }

        /* Remove any existing status bar styling that might conflict */
        body.standalone-mode::before {
          display: none !important;
        }

        /* Ensure the app container accounts for safe areas, but not top to allow header to extend */
        .app-container {
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);
          padding-bottom: env(safe-area-inset-bottom);
        }

        /* Adjust bottom navigation for safe area */
        nav.fixed-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `;

      // Add the style to the document head
      document.head.appendChild(style);
    }

    // Cleanup function
    return () => {
      // Remove the standalone-mode class if component unmounts
      document.body.classList.remove('standalone-mode');
    };
  }, []);

  // This component doesn't render anything visible
  return null;
}

export default StandaloneModeFix;