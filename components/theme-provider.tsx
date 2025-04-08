"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import { type ThemeColor, themeColors } from "@/lib/theme-utils"
import DataManager from "@/lib/data-manager"
import { LoadingProvider } from "@/lib/loading-context"

interface ThemeContextType {
  themeColor: ThemeColor
  setThemeColor: (theme: ThemeColor) => void
  isChangingTheme: boolean
}

const ThemeContext = createContext<ThemeContextType>({
  themeColor: "teal",
  setThemeColor: () => {},
  isChangingTheme: false,
})

export const useThemeContext = () => useContext(ThemeContext)

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [themeColor, setThemeColorState] = useState<ThemeColor>("teal")
  const [isChangingTheme, setIsChangingTheme] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Initialize theme from settings
  useEffect(() => {
    setMounted(true)
    try {
      DataManager.initializeStorage()
      const settings = DataManager.getSettings()
      if (settings && settings.theme) {
        setThemeColorState(settings.theme as ThemeColor)
        applyThemeColors(settings.theme as ThemeColor)
      } else {
        applyThemeColors("teal")
      }
    } catch (error) {
      console.error("Failed to load theme settings:", error)
      applyThemeColors("teal")
    }
  }, [])

  // Apply theme colors to CSS variables
  const applyThemeColors = (theme: ThemeColor) => {
    const colors = themeColors[theme]
    if (!colors) return

    // Convert hex to RGB for CSS variables
    const convertHexToRgbString = (hex: string) => {
      const rgb = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
      if (!rgb) return null
      return `${Number.parseInt(rgb[1], 16)}, ${Number.parseInt(rgb[2], 16)}, ${Number.parseInt(rgb[3], 16)}`
    }

    // Set CSS variables
    document.documentElement.style.setProperty("--md-primary", colors.primary)
    document.documentElement.style.setProperty("--md-primary-container", colors.primaryContainer)
    document.documentElement.style.setProperty("--md-secondary", colors.secondary)
    document.documentElement.style.setProperty("--md-secondary-container", colors.secondaryContainer)
    document.documentElement.style.setProperty("--md-tertiary", colors.tertiary)
    document.documentElement.style.setProperty("--md-tertiary-container", colors.tertiaryContainer)
    document.documentElement.style.setProperty("--md-primary-darker", colors.primaryDarker)

    // Set RGB versions for opacity operations
    const primaryRgb = convertHexToRgbString(colors.primary)
    if (primaryRgb) {
      document.documentElement.style.setProperty("--md-primary-rgb", primaryRgb)
    }

    const secondaryRgb = convertHexToRgbString(colors.secondary)
    if (secondaryRgb) {
      document.documentElement.style.setProperty("--md-secondary-rgb", secondaryRgb)
    }

    const tertiaryRgb = convertHexToRgbString(colors.tertiary)
    if (tertiaryRgb) {
      document.documentElement.style.setProperty("--md-tertiary-rgb", tertiaryRgb)
    }

    // Update Tailwind CSS variables to match theme
    document.documentElement.style.setProperty("--primary", colors.primary)
    document.documentElement.style.setProperty("--secondary", colors.secondary)
    document.documentElement.style.setProperty("--accent", colors.tertiary)
    document.documentElement.style.setProperty("--ring", colors.primary)

    // Update icon background color based on theme brightness
    const isLightTheme = isLightColor(colors.primary)
    const isDarkMode = document.documentElement.classList.contains("dark")

    let iconBgColor
    if (isDarkMode) {
      // In dark mode, light themes get darker backgrounds (less contrast)
      // Dark themes get lighter backgrounds (more contrast)
      iconBgColor = isLightTheme ? "rgba(90, 90, 90, 0.2)" : "rgba(180, 180, 180, 0.2)"
    } else {
      // In light mode, light themes get darker backgrounds (more contrast)
      // Dark themes get lighter backgrounds (more contrast)
      iconBgColor = isLightTheme ? "rgba(80, 80, 80, 0.2)" : "rgba(200, 200, 200, 0.2)"
    }

    document.documentElement.style.setProperty("--icon-bg-color", iconBgColor)
  }

  // Set theme color with transition effect
  const setThemeColor = (theme: ThemeColor) => {
    if (theme === themeColor) return

    setIsChangingTheme(true)

    // Create and append transition overlay
    const overlay = document.createElement("div")
    overlay.className = "theme-transition-overlay"
    document.body.appendChild(overlay)

    // Trigger animation
    setTimeout(() => {
      overlay.classList.add("theme-transition-active")
    }, 10)

    // Apply theme after a short delay
    setTimeout(() => {
      setThemeColorState(theme)
      applyThemeColors(theme)

      // Save to settings
      try {
        const settings = DataManager.getSettings()
        settings.theme = theme
        DataManager.saveSettings(settings)
      } catch (error) {
        console.error("Failed to save theme settings:", error)
      }

      // Remove overlay with fade out
      setTimeout(() => {
        overlay.classList.remove("theme-transition-active")
        setTimeout(() => {
          document.body.removeChild(overlay)
          setIsChangingTheme(false)
        }, 300)
      }, 300)
    }, 300)
  }

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor, isChangingTheme }}>
      <NextThemesProvider {...props}>
        <LoadingProvider>{children}</LoadingProvider>
      </NextThemesProvider>
    </ThemeContext.Provider>
  )
}

// Helper function to determine if a color is light
function isLightColor(hex: string): boolean {
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : null
  }

  const rgb = hexToRgb(hex)
  if (!rgb) return false

  // HSP (Highly Sensitive Perceptive color model) equation from https://en.wikipedia.org/wiki/HSP_color_space
  const hsp = Math.sqrt(0.299 * (rgb.r * rgb.r) + 0.587 * (rgb.g * rgb.g) + 0.114 * (rgb.b * rgb.b))

  // Adjust threshold as needed
  return hsp > 128
}

