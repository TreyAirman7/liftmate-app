"use client"

import { useState, useEffect } from "react"
import { Clock, Dumbbell, Plus, Save, X, ChevronDown, ChevronUp, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Exercise, ExerciseInWorkout, WorkoutSet, CompletedWorkout } from "@/lib/data-manager"
import DataManager from "@/lib/data-manager"

interface WorkoutTrackerProps {
  onComplete: (workout: CompletedWorkout, isTemplateBased: boolean) => void
  onCancel: () => void
  templateId?: string
  templateName?: string
  initialExercises?: ExerciseInWorkout[]
}

export default function WorkoutTracker({
  onComplete,
  onCancel,
  templateId,
  templateName,
  initialExercises = [],
}: WorkoutTrackerProps) {
  const [startTime] = useState<Date>(new Date())
  const [elapsedTime, setElapsedTime] = useState<number>(0)
  const [exercises, setExercises] = useState<ExerciseInWorkout[]>(initialExercises)
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([])
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("")

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000)
      setElapsedTime(elapsed)
    }, 1000)

    return () => clearInterval(timer)
  }, [startTime])

  // Load available exercises
  useEffect(() => {
    const loadExercises = () => {
      try {
        // Initialize storage if needed
        DataManager.initializeStorage()

        // Get exercises from localStorage
        const exercises = JSON.parse(localStorage.getItem("liftmate-exercises") || "[]")
        setAvailableExercises(exercises)
      } catch (error) {
        console.error("Failed to load exercises:", error)
        setAvailableExercises([])
      }
    }

    loadExercises()
  }, [])

  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Add a new exercise to the workout
  const addExercise = (exerciseId: string) => {
    if (!exerciseId) return

    const exercise = availableExercises.find((e) => e.id === exerciseId)
    if (!exercise) return

    const newExercise: ExerciseInWorkout = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: [],
    }

    setExercises([...exercises, newExercise])
    setSelectedExerciseId("")
  }

  // Add a new set to an exercise
  const addSet = (exerciseIndex: number) => {
    const newExercises = [...exercises]
    const newSet: WorkoutSet = {
      weight: 0,
      reps: 0,
      timestamp: new Date().toISOString(),
    }

    newExercises[exerciseIndex].sets.push(newSet)
    setExercises(newExercises)
  }

  // Update a set's weight or reps
  const updateSet = (exerciseIndex: number, setIndex: number, field: "weight" | "reps", value: number) => {
    const newExercises = [...exercises]
    newExercises[exerciseIndex].sets[setIndex][field] = value
    setExercises(newExercises)
  }

  // Remove a set
  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const newExercises = [...exercises]
    newExercises[exerciseIndex].sets.splice(setIndex, 1)
    setExercises(newExercises)
  }

  // Remove an exercise
  const removeExercise = (exerciseIndex: number) => {
    const newExercises = [...exercises]
    newExercises.splice(exerciseIndex, 1)
    setExercises(newExercises)
  }

  // Complete the workout
  const completeWorkout = () => {
    // Filter out exercises with no sets
    const completedExercises = exercises.filter((exercise) => exercise.sets.length > 0)

    if (completedExercises.length === 0) {
      // Show error or alert that no exercises were completed
      return
    }

    const workout: CompletedWorkout = {
      id: DataManager.generateId(),
      date: new Date().toISOString(),
      duration: elapsedTime,
      templateId: templateId || null,
      templateName: templateName || null,
      exercises: completedExercises,
    }

    onComplete(workout, !!templateId) // Pass true if templateId exists
  }

  return (
    <div className="flex flex-col h-full">
      {/* Workout Header */}
      <div className="bg-primary dark:bg-teal-800 text-primary-foreground p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          <span className="text-xl font-bold">{formatTime(elapsedTime)}</span>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-foreground hover:bg-primary/80 dark:hover:bg-primary/80"
            onClick={onCancel}
          >
            <X className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-foreground hover:bg-primary/80 dark:hover:bg-primary/80"
            onClick={completeWorkout}
          >
            <Save className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Workout Content */}
      <ScrollArea className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4 pb-24">
          {/* Workout Title */}
          <div className="flex items-center justify-center space-x-2">
            <Dumbbell className="h-6 w-6" />
            <h2 className="text-xl font-bold">{templateName ? `${templateName} Workout` : "Current Workout"}</h2>
          </div>

          {/* Add Exercise */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Add Exercise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select Exercise" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableExercises.map((exercise) => (
                      <SelectItem key={exercise.id} value={exercise.id}>
                        {exercise.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => addExercise(selectedExerciseId)}
                  disabled={!selectedExerciseId}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Exercise
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Exercise</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-exercise-name">Exercise Name</Label>
                      <Input id="new-exercise-name" placeholder="e.g. Incline Bench Press" />
                    </div>

                    <div className="space-y-2">
                      <Label>Target Muscles</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {["chest", "back", "legs", "shoulders", "arms", "core"].map((muscle) => (
                          <div key={muscle} className="flex items-center space-x-2">
                            <input type="checkbox" id={`muscle-${muscle}`} className="rounded text-primary" />
                            <Label htmlFor={`muscle-${muscle}`}>
                              {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button className="w-full bg-primary hover:bg-primary/90">Save Exercise</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Exercise List */}
          {exercises.length === 0 ? (
            <Alert>
              <AlertDescription className="text-center py-8 text-muted-foreground">
                Add exercises to start tracking your workout
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {exercises.map((exercise, exerciseIndex) => (
                <Collapsible key={`${exercise.exerciseId}-${exerciseIndex}`} defaultOpen={true}>
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CollapsibleTrigger className="flex items-center space-x-2 hover:text-primary">
                          <h3 className="text-lg font-medium">{exercise.exerciseName}</h3>
                          <ChevronDown className="h-5 w-5 collapsible-icon" />
                          <ChevronUp className="h-5 w-5 collapsible-icon hidden" />
                        </CollapsibleTrigger>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeExercise(exerciseIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CollapsibleContent>
                      <CardContent className="pb-4">
                        {/* Sets Table */}
                        <div className="space-y-4">
                          {exercise.sets.length > 0 && (
                            <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground mb-2">
                              <div className="col-span-2 text-center">Set</div>
                              <div className="col-span-4 text-center">Weight</div>
                              <div className="col-span-4 text-center">Reps</div>
                              <div className="col-span-2"></div>
                            </div>
                          )}

                          {exercise.sets.map((set, setIndex) => (
                            <div key={setIndex} className="grid grid-cols-12 gap-2 items-center">
                              <div className="col-span-2 text-center">
                                <Badge variant="outline">{setIndex + 1}</Badge>
                              </div>
                              <div className="col-span-4">
                                <Input
                                  type="number"
                                  value={set.weight || ""}
                                  onChange={(e) => updateSet(exerciseIndex, setIndex, "weight", Number(e.target.value))}
                                  className="text-center"
                                  min="0"
                                />
                              </div>
                              <div className="col-span-4">
                                <Input
                                  type="number"
                                  value={set.reps || ""}
                                  onChange={(e) => updateSet(exerciseIndex, setIndex, "reps", Number(e.target.value))}
                                  className="text-center"
                                  min="0"
                                />
                              </div>
                              <div className="col-span-2 flex justify-center">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => removeSet(exerciseIndex, setIndex)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}

                          <Button variant="outline" className="w-full" onClick={() => addSet(exerciseIndex)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Set
                          </Button>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-background border-t border-border">
        <Button
          className="w-full bg-primary hover:bg-primary/90"
          onClick={completeWorkout}
          disabled={exercises.length === 0 || exercises.every((e) => e.sets.length === 0)}
        >
          <Save className="h-4 w-4 mr-2" />
          Complete Workout
        </Button>
      </div>
    </div>
  )
}

