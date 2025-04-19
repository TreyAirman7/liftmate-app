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
    let colour = colors ? colors.primary : (resolvedTheme === 'dark' ? FALLBACK_DARK : FALLBACK_LIGHT);

    const sel = `meta[name="theme-color"][media="(prefers-color-scheme: ${resolvedTheme})"]`;
    let meta  = document.querySelector(sel) as HTMLMetaElement | null;

    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.setAttribute('media', `(prefers-color-scheme: ${resolvedTheme})`);
      document.head.appendChild(meta);
    }

    meta.content = colour;
  }, [resolvedTheme, theme, themeColor]);                   //  ← depends on BOTH

  return null;
}

