"use client"

import { useState, useEffect } from "react"
import { useThemeContext } from "@/components/theme-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from "recharts"
import { Black_Ops_One } from "next/font/google"
import dayjs from "dayjs"
import { prepareRegressionData, performLinearRegression, generateLimitingReturnsConfidenceRange } from "@/lib/performance-prediction"
import type { CompletedWorkout } from "@/lib/data-manager"
import type { PerformancePrediction } from "@/lib/performance-prediction"

// Initialize the font
const blackOpsOne = Black_Ops_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
})

interface PerformanceChartProps {
  selectedExercise: string
  selectedExerciseId: string
  selectedTimeframe: string
  workouts: CompletedWorkout[]
  prediction: PerformancePrediction
}

interface ChartDataPoint {
  date: string
  weight: number
  reps?: number
  isProjected?: boolean
}

export function PerformanceChart({
  selectedExercise,
  selectedExerciseId,
  selectedTimeframe,
  workouts,
  prediction,
}: PerformanceChartProps) {
  const { themeColor } = useThemeContext()
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])

  // Convert timeframe to months for data preparation
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

  // Prepare chart data when inputs change
  useEffect(() => {
    if (!selectedExerciseId || workouts.length === 0) {
      setChartData([])
      return
    }

    // Filter out future-dated workouts
    const today = dayjs().endOf('day')
    const filteredWorkouts = workouts.filter(w => dayjs(w.date).isBefore(today) || dayjs(w.date).isSame(today))

    const timeframeMonths = getTimeframeMonths(selectedTimeframe)
    
    // Get regression data points
    const regressionData = prepareRegressionData(
      selectedExerciseId,
      filteredWorkouts,
      timeframeMonths
    )
    
    if (regressionData.length === 0) {
      setChartData([])
      return
    }
    
    // Get the first workout date as reference point
    const relevantWorkouts = filteredWorkouts
      .filter(workout => workout.exercises.some(ex => ex.exerciseId === selectedExerciseId))
      .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)))
    
    if (relevantWorkouts.length === 0) {
      setChartData([])
      return
    }
    
    const firstWorkoutDate = dayjs(relevantWorkouts[0].date)
    
    // Convert regression data to chart data format
    const historicalData: ChartDataPoint[] = regressionData.map(([daysSinceFirst, oneRepMax]) => ({
      date: firstWorkoutDate.add(daysSinceFirst, 'day').format('MMM D'),
      weight: oneRepMax,
      isProjected: false
    }))
    
    // Projected data using limiting returns model (logistic/sigmoid)
    const projectedData: ChartDataPoint[] = []
    if (prediction.predictedOneRepMax > prediction.currentOneRepMax && prediction.predictedDate) {
      const lastDate = dayjs(relevantWorkouts[relevantWorkouts.length - 1].date)
      const projectionDays = 180 // Always project 6 months (180 days)
      const numPoints = 8 // Number of points for smooth curve

      for (let i = 0; i <= numPoints; i++) {
        const day = Math.round((projectionDays / numPoints) * i)
        // Limiting returns model (must match backend logic)
        const L = prediction.currentOneRepMax * 0.25
        const k = 0.03
        const x0 = 90
        const b = prediction.currentOneRepMax
        const y = L / (1 + Math.exp(-k * (day - x0))) + b
        projectedData.push({
          date: lastDate.add(day, 'day').format('MMM D'),
          weight: Math.round(y),
          isProjected: true
        })
      }
    }
    
    // Combine historical and projected data
    setChartData([...historicalData, ...projectedData])
  }, [selectedExerciseId, selectedTimeframe, workouts, prediction])

  // Generate confidence area data
  // Generate confidence area data using limiting returns model
  const generateConfidenceAreaData = () => {
    if (!prediction.predictedDate || !prediction.currentOneRepMax || !prediction.confidence) return []

    const lastDate = chartData.length > 0
      ? dayjs().add(0, 'day') // fallback
      : dayjs()

    // Use the same projectionDays as the projection
    const projectionDays = 180
    const confidencePoints = generateLimitingReturnsConfidenceRange(
      prediction.currentOneRepMax,
      projectionDays,
      prediction.confidence
    )

    // Map to chart area points (upper, then lower in reverse for area fill)
    const upperBound = confidencePoints.map(pt => ({
      date: dayjs(lastDate).add(pt.day, 'day').format('MMM D'),
      weight: Math.round(pt.upper)
    }))
    const lowerBound = confidencePoints.slice().reverse().map(pt => ({
      date: dayjs(lastDate).add(pt.day, 'day').format('MMM D'),
      weight: Math.round(pt.lower)
    }))
    return [...upperBound, ...lowerBound]
  }

  const confidenceAreaData = generateConfidenceAreaData()

  return (
    <div>
      <h2 className={`text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 ${blackOpsOne.className}`}>
        Performance Trend
      </h2>
      <Card>
        <CardContent className="p-4">
          {chartData.length > 0 ? (
            <div className="h-80 overflow-x-auto">
              <ChartContainer className="min-w-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      label={{ 
                        value: 'Weight (lbs)', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fontSize: 12 }
                      }}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <ChartTooltip>
                              <ChartTooltipContent>
                                <p className="font-medium">{payload[0].payload.date}</p>
                                <p className="text-sm text-muted-foreground">
                                  Weight: {payload[0].value} lbs
                                </p>
                                {payload[0].payload.reps && (
                                  <p className="text-sm text-muted-foreground">
                                    Reps: {payload[0].payload.reps}
                                  </p>
                                )}
                                {payload[0].payload.isProjected && (
                                  <p className="text-sm text-blue-500 dark:text-blue-400">
                                    Projected
                                  </p>
                                )}
                              </ChartTooltipContent>
                            </ChartTooltip>
                          )
                        }
                        return null
                      }}
                    />
                    
                    {/* Confidence area */}
                    {confidenceAreaData.length > 0 && (
                      <Area
                        type="monotone"
                        dataKey="weight"
                        data={confidenceAreaData}
                        fill="rgba(16, 185, 129, 0.2)"
                        stroke="none"
                      />
                    )}
                    
                    {/* Historical data line */}
                    <Line
                      type="monotone"
                      dataKey="weight"
                      data={chartData.filter(point => !point.isProjected)}
                      stroke="var(--md-primary)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    
                    {/* Projected data line */}
                    <Line
                      type="monotone"
                      dataKey="weight"
                      data={chartData.filter(point => point.isProjected)}
                      stroke="rgba(16, 185, 129, 1)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground text-sm">
                Not enough data to display performance trend
              </p>
            </div>
          )}
          
          {/* Chart legend */}
          {chartData.length > 0 && (
            <div className="flex mt-4 text-sm flex-wrap gap-4">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-primary mr-2"></div>
                <span>Historical Data</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                <span>Predicted Growth</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-200 opacity-70 mr-2"></div>
                <span>Confidence Range</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}