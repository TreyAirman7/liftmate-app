"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { CompletedWorkout } from "@/lib/data-manager"
import DataManager from "@/lib/data-manager"

interface WorkoutContextType {
  workouts: CompletedWorkout[]
  refreshWorkouts: () => Promise<void>
  addWorkout: (workout: CompletedWorkout) => Promise<void>
  deleteWorkout: (id: string) => Promise<void>
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined)

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [workouts, setWorkouts] = useState<CompletedWorkout[]>([])

  // Load workouts on mount
  useEffect(() => {
    refreshWorkouts()
  }, [])

  // Function to refresh workouts from storage
  const refreshWorkouts = async () => {
    try {
      // Initialize storage if needed
      DataManager.initializeStorage()

      // Get workouts from localStorage
      const loadedWorkouts = DataManager.getWorkouts()
      setWorkouts(loadedWorkouts)
    } catch (error) {
      console.error("Failed to load workouts:", error)
      setWorkouts([])
    }
  }

  // Function to add a new workout
  const addWorkout = async (workout: CompletedWorkout) => {
    try {
      // Save to storage
      DataManager.saveWorkout(workout)

      // Optimistically update state
      setWorkouts((prev) => [workout, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())) // Keep sorted
      // Optionally, refresh from source to ensure consistency, though optimistic update should work
      // await refreshWorkouts(); // Uncomment if optimistic update proves unreliable
    } catch (error) {
      console.error("Failed to add workout:", error)
      throw error
    }
  }

  // Function to delete a workout
  const deleteWorkout = async (id: string) => {
    try {
      // Delete from storage
      DataManager.deleteWorkout(id)

      // Update state
      setWorkouts((prev) => prev.filter((workout) => workout.id !== id))
    } catch (error) {
      console.error("Failed to delete workout:", error)
      throw error
    }
  }

  return (
    <WorkoutContext.Provider value={{ workouts, refreshWorkouts, addWorkout, deleteWorkout }}>
      {children}
    </WorkoutContext.Provider>
  )
}

export function useWorkouts() {
  const context = useContext(WorkoutContext)
  if (context === undefined) {
    throw new Error("useWorkouts must be used within a WorkoutProvider")
  }
  return context
}

