// components/dynamic-theme-color.tsx
'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

const PRIMARY_VAR    = '--md-primary';
const FALLBACK_LIGHT = '#00796b';
const FALLBACK_DARK  = '#004d40';

export function DynamicThemeColor() {
  const { theme, resolvedTheme } = useTheme();   //  ← note `theme`

  useEffect(() => {
    const css = getComputedStyle(document.documentElement);
    let colour = css.getPropertyValue(PRIMARY_VAR).trim();
    if (!colour) colour = resolvedTheme === 'dark' ? FALLBACK_DARK : FALLBACK_LIGHT;

    const sel = `meta[name="theme-color"][media="(prefers-color-scheme: ${resolvedTheme})"]`;
    let meta  = document.querySelector(sel) as HTMLMetaElement | null;

    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.setAttribute('media', `(prefers-color-scheme: ${resolvedTheme})`);
      document.head.appendChild(meta);
    }

    meta.content = colour;
  }, [resolvedTheme, theme]);                   //  ← depends on BOTH

  return null;
}

