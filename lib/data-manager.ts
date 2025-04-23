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

export interface GoalMilestone {
  value: number;
  targetDate: string; // ISO Date string
  achievedDate?: string | null; // ISO Date string if achieved
}

export type GoalUnit = 'kg' | 'lbs' | 'reps' | 'visits' | 'minutes';

export interface UserGoal {
  id: string; // Unique ID
  exerciseId?: string | null; // Link to Exercise interface (optional for non-exercise goals)
  exerciseName?: string | null; // Denormalized for display
  goalType: 'exercise' | 'weight' | 'visits' | 'duration'; // Type of goal
  targetValue: number;
  targetUnit: GoalUnit; // Expandable units
  startValue: number; // Value at the start date
  startDate: string; // ISO Date string
  // Optional user-defined target date
  userTargetDate?: string | null; // ISO Date string
  // Calculated fields (updated periodically or on demand)
  currentValue?: number; // Latest achieved value from workouts or manual input
  projectedDate?: string | null; // Calculated ISO Date string
  confidence?: number | null; // Calculated confidence (0-1)
  milestones?: GoalMilestone[]; // Array of milestones
  completed?: boolean; // Track completion status
}


// Storage keys
const STORAGE_KEYS = {
  EXERCISES: "liftmate-exercises",
  TEMPLATES: "liftmate-templates",
  WORKOUTS: "liftmate-workouts",
  GOALS: "liftmate-goals", // Added Goals key
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
  localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify([])) // Initialize Goals
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

// --- Goal Management ---

// Get all goals
const getGoals = (): UserGoal[] => {
  const goals = localStorage.getItem(STORAGE_KEYS.GOALS)
  return goals ? JSON.parse(goals) : []
}

// Save or update a goal
const saveGoal = (goal: UserGoal): void => {
  const goals = getGoals()
  const index = goals.findIndex((g) => g.id === goal.id)

  if (index >= 0) {
    goals[index] = goal // Update existing goal
  } else {
    goals.push(goal) // Add new goal
  }

  localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals))
}

// Delete a goal
const deleteGoal = (id: string): void => {
  const goals = getGoals()
  const filteredGoals = goals.filter((g) => g.id !== id)
  localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(filteredGoals))
}

// Update a specific goal (useful for partial updates like currentValue)
const updateGoal = (id: string, updates: Partial<UserGoal>): void => {
  const goals = getGoals()
  const index = goals.findIndex((g) => g.id === id)

  if (index >= 0) {
    goals[index] = { ...goals[index], ...updates }
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals))
  } else {
    console.warn(`Goal with id ${id} not found for update.`)
  }
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
  // Goal functions
  getGoals,
  saveGoal,
  deleteGoal,
  updateGoal,
}

export default DataManager

