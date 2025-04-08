"use client"

import { useThemeContext } from "@/components/theme-provider"

interface LoadingIndicatorProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingIndicator({ size = "md", className = "" }: LoadingIndicatorProps) {
  const { themeColor } = useThemeContext()

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="loading-container scale-50">
        <div className="loader">
          <span className="item">
            <i className="fa-solid fa-dumbbell"></i>
          </span>
          <span className="item">
            <i className="fa-solid fa-weight-hanging"></i>
          </span>
          <span className="item">
            <i className="fa-solid fa-compact-disc"></i>
          </span>
        </div>
      </div>
    </div>
  )
}

