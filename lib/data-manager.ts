// This is a simplified version of the data manager
// In a real implementation, this would handle all localStorage operations

import { preloadedExercises } from "./exercise-data";
import { preloadedTemplates } from "./template-data";

export interface Exercise {
  id: string
  name: string
  muscles: string[]
}

export interface WorkoutSet {
  weight: number
  reps: number
  timestamp: string
}

export interface ExerciseInWorkout {
  exerciseId: string
  exerciseName: string
  sets: WorkoutSet[]
}

// Update the WorkoutTemplate interface to include category and description
export interface WorkoutTemplate {
  id: string
  name: string
  description?: string | null
  category?: string | null
  lastUsed: string | null
  exercises: {
    exerciseId: string
    exerciseName: string
    sets: {
      targetReps: number
      restTime: number
    }[]
  }[]
}

export interface CompletedWorkout {
  id: string
  date: string
  duration: number
  templateId: string | null
  templateName: string | null
  exercises: ExerciseInWorkout[]
  stats?: {
    totalVolume: number
    totalSets: number
    completedExercises: number
    averageWeight: number
  }
}

// Update the UserSettings interface to include theme
export interface UserSettings {
  weightUnit: "kg" | "lbs"
  theme: string
  darkMode: boolean
}

export interface UserProfile {
  name: string
  sex: string
  age: number
  joinDate: string
}

// Storage keys
const STORAGE_KEYS = {
  EXERCISES: "liftmate-exercises",
  TEMPLATES: "liftmate-templates",
  WORKOUTS: "liftmate-workouts",
  ACTIVE_WORKOUT: "liftmate-active-workout",
  SETTINGS: "liftmate-settings",
  USER_PROFILE: "liftmate-user-profile",
}

// Helper to generate unique IDs
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// Update the initializeStorage function to include a default template
const initializeStorage = (): void => {
  // Check if storage is already initialized
  if (localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    return
  }

  // Default settings
  const defaultSettings: UserSettings = {
    weightUnit: "lbs",
    theme: "teal",
    darkMode: false,
  }

  // Default user profile
  const defaultProfile: UserProfile = {
    name: "User",
    sex: "",
    age: 0,
    joinDate: new Date().toISOString(),
  }


  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings))
  localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(defaultProfile))
  localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(preloadedExercises)) // Initialize with preloaded exercises
  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(preloadedTemplates)) // Initialize with preloaded templates
  localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify([]))
}

// Get settings
const getSettings = (): UserSettings | null => {
  const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS)
  return settings ? JSON.parse(settings) : null
}

// Save settings
const saveSettings = (settings: UserSettings): void => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
}

// Get user profile
const getUserProfile = (): UserProfile | null => {
  const profile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE)
  return profile ? JSON.parse(profile) : null
}

// Save user profile
const saveUserProfile = (profile: UserProfile): void => {
  localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile))
}

// Get all templates
const getTemplates = (): WorkoutTemplate[] => {
  const templates = localStorage.getItem(STORAGE_KEYS.TEMPLATES)
  return templates ? JSON.parse(templates) : []
}

// Save template
const saveTemplate = (template: WorkoutTemplate): void => {
  const templates = getTemplates()
  const index = templates.findIndex((t) => t.id === template.id)

  if (index >= 0) {
    templates[index] = template
  } else {
    templates.push(template)
  }

  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates))
}

// Delete template
const deleteTemplate = (id: string): void => {
  const templates = getTemplates()
  const filteredTemplates = templates.filter((t) => t.id !== id)
  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(filteredTemplates))
}

// Get all workouts
const getWorkouts = (): CompletedWorkout[] => {
  const workouts = localStorage.getItem(STORAGE_KEYS.WORKOUTS)
  return workouts ? JSON.parse(workouts) : []
}

// Save workout
const saveWorkout = (workout: CompletedWorkout): void => {
  const workouts = getWorkouts()
  const index = workouts.findIndex((w) => w.id === workout.id)

  if (index >= 0) {
    workouts[index] = workout
  } else {
    workouts.push(workout)
  }

  localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts))
}

// Delete workout
const deleteWorkout = (id: string): void => {
  const workouts = getWorkouts()
  const filteredWorkouts = workouts.filter((w) => w.id !== id)
  localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(filteredWorkouts))
}

// Get exercises
const getExercises = (): Exercise[] => {
  const exercises = localStorage.getItem(STORAGE_KEYS.EXERCISES)
  return exercises ? JSON.parse(exercises) : []
}

// Save exercise
const saveExercise = (exercise: Exercise): void => {
  const exercises = getExercises()
  const index = exercises.findIndex((e) => e.id === exercise.id)

  if (index >= 0) {
    exercises[index] = exercise
  } else {
    exercises.push(exercise)
  }

  localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises))
}

// Delete exercise
const deleteExercise = (id: string): void => {
  const exercises = getExercises()
  const filteredExercises = exercises.filter((e) => e.id !== id)
  localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(filteredExercises))
}

// Export the data manager
const DataManager = {
  initializeStorage,
  generateId,
  getSettings,
  saveSettings,
  getUserProfile,
  saveUserProfile,
  getTemplates,
  saveTemplate,
  deleteTemplate,
  getWorkouts,
  saveWorkout,
  deleteWorkout,
  getExercises,
  saveExercise,
  deleteExercise,
}

export default DataManager

