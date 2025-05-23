"use client"

import React, { useState, useEffect, useRef } from "react" // Combined imports with explicit React import
import { useThemeContext } from "@/components/theme-provider"
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
  const { themeColor } = useThemeContext()
  const { workouts: originalWorkouts } = useWorkouts()
  
  // Create sample workout data only once using useMemo to prevent recreation on every render
  const sampleWorkouts = React.useMemo(() => {
    // Fixed dates for sample data to prevent new Date objects on every render
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);
    
    const date13 = new Date(today);
    date13.setDate(13);
    
    const date14 = new Date(today);
    date14.setDate(14);
    
    // Fixed timestamps for all sample data
    const todayTimestamp = today.toISOString();
    const date13Timestamp = date13.toISOString();
    const date14Timestamp = date14.toISOString();
    
    return [
      {
        id: "sample1",
        date: todayTimestamp,
        duration: 3600,
        templateId: "template1",
        templateName: "Sample Workout",
        exercises: [
          {
            exerciseId: "ex1",
            exerciseName: "Bench Press",
            sets: [
              { weight: 135, reps: 10, timestamp: todayTimestamp },
              { weight: 155, reps: 8, timestamp: todayTimestamp },
              { weight: 175, reps: 6, timestamp: todayTimestamp }
            ]
          }
        ],
        stats: {
          totalVolume: 3000,
          totalSets: 3,
          completedExercises: 1,
          averageWeight: 155
        }
      },
      {
        id: "sample2",
        date: twoDaysAgo.toISOString(),
        duration: 4500,
        templateId: "template2",
        templateName: "Sample Workout 2",
        exercises: [
          {
            exerciseId: "ex2",
            exerciseName: "Squat",
            sets: [
              { weight: 185, reps: 8, timestamp: todayTimestamp },
              { weight: 205, reps: 6, timestamp: todayTimestamp },
              { weight: 225, reps: 4, timestamp: todayTimestamp }
            ]
          }
        ],
        stats: {
          totalVolume: 4000,
          totalSets: 3,
          completedExercises: 1,
          averageWeight: 205
        }
      },
      {
        id: "sample3",
        date: date13Timestamp,
        duration: 3000,
        templateId: "template3",
        templateName: "Sample Workout 3",
        exercises: [
          {
            exerciseId: "ex3",
            exerciseName: "Deadlift",
            sets: [
              { weight: 225, reps: 5, timestamp: date13Timestamp },
              { weight: 245, reps: 5, timestamp: date13Timestamp },
              { weight: 265, reps: 5, timestamp: date13Timestamp }
            ]
          }
        ],
        stats: {
          totalVolume: 3675,
          totalSets: 3,
          completedExercises: 1,
          averageWeight: 245
        }
      },
      {
        id: "sample4",
        date: date14Timestamp,
        duration: 2700,
        templateId: "template4",
        templateName: "Sample Workout 4",
        exercises: [
          {
            exerciseId: "ex4",
            exerciseName: "Overhead Press",
            sets: [
              { weight: 95, reps: 8, timestamp: date14Timestamp },
              { weight: 105, reps: 6, timestamp: date14Timestamp },
              { weight: 115, reps: 4, timestamp: date14Timestamp }
            ]
          }
        ],
        stats: {
          totalVolume: 1750,
          totalSets: 3,
          completedExercises: 1,
          averageWeight: 105
        }
      }
    ];
  }, []); // Empty dependency array ensures this runs only once
  
  // Use real workouts only
  const workouts = originalWorkouts;
  
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
          {/* Replace the problematic Select component with a simple HTML select */}
          <div className="relative w-32">
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="3months">3 Months</option>
              <option value="6months">6 Months</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 opacity-50">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </div>
          </div>
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
                      <Bar dataKey="volume" fill={themeColor === "default" ? "#FFA500" : "var(--md-primary)"} isAnimationActive={true} animationDuration={500} />
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

        {/* Workout Activity Calendar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Workout Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-col space-y-2">
              {/* Calendar Header - Days of Week */}
              <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-medium mb-1">
                <div>M</div>
                <div>T</div>
                <div>W</div>
                <div>T</div>
                <div>F</div>
                <div>S</div>
                <div>S</div>
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: 28 }).map((_, i) => {
                  // Calculate the date for this cell (from 27 days ago to today)
                  const now = new Date();
                  const date = new Date(now);
                  date.setHours(0, 0, 0, 0); // Normalize time to start of day
                  date.setDate(now.getDate() - 27 + i);
                  
                  // Format date for display and comparison
                  const dateStr = date.toISOString().split('T')[0];
                  const isToday = new Date(now.setHours(0, 0, 0, 0)).getTime() === date.getTime();
                  
                  // Find workouts on this date
                  const workoutsOnDate = workouts.filter((workout) => {
                    const workoutDate = new Date(workout.date);
                    workoutDate.setHours(0, 0, 0, 0); // Normalize time to start of day
                    
                    // Try different comparison methods
                    const isSameDate = workoutDate.getTime() === date.getTime();
                    const isSameDateString = workoutDate.toISOString().split('T')[0] === dateStr;
                    
                    // Use string comparison as a fallback
                    return isSameDate || isSameDateString;
                  });
                  
                  // Calculate activity level based on workouts and volume
                  let activityLevel = 0;
                  let totalVolume = 0;
                  
                  if (workoutsOnDate.length > 0) {
                    // Calculate total volume for all workouts on this date
                    totalVolume = workoutsOnDate.reduce((sum, workout) => {
                      if (workout.stats?.totalVolume) {
                        return sum + workout.stats.totalVolume;
                      }
                      
                      return sum + calculateTotalVolume(workout);
                    }, 0);
                    
                    // Set activity level based on volume
                    if (totalVolume > 5000) {
                      activityLevel = 3; // High intensity
                    } else if (totalVolume > 2000) {
                      activityLevel = 2; // Medium intensity
                    } else {
                      activityLevel = 1; // Low intensity
                    }
                  }
                  
                  // Determine cell styling based on workout presence and theme
                  let cellClasses = "relative flex items-center justify-center w-full aspect-square rounded-md transition-all duration-200";
                  
                  // Base style for all cells (empty days)
                  let bgColorClass = "bg-gray-100 dark:bg-gray-800";
                  
                  // Apply theme color if there's a workout
                  if (workoutsOnDate.length > 0) {
                    bgColorClass = themeColor === "default"
                      ? "bg-orange-500 dark:bg-orange-500" // Using a solid orange for default theme
                      : "bg-primary dark:bg-primary"; // Using primary theme color
                  }
                  
                  // Add today indicator
                  const todayClass = isToday
                    ? "ring-2 ring-offset-2 ring-primary dark:ring-primary"
                    : "";
                  
                  // Get day number
                  const dayNumber = date.getDate();
                  
                  return (
                    <div
                      key={i}
                      className={`${cellClasses} bg-gray-100 dark:bg-gray-800 ${todayClass} group hover:scale-105`}
                      style={{
                        backgroundColor: workoutsOnDate.length > 0
                          ? (themeColor === "default" ? "#FFA500" : "var(--primary)")
                          : undefined
                      }}
                      title={`${dateStr}: ${workoutsOnDate.length} workout(s), ${totalVolume.toLocaleString()} volume`}
                    >
                      {/* Day number - small and subtle */}
                      <span className={`absolute top-1 left-1 text-[0.65rem] ${workoutsOnDate.length > 0 ? 'text-black dark:text-primary-foreground' : 'text-muted-foreground'}`}>
                        {dayNumber}
                      </span>
                      
                    </div>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <div className="h-3 w-3 rounded-sm bg-gray-100 dark:bg-gray-800" />
                  <span>No workout</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className={`h-3 w-3 rounded-sm ${themeColor === "default" ? "bg-orange-500 dark:bg-orange-500" : "bg-primary dark:bg-primary"}`} />
                  <span>Workout</span>
                </div>
              </div>
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
