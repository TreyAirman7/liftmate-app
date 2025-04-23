"use client"

import { useEffect, useRef } from "react"
import { motion, animate } from "framer-motion"
import { Card } from "@/components/ui/card"
import { ArrowUp, ArrowDown, Calendar, BarChart3 } from "lucide-react"
import dayjs from "dayjs"

interface CurrentStatsProps {
  currentOneRepMax: number
  predictedOneRepMax: number
  oneRepMaxChange: number | null
  predictedDate: string | null
  confidence: number
}

// Animated counter component
interface AnimatedCounterProps {
  value: number
  formatOptions?: Intl.NumberFormatOptions
  className?: string
}

function AnimatedCounter({ value, formatOptions, className }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const controls = animate(0, value, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate(latest) {
        node.textContent = latest.toLocaleString(undefined, formatOptions)
      },
    })

    controls.play()

    return () => controls.stop()
  }, [value, formatOptions])

  return <span ref={ref} className={className}>{value.toLocaleString(undefined, formatOptions)}</span>
}

export function CurrentStats({
  currentOneRepMax,
  predictedOneRepMax,
  oneRepMaxChange,
  predictedDate,
  confidence,
}: CurrentStatsProps) {
  // Format the predicted date
  const formattedDate = predictedDate 
    ? dayjs(predictedDate).format("MMM D, YYYY")
    : "Not enough data"

  // Calculate confidence percentage
  const confidencePercentage = Math.round(confidence * 100)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Current 1RM */}
      <Card className="bg-gray-100 dark:bg-gray-800 p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-gray-700 dark:text-gray-300">Current 1RM</h3>
          <div className="text-xl font-bold">
            <AnimatedCounter value={currentOneRepMax} /> <span className="text-sm font-normal text-gray-500 dark:text-gray-400">lbs</span>
          </div>
        </div>
        <div className={`flex items-center text-sm ${oneRepMaxChange && oneRepMaxChange > 0 ? 'text-green-600 dark:text-green-400' : oneRepMaxChange && oneRepMaxChange < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {oneRepMaxChange ? (
            <>
              {oneRepMaxChange > 0 ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
              <span>{oneRepMaxChange > 0 ? '+' : ''}{oneRepMaxChange} lbs from last month</span>
            </>
          ) : (
            <span>No previous data for comparison</span>
          )}
        </div>
      </Card>
      
      {/* Predicted 1RM */}
      <Card className="bg-gray-100 dark:bg-gray-800 p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-gray-700 dark:text-gray-300">Predicted 1RM</h3>
          <div className="text-xl font-bold">
            <AnimatedCounter value={predictedOneRepMax} /> <span className="text-sm font-normal text-gray-500 dark:text-gray-400">lbs</span>
          </div>
        </div>
        <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Expected by {formattedDate}</span>
        </div>
      </Card>
      
      {/* Confidence Level */}
      <Card className="bg-gray-100 dark:bg-gray-800 p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-gray-700 dark:text-gray-300">Confidence Level</h3>
          <div className="text-xl font-bold">
            <AnimatedCounter value={confidencePercentage} /><span className="text-sm font-normal text-gray-500 dark:text-gray-400">%</span>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <BarChart3 className="h-4 w-4 mr-1" />
          <span>Based on workout history</span>
        </div>
      </Card>
    </div>
  )
}