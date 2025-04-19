"use client"

import type React from "react"

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

import { useState, useEffect, useRef, useCallback } from "react"
import { Dumbbell, BarChart2, TrendingUp, Clipboard, Clock, Target, Image, Database } from "lucide-react"
import { useTheme } from "next-themes"
import WorkoutTab from "@/components/workout-tab"
import StatsTab from "@/components/stats-tab"
import ProgressTab from "@/components/progress-tab"
import ExercisesTab from "@/components/exercises-tab"
import HistoryTab from "@/components/history-tab"
import GoalsTab from "@/components/goals-tab"
import PicsTab from "@/components/pics-tab"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { ThemeSelector } from "@/components/theme-selector"
import LoadingScreen from "@/components/loading-screen"
import DataManager from "@/lib/data-manager"
import {
  startAnimationMonitoring,
  stopAnimationMonitoring,
  getOptimalAnimationSettings,
} from "@/lib/performance-monitor"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import PhotoStorage from "@/lib/photo-storage"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firestore
const db = getFirestore(app);

// Add dumbbell animation
const dumbbellAnimationStyle = `
  @keyframes lift {
    0%, 100% { transform: rotate(-8deg); }
    50% { transform: rotate(8deg); }
  }
  .animate-dumbbell {
    animation: lift 2s ease-in-out infinite;
    transform-origin: center;
  }
`

// Storage info component to display localStorage and IndexedDB usage
const StorageInfo = () => {
  const [storageData, setStorageData] = useState({
    localStorage: {
      used: "0 KB",
      total: "5 MB",
      percent: 0,
    },
    indexedDB: {
      used: "0 KB",
      total: "50 MB", // Approximate quota for most browsers
      percent: 0,
    },
  })

  useEffect(() => {
    // Calculate localStorage usage
    const calculateLocalStorageUsage = () => {
      let total = 0
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i) || ""
        const value = localStorage.getItem(key) || ""
        total += key.length + value.length
      }

      // Convert to KB
      const usedKB = (total / 1024).toFixed(2)
      // Approximate localStorage limit (5MB for most browsers)
      const totalMB = 5
      const percent = Math.min(100, (total / (totalMB * 1024 * 1024)) * 100)

      return {
        used: `${usedKB} KB`,
        total: `${totalMB} MB`,
        percent: percent,
      }
    }

    // Estimate IndexedDB usage
    const estimateIndexedDBUsage = async () => {
      try {
        // Get an estimate of IndexedDB usage by checking the photos store
        const photos = await PhotoStorage.getAllPhotos()

        // Rough estimate: each photo might be around 500KB on average
        const estimatedSize = photos.length * 500 * 1024
        const usedMB = (estimatedSize / (1024 * 1024)).toFixed(2)

        // Approximate IndexedDB limit (50MB for most browsers)
        const totalMB = 50
        const percent = Math.min(100, (estimatedSize / (totalMB * 1024 * 1024)) * 100)

        return {
          used: `${usedMB} MB`,
          total: `${totalMB} MB`,
          percent: percent,
        }
      } catch (error) {
        console.error("Error estimating IndexedDB usage:", error)
        return {
          used: "Unknown",
          total: "50 MB",
          percent: 0,
        }
      }
    }

    const updateStorageInfo = async () => {
      const localStorage = calculateLocalStorageUsage()
      const indexedDB = await estimateIndexedDBUsage()

      setStorageData({
        localStorage,
        indexedDB,
      })
    }

    updateStorageInfo()

    // Update every 5 seconds if the dropdown is open
    const interval = setInterval(updateStorageInfo, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-2 space-y-3">
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>localStorage:</span>
          <span>
            {storageData.localStorage.used} / {storageData.localStorage.total}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${storageData.localStorage.percent}%` }}></div>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>IndexedDB:</span>
          <span>
            {storageData.indexedDB.used} / {storageData.indexedDB.total}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${storageData.indexedDB.percent}%` }}></div>
        </div>
      </div>
    </div>
  )
}

// Replace the TabContent component with this improved version:
const TabContent = ({
  id,
  isActive,
  isPrevious,
  animationDirection,
  children,
}: {
  id: string
  isActive: boolean
  isPrevious: boolean
  animationDirection: "next" | "prev" | null
  children: React.ReactNode
}) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const [animationComplete, setAnimationComplete] = useState(!animationDirection)
  const [shouldRender, setShouldRender] = useState(isActive || isPrevious)

  // Effect to handle animation completion
  useEffect(() => {
    if (!contentRef.current) return

    // Reset animation complete state when animation direction changes
    if (animationDirection) {
      setAnimationComplete(false)
    }

    // Add animation end listener
    const handleAnimationEnd = () => {
      setAnimationComplete(true)

      // Clean up will-change after animation
      if (contentRef.current) {
        contentRef.current.style.willChange = "auto"
      }
    }

    contentRef.current.addEventListener("animationend", handleAnimationEnd)

    return () => {
      if (contentRef.current) {
        contentRef.current.removeEventListener("animationend", handleAnimationEnd)
      }
    }
  }, [animationDirection])

  // Effect to handle rendering logic
  useEffect(() => {
    // Always render if active or previous during animation
    if (isActive || isPrevious) {
      setShouldRender(true)
    }
    // Keep rendered if animation just completed but hide after a delay
    else if (animationComplete) {
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isActive, isPrevious, animationComplete])

  // Apply hardware acceleration before animation starts
  useEffect(() => {
    if (!contentRef.current || !animationDirection) return

    // Set will-change before animation
    contentRef.current.style.willChange = "transform, opacity"

    // Force a reflow to ensure the will-change is applied before animation
    void contentRef.current.offsetHeight
  }, [animationDirection])

  // Get the appropriate class based on state
  let className = "tab-content"

  if (isActive) {
    if (animationDirection === "next") {
      className += " slide-in-right"
    } else if (animationDirection === "prev") {
      className += " slide-in-left"
    } else {
      className += " active"
    }
  } else if (isPrevious && animationDirection) {
    if (animationDirection === "next") {
      className += " slide-out-left"
    } else {
      className += " slide-out-right"
    }
  } else {
    className += " hidden"
  }

  if (animationComplete) {
    className += " animation-complete"
  }

  // Always render the div, but conditionally render children
  return (
    <div ref={contentRef} className={className} id={`tab-${id}`} style={{ display: shouldRender ? "block" : "none" }}>
      {shouldRender ? children : null}
    </div>
  )
}

// Add the header text animation function
function setupHeaderTextAnimation() {
  try {
    // Skip animation if reduced motion is preferred
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const typingText = document.querySelector(".typing-text")
    if (!typingText) return

    // Wait for typewriter effect to complete (3 seconds after page load)
    // 1s delay + 2s typing = 3s total
    setTimeout(() => {
      // First remove cursor
      typingText.classList.add("no-cursor")

      // Wait a moment after cursor disappears, then add wiggle
      setTimeout(() => {
        typingText.classList.add("wiggle")

        // After wiggle completes, add final effects
        setTimeout(() => {
          // Remove wiggle class to avoid conflicts
          typingText.classList.remove("wiggle")

          // Add the complete animation class for growth and glow
          typingText.classList.add("animate-complete")
        }, 500)
      }, 300)
    }, 2000)

    console.log("Header text animation sequence initialized")
  } catch (error) {
    console.warn("Error setting up header text animation:", error)
  }
}

export default function LiftMatePage() {
  const [activeTab, setActiveTab] = useState("workout")
  const [previousTab, setPreviousTab] = useState<string | null>(null)
  const [animationDirection, setAnimationDirection] = useState<"next" | "prev" | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const { theme } = useTheme()
  const [userName, setUserName] = useState("Trey")

  // Add these refs and state variables at the top of the component
  const tabScrollPositionsRef = useRef<Record<string, number>>({})
  const prefersReducedMotion = useRef<boolean>(false)
  const animationDuration = useRef<number>(350) // Default animation duration in ms
  const useSimplifiedAnimations = useRef<boolean>(false)

  // Define tab order for direction detection
  const tabOrder = ["workout", "stats", "progress", "exercises", "history", "goals", "pics"]

  // Get current time of day for greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  // Initialize app and detect device capabilities
  useEffect(() => {
    let mediaQuery: MediaQueryList
    let handleReducedMotionChange: (e: MediaQueryListEvent) => void

    const initializeApp = async () => {
      try {
        // Initialize storage
        DataManager.initializeStorage()

        // Check for reduced motion preference
        mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
        prefersReducedMotion.current = mediaQuery.matches

        // Get optimal animation settings based on device capabilities
        const { duration, useSimplifiedAnimation } = getOptimalAnimationSettings()
        animationDuration.current = duration
        useSimplifiedAnimations.current = useSimplifiedAnimation

        // Apply animation duration to CSS variables
        document.documentElement.style.setProperty("--tab-animation-duration", `${duration}ms`)

        // Apply simplified animations class if needed
        if (useSimplifiedAnimation) {
          document.documentElement.classList.add("simplified-animations")
        }

        // Set mounted state immediately so the loading screen can render properly
        setMounted(true)

        // Let the loading screen animation complete naturally
        // The loading bar animation takes 4 seconds total (3.5s + 0.5s delay)
        // We'll set loading to false after that time, but the loading screen component
        // will only hide itself after the animation completes
        setTimeout(() => {
          setLoading(false)
        }, 4500) // 4.5 seconds to ensure the loading bar completes
      } catch (error) {
        console.error("Failed to initialize app:", error)
        setMounted(true)
        setLoading(false)
      }
    }

    initializeApp()

    // Set up event listeners for reduced motion preference
    mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")

    handleReducedMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches
    }

    mediaQuery.addEventListener("change", handleReducedMotionChange)

    return () => {
      mediaQuery.removeEventListener("change", handleReducedMotionChange)
    }
  }, [])

  // Initialize header text animation after component mounts
  useEffect(() => {
    if (mounted && !loading) {
      // Initialize the header text animation
      setupHeaderTextAnimation()
    }
  }, [mounted, loading])

  // Update the switchTab function to be more reliable
  const switchTab = useCallback(
    (tabId: string) => {
      if (tabId === activeTab || isAnimating) return

      // Set animating state to prevent multiple rapid transitions
      setIsAnimating(true)

      // Start performance monitoring for the animation
      startAnimationMonitoring()

      // Determine direction based on tab order
      const currentIndex = tabOrder.indexOf(activeTab)
      const newIndex = tabOrder.indexOf(tabId)
      const direction = newIndex > currentIndex ? "next" : "prev"

      // Store current scroll position before animation
      const scrollPositions = tabScrollPositionsRef.current
      scrollPositions[activeTab] = window.scrollY

      // Set animation direction and previous tab
      setAnimationDirection(direction)
      setPreviousTab(activeTab)

      // Update active tab
      setActiveTab(tabId)

      // Reset animation state after animation completes
      const animationDurationMs = animationDuration.current
      setTimeout(() => {
        setAnimationDirection(null)
        setIsAnimating(false)

        // Stop performance monitoring
        const metrics = stopAnimationMonitoring()

        // Restore scroll position if available
        if (scrollPositions[tabId] !== undefined) {
          window.scrollTo(0, scrollPositions[tabId])
        } else {
          window.scrollTo(0, 0)
        }

        // Adjust animation duration if performance was poor
        if (metrics && metrics.jankFrames / metrics.totalFrames > 0.2) {
          // If more than 20% of frames were janky, reduce animation duration
          animationDuration.current = Math.max(200, animationDuration.current - 50)
          document.documentElement.style.setProperty("--tab-animation-duration", `${animationDuration.current}ms`)

          // Enable simplified animations if performance is really bad
          if (metrics.jankFrames / metrics.totalFrames > 0.4) {
            useSimplifiedAnimations.current = true
            document.documentElement.classList.add("simplified-animations")
          }
        }
      }, animationDurationMs + 50) // Add a small buffer to ensure animation completes
    },
    [activeTab, isAnimating, tabOrder],
  )

  return (
    <>
      <style jsx global>
        {dumbbellAnimationStyle}
      </style>
      {/* Loading screen - will fade out when loading is false */}
      <LoadingScreen isLoading={loading || !mounted} />

      {mounted && (
        <div className="flex flex-col h-screen">
          {/* App Header with animated text */}
          <header className="app-header flex items-center justify-between p-4 text-white pt-[env(safe-area-inset-top)]">
            <div className="flex items-center gap-2">
              <div className="h-12 w-12 flex items-center justify-center" aria-label="LiftMate">
                <div className="w-[40px] h-[40px] flex items-center justify-between relative animate-[rotateDumbbell_2s_infinite_linear,bobDumbbell_1.8s_infinite_ease-in-out]">
                  <div className="absolute w-[20px] h-[5px] bg-white rounded-md left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[-1]"></div>
                  <div className="w-[15px] h-[15px] bg-white rounded-lg shadow-md animate-[glowWeight_2s_infinite_ease-in-out] animation-delay-[0.2s]"></div>
                  <div className="w-[15px] h-[15px] bg-white rounded-lg shadow-md animate-[glowWeight_2s_infinite_ease-in-out] animation-delay-[0.4s]"></div>
                </div>
              </div>
              <h1 className="text-2xl font-bold">
                <span className="typing-text !text-white">LiftMate</span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeSelector />
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white">
                    <span className="sr-only">Storage Info</span>
                    <Database className="h-6 w-6 text-white" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Storage Usage</DropdownMenuLabel>
                  <StorageInfo />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content - Optimized with TabContent component */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto relative">
            {/* Each tab content is absolutely positioned for smooth transitions */}
            <TabContent
              id="workout"
              isActive={activeTab === "workout"}
              isPrevious={previousTab === "workout"}
              animationDirection={animationDirection}
            >
              <WorkoutTab userName={userName} greeting={getGreeting()} />
            </TabContent>

            <TabContent
              id="stats"
              isActive={activeTab === "stats"}
              isPrevious={previousTab === "stats"}
              animationDirection={animationDirection}
            >
              <StatsTab />
            </TabContent>

            <TabContent
              id="progress"
              isActive={activeTab === "progress"}
              isPrevious={previousTab === "progress"}
              animationDirection={animationDirection}
            >
              <ProgressTab />
            </TabContent>

            <TabContent
              id="exercises"
              isActive={activeTab === "exercises"}
              isPrevious={previousTab === "exercises"}
              animationDirection={animationDirection}
            >
              <ExercisesTab />
            </TabContent>

            <TabContent
              id="history"
              isActive={activeTab === "history"}
              isPrevious={previousTab === "history"}
              animationDirection={animationDirection}
            >
              <HistoryTab />
            </TabContent>

            <TabContent
              id="goals"
              isActive={activeTab === "goals"}
              isPrevious={previousTab === "goals"}
              animationDirection={animationDirection}
            >
              <GoalsTab />
            </TabContent>

            <TabContent
              id="pics"
              isActive={activeTab === "pics"}
              isPrevious={previousTab === "pics"}
              animationDirection={animationDirection}
            >
              <PicsTab />
            </TabContent>
          </main>

          {/* Bottom Navigation */}
          <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-7 border-t border-border bg-background pb-[calc(2*env(safe-area-inset-bottom))]">
            {[
              { id: "workout", icon: <Dumbbell className="h-7 w-7" />, label: "Workout" },
              { id: "stats", icon: <BarChart2 className="h-7 w-7" />, label: "Stats" },
              { id: "progress", icon: <TrendingUp className="h-7 w-7" />, label: "Progress" },
              { id: "exercises", icon: <Clipboard className="h-7 w-7" />, label: "Exercises" },
              { id: "history", icon: <Clock className="h-7 w-7" />, label: "History" },
              { id: "goals", icon: <Target className="h-7 w-7" />, label: "Goals" },
              { id: "pics", icon: <Image className="h-7 w-7" />, label: "Pics" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className={`flex flex-col items-center justify-center py-6 relative transition-colors ${
                  activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
                disabled={isAnimating}
                aria-label={`Switch to ${tab.label} tab`}
                aria-current={activeTab === tab.id ? "page" : undefined}
              >
                {activeTab === tab.id && <div className="absolute top-0 w-10 h-1 bg-primary rounded-full"></div>}
                {tab.icon}
                {/* Removed text label for icon-only nav */}
              </button>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}

