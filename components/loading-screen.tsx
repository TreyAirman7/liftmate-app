"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion" // Import motion
import { useThemeContext } from "@/components/theme-provider"
interface LoadingScreenProps {
  isLoading?: boolean
}

export default function LoadingScreen({ isLoading = true }: LoadingScreenProps) {
  const [visible, setVisible] = useState(isLoading)
  const [barAnimationComplete, setBarAnimationComplete] = useState(false)
  const loadingBarRef = useRef<HTMLDivElement>(null)
  const { themeColor } = useThemeContext()

  // Handle loading bar animation completion
  useEffect(() => {
    if (!loadingBarRef.current) return

    const handleAnimationEnd = () => {
      // Set a small delay after the bar fills to allow users to see the completed state
      setTimeout(() => {
        setBarAnimationComplete(true)
      }, 300)
    }

    loadingBarRef.current.addEventListener("animationend", handleAnimationEnd)

    return () => {
      if (loadingBarRef.current) {
        loadingBarRef.current.removeEventListener("animationend", handleAnimationEnd)
      }
    }
  }, [])

  // Only hide the loading screen when both conditions are met:
  // 1. The parent component signals loading is complete (isLoading = false)
  // 2. The loading bar animation has completed
  useEffect(() => {
    if (!isLoading && barAnimationComplete) {
      // Add a small delay before hiding to ensure smooth transition
      const timer = setTimeout(() => {
        setVisible(false)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [isLoading, barAnimationComplete])

  // If not visible, don't render anything
  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-50`}
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        marginTop: "calc(env(safe-area-inset-top, 0px) * -1)",
        height: "calc(100vh + env(safe-area-inset-top, 0px) + env(safe-area-inset-bottom, 0px))",
      }}
    >
      {/* Gradient background with bokeh effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-700 bg-[length:400%_400%] animate-[gradientBG_12s_ease_infinite]">
        {/* Bokeh shapes */}
        <div className="absolute w-[300px] h-[300px] rounded-full blur-[40px] opacity-20 bg-blue-400 top-[10%] left-[15%] animate-[driftFade_22s_infinite_linear_alternate] -animation-delay-[5s]"></div>
        <div className="absolute w-[200px] h-[200px] rounded-full blur-[40px] opacity-20 bg-purple-400 bottom-[15%] right-[20%] animate-[driftFade_19s_infinite_linear_alternate] -animation-delay-[2s]"></div>
        <div className="absolute w-[150px] h-[150px] rounded-full blur-[40px] opacity-15 bg-yellow-400 top-[40%] right-[30%] animate-[driftFade_25s_infinite_linear_alternate] -animation-delay-[10s]"></div>
        <div className="absolute w-[250px] h-[250px] rounded-full blur-[40px] opacity-[0.18] bg-emerald-400 bottom-[30%] left-[25%] animate-[driftFade_18s_infinite_linear_alternate] -animation-delay-[8s]"></div>
      </div>

      {/* Content container */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-8">
        {/* Title */}
        <h1 className="text-5xl font-bold mb-6 tracking-tight opacity-0 animate-[fadeInScaleUp_1.5s_ease-out_forwards] font-['Black_Ops_One'] !text-white">
          LiftMate
        </h1>

        {/* Dumbbell loader - Enhanced with Framer Motion */}
        <motion.div
          className="w-[100px] h-[40px] my-6 mx-auto flex items-center justify-between relative"
          animate={{
            rotate: [0, 15, 0], // Corresponds to rotateDumbbell
            y: [0, -5, 0],      // Corresponds to bobDumbbell
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            y: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <div className="absolute w-[40px] h-[10px] bg-gray-500 rounded-md left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[-1]"></div>
          {/* Keep CSS animation for glow for simplicity, or could be moved to motion */}
          <div className="w-[40px] h-[40px] bg-gray-600 rounded-lg shadow-md animate-[glowWeight_2s_infinite_ease-in-out] animation-delay-[0.2s]"></div>
          <div className="w-[40px] h-[40px] bg-gray-600 rounded-lg shadow-md animate-[glowWeight_2s_infinite_ease-in-out] animation-delay-[0.4s]"></div>
        </motion.div>

        {/* Loading bar */}
        <div className="w-[60%] max-w-[300px] h-[10px] bg-black/30 rounded-md my-6 mx-auto overflow-hidden relative">
          <div
            ref={loadingBarRef}
            className="h-full rounded-md animate-[fillBar_3.5s_linear_forwards] animation-delay-[0.5s]"
            style={{
              width: "0%",
              backgroundColor: `var(--md-primary)`,
            }}
          ></div>
        </div>

        {/* Loading text */}
        <div className="text-lg text-gray-100 opacity-0 animate-[fadeIn_2s_ease-in_forwards] font-['Inter']">
          Loading your progress
          <span className="inline-block opacity-0 animate-[loadingDots_1.4s_infinite]">.</span>
          <span className="inline-block opacity-0 animate-[loadingDots_1.4s_infinite] animation-delay-[0.2s]">.</span>
          <span className="inline-block opacity-0 animate-[loadingDots_1.4s_infinite] animation-delay-[0.4s]">.</span>
        </div>
      </div>
    </div>
  )
}

