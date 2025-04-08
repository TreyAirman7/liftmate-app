"use client"

import { useState } from "react"
import { X, Play, ChevronLeft, ChevronRight, Dumbbell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { WorkoutTemplate } from "@/lib/data-manager"

interface TemplatePreviewProps {
  template: WorkoutTemplate
  onClose: () => void
  onStart: () => void
}

export default function TemplatePreview({ template, onClose, onStart }: TemplatePreviewProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)

  // Calculate total sets
  const totalSets = template.exercises.reduce((total, ex) => total + ex.sets.length, 0)

  // Get current exercise
  const currentExercise = template.exercises[currentExerciseIndex]

  // Navigate to previous exercise
  const prevExercise = () => {
    setCurrentExerciseIndex((prev) => (prev > 0 ? prev - 1 : template.exercises.length - 1))
  }

  // Navigate to next exercise
  const nextExercise = () => {
    setCurrentExerciseIndex((prev) => (prev < template.exercises.length - 1 ? prev + 1 : 0))
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <div className="p-4 bg-primary text-primary-foreground flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onClose} className="mr-2 text-primary-foreground">
            <X className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Template Preview</h1>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onStart}
          className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
        >
          <Play className="h-4 w-4 mr-2" />
          Start Workout
        </Button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto overscroll-contain">
        <div className="max-w-md mx-auto space-y-6">
          {/* Template Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{template.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Exercises</p>
                  <p className="text-lg font-bold">{template.exercises.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Sets</p>
                  <p className="text-lg font-bold">{totalSets}</p>
                </div>
                {template.category && (
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <Badge variant="outline" className="mt-1">
                      {template.category}
                    </Badge>
                  </div>
                )}
              </div>

              {template.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p>{template.description}</p>
                </div>
              )}

              {template.lastUsed && (
                <div className="text-sm text-muted-foreground">
                  Last used: {new Date(template.lastUsed).toLocaleDateString()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Exercise Preview */}
          {template.exercises.length > 0 && (
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Exercise Preview</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {currentExerciseIndex + 1} of {template.exercises.length}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="icon" onClick={prevExercise}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="text-center">
                    <h3 className="text-xl font-bold">{currentExercise.exerciseName}</h3>
                    <div className="flex items-center justify-center mt-2">
                      <Dumbbell className="h-5 w-5 mr-2 text-primary" />
                      <span>{currentExercise.sets.length} sets</span>
                    </div>
                  </div>

                  <Button variant="outline" size="icon" onClick={nextExercise}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 mt-4">
                  <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
                    <div className="col-span-2 text-center">Set</div>
                    <div className="col-span-5 text-center">Target Reps</div>
                    <div className="col-span-5 text-center">Rest Time</div>
                  </div>

                  {currentExercise.sets.map((set, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2 items-center py-2 border-b border-border last:border-0"
                    >
                      <div className="col-span-2 text-center">
                        <Badge variant="outline">{index + 1}</Badge>
                      </div>
                      <div className="col-span-5 text-center font-medium">{set.targetReps} reps</div>
                      <div className="col-span-5 text-center">{set.restTime} sec</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Start Workout Button */}
          <Button className="w-full bg-primary hover:bg-primary/90" onClick={onStart}>
            <Play className="h-4 w-4 mr-2" />
            Start Workout with this Template
          </Button>
        </div>
      </div>
    </div>
  )
}

