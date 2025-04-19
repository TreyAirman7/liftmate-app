"use client"

import { useState } from "react"
import { Clock, Dumbbell, Calendar, BarChart2, Save } from "lucide-react"
import { motion } from "framer-motion" // Import motion
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CompletedWorkout } from "@/lib/data-manager"
import { useWorkouts } from "@/lib/workout-context"
import { showSuccessToast } from "@/lib/toast"

interface WorkoutSummaryProps {
  workout: CompletedWorkout
  onSave: (workout: CompletedWorkout) => void
  onSaveAsTemplate: (name: string) => void
  isTemplateBased: boolean // Add prop to indicate if the workout was started from a template
}
 
export default function WorkoutSummary({ workout, onSave, onSaveAsTemplate, isTemplateBased }: WorkoutSummaryProps) {
  const [templateName, setTemplateName] = useState(workout.templateName || "")
  const [isSaving, setIsSaving] = useState(false) // Add saving state
  const { addWorkout } = useWorkouts()

  // Format duration as mm:ss
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  // Calculate total volume
  const calculateTotalVolume = (): number => {
    return workout.exercises.reduce((total, exercise) => {
      return (
        total +
        exercise.sets.reduce((exerciseTotal, set) => {
          return exerciseTotal + set.weight * set.reps
        }, 0)
      )
    }, 0)
  }

  // Calculate total reps
  const calculateTotalReps = (): number => {
    return workout.exercises.reduce((total, exercise) => {
      return (
        total +
        exercise.sets.reduce((exerciseTotal, set) => {
          return exerciseTotal + set.reps
        }, 0)
      )
    }, 0)
  }

  // Handle save as template
  const handleSaveAsTemplate = () => {
    if (templateName.trim()) {
      onSaveAsTemplate(templateName)
    }
  }

  // Handle save workout with context update
  const handleSaveWorkout = async () => {
    setIsSaving(true) // Set saving state to true
    try {
      // Add workout to context (which also saves to storage)
      await addWorkout(workout)

      // Show success message
      showSuccessToast("Workout saved successfully!")

      // Call the original onSave callback
      onSave(workout)
    } catch (error) {
      console.error("Failed to save workout:", error)
    } finally {
      setIsSaving(false) // Set saving state to false
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Summary Header */}
      <div className="bg-primary dark:bg-teal-800 text-primary-foreground p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Workout Summary</h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary-foreground hover:bg-primary/80 dark:hover:bg-primary/80"
          onClick={handleSaveWorkout}
          disabled={isSaving} // Disable button while saving
        >
          <motion.div
            animate={{ rotate: isSaving ? 360 : 0 }} // Rotate icon when saving
            transition={{ duration: 0.5, repeat: isSaving ? Infinity : 0, ease: "linear" }}
          >
            <Save className="h-5 w-5" />
          </motion.div>
        </Button>
      </div>

      {/* Summary Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-6 max-w-md mx-auto pb-24">
          {/* Workout Overview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Dumbbell className="h-5 w-5 mr-2" />
                Workout Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(workout.date)}</span>
              </div>

              {workout.templateName && (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{workout.templateName}</Badge>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="flex flex-col items-center">
                  <Clock className="h-5 w-5 mb-1 text-primary" />
                  <span className="text-lg font-bold">{formatDuration(workout.duration)}</span>
                  <span className="text-xs text-muted-foreground">Duration</span>
                </div>

                <div className="flex flex-col items-center">
                  <Dumbbell className="h-5 w-5 mb-1 text-primary" />
                  <span className="text-lg font-bold">{workout.exercises.length}</span>
                  <span className="text-xs text-muted-foreground">Exercises</span>
                </div>

                <div className="flex flex-col items-center">
                  <BarChart2 className="h-5 w-5 mb-1 text-primary" />
                  <span className="text-lg font-bold">{calculateTotalReps()}</span>
                  <span className="text-xs text-muted-foreground">Total Reps</span>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Volume</span>
                  <span className="text-xl font-bold text-primary">{calculateTotalVolume().toLocaleString()} lbs</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exercise Details */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Exercise Details</h3>

            {workout.exercises.map((exercise, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{exercise.exerciseName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
                      <div className="col-span-2 text-center">Set</div>
                      <div className="col-span-4 text-center">Weight</div>
                      <div className="col-span-3 text-center">Reps</div>
                      <div className="col-span-3 text-center">Volume</div>
                    </div>

                    {exercise.sets.map((set, setIndex) => (
                      <div
                        key={setIndex}
                        className="grid grid-cols-12 gap-2 items-center py-1 border-b border-border last:border-0"
                      >
                        <div className="col-span-2 text-center">
                          <Badge variant="outline">{setIndex + 1}</Badge>
                        </div>
                        <div className="col-span-4 text-center">{set.weight} lbs</div>
                        <div className="col-span-3 text-center">{set.reps}</div>
                        <div className="col-span-3 text-center font-medium">{set.weight * set.reps}</div>
                      </div>
                    ))}

                    <div className="flex justify-between pt-2 font-medium">
                      <span>Total</span>
                      <span>
                        {exercise.sets.reduce((total, set) => total + set.weight * set.reps, 0).toLocaleString()} lbs
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-background border-t border-border">
        {/* Conditionally render the "Save as Template" button */}
        {!isTemplateBased && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full bg-primary hover:bg-primary/90">
                <Save className="h-4 w-4 mr-2" />
                Save as Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save as Workout Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    placeholder="e.g. Push Day"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                  />
                </div>

               <Button
                 className="w-full bg-primary hover:bg-primary/90"
                 onClick={handleSaveAsTemplate}
                 disabled={!templateName.trim()}
               >
                 Save Template
               </Button>
             </div>
           </DialogContent>
         </Dialog>
       )}
     </div>
   </div>
 )
}

