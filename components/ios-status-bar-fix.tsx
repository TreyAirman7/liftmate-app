'use client';

import { useEffect } from 'react';

/**
 * iOSStatusBarFix component
 * 
 * This component implements a different approach to handling the iOS status bar in standalone mode.
 * Instead of trying to style the status bar directly, it:
 * 1. Applies a full-screen gradient background to the entire document
 * 2. Ensures content is properly offset to account for the status bar
 * 3. Uses viewport units and safe-area-inset values for proper positioning
 */
export function iOSStatusBarFix() {
  useEffect(() => {
    // Only run in the browser
    if (typeof window === 'undefined') return;

    // Check if the app is running in standalone mode on iOS
    const isInStandaloneMode = () => 
      ('standalone' in window.navigator) && 
      (window.navigator['standalone'] === true);
    
    const isIOS = () => 
      /iPad|iPhone|iPod/.test(navigator.userAgent) && 
      !(window as any).MSStream;

    // Only apply the fix for iOS in standalone mode
    if (isInStandaloneMode() && isIOS()) {
      // Create a style element for our custom CSS
      const style = document.createElement('style');
      
      // Add CSS to create a full-screen gradient that extends under the status bar
      style.textContent = `
        /* Apply a full-screen gradient background to html and body */
        html, body {
          background-image: linear-gradient(to right, var(--md-primary), var(--md-primary-darker));
          background-attachment: fixed;
          background-size: 100% 100vh;
        }
        
        /* Ensure the app container is positioned correctly */
        .app-container {
          position: relative;
          margin-top: env(safe-area-inset-top);
          background-color: var(--md-background);
          min-height: calc(100vh - env(safe-area-inset-top));
          border-top-left-radius: 0;
          border-top-right-radius: 0;
        }
        
        /* Remove the fixed status bar background div since we don't need it anymore */
        #status-bar-background {
          display: none !important;
        }
        
        /* Ensure the app header doesn't have its own gradient background */
        .app-header {
          background: transparent !important;
          box-shadow: none !important;
        }
      `;
      
      // Add the style to the document head
      document.head.appendChild(style);
      
      // Add a class to the body for iOS standalone mode
      document.body.classList.add('ios-standalone-mode');
      
      // Create a function to update the gradient colors when theme changes
      const updateGradientColors = () => {
        const computedStyle = getComputedStyle(document.documentElement);
        const primaryColor = computedStyle.getPropertyValue('--md-primary').trim();
        const secondaryColor = computedStyle.getPropertyValue('--md-primary-darker').trim() || 
                              computedStyle.getPropertyValue('--md-secondary').trim();
        
        // Update the html/body background gradient
        document.documentElement.style.backgroundImage = 
          `linear-gradient(to right, ${primaryColor}, ${secondaryColor || primaryColor})`;
        document.body.style.backgroundImage = 
          `linear-gradient(to right, ${primaryColor}, ${secondaryColor || primaryColor})`;
      };
      
      // Call once on initialization
      updateGradientColors();
      
      // Set up a MutationObserver to detect theme changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class' || 
              mutation.attributeName === 'data-theme' || 
              mutation.attributeName === 'style') {
            updateGradientColors();
          }
        });
      });
      
      // Start observing the document element for class/theme changes
      observer.observe(document.documentElement, { 
        attributes: true, 
        attributeFilter: ['class', 'data-theme', 'style'] 
      });
      
      // Cleanup function
      return () => {
        document.body.classList.remove('ios-standalone-mode');
        observer.disconnect();
      };
    }
  }, []);

  // This component doesn't render anything visible
  return null;
}

export default iOSStatusBarFix;