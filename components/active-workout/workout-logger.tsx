"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Check, Clock, Trophy, FastForward, CalendarIcon } from "lucide-react" // Added CalendarIcon
// import Confetti from "react-confetti" // Keep for reference, but using tsParticles now
// import { useWindowSize } from "react-use" // Keep for reference
import Particles, { initParticlesEngine } from "@tsparticles/react" // Import Particles component and engine init
import type { Engine } from "@tsparticles/engine" // Keep Engine type import
import { loadConfettiPreset } from "@tsparticles/preset-confetti" // Import confetti preset
import { format } from "date-fns" // Import date-fns format
import { cn } from "@/lib/utils" // Import cn utility
import { Button } from "@/components/ui/button" // Import Button
import { Calendar } from "@/components/ui/calendar" // Import Calendar
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover" // Import Popover components
import { useThemeContext } from "@/components/theme-provider"
import { showSuccessToast, showErrorToast } from "@/lib/toast"
import type { CompletedWorkout, WorkoutTemplate, WorkoutSet } from "@/lib/data-manager" // Import CompletedWorkout
import DataManager from "@/lib/data-manager"
import { useEffect as useEffectOriginal } from "react"

interface WorkoutLoggerProps {
  template: WorkoutTemplate
  onComplete: (workout: any) => void
  onCancel: () => void
}

export default function WorkoutLogger({ template, onComplete, onCancel }: WorkoutLoggerProps) {
  const { themeColor } = useThemeContext()
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [currentSetIndex, setCurrentSetIndex] = useState(0)
  const [completedSets, setCompletedSets] = useState<Record<string, WorkoutSet[]>>({})
  const [isResting, setIsResting] = useState(false)
  const [restTimeRemaining, setRestTimeRemaining] = useState(0)
  const [selectedWorkoutDate, setSelectedWorkoutDate] = useState<Date>(new Date()) // Renamed state variable
  const [workoutStartTime] = useState(new Date()) // Reintroduced state for actual start time
  const [weight, setWeight] = useState<number>(0)
  const [reps, setReps] = useState<number>(0)
  const [workoutCompleted, setWorkoutCompleted] = useState(false)
  const [showPersonalRecordAnimation, setShowPersonalRecordAnimation] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [animateTimerComplete, setAnimateTimerComplete] = useState(false) // State for animation
  const [inputMode, setInputMode] = useState<"slider" | "text">("slider")
  // Saving state management
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [previousWorkoutData, setPreviousWorkoutData] = useState<{
    [key: string]: {
      date: string
      weight: number
      reps: number
      setData?: { [key: number]: { weight: number; reps: number } }
    }
  }>({})
  // const { width: windowWidth, height: windowHeight } = useWindowSize() // No longer needed for tsParticles basic preset
  const [engineInitialized, setEngineInitialized] = useState(false) // State for tsParticles engine init
 
  // Initialize tsParticles engine
  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadConfettiPreset(engine)
    }).then(() => {
      setEngineInitialized(true)
    })
  }, []) // Run only once on mount
 
  // Initialize audio for rest timer completion
  useEffect(() => {
    audioRef.current = new Audio("/sounds/timer-complete.mp3")
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Initialize completed sets
  useEffect(() => {
    const initialCompletedSets: Record<string, WorkoutSet[]> = {}
    template.exercises.forEach((exercise) => {
      initialCompletedSets[exercise.exerciseId] = []
    })
    setCompletedSets(initialCompletedSets)
  }, [template])

  // Rest timer effect
  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null

    if (isResting && restTimeRemaining > 0) {
      timerId = setTimeout(() => {
        setRestTimeRemaining((prev) => prev - 1)
      }, 1000)
    } else if (isResting && restTimeRemaining === 0) {
      setIsResting(false)
      setAnimateTimerComplete(true) // Trigger animation
      // Play sound when timer completes
      if (audioRef.current) {
        audioRef.current.play().catch((err) => console.error("Error playing sound:", err))
      }
      // Reset animation state after duration
      setTimeout(() => setAnimateTimerComplete(false), 500) // Match animation duration
    }

    return () => {
      if (timerId) clearTimeout(timerId)
    }
  }, [isResting, restTimeRemaining])

  // Get current exercise
  const currentExercise = template.exercises[currentExerciseIndex]

  // Get current set configuration
  const currentSetConfig = currentExercise?.sets[currentSetIndex]

  // Get previous workout data for reference
  // const previousWorkoutData = {
  //   date: "Mar 31",
  //   weight: 82.5,
  //   reps: 8,
  // }

  // Format rest time as MM:SS
  const formatRestTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Calculate workout progress
  const calculateProgress = (): number => {
    let totalSets = 0
    let completedSetCount = 0

    template.exercises.forEach((exercise) => {
      totalSets += exercise.sets.length
      completedSetCount += completedSets[exercise.exerciseId]?.length || 0
    })

    return totalSets > 0 ? (completedSetCount / totalSets) * 100 : 0
  }

  // Handle completing a set
  const completeSet = () => {
    if (!currentExercise) return

    // Validate inputs
    if (weight <= 0) {
      showErrorToast("Please enter a weight greater than 0")
      return
    }

    if (reps <= 0) {
      showErrorToast("Please enter at least 1 rep")
      return
    }

    // Create new set
    const newSet: WorkoutSet = {
      weight,
      reps,
      timestamp: new Date().toISOString(),
    }

    // Check if it's a personal record
    // if (weight > previousWorkoutData.weight) {
    //   setShowPersonalRecordAnimation(true)
    //   showSuccessToast("New personal record! 🎉")
    //   setTimeout(() => setShowPersonalRecordAnimation(false), 3000)
    // } else {
    //   // Provide feedback even if not a PR
    //   showSuccessToast(`Set completed: ${weight} lbs × ${reps} reps`)
    // }

    // Check if it's a personal record
    if (
      currentExercise &&
      previousWorkoutData[currentExercise.exerciseId] &&
      weight > previousWorkoutData[currentExercise.exerciseId].weight
    ) {
      setShowPersonalRecordAnimation(true)
      showSuccessToast("New personal record! 🎉")
      setTimeout(() => setShowPersonalRecordAnimation(false), 3000)
    } else {
      // Provide feedback even if not a PR
      showSuccessToast(`Set completed: ${weight} lbs × ${reps} reps`)
    }

    // Update completed sets
    setCompletedSets((prev) => ({
      ...prev,
      [currentExercise.exerciseId]: [...(prev[currentExercise.exerciseId] || []), newSet],
    }))

    // Start rest timer if not the last set
    const isLastSet = currentSetIndex === currentExercise.sets.length - 1
    const isLastExercise = currentExerciseIndex === template.exercises.length - 1

    if (!isLastSet || !isLastExercise) {
      setIsResting(true)
      setRestTimeRemaining(currentSetConfig?.restTime || 60)
    }

    // Move to next set or exercise
    if (isLastSet) {
      if (isLastExercise) {
        // Workout completed
        setWorkoutCompleted(true)
      } else {
        // Move to next exercise
        setCurrentExerciseIndex((prev) => prev + 1)
        setCurrentSetIndex(0)
      }
    } else {
      // Move to next set
      setCurrentSetIndex((prev) => prev + 1)
    }

    // Reset inputs
    setWeight(0)
    setReps(0)
  }

  // Skip rest timer
  const skipRest = () => {
    setIsResting(false)
    setRestTimeRemaining(0)
    showSuccessToast("Rest period skipped")
  }

  // Finish workout with proper error handling and feedback
  const finishWorkout = useCallback(() => {
    try {
      // Show loading feedback
      showSuccessToast("Saving workout...")

      const endTime = new Date()
      const durationInSeconds = Math.floor((endTime.getTime() - workoutStartTime.getTime()) / 1000) // Use actual start time

      // Validate workout data
      const completedExercises = Object.entries(completedSets).filter(([_, sets]) => sets.length > 0).length

      if (completedExercises === 0) {
        showErrorToast("Cannot save workout with no completed sets")
        return
      }

      // Create completed workout object with explicit type
      const completedWorkout: CompletedWorkout = { // Explicitly type here
        id: DataManager.generateId(),
        date: selectedWorkoutDate.toISOString(), // Use selected date for the log
        duration: durationInSeconds,
        templateId: template.id,
        templateName: template.name,
        exercises: template.exercises
          .map((exercise) => ({
            exerciseId: exercise.exerciseId,
            exerciseName: exercise.exerciseName,
            sets: completedSets[exercise.exerciseId] || [],
          }))
          .filter((exercise) => exercise.sets.length > 0), // Only include exercises with completed sets
        // stats will be added next
      }

      // Calculate and add workout statistics
      const totalVolume = Object.values(completedSets)
        .flat()
        .reduce((total, set) => total + set.weight * set.reps, 0)

      const totalSets = Object.values(completedSets).reduce((total, sets) => total + sets.length, 0)

      completedWorkout.stats = {
        totalVolume,
        totalSets,
        completedExercises,
        averageWeight: totalSets > 0 ? Math.round(totalVolume / totalSets) : 0,
      }

      // Update template's lastUsed date
      try {
        const templates = DataManager.getTemplates()
        const templateIndex = templates.findIndex((t) => t.id === template.id)
        if (templateIndex >= 0) {
          templates[templateIndex].lastUsed = new Date().toISOString()
          DataManager.saveTemplate(templates[templateIndex])
        }
      } catch (error) {
        console.error("Failed to update template's lastUsed date:", error)
        // Non-critical error, continue with workout completion
      }

      // Save workout data with persistent storage
      DataManager.saveWorkout(completedWorkout)

      // Show success message with workout stats
      showSuccessToast(
        `Workout saved: ${completedExercises} exercises, ${totalSets} sets, ${totalVolume.toLocaleString()} lbs total volume 💪`,
      )

      // Call the onComplete callback with the completed workout data
      onComplete(completedWorkout)
    } catch (error) {
      console.error("Failed to save workout:", error)
      showErrorToast("Failed to save workout. Please try again.")
    }
  }, [completedSets, onComplete, template, selectedWorkoutDate, workoutStartTime]) // Update dependency array

  // Render rest timer screen
  useEffectOriginal(() => {
    // Fetch previous workout data for all exercises in the template
    const fetchPreviousWorkoutData = async () => {
      try {
        // Get all completed workouts
        const allWorkouts = DataManager.getWorkouts()

        // Sort by date (newest first)
        allWorkouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        // Create a map to store the most recent data for each exercise
        const exerciseData: {
          [key: string]: {
            date: string
            weight: number
            reps: number
            setData?: { [key: number]: { weight: number; reps: number } }
          }
        } = {}

        // For each exercise in the current template
        template.exercises.forEach((exercise) => {
          // Find the most recent workout that includes this exercise
          const recentWorkoutWithExercise = allWorkouts.find((workout) =>
            workout.exercises.some((ex) => ex.exerciseId === exercise.exerciseId),
          )

          if (recentWorkoutWithExercise) {
            // Find the exercise data in that workout
            const exerciseInWorkout = recentWorkoutWithExercise.exercises.find(
              (ex) => ex.exerciseId === exercise.exerciseId,
            )

            if (exerciseInWorkout && exerciseInWorkout.sets.length > 0) {
              // Get the last set (usually the heaviest or most significant)
              const lastSet = exerciseInWorkout.sets[exerciseInWorkout.sets.length - 1]

              // Store the data for the exercise overall
              exerciseData[exercise.exerciseId] = {
                date: new Date(recentWorkoutWithExercise.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                }),
                weight: lastSet.weight,
                reps: lastSet.reps,
                setData: {},
              }

              // Store data for each set if available
              if (exerciseData[exercise.exerciseId].setData) {
                exerciseInWorkout.sets.forEach((set, index) => {
                  if (exerciseData[exercise.exerciseId].setData) {
                    exerciseData[exercise.exerciseId].setData![index] = {
                      weight: set.weight,
                      reps: set.reps,
                    }
                  }
                })
              }
            }
          }
        })

        setPreviousWorkoutData(exerciseData)
      } catch (error) {
        console.error("Failed to fetch previous workout data:", error)
      }
    }

    fetchPreviousWorkoutData()
  }, [template.exercises])

  // Now, let's update the code to pre-populate the weight and reps fields when a new set is started
  // Add this useEffect to set initial values when the current exercise or set changes
  useEffectOriginal(() => {
    if (currentExercise) {
      const prevData = previousWorkoutData[currentExercise.exerciseId]

      // If we have previous data for this exercise and the fields are empty
      if (prevData && weight === 0 && reps === 0) {
        // Try to get set-specific data first
        if (prevData.setData && prevData.setData[currentSetIndex]) {
          setWeight(prevData.setData[currentSetIndex].weight)
          setReps(prevData.setData[currentSetIndex].reps)
        } else {
          // Fall back to the last set data
          setWeight(prevData.weight)
          setReps(prevData.reps)
        }

        // Provide subtle feedback that values were pre-populated
        showSuccessToast("Previous workout values loaded", { duration: 1500 })
      }
    }
  }, [currentExerciseIndex, currentSetIndex, currentExercise, previousWorkoutData])

  // Let's enhance the set tracking to remember previous sets within the same workout
  // Add this useEffect to update weight and reps when moving to a new set of the same exercise

  // Add this after the other useEffects
  useEffectOriginal(() => {
    // If we're not on the first set of an exercise, use the previous set's values as a starting point
    if (currentExercise && currentSetIndex > 0) {
      const exerciseSets = completedSets[currentExercise.exerciseId] || []

      // If we have completed the previous set in this workout
      if (exerciseSets.length >= currentSetIndex) {
        const previousSet = exerciseSets[currentSetIndex - 1]

        // Pre-populate with the previous set's values
        setWeight(previousSet.weight)
        setReps(previousSet.reps)
      }
    }
  }, [currentExerciseIndex, currentSetIndex])

  if (isResting) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col"> {/* Use theme background/foreground */}
        {/* Header with Cancel Button */}
        <div className="p-4 flex items-center" style={{ backgroundColor: themeColor === "default" ? "#FFA500" : "var(--md-primary)" }}>
          <button
            onClick={() => {
              // Confirm before exiting if there's progress
              const hasProgress = Object.values(completedSets).some(sets => sets.length > 0);
              if (hasProgress) {
                if (window.confirm("Do you want to save your progress before exiting?")) {
                  // Save workout progress
                  try {
                    const endTime = new Date();
                    const durationInSeconds = Math.floor((endTime.getTime() - workoutStartTime.getTime()) / 1000);
                    
                    // Create partial workout object
                    const partialWorkout: CompletedWorkout & { isPartial: boolean } = {
                      id: DataManager.generateId(),
                      date: selectedWorkoutDate.toISOString(),
                      duration: durationInSeconds,
                      templateId: template.id,
                      templateName: template.name,
                      exercises: template.exercises
                        .map((exercise) => ({
                          exerciseId: exercise.exerciseId,
                          exerciseName: exercise.exerciseName,
                          sets: completedSets[exercise.exerciseId] || [],
                        }))
                        .filter((exercise) => exercise.sets.length > 0),
                      isPartial: true, // Mark as partial workout
                    };
                    
                    // Calculate stats
                    const totalVolume = Object.values(completedSets)
                      .flat()
                      .reduce((total, set) => total + set.weight * set.reps, 0);
                    
                    const totalSets = Object.values(completedSets).reduce((total, sets) => total + sets.length, 0);
                    
                    partialWorkout.stats = {
                      totalVolume,
                      totalSets,
                      completedExercises: Object.entries(completedSets).filter(([_, sets]) => sets.length > 0).length,
                      averageWeight: totalSets > 0 ? Math.round(totalVolume / totalSets) : 0,
                    };
                    
                    // Save partial workout
                    DataManager.saveWorkout(partialWorkout);
                    showSuccessToast("Workout progress saved");
                  } catch (error) {
                    console.error("Failed to save workout progress:", error);
                    showErrorToast("Failed to save workout progress");
                  }
                }
              }
              // Exit workout
              onCancel();
            }}
            className="mr-3 text-white hover:bg-white/20 p-1 rounded-full"
            aria-label="Cancel workout"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-white">{template.name}</h1>
        </div>

        {/* Progress indicator */}
        <div className="w-full h-1 bg-muted"> {/* Use theme muted */}
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${calculateProgress()}%`,
              backgroundColor: themeColor === "default" ? "#FFA500" : "var(--md-primary)",
            }}
          ></div>
        </div>

        <div className="p-4 text-center">
          <p className="text-muted-foreground">{calculateProgress().toFixed(0)}% Exercises</p> {/* Use theme muted-foreground */}
        </div>

        {/* Exercise name */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold">{currentExercise?.exerciseName}</h2>
          <div
            className="w-16 h-1 mx-auto mt-2"
            style={{ backgroundColor: themeColor === "default" ? "#FFA500" : "var(--md-primary)" }}
          ></div>
        </div>

        {/* Rest timer card */}
        <div className="flex-1 flex items-center justify-center p-4"> {/* Added padding */}
          <div className="bg-card text-card-foreground p-8 rounded-lg w-full max-w-xs mx-auto shadow-lg"> {/* Use theme card */}
            <div className="flex justify-center mb-4">
              <Clock className="h-10 w-10 text-foreground" /> {/* Use theme foreground */}
            </div>
            <p className="text-center text-xl mb-6">Rest Time</p>

            <p
              className={`text-center text-6xl font-mono font-bold mb-8 rest-timer ${animateTimerComplete ? 'animate-pulse-once' : ''}`}
              style={{ color: themeColor === "default" ? "#FFA500" : "var(--md-primary)" }}
            >
              {formatRestTime(restTimeRemaining)}
            </p>

            <button
              className="w-full py-3 rounded-md font-bold text-primary-foreground flex items-center justify-center active:scale-95 transition-transform"
              style={{ backgroundColor: themeColor === "default" ? "#FFA500" : "var(--md-primary)" }}
              onClick={skipRest}
            >
              <FastForward className="h-5 w-5 mr-2" />
              SKIP REST
            </button>
          </div>
        </div>
      </div>
    )
  }

  // In the workoutCompleted section, replace the existing return statement with:
  if (workoutCompleted) {
    // Calculate workout statistics
    const workoutDuration = Math.floor((new Date().getTime() - workoutStartTime.getTime()) / 60000) // Use actual start time for display
    const completedExercises = Object.values(completedSets).filter((sets) => sets.length > 0).length
    const totalSets = Object.values(completedSets).reduce((total, sets) => total + sets.length, 0)
    const totalVolume = Object.values(completedSets)
      .flat()
      .reduce((total, set) => total + set.weight * set.reps, 0)
    const personalBests = Object.entries(completedSets)
      .map(([exerciseId, sets]) => {
        const exercise = template.exercises.find((e) => e.exerciseId === exerciseId)
        if (!exercise || sets.length === 0) return null

        // Find the set with the highest weight
        const maxWeightSet = [...sets].sort((a, b) => b.weight - a.weight)[0]
        return {
          exerciseName: exercise.exerciseName,
          weight: maxWeightSet.weight,
          reps: maxWeightSet.reps,
        }
      })
      .filter(Boolean)
      .sort((a, b) => (b?.weight || 0) * (b?.reps || 0) - (a?.weight || 0) * (a?.reps || 0))
      .slice(0, 3)

    // Enhanced save function with loading state
    const handleSaveWorkout = async () => {
      try {
        setIsSaving(true)
        setSaveError(null)

        // Show loading feedback
        showSuccessToast("Saving your workout...")

        const endTime = new Date()
        const durationInSeconds = Math.floor((endTime.getTime() - workoutStartTime.getTime()) / 1000) // Use actual start time

        // Validate workout data
        if (completedExercises === 0) {
          setSaveError("Cannot save workout with no completed sets")
          showErrorToast("Cannot save workout with no completed sets")
          setIsSaving(false)
          return
        }

        // Create completed workout object with all metadata
        const completedWorkout = {
          id: DataManager.generateId(),
          date: selectedWorkoutDate.toISOString(), // Use selected date for the log
          duration: durationInSeconds,
          templateId: template.id,
          templateName: template.name,
          exercises: template.exercises
            .map((exercise) => ({
              exerciseId: exercise.exerciseId,
              exerciseName: exercise.exerciseName,
              sets: completedSets[exercise.exerciseId] || [],
            }))
            .filter((exercise) => exercise.sets.length > 0), // Only include exercises with completed sets
          stats: {
            totalVolume,
            totalSets,
            completedExercises,
            averageWeight: totalSets > 0 ? Math.round(totalVolume / totalSets) : 0,
          },
        }

        // Update template's lastUsed date
        try {
          const templates = DataManager.getTemplates()
          const templateIndex = templates.findIndex((t) => t.id === template.id)
          if (templateIndex >= 0) {
            templates[templateIndex].lastUsed = new Date().toISOString()
            DataManager.saveTemplate(templates[templateIndex])
          }
        } catch (error) {
          console.error("Failed to update template's lastUsed date:", error)
          // Non-critical error, continue with workout completion
        }

        // Simulate network delay for better UX
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Save workout data with persistent storage
        DataManager.saveWorkout(completedWorkout)

        // Show success message with workout stats
        showSuccessToast(`Workout saved successfully! 💪`)

        // Call the onComplete callback with the completed workout data
        onComplete(completedWorkout)
      } catch (error) {
        console.error("Failed to save workout:", error)
        setSaveError("Failed to save workout. Please try again.")
        showErrorToast("Failed to save workout. Please try again.")
        setIsSaving(false)
      }
    }

    // Enhanced discard function with confirmation
    const handleDiscardWorkout = () => {
      // Confirm before discarding
      if (totalSets > 0) {
        if (window.confirm("Are you sure you want to discard this workout? All progress will be lost.")) {
          showSuccessToast("Workout discarded")

          // Reset all workout data
          setCompletedSets({})
          setCurrentExerciseIndex(0)
          setCurrentSetIndex(0)
          setWorkoutCompleted(false)

          // Navigate back
          onCancel()
        }
      } else {
        // No confirmation needed if no sets completed
        showSuccessToast("Workout discarded")
        onCancel()
      }
    }

    // Particle options for confetti burst
    const particleOptions = {
      preset: "confetti",
      emitters: [
        {
          position: { x: 50, y: 30 }, // Start slightly above center
          rate: {
            quantity: 50, // Number of particles per burst
            delay: 0.1, // Short delay before burst
          },
          life: {
            duration: 0.15, // Emitter lasts for a very short time
            count: 1, // Only emit once
          },
        },
      ],
      particles: {
        number: {
          value: 0, // Start with 0, emitter adds them
        },
        move: {
          speed: { min: 10, max: 20 }, // Adjust speed
          gravity: {
            enable: true,
            acceleration: 20, // Make them fall faster
          },
          decay: 0.05, // Make them disappear faster
        },
        size: {
          value: { min: 3, max: 7 }, // Adjust size
        },
        opacity: {
          value: { min: 0.5, max: 1 }, // Adjust opacity
        },
      },
      fullScreen: {
        enable: true,
        zIndex: 9998, // Ensure it's behind modals/dialogs (z-50 = 50, so 9998 should be high enough but behind potential future high z-index elements)
      },
    }
 
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Conditionally render Particles */}
        {engineInitialized && (
          <Particles id="tsparticles-summary" options={particleOptions} />
        )}
        {/* Header */}
        <div
          className="p-4 flex items-center justify-between shadow-md"
          style={{ backgroundColor: themeColor === "default" ? "#FFA500" : "var(--md-primary)" }}
        >
          <div className="flex items-center">
            <button
              onClick={() => {
                // Confirm before exiting if there's progress
                const hasProgress = Object.values(completedSets).some(sets => sets.length > 0);
                if (hasProgress) {
                  if (window.confirm("Do you want to save your progress before exiting?")) {
                    // Save workout progress
                    try {
                      const endTime = new Date();
                      const durationInSeconds = Math.floor((endTime.getTime() - workoutStartTime.getTime()) / 1000);
                      
                      // Create partial workout object
                      const partialWorkout: CompletedWorkout & { isPartial: boolean } = {
                        id: DataManager.generateId(),
                        date: selectedWorkoutDate.toISOString(),
                        duration: durationInSeconds,
                        templateId: template.id,
                        templateName: template.name,
                        exercises: template.exercises
                          .map((exercise) => ({
                            exerciseId: exercise.exerciseId,
                            exerciseName: exercise.exerciseName,
                            sets: completedSets[exercise.exerciseId] || [],
                          }))
                          .filter((exercise) => exercise.sets.length > 0),
                        isPartial: true, // Mark as partial workout
                      };
                      
                      // Calculate stats
                      const totalVolume = Object.values(completedSets)
                        .flat()
                        .reduce((total, set) => total + set.weight * set.reps, 0);
                      
                      const totalSets = Object.values(completedSets).reduce((total, sets) => total + sets.length, 0);
                      
                      partialWorkout.stats = {
                        totalVolume,
                        totalSets,
                        completedExercises: Object.entries(completedSets).filter(([_, sets]) => sets.length > 0).length,
                        averageWeight: totalSets > 0 ? Math.round(totalVolume / totalSets) : 0,
                      };
                      
                      // Save partial workout
                      DataManager.saveWorkout(partialWorkout);
                      showSuccessToast("Workout progress saved");
                    } catch (error) {
                      console.error("Failed to save workout progress:", error);
                      showErrorToast("Failed to save workout progress");
                    }
                  }
                }
                // Exit workout
                onCancel();
              }}
              className="mr-3 text-white hover:bg-white/20 p-1 rounded-full"
              aria-label="Cancel workout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-white">{template.name}</h1>
          </div>
          <div className="text-white text-sm bg-black bg-opacity-20 px-3 py-1 rounded-full">{workoutDuration} min</div>
        </div>

        {/* Main content - scrollable */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-md mx-auto p-4">
            {/* Congratulations section */}
            <div className="text-center mb-8 relative">
              {/* Animated particles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full opacity-30"
                    style={{
                      backgroundColor: themeColor === "default" ? "#FFA500" : "var(--md-primary)",
                      width: `${Math.random() * 10 + 5}px`,
                      height: `${Math.random() * 10 + 5}px`,
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      animation: `float ${Math.random() * 10 + 10}s linear infinite`,
                    }}
                  ></div>
                ))}
              </div>

              <div className="relative">
                <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-primary bg-opacity-20 mb-4">
                  <Trophy className="h-12 w-12 text-primary" />
                </div>

                <h2 className="text-3xl font-bold mb-2">Workout Complete!</h2>
                <p className="text-muted-foreground">Great job! You've crushed today's workout.</p>
              </div>
            </div>

            {/* Workout summary card */}
            <div className="bg-card rounded-xl shadow-lg overflow-hidden mb-6 border border-border">
              <div className="p-5 border-b border-border">
                <h3 className="text-xl font-bold">Workout Summary</h3>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 divide-x divide-y divide-border border-border">
                <div className="p-4 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-primary">{completedExercises}</span>
                  <span className="text-sm text-muted-foreground">Exercises</span>
                </div>
                <div className="p-4 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-primary">{totalSets}</span>
                  <span className="text-sm text-muted-foreground">Sets</span>
                </div>
                <div className="p-4 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-primary">{workoutDuration}</span>
                  <span className="text-sm text-muted-foreground">Minutes</span>
                </div>
                <div className="p-4 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-primary">{totalVolume.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">Total Volume (lbs)</span>
                </div>
              </div>
            </div>

            {/* Personal bests section */}
            {personalBests.length > 0 && (
              <div className="bg-card rounded-xl shadow-lg overflow-hidden mb-6 border border-border">
                <div className="p-5 border-b border-border flex items-center">
                  <div className="h-6 w-6 rounded-full bg-yellow-500 mr-2 flex items-center justify-center">
                    <span className="text-xs text-black font-bold">PB</span>
                  </div>
                  <h3 className="text-xl font-bold">Top Lifts</h3>
                </div>

                <div className="divide-y divide-border">
                  {personalBests.map((pb, index) => (
                    <div key={index} className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{pb?.exerciseName}</p>
                        <p className="text-sm text-muted-foreground">{pb?.reps} reps</p>
                      </div>
                      <div className="text-xl font-bold text-primary">{pb?.weight} lbs</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error message if save failed */}
            {saveError && (
              <div className="bg-destructive/10 border border-destructive text-destructive p-3 rounded-lg mb-6">
                <p>{saveError}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                className="w-full py-3 px-4 rounded-lg font-bold text-primary-foreground flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70"
                style={{
                  backgroundColor: themeColor === "default" ? "#FFA500" : "var(--md-primary)",
                  transform: "translateY(0)",
                }}
                onClick={handleSaveWorkout}
                disabled={isSaving}
                aria-disabled={isSaving}
                onMouseDown={(e) => (e.currentTarget.style.transform = "translateY(2px)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                onTouchStart={(e) => (e.currentTarget.style.transform = "translateY(2px)")}
                onTouchEnd={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              >
                {isSaving ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    SAVING...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    SAVE WORKOUT
                  </>
                )}
              </button>

              <button
                className="w-full py-3 px-4 rounded-lg font-medium text-muted-foreground border border-border flex items-center justify-center hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                onClick={handleDiscardWorkout}
                disabled={isSaving}
                aria-disabled={isSaving}
              >
                DISCARD WORKOUT
              </button>
            </div>
          </div>
        </div>

        {/* Audio element for timer sound */}
        <audio ref={audioRef} src="/sounds/timer-complete.mp3" />

        <style jsx>{`
          @keyframes float {
            0% { transform: translateY(0) rotate(0deg); opacity: 0; }
            10% { opacity: 0.3; }
            90% { opacity: 0.2; }
            100% { transform: translateY(-1000%) rotate(720deg); opacity: 0; }
          }
          
          .animate-spin {
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    )
  }

  // Update the set logging interface buttons
  const toggleInputMode = () => {
    const newMode = inputMode === "slider" ? "text" : "slider"
    setInputMode(newMode)
    showSuccessToast(`Switched to ${newMode} input mode`)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col"> {/* Use theme background/foreground */}
      {/* Header with Date Picker and Cancel Button */}
      <div className="p-4 flex justify-between items-center" style={{ backgroundColor: themeColor === "default" ? "#FFA500" : "var(--md-primary)" }}>
        <div className="flex items-center">
          <button
            onClick={() => {
              // Confirm before exiting if there's progress
              const hasProgress = Object.values(completedSets).some(sets => sets.length > 0);
              if (hasProgress) {
                if (window.confirm("Do you want to save your progress before exiting?")) {
                  // Save workout progress
                  try {
                    const endTime = new Date();
                    const durationInSeconds = Math.floor((endTime.getTime() - workoutStartTime.getTime()) / 1000);
                    
                    // Create partial workout object with proper type
                    const partialWorkout: CompletedWorkout & { isPartial: boolean } = {
                      id: DataManager.generateId(),
                      date: selectedWorkoutDate.toISOString(),
                      duration: durationInSeconds,
                      templateId: template.id,
                      templateName: template.name,
                      exercises: template.exercises
                        .map((exercise) => ({
                          exerciseId: exercise.exerciseId,
                          exerciseName: exercise.exerciseName,
                          sets: completedSets[exercise.exerciseId] || [],
                        }))
                        .filter((exercise) => exercise.sets.length > 0),
                      isPartial: true, // Mark as partial workout
                    };
                    
                    // Calculate stats
                    const totalVolume = Object.values(completedSets)
                      .flat()
                      .reduce((total, set) => total + set.weight * set.reps, 0);
                    
                    const totalSets = Object.values(completedSets).reduce((total, sets) => total + sets.length, 0);
                    
                    partialWorkout.stats = {
                      totalVolume,
                      totalSets,
                      completedExercises: Object.entries(completedSets).filter(([_, sets]) => sets.length > 0).length,
                      averageWeight: totalSets > 0 ? Math.round(totalVolume / totalSets) : 0,
                    };
                    
                    // Save partial workout
                    DataManager.saveWorkout(partialWorkout);
                    showSuccessToast("Workout progress saved");
                  } catch (error) {
                    console.error("Failed to save workout progress:", error);
                    showErrorToast("Failed to save workout progress");
                  }
                }
              }
              // Exit workout
              onCancel();
            }}
            className="mr-3 text-white hover:bg-white/20 p-1 rounded-full"
            aria-label="Cancel workout"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-white">{template.name}</h1>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[180px] justify-start text-left font-normal", // Removed text-black, Button variant handles text color
                !selectedWorkoutDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedWorkoutDate ? format(selectedWorkoutDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedWorkoutDate}
              onSelect={(date) => {
                if (date) setSelectedWorkoutDate(date) // Update selected date state
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Progress indicator */}
      <div className="w-full h-1 bg-muted">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${calculateProgress()}%`,
            backgroundColor: themeColor === "default" ? "#FFA500" : "var(--md-primary)",
          }}
        ></div>
      </div>

      <div className="p-4 text-center">
        <p className="text-muted-foreground">{calculateProgress().toFixed(0)}% Exercises</p>
      </div>

      {/* Exercise name */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold">{currentExercise?.exerciseName}</h2>
        <div
          className="w-16 h-1 mx-auto mt-2"
          style={{ backgroundColor: themeColor === "default" ? "#FFA500" : "var(--md-primary)" }}
        ></div>
      </div>

      {/* Set navigation */}
      <div className="flex justify-center mb-6">
        {currentExercise?.sets.map((_, index) => (
          <div
            key={index}
            className={`w-10 h-10 rounded-full flex items-center justify-center mx-1 ${
              index < currentSetIndex
                ? "bg-secondary text-secondary-foreground" // Completed set
                : index === currentSetIndex
                  ? "" // Active set (uses inline style)
                  : "bg-muted text-muted-foreground" // Upcoming set
            }`}
            style={
              index === currentSetIndex
                ? {
                    backgroundColor: themeColor === "default" ? "#FFA500" : "var(--md-primary)", // Keep theme color for active
                    color: "var(--primary-foreground)", // Text color for active set number
                  }
                : {}
            }
          >
            {index + 1}
          </div>
        ))}
      </div>

      {/* Set card */}
      <div className="flex-1 px-4">
        <div className="bg-card text-card-foreground p-6 rounded-lg max-w-md mx-auto shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Set {currentSetIndex + 1}</h3>
            <div className="flex items-center gap-3">
              <button
                className="text-sm px-2 py-1 rounded-md transition-colors active:scale-95"
                style={{
                  backgroundColor:
                    inputMode === "text" ? (themeColor === "default" ? "#FFA500" : "var(--md-primary)") : "transparent",
                  color: inputMode === "text" ? "var(--primary-foreground)" : "var(--foreground)",
                  border: `1px solid ${themeColor === "default" ? "#FFA500" : "var(--md-primary)"}`,
                }}
                onClick={toggleInputMode}
                aria-label={`Switch to ${inputMode === "slider" ? "text" : "slider"} input mode`}
              >
                {inputMode === "slider" ? "Use Text Input" : "Use Slider"}
              </button>
              <div className="flex items-center">
                <span
                  className="text-2xl font-bold mr-1"
                  style={{ color: themeColor === "default" ? "#FFA500" : "var(--md-primary)" }}
                >
                  {currentSetConfig?.targetReps || 0}
                </span>
                <span style={{ color: themeColor === "default" ? "#FFA500" : "var(--md-primary)" }}>reps</span>
              </div>
            </div>
          </div>

          {/* Previous workout reference */}
          <div className="bg-background p-3 rounded-md mb-4">
            {currentExercise && previousWorkoutData[currentExercise.exerciseId] ? (
              <>
                <div className="text-sm text-muted-foreground mb-1">
                  Last time: {previousWorkoutData[currentExercise.exerciseId].date}
                </div>
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 mr-2"
                    style={{ backgroundColor: themeColor === "default" ? "#FFA500" : "var(--md-primary)" }}
                  ></div>
                  <span className="font-bold text-foreground">{previousWorkoutData[currentExercise.exerciseId].weight}lbs</span>
                  <span className="mx-2 text-muted-foreground">•</span>
                  <span className="font-bold text-foreground">{previousWorkoutData[currentExercise.exerciseId].reps} reps</span>
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No previous data for this exercise</div>
            )}
          </div>

          {/* Weight input */}
          <div className="mb-4">
            <label className="block text-muted-foreground mb-2">Weight (lbs)</label>
            {inputMode === "slider" ? (
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="2.5"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                  style={
                    {
                      "--range-thumb-bg": themeColor === "default" ? "#FFA500" : "var(--md-primary)",
                    } as React.CSSProperties
                  }
                  aria-label="Weight in pounds"
                />
                <div
                  className="w-6 h-6 rounded-full absolute pointer-events-none"
                  style={{
                    backgroundColor: themeColor === "default" ? "#FFA500" : "var(--md-primary)",
                    left: `${(weight / 500) * 100}%`,
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                ></div>
              </div>
            ) : (
              <input
                type="number"
                min="0"
                max="500"
                step="2.5"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full bg-secondary text-foreground p-2 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Weight in pounds"
              />
            )}
            <div className="text-center mt-2 font-bold text-xl text-foreground">{weight}</div>
          </div>

          {/* Reps input */}
          <div className="mb-6">
            <label className="block text-muted-foreground mb-2">Reps Completed</label>
            {inputMode === "slider" ? (
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={reps}
                  onChange={(e) => setReps(Number(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                  style={
                    {
                      "--range-thumb-bg": themeColor === "default" ? "#FFA500" : "var(--md-primary)",
                    } as React.CSSProperties
                  }
                  aria-label="Number of reps"
                />
                <div
                  className="w-6 h-6 rounded-full absolute pointer-events-none"
                  style={{
                    backgroundColor: themeColor === "default" ? "#FFA500" : "var(--md-primary)",
                    left: `${(reps / 30) * 100}%`,
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                ></div>
              </div>
            ) : (
              <input
                type="number"
                min="0"
                max="30"
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
                className="w-full bg-secondary text-foreground p-2 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Number of reps"
              />
            )}
            <div className="text-center mt-2 font-bold text-xl text-foreground">{reps}</div>
          </div>

          {/* Complete set button */}
          <button
            className="w-full py-3 rounded-md font-bold text-primary-foreground flex items-center justify-center active:scale-95 transition-transform disabled:bg-muted disabled:text-muted-foreground"
            style={{
              backgroundColor:
                weight > 0 && reps > 0 ? (themeColor === "default" ? "#FFA500" : "var(--md-primary)") : undefined,
            }}
            onClick={completeSet}
            disabled={weight === 0 || reps === 0}
            aria-disabled={weight === 0 || reps === 0}
          >
            <Check className="h-5 w-5 mr-2" />
            COMPLETE SET
          </button>
        </div>
      </div>

      {/* Personal record animation */}
      {/* Keep PR animation separate for now, or integrate into tsParticles later if desired */}
      {showPersonalRecordAnimation && (
         <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none"> {/* Ensure PR text is above particles */}
           <div className="bg-black bg-opacity-70 p-6 rounded-lg animate-bounce">
             <h3 className="text-2xl font-bold text-white">NEW PR! 🎉</h3>
           </div>
         </div>
       )}

      {/* Audio element for timer sound */}
      <audio ref={audioRef} src="/sounds/timer-complete.mp3" />

      <style jsx>{`
      @keyframes float {
        0% { transform: translateY(0) rotate(0deg); opacity: 0; }
        10% { opacity: 0.3; }
        90% { opacity: 0.2; }
        100% { transform: translateY(-1000%) rotate(720deg); opacity: 0; }
      }
      
      input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 0; /* Change from 20px to 0 to hide it */
        height: 0; /* Change from 20px to 0 to hide it */
        background: transparent; /* Make it transparent */
        border: none;
        cursor: pointer;
      }

      input[type=range]::-moz-range-thumb {
        width: 0; /* Change from 20px to 0 to hide it */
        height: 0; /* Change from 20px to 0 to hide it */
        background: transparent; /* Make it transparent */
        border: none;
        cursor: pointer;
      }
      
      .active\:scale-95:active {
        transform: scale(0.95);
      }
      
      .transition-transform {
        transition: transform 0.1s ease;
      }
    `}</style>
    </div>
  )
}

