"use client"

import { useState, useEffect, useRef } from "react" // Combined imports
import { motion, animate } from "framer-motion"
import { BarChart2, PieChart, TrendingUp, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CompletedWorkout } from "@/lib/data-manager"
import DataManager from "@/lib/data-manager"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import MuscleHeatmap from "@/components/muscle-heatmap"
import OneRepMaxCard from "@/components/one-rep-max-card"
import { useWorkouts } from "@/lib/workout-context"

// Animated Counter Component (Moved to module scope)
interface AnimatedCounterProps {
  value: number
  formatOptions?: Intl.NumberFormatOptions
}

function AnimatedCounter({ value, formatOptions }: AnimatedCounterProps) {
  const ref = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const controls = animate(0, value, {
      duration: 0.8, // Adjust duration as needed
      ease: "easeOut",
      onUpdate(latest) {
        // Ensure node.textContent is updated correctly
        node.textContent = latest.toLocaleString(undefined, formatOptions)
      },
    })

    // Start animation when value changes
    // No need to explicitly call play() here, animate starts automatically

    return () => controls.stop()
  }, [value, formatOptions]) // Dependency array includes value and formatOptions

  // Render initial value (or 0) to avoid layout shift and ensure hydration match
  // Use the value directly for initial render to prevent hydration mismatch
  return <p ref={ref} className="text-4xl font-bold text-primary">{value.toLocaleString(undefined, formatOptions)}</p>
}

function calculateTotalVolume(workout: CompletedWorkout): number {
  return workout.exercises.reduce((total, exercise) => {
    return (
      total +
      exercise.sets.reduce((exerciseTotal, set) => {
        return exerciseTotal + set.weight * set.reps
      }, 0)
    )
  }, 0)
}


export default function StatsTab() { // Added export default back
  const { workouts } = useWorkouts()
  const [timeRange, setTimeRange] = useState("all")
  const [volumeData, setVolumeData] = useState<any[]>([])
  const [muscleDistribution, setMuscleDistribution] = useState<{ [key: string]: number }>({})

  // Process data for charts when workouts change
  useEffect(() => {
    if (workouts.length === 0) return

    // Filter workouts based on time range
    let filteredWorkouts = [...workouts]

    if (timeRange !== "all") {
      const now = new Date()
      const cutoffDate = new Date()

      if (timeRange === "week") {
        cutoffDate.setDate(now.getDate() - 7)
      } else if (timeRange === "month") {
        cutoffDate.setMonth(now.getMonth() - 1)
      } else if (timeRange === "3months") {
        cutoffDate.setMonth(now.getMonth() - 3)
      } else if (timeRange === "6months") {
        cutoffDate.setMonth(now.getMonth() - 6)
      }

      filteredWorkouts = workouts.filter((w) => new Date(w.date) >= cutoffDate)
    }

    // Process volume data
    const volumeByDate: { [key: string]: number } = {}

    filteredWorkouts.forEach((workout) => {
      const date = new Date(workout.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      const volume = calculateTotalVolume(workout)

      if (volumeByDate[date]) {
        volumeByDate[date] += volume
      } else {
        volumeByDate[date] = volume
      }
    })

    const volumeChartData = Object.keys(volumeByDate).map((date) => ({
      date,
      volume: volumeByDate[date],
    }))

    setVolumeData(volumeChartData)

    // Process muscle distribution
    const muscleCount: { [key: string]: number } = {}

    // Get exercises data
    const exercises = DataManager.getExercises()

    filteredWorkouts.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        // Find the exercise in our exercise library to get muscle groups
        const exerciseData = exercises.find((e) => e.id === exercise.exerciseId)

        if (exerciseData) {
          exerciseData.muscles.forEach((muscle) => {
            if (muscleCount[muscle]) {
              muscleCount[muscle] += exercise.sets.length
            } else {
              muscleCount[muscle] = exercise.sets.length
            }
          })
        }
      })
    })

    setMuscleDistribution(muscleCount)
  }, [workouts, timeRange])

  // Calculate total workouts
  const totalWorkouts = workouts.length

  // Calculate total volume
  const totalVolume = workouts.reduce((total, workout) => {
    return total + calculateTotalVolume(workout)
  }, 0)

  // Calculate average duration
  const averageDuration =
    workouts.length > 0
      ? Math.round(workouts.reduce((total, workout) => total + workout.duration, 0) / workouts.length / 60)
      : 0

  // Calculate workouts per week
  const calculateWorkoutsPerWeek = (): number => {
    if (workouts.length < 2) return workouts.length

    // Correctly get oldest (last in array) and newest (first in array) dates
    const oldestWorkoutDate = new Date(workouts[workouts.length - 1].date)
    const newestWorkoutDate = new Date(workouts[0].date)

    const totalDays = (newestWorkoutDate.getTime() - oldestWorkoutDate.getTime()) / (1000 * 60 * 60 * 24)
    const totalWeeks = totalDays / 7

    return totalWeeks > 0 ? Number.parseFloat((workouts.length / totalWeeks).toFixed(1)) : workouts.length
  }

  // Get personal records
  const getPersonalRecords = (): { exercise: string; weight: number; reps: number }[] => {
    const records: { [key: string]: { weight: number; reps: number } } = {}

    workouts.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        exercise.sets.forEach((set) => {
          const key = exercise.exerciseName

          if (!records[key] || set.weight > records[key].weight) {
            records[key] = {
              weight: set.weight,
              reps: set.reps,
            }
          }
        })
      })
    })

    return Object.entries(records)
      .map(([exercise, record]) => ({
        exercise,
        weight: record.weight,
        reps: record.reps,
      }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3)
  }

  // Get total muscle distribution percentages
  const getMuscleDistributionPercentages = () => {
    const total = Object.values(muscleDistribution).reduce((sum, count) => sum + count, 0)

    if (total === 0) return {}

    const percentages: { [key: string]: number } = {}

    Object.entries(muscleDistribution).forEach(([muscle, count]) => {
      percentages[muscle] = Math.round((count / total) * 100)
    })

    return percentages
  }

  const musclePercentages = getMuscleDistributionPercentages()
  const personalRecords = getPersonalRecords()

  return (
    <div className="flex flex-col items-center p-4 space-y-6">
      {/* Stats Header */}
      <div className="flex flex-col items-center space-y-2 w-full">
        <BarChart2 className="h-10 w-10" />
        <h2 className="text-2xl font-bold">Statistics</h2>
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Time Range Filter */}
        <div className="flex justify-end">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 flex flex-col items-center">
              <AnimatedCounter value={totalWorkouts} />
              <p className="text-sm text-muted-foreground">Total Workouts</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col items-center">
              <AnimatedCounter value={totalVolume} formatOptions={{ maximumFractionDigits: 0 }} />
              <p className="text-sm text-muted-foreground">Total Weight (lbs)</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col items-center">
              <AnimatedCounter value={averageDuration} />
              <p className="text-sm text-muted-foreground">Avg Duration (min)</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col items-center">
              <AnimatedCounter value={calculateWorkoutsPerWeek()} formatOptions={{ maximumFractionDigits: 1 }} />
              <p className="text-sm text-muted-foreground">Workouts/Week</p>
            </CardContent>
          </Card>
        </div>

        {/* Volume Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Volume Progression
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {volumeData.length > 0 ? (
              <div className="h-64 overflow-x-auto">
                <ChartContainer className="min-w-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={volumeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <ChartTooltip>
                                <ChartTooltipContent>
                                  <p className="font-medium">{payload[0].payload.date}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Volume: {payload[0].value?.toLocaleString()} lbs
                                  </p>
                                </ChartTooltipContent>
                              </ChartTooltip>
                            )
                          }
                          return null
                        }}
                      />
                      <Bar dataKey="volume" fill="#0D9488" isAnimationActive={true} animationDuration={500} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center">
                <p className="text-muted-foreground text-sm">Complete workouts to see volume data</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Muscle Group Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Muscle Group Focus
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {Object.keys(musclePercentages).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(musclePercentages)
                  .sort(([, a], [, b]) => b - a)
                  .map(([muscle, percentage]) => (
                    <div key={muscle} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{muscle.charAt(0).toUpperCase() + muscle.slice(1)}</span>
                        <span>{percentage}%</span>
                      </div>
                      <Progress value={percentage} className="h-2 bg-muted" />
                    </div>
                  ))}
              </div>
            ) : (
              <div className="py-4 text-center text-muted-foreground">Complete workouts to see muscle distribution</div>
            )}
          </CardContent>
        </Card>

        {/* Muscle Heatmap */}
        <MuscleHeatmap workoutData={workouts} className="mt-6" />

        {/* Activity Heatmap */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Workout Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-1">
              <div>M</div>
              <div>T</div>
              <div>W</div>
              <div>T</div>
              <div>F</div>
              <div>S</div>
              <div>S</div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 28 }).map((_, i) => {
                // Generate activity levels based on actual workout data
                let activityLevel = 0

                if (workouts.length > 0) {
                  const now = new Date()
                  const date = new Date()
                  date.setDate(now.getDate() - (28 - i))

                  // Check if there's a workout on this date
                  const hasWorkout = workouts.some((workout) => {
                    const workoutDate = new Date(workout.date)
                    return (
                      workoutDate.getDate() === date.getDate() &&
                      workoutDate.getMonth() === date.getMonth() &&
                      workoutDate.getFullYear() === date.getFullYear()
                    )
                  })

                  if (hasWorkout) {
                    activityLevel = Math.floor(Math.random() * 3) + 1 // 1, 2, or 3
                  }
                }

                let bgColor = "bg-gray-100 dark:bg-gray-800"

                if (activityLevel === 1) bgColor = "bg-teal-200 dark:bg-teal-900"
                if (activityLevel === 2) bgColor = "bg-teal-400 dark:bg-teal-700"
                if (activityLevel === 3) bgColor = "bg-teal-600 dark:bg-teal-500"

                return <div key={i} className={`${bgColor} w-full aspect-square rounded-sm`} />
              })}
            </div>
          </CardContent>
        </Card>

        {/* Personal Records */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Personal Records</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {personalRecords.length > 0 ? (
              personalRecords.map((record, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{record.exercise}</p>
                    <p className="text-sm text-muted-foreground">{record.reps} reps</p>
                  </div>
                  <p className="text-xl font-bold text-primary">{record.weight} lbs</p>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                Complete workouts to see your personal records
              </div>
            )}
          </CardContent>
        </Card>

        {/* One Rep Max Calculator */}
        <OneRepMaxCard workouts={workouts} />
      </div>
    </div>
  )
}
