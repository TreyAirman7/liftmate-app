'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

// The CSS variable name for the primary theme color used in the header
const PRIMARY_COLOR_VAR = '--md-primary';

export function DynamicThemeColor() {
  const { resolvedTheme } = useTheme(); // Use resolvedTheme to handle 'system'

  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window === 'undefined' || !resolvedTheme) {
      return;
    }

    let primaryColor = '';
    let secondaryColor = '';
    
    try {
      // Get the computed style of the root element (html)
      const computedStyle = getComputedStyle(document.documentElement);
      
      // Read the value of the primary and secondary color CSS variables
      // Need to trim() because getPropertyValue might return surrounding whitespace
      const primaryColorValue = computedStyle.getPropertyValue(PRIMARY_COLOR_VAR)?.trim();
      const secondaryColorValue = computedStyle.getPropertyValue('--md-primary-darker')?.trim() ||
                                 computedStyle.getPropertyValue('--md-secondary')?.trim();

      if (primaryColorValue) {
        primaryColor = primaryColorValue;
        // If we have a primary color but no secondary, derive a slightly darker version
        secondaryColor = secondaryColorValue || darkenColor(primaryColorValue);
      } else {
        console.warn(`CSS variable ${PRIMARY_COLOR_VAR} not found. Falling back.`);
        // Fallback colors if CSS variables aren't found
        primaryColor = resolvedTheme === 'dark' ? '#004d40' : '#00796b'; // Darker/Lighter Teal fallbacks
        secondaryColor = resolvedTheme === 'dark' ? '#00251a' : '#004d40'; // Even darker versions
      }
    } catch (error) {
      console.error('Error reading theme color CSS variables:', error);
      // Fallback colors on error
      primaryColor = resolvedTheme === 'dark' ? '#004d40' : '#00796b';
      secondaryColor = resolvedTheme === 'dark' ? '#00251a' : '#004d40';
    }
    
    // Helper function to darken a color by approximately 20%
    function darkenColor(color: string): string {
      // Simple implementation for common color formats
      if (color.startsWith('#')) {
        // Hex color
        return color; // For simplicity, return the same color for now
      } else if (color.startsWith('rgb')) {
        // RGB color
        return color; // For simplicity, return the same color for now
      } else {
        // Assume HSL or other format, return a fallback
        return resolvedTheme === 'dark' ? '#00251a' : '#004d40';
      }
    }

    // Find the theme-color meta tag
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');

    // Update or create theme-color meta tag for browser tab color
    if (themeColorMeta instanceof HTMLMetaElement) {
      // Update existing meta tag
      themeColorMeta.setAttribute('content', primaryColor);
    } else {
      // If the meta tag doesn't exist or is not the correct type, create/replace it
      if (themeColorMeta) {
        themeColorMeta.remove(); // Remove incorrect element if found
      }
      const newMeta = document.createElement('meta');
      newMeta.name = 'theme-color';
      newMeta.content = primaryColor;
      document.getElementsByTagName('head')[0].appendChild(newMeta);
      console.warn('Theme color meta tag was missing or invalid, created/replaced dynamically.');
    }
    
    // Note: Status bar styling for iOS is now handled by the iOSStatusBarFix component

  }, [resolvedTheme]); // Re-run effect when resolvedTheme changes

  // This component doesn't render anything itself
  return null;
}