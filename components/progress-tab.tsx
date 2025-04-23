"use client"

import { useState, useEffect } from "react"
import { useThemeContext } from "@/components/theme-provider"
import { TrendingUp, Weight, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import type { CompletedWorkout } from "@/lib/data-manager"
import DataManager from "@/lib/data-manager"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { PerformancePredictor } from "@/components/performance-predictor"

interface WeightEntry {
  date: string
  weight: number
}

export default function ProgressTab() {
  const { themeColor } = useThemeContext()
  const [selectedExercise, setSelectedExercise] = useState("")
  const [selectedTimeframe, setSelectedTimeframe] = useState("3m")
  const [selectedRepRange, setSelectedRepRange] = useState("all")
  const [workouts, setWorkouts] = useState<CompletedWorkout[]>([])
  const [availableExercises, setAvailableExercises] = useState<string[]>([])
  const [strengthData, setStrengthData] = useState<any[]>([])
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([])
  const [newWeight, setNewWeight] = useState("")

  // Load workouts and weight data on mount
  useEffect(() => {
    const loadData = () => {
      try {
        // Initialize storage if needed
        DataManager.initializeStorage()

        // Get workouts from localStorage
        const workouts = DataManager.getWorkouts()

        // Sort by date (newest first)
        workouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        setWorkouts(workouts)

        // Extract unique exercise names
        const exerciseNames = new Set<string>()
        workouts.forEach((workout) => {
          workout.exercises.forEach((exercise) => {
            exerciseNames.add(exercise.exerciseName)
          })
        })

        setAvailableExercises(Array.from(exerciseNames))

        if (exerciseNames.size > 0) {
          setSelectedExercise(Array.from(exerciseNames)[0])
        }

        // Get weight entries
        const weightEntriesJson = localStorage.getItem("liftmate-weight-entries")
        const weightEntries = weightEntriesJson ? JSON.parse(weightEntriesJson) : []

        // Sort by date (newest first)
        weightEntries.sort((a: WeightEntry, b: WeightEntry) => new Date(b.date).getTime() - new Date(a.date).getTime())

        setWeightEntries(weightEntries)
      } catch (error) {
        console.error("Failed to load data:", error)
      }
    }

    loadData()
  }, [])

  // Update strength data when selection changes
  useEffect(() => {
    if (!selectedExercise || workouts.length === 0) return

    // Filter workouts based on timeframe
    let filteredWorkouts = [...workouts]

    if (selectedTimeframe !== "all") {
      const now = new Date()
      const cutoffDate = new Date()

      if (selectedTimeframe === "1m") {
        cutoffDate.setMonth(now.getMonth() - 1)
      } else if (selectedTimeframe === "3m") {
        cutoffDate.setMonth(now.getMonth() - 3)
      } else if (selectedTimeframe === "6m") {
        cutoffDate.setMonth(now.getMonth() - 6)
      } else if (selectedTimeframe === "1y") {
        cutoffDate.setFullYear(now.getFullYear() - 1)
      }

      filteredWorkouts = workouts.filter((w) => new Date(w.date) >= cutoffDate)
    }

    // Extract strength data for the selected exercise
    const strengthByDate: { [key: string]: { weight: number; reps: number } } = {}

    filteredWorkouts.forEach((workout) => {
      const date = new Date(workout.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })

      workout.exercises.forEach((exercise) => {
        if (exercise.exerciseName === selectedExercise) {
          exercise.sets.forEach((set) => {
            // Filter by rep range if needed
            if (selectedRepRange !== "all") {
              const [minReps, maxReps] = selectedRepRange.split("-").map(Number)

              if (maxReps && (set.reps < minReps || set.reps > maxReps)) return
              if (!maxReps && set.reps < minReps) return
            }

            // Track the heaviest weight for this date
            if (!strengthByDate[date] || set.weight > strengthByDate[date].weight) {
              strengthByDate[date] = {
                weight: set.weight,
                reps: set.reps,
              }
            }
          })
        }
      })
    })

    // Convert to chart data format
    const chartData = Object.keys(strengthByDate).map((date) => ({
      date,
      weight: strengthByDate[date].weight,
      reps: strengthByDate[date].reps,
    }))

    // Sort by date (oldest first for charts)
    chartData.sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return dateA.getTime() - dateB.getTime()
    })

    setStrengthData(chartData)
  }, [selectedExercise, selectedTimeframe, selectedRepRange, workouts])

  // Add new weight entry
  const addWeightEntry = () => {
    if (!newWeight || isNaN(Number.parseFloat(newWeight))) return

    const weight = Number.parseFloat(newWeight)

    const newEntry: WeightEntry = {
      date: new Date().toISOString(),
      weight,
    }

    // Add to state
    const updatedEntries = [newEntry, ...weightEntries]
    setWeightEntries(updatedEntries)

    // Save to localStorage
    localStorage.setItem("liftmate-weight-entries", JSON.stringify(updatedEntries))

    // Reset input
    setNewWeight("")
  }

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Get current max weight
  const getCurrentMax = (): number => {
    if (strengthData.length === 0) return 0
    return Math.max(...strengthData.map((d) => d.weight))
  }

  // Calculate improvement percentage
  const getImprovement = (): number => {
    if (strengthData.length < 2) return 0

    const firstWeight = strengthData[0].weight
    const lastWeight = strengthData[strengthData.length - 1].weight

    return Math.round(((lastWeight - firstWeight) / firstWeight) * 100)
  }

  // Calculate total volume
  const getTotalVolume = (): number => {
    if (!selectedExercise || workouts.length === 0) return 0

    return workouts.reduce((total, workout) => {
      const exerciseVolume = workout.exercises
        .filter((e) => e.exerciseName === selectedExercise)
        .reduce((exerciseTotal, exercise) => {
          return (
            exerciseTotal +
            exercise.sets.reduce((setTotal, set) => {
              return setTotal + set.weight * set.reps
            }, 0)
          )
        }, 0)

      return total + exerciseVolume
    }, 0)
  }

  // Get weight stats
  const getWeightStats = () => {
    if (weightEntries.length === 0) {
      return { current: 0, change: 0, average: 0 }
    }

    const current = weightEntries[0].weight

    let change = 0
    if (weightEntries.length > 1) {
      change = current - weightEntries[weightEntries.length - 1].weight
    }

    const average = weightEntries.reduce((sum, entry) => sum + entry.weight, 0) / weightEntries.length

    return {
      current,
      change,
      average: Math.round(average * 10) / 10,
    }
  }

  // Prepare weight chart data
  const getWeightChartData = () => {
    // Sort by date (oldest first for charts)
    return [...weightEntries]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((entry) => ({
        date: new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        weight: entry.weight,
      }))
  }

  const weightStats = getWeightStats()
  const weightChartData = getWeightChartData()

  return (
    <div className="flex flex-col items-center p-4 space-y-6">
      {/* Progress Header */}
      <div className="flex flex-col items-center space-y-2 w-full">
        <TrendingUp className="h-10 w-10" />
        <h2 className="text-2xl font-bold">Progress</h2>
      </div>

      <div className="w-full max-w-md">
        <Tabs defaultValue="strength" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="strength">
              <TrendingUp className="h-6 w-6 mx-auto" />
            </TabsTrigger>
            <TabsTrigger value="weight">
              <Weight className="h-6 w-6 mx-auto" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="strength" className="space-y-4">
            {/* Exercise Selection */}
            <div className="flex items-center space-x-2">
              <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Exercise" />
                </SelectTrigger>
                <SelectContent>
                  {availableExercises.map((exercise) => (
                    <SelectItem key={exercise} value={exercise}>
                      {exercise}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filters */}
            <div className="flex space-x-2">
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-1/2">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">1 Month</SelectItem>
                  <SelectItem value="3m">3 Months</SelectItem>
                  <SelectItem value="6m">6 Months</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedRepRange} onValueChange={setSelectedRepRange}>
                <SelectTrigger className="w-1/2">
                  <SelectValue placeholder="Rep Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reps</SelectItem>
                  <SelectItem value="1-5">1-5 Reps</SelectItem>
                  <SelectItem value="6-10">6-10 Reps</SelectItem>
                  <SelectItem value="11-15">11-15 Reps</SelectItem>
                  <SelectItem value="16+">16+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Progress Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  {selectedExercise ? `${selectedExercise} Progress` : "Select an Exercise"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {strengthData.length > 0 ? (
                  <div className="h-64 overflow-x-auto">
                    <ChartContainer className="min-w-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={strengthData}>
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
                                      <p className="text-sm text-muted-foreground">Weight: {payload[0].value} lbs</p>
                                      <p className="text-sm text-muted-foreground">Reps: {payload[0].payload.reps}</p>
                                    </ChartTooltipContent>
                                  </ChartTooltip>
                                )
                              }
                              return null
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="weight"
                            stroke={themeColor === "olive" ? "#FFA500" : "var(--md-primary)"}
                            strokeWidth={2}
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
                      {selectedExercise
                        ? "No data available for the selected exercise and filters"
                        : "Select an exercise to view progress"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Predictor */}
            <div className="mt-6">
              <PerformancePredictor
                selectedExercise={selectedExercise}
                selectedExerciseId={availableExercises.length > 0 ?
                  workouts.find(w =>
                    w.exercises.some(e => e.exerciseName === selectedExercise)
                  )?.exercises.find(e => e.exerciseName === selectedExercise)?.exerciseId || "" : ""}
                selectedTimeframe={selectedTimeframe}
                workouts={workouts}
              />
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-2">
              <Card>
                <CardContent className="p-3 flex flex-col items-center">
                  <p className="text-xs text-muted-foreground">Current Max</p>
                  <p className="text-lg font-bold text-primary">{getCurrentMax()} lbs</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 flex flex-col items-center">
                  <p className="text-xs text-muted-foreground">Improvement</p>
                  <p className="text-lg font-bold text-primary">
                    {getImprovement() > 0 ? "+" : ""}
                    {getImprovement()}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 flex flex-col items-center">
                  <p className="text-xs text-muted-foreground">Volume</p>
                  <p className="text-lg font-bold text-primary">{getTotalVolume().toLocaleString()} lbs</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="weight" className="space-y-4">
            {/* Weight Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Weight className="h-5 w-5 mr-2" />
                  Body Weight Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {weightChartData.length > 0 ? (
                  <div className="h-64">
                    <ChartContainer>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weightChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={["dataMin - 5", "dataMax + 5"]} />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <ChartTooltip>
                                    <ChartTooltipContent>
                                      <p className="font-medium">{payload[0].payload.date}</p>
                                      <p className="text-sm text-muted-foreground">Weight: {payload[0].value} lbs</p>
                                    </ChartTooltipContent>
                                  </ChartTooltip>
                                )
                              }
                              return null
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="weight"
                            stroke={themeColor === "olive" ? "#FFA500" : "var(--md-primary)"}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">Add weight entries to see your trend</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Weight Stats */}
            <div className="grid grid-cols-3 gap-2">
              <Card>
                <CardContent className="p-3 flex flex-col items-center">
                  <p className="text-xs text-muted-foreground">Current</p>
                  <p className="text-lg font-bold text-primary">{weightStats.current} lbs</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 flex flex-col items-center">
                  <p className="text-xs text-muted-foreground">Change</p>
                  <p className="text-lg font-bold text-primary">
                    {weightStats.change > 0 ? "+" : ""}
                    {weightStats.change} lbs
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 flex flex-col items-center">
                  <p className="text-xs text-muted-foreground">Average</p>
                  <p className="text-lg font-bold text-primary">{weightStats.average} lbs</p>
                </CardContent>
              </Card>
            </div>

            {/* Add Weight Entry */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Add Weight Entry</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    placeholder="Weight (lbs)"
                    className="flex-1"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                  />
                  <Button className="bg-primary hover:bg-primary/90" onClick={addWeightEntry}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Entries */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Recent Entries</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {weightEntries.length > 0 ? (
                  weightEntries.slice(0, 5).map((entry, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <p className="text-sm">{formatDate(entry.date)}</p>
                      <p className="font-medium">{entry.weight} lbs</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-2 text-muted-foreground">No weight entries yet</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

