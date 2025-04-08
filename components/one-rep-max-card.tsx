"use client"

import { motion, animate } from "framer-motion" // Import motion and animate
import { useRef, useEffect } from "react" // Import useRef and useEffect
import { useMemo } from "react"
import { Dumbbell } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CompletedWorkout } from "@/lib/data-manager"

interface OneRepMaxCardProps {
  workouts: CompletedWorkout[]
}

interface ExerciseOneRepMax {
  exerciseName: string
  oneRepMax: number
  weight: number
  reps: number
}

// Animated Counter Component (copied from stats-tab)
interface AnimatedCounterProps {
  value: number
  formatOptions?: Intl.NumberFormatOptions
  className?: string
}

function AnimatedCounter({ value, formatOptions, className }: AnimatedCounterProps) {
  const ref = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const controls = animate(0, value, {
      duration: 0.8, // Adjust duration as needed
      ease: "easeOut",
      onUpdate(latest) {
        node.textContent = latest.toLocaleString(undefined, formatOptions)
      },
    })

    // Start animation when value changes
    controls.play()

    return () => controls.stop()
  }, [value, formatOptions])

  // Render initial value (or 0) to avoid layout shift
  return <p ref={ref} className={className}>{value.toLocaleString(undefined, formatOptions)}</p>
}


export default function OneRepMaxCard({ workouts }: OneRepMaxCardProps) {
  // Calculate one rep max estimates using Brzycki formula
  const oneRepMaxes = useMemo(() => {
    if (!workouts.length) return []

    // Get the most recent workout
    const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const latestWorkout = sortedWorkouts[0]

    const exerciseMaxes: ExerciseOneRepMax[] = []
    const processedExercises = new Set<string>()

    // Process each exercise in the latest workout
    latestWorkout.exercises.forEach((exercise) => {
      if (processedExercises.has(exercise.exerciseName)) return
      processedExercises.add(exercise.exerciseName)

      // Find the set with the highest potential 1RM
      let highestOneRepMax = 0
      let bestSet = { weight: 0, reps: 0 }

      exercise.sets.forEach((set) => {
        // Skip sets with very high reps (approaching 37) to avoid division by zero
        if (set.reps >= 36) return

        // Calculate 1RM using Brzycki formula: weight × 36/(37-reps)
        const oneRepMax = (set.weight * 36) / (37 - set.reps)

        if (oneRepMax > highestOneRepMax) {
          highestOneRepMax = oneRepMax
          bestSet = { weight: set.weight, reps: set.reps }
        }
      })

      // Only add exercises where we could calculate a 1RM
      if (highestOneRepMax > 0) {
        exerciseMaxes.push({
          exerciseName: exercise.exerciseName,
          oneRepMax: Math.round(highestOneRepMax),
          weight: bestSet.weight,
          reps: bestSet.reps,
        })
      }
    })

    // Sort by highest 1RM
    return exerciseMaxes.sort((a, b) => b.oneRepMax - a.oneRepMax)
  }, [workouts])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Dumbbell className="h-5 w-5 mr-2" />
          Estimated One Rep Max
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {oneRepMaxes.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Based on Brzycki formula: weight × 36/(37-reps)</p>
            {oneRepMaxes.map((exercise, index) => (
              <div
                key={index}
                className="flex justify-between items-center border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">{exercise.exerciseName}</p>
                  <p className="text-sm text-muted-foreground">
                    Based on {exercise.weight} lbs × {exercise.reps} reps
                  </p>
                </div>
                <div className="text-right">
                  <AnimatedCounter value={exercise.oneRepMax} className="text-xl font-bold text-primary" />
                  <p className="text-xs text-muted-foreground">lbs Est. 1RM</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-muted-foreground">Complete workouts to see estimated one rep maxes</div>
        )}
      </CardContent>
    </Card>
  )
}

