"use client"

import { useState, useEffect } from "react"
import { useThemeContext } from "@/components/theme-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from "recharts"
import { generatePerformancePrediction, calculateOneRepMaxChange } from "@/lib/performance-prediction"
import type { CompletedWorkout } from "@/lib/data-manager"
import type { PerformancePrediction } from "@/lib/performance-prediction"
import { CurrentStats } from "./current-stats"
import { RepRangeTable } from "./rep-range-table"
import { PerformanceInsights } from "./performance-insights"
import { PredictionMetadata } from "./prediction-metadata"
import { PerformanceChart } from "./performance-chart"

// Font import for Black Ops One
import { Black_Ops_One } from "next/font/google"

// Initialize the font
const blackOpsOne = Black_Ops_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
})

interface PerformancePredictorProps {
  selectedExercise: string
  selectedExerciseId: string
  selectedTimeframe: string
  workouts: CompletedWorkout[]
}

export function PerformancePredictor({
  selectedExercise,
  selectedExerciseId,
  selectedTimeframe,
  workouts,
}: PerformancePredictorProps) {
  const { themeColor } = useThemeContext()
  const [prediction, setPrediction] = useState<PerformancePrediction | null>(null)
  const [oneRepMaxChange, setOneRepMaxChange] = useState<number | null>(null)

  // Convert timeframe to months for prediction
  const getTimeframeMonths = (timeframe: string): number | null => {
    switch (timeframe) {
      case "1m":
        return 1
      case "3m":
        return 3
      case "6m":
        return 6
      case "1y":
        return 12
      case "all":
        return null // null means all time
      default:
        return 3 // Default to 3 months
    }
  }

  // Generate prediction when inputs change
  useEffect(() => {
    if (!selectedExerciseId || workouts.length === 0) {
      setPrediction(null)
      setOneRepMaxChange(null)
      return
    }

    const timeframeMonths = getTimeframeMonths(selectedTimeframe)
    
    // Generate performance prediction
    const newPrediction = generatePerformancePrediction(
      selectedExerciseId,
      selectedExercise,
      workouts,
      timeframeMonths
    )
    
    setPrediction(newPrediction)
    
    // Calculate one-rep max change over the last month
    const change = calculateOneRepMaxChange(selectedExerciseId, workouts)
    setOneRepMaxChange(change)
  }, [selectedExerciseId, selectedExercise, selectedTimeframe, workouts])

  // If no prediction data is available
  if (!prediction) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className={`text-xl ${blackOpsOne.className}`}>Performance Predictor</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            {workouts.length === 0
              ? "Complete workouts to see performance predictions"
              : selectedExerciseId
              ? "Not enough data for this exercise to generate predictions"
              : "Select an exercise to view performance predictions"}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className={`text-xl ${blackOpsOne.className}`}>Performance Predictor</CardTitle>
        <p className="text-sm text-muted-foreground">
          Track your progress and see where your performance is heading
        </p>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        {/* Current and Predicted Stats */}
        <CurrentStats 
          currentOneRepMax={prediction.currentOneRepMax} 
          predictedOneRepMax={prediction.predictedOneRepMax} 
          oneRepMaxChange={oneRepMaxChange}
          predictedDate={prediction.predictedDate}
          confidence={prediction.confidence}
        />
        
        {/* Performance Chart */}
        <PerformanceChart 
          selectedExercise={selectedExercise}
          selectedTimeframe={selectedTimeframe}
          workouts={workouts}
          selectedExerciseId={selectedExerciseId}
          prediction={prediction}
        />
        
        {/* Rep Range Predictions */}
        <RepRangeTable repRangePredictions={prediction.repRangePredictions} />
        
        {/* Performance Insights */}
        <PerformanceInsights insights={prediction.insights} />
        
        {/* Prediction Metadata */}
        <PredictionMetadata metadata={prediction.metadata} />
      </CardContent>
    </Card>
  )
}