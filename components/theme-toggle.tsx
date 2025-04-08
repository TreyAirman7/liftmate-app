"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="text-white">
        <span className="sr-only">Toggle theme</span>
        <div className="h-6 w-6 opacity-50" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="text-white"
    >
      <span className="sr-only">Toggle theme</span>
      {resolvedTheme === "dark" ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
    </Button>
  )
}

