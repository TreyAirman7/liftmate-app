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

    let color = '';
    try {
      // Get the computed style of the root element (html)
      const computedStyle = getComputedStyle(document.documentElement);
      // Read the value of the primary color CSS variable
      // Need to trim() because getPropertyValue might return surrounding whitespace
      const primaryColorValue = computedStyle.getPropertyValue(PRIMARY_COLOR_VAR)?.trim();

      if (primaryColorValue) {
        // Convert HSL string (e.g., "173 58% 39%") to hex if necessary,
        // or ensure the variable directly holds a hex/rgb value suitable for meta tag.
        // Assuming the variable holds a value directly usable by the meta tag for now.
        // If it's HSL like in globals.css, conversion would be needed here.
        color = primaryColorValue;
      } else {
        console.warn(`CSS variable ${PRIMARY_COLOR_VAR} not found. Falling back.`);
        // Fallback colors if CSS variable isn't found
        color = resolvedTheme === 'dark' ? '#004d40' : '#00796b'; // Darker/Lighter Teal fallbacks
      }
    } catch (error) {
      console.error('Error reading theme color CSS variable:', error);
      // Fallback colors on error
      color = resolvedTheme === 'dark' ? '#004d40' : '#00796b';
    }

    // Find the theme-color meta tag
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    // Find the apple-mobile-web-app-status-bar-style meta tag
    const appleStatusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');

    // Update or create theme-color meta tag
    if (themeColorMeta instanceof HTMLMetaElement) {
      // Update existing meta tag
      if (color) {
        themeColorMeta.setAttribute('content', color);
      }
    } else {
      // If the meta tag doesn't exist or is not the correct type, create/replace it
      if (themeColorMeta) {
        themeColorMeta.remove(); // Remove incorrect element if found
      }
      const newMeta = document.createElement('meta');
      newMeta.name = 'theme-color';
      if (color) {
        newMeta.content = color;
      }
      document.getElementsByTagName('head')[0].appendChild(newMeta);
      console.warn('Theme color meta tag was missing or invalid, created/replaced dynamically.');
    }

    // Update apple-mobile-web-app-status-bar-style meta tag
    if (appleStatusBarMeta instanceof HTMLMetaElement) {
      // Set to default to allow the status bar to be colored by the app
      appleStatusBarMeta.setAttribute('content', 'default');
    }

  }, [resolvedTheme]); // Re-run effect when resolvedTheme changes

  // This component doesn't render anything itself
  return null;
}