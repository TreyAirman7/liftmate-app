"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { useThemeContext } from "@/components/theme-provider"
import { type ThemeColor, themeColors } from "@/lib/theme-utils"
import { Button } from "@/components/ui/button"
import { Palette, Moon, Sun, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Update the theme selector to use the new toast utility

// Add this import at the top
import { showSuccessToast } from "@/lib/toast"

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const { themeColor, setThemeColor, isChangingTheme } = useThemeContext()
  const [open, setOpen] = useState(false)

  // Update the handleThemeChange function
  const handleThemeChange = (newTheme: ThemeColor) => {
    setThemeColor(newTheme)
    setOpen(false)

    // Show a toast notification after the theme transition completes
    setTimeout(() => {
      showSuccessToast(`Theme changed to ${newTheme}`, { duration: 2000 })
    }, 600)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white" disabled={isChangingTheme}>
          <span className="sr-only">Change theme</span>
          <Palette className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Theme</DialogTitle>
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="py-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-medium">Mode</h3>
            <div className="flex items-center space-x-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
                className="flex items-center"
              >
                <Sun className="h-4 w-4 mr-2" />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
                className="flex items-center"
              >
                <Moon className="h-4 w-4 mr-2" />
                Dark
              </Button>
            </div>
          </div>

          <h3 className="text-sm font-medium mb-4">Theme Colors</h3>
          {/* Enhance the theme color buttons with better visual feedback */}
          <div className="grid grid-cols-5 gap-2">
            {(Object.keys(themeColors) as ThemeColor[]).map((color) => (
              <button
                key={color}
                className={`w-full aspect-square rounded-full border-2 transition-all ${
                  themeColor === color
                    ? "border-primary scale-110 shadow-md"
                    : "border-transparent hover:scale-105 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
                style={{
                  backgroundColor: themeColors[color].primary,
                  boxShadow: themeColor === color ? `0 0 10px ${themeColors[color].primary}80` : "none",
                }}
                onClick={() => handleThemeChange(color)}
                aria-label={`${color} theme`}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

