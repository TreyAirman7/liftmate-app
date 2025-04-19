// components/dynamic-theme-color.tsx
'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

const PRIMARY_VAR      = '--md-primary';   // colour to sample
const FALLBACK_LIGHT   = '#00796b';        // safe defaults
const FALLBACK_DARK    = '#004d40';

export function DynamicThemeColor() {
  const { resolvedTheme } = useTheme();    // 'light' | 'dark'

  useEffect(() => {
    /* 1. Read the current solid colour from CSS */
    const root  = getComputedStyle(document.documentElement);
    let colour  = root.getPropertyValue(PRIMARY_VAR).trim();
    if (!colour)
      colour = resolvedTheme === 'dark' ? FALLBACK_DARK : FALLBACK_LIGHT;

    /* 2. Locate (or create) the meta tag that matches the active scheme */
    const sel   = `meta[name="theme-color"][media="(prefers-color-scheme: ${resolvedTheme})"]`;
    let  meta   = document.querySelector(sel) as HTMLMetaElement | null;

    if (!meta) {
      meta       = document.createElement('meta');
      meta.name  = 'theme-color';
      meta.setAttribute('media', `(prefers-color-scheme: ${resolvedTheme})`);
      document.head.appendChild(meta);
    }

    /* 3. Update the solid colour so Safari re‑tints the bar */
    meta.content = colour;
  }, [resolvedTheme]);                     // runs on every theme switch

  return null;
}
