// components/dynamic-theme-color.tsx
'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useThemeContext } from '@/components/theme-provider';
import { themeColors } from '@/lib/theme-utils'; // Import themeColors

const PRIMARY_VAR    = '--md-primary';
const FALLBACK_LIGHT = '#00796b';
const FALLBACK_DARK  = '#004d40';

export function DynamicThemeColor() {
  const { theme, resolvedTheme } = useTheme();   //  ← note `theme`
  const { themeColor } = useThemeContext();
  useEffect(() => {
    const colors = themeColors[themeColor];
    
    // Get the appropriate color based on the current theme
    const darkColor = colors ? colors.primary : FALLBACK_DARK;
    const lightColor = colors ? colors.primary : FALLBACK_LIGHT;
    
    // Update the dark mode meta tag
    let darkMeta = document.querySelector('meta[name="theme-color"][media="(prefers-color-scheme: dark)"]') as HTMLMetaElement | null;
    if (!darkMeta) {
      darkMeta = document.createElement('meta');
      darkMeta.name = 'theme-color';
      darkMeta.setAttribute('media', '(prefers-color-scheme: dark)');
      document.head.appendChild(darkMeta);
    }
    darkMeta.content = darkColor;
    
    // Update the light mode meta tag
    let lightMeta = document.querySelector('meta[name="theme-color"][media="(prefers-color-scheme: light)"]') as HTMLMetaElement | null;
    if (!lightMeta) {
      lightMeta = document.createElement('meta');
      lightMeta.name = 'theme-color';
      lightMeta.setAttribute('media', '(prefers-color-scheme: light)');
      document.head.appendChild(lightMeta);
    }
    lightMeta.content = lightColor;
    
    // Create a theme-specific meta tag without media query for the current theme
    // This ensures the status bar color updates correctly regardless of system preference
    let currentMeta = document.querySelector('meta[name="theme-color"]:not([media])') as HTMLMetaElement | null;
    if (!currentMeta) {
      currentMeta = document.createElement('meta');
      currentMeta.name = 'theme-color';
      document.head.appendChild(currentMeta);
    }
    
    // Set the color based on the actual theme being used
    currentMeta.content = resolvedTheme === 'dark' ? darkColor : lightColor;
  }, [resolvedTheme, theme, themeColor]);                   //  ← depends on BOTH

  return null;
}

