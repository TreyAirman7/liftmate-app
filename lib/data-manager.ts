// This is a simplified version of the data manager
// In a real implementation, this would handle all localStorage operations

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

  // Default exercises with comprehensive list
  const defaultExercises: Exercise[] = [
    { id: generateId(), name: "Barbell Squat", muscles: ["quads", "glutes", "hamstrings", "core"] },
    { id: generateId(), name: "Deadlift", muscles: ["back", "glutes", "hamstrings", "traps", "forearms"] },
    { id: generateId(), name: "Bench Press", muscles: ["chest", "shoulders", "triceps"] },
    { id: generateId(), name: "Overhead Press", muscles: ["shoulders", "triceps", "traps"] },
    { id: generateId(), name: "Barbell Row", muscles: ["back", "biceps", "forearms", "traps"] },
    { id: generateId(), name: "Pull-up", muscles: ["back", "biceps", "forearms"] },
    { id: generateId(), name: "Dip", muscles: ["chest", "triceps", "shoulders"] },
    { id: generateId(), name: "Bicep Curl", muscles: ["biceps", "forearms"] },
    { id: generateId(), name: "Triceps Extension", muscles: ["triceps"] },
    { id: generateId(), name: "Lateral Raise", muscles: ["shoulders"] },
    { id: generateId(), name: "Front Raise", muscles: ["shoulders"] },
    { id: generateId(), name: "Leg Press", muscles: ["quads", "glutes", "hamstrings"] },
    { id: generateId(), name: "Leg Extension", muscles: ["quads"] },
    { id: generateId(), name: "Hamstring Curl", muscles: ["hamstrings"] },
    { id: generateId(), name: "Calf Raise", muscles: ["calves"] },
    { id: generateId(), name: "Lunge", muscles: ["quads", "glutes", "hamstrings"] },
    { id: generateId(), name: "Dumbbell Bench Press", muscles: ["chest", "shoulders", "triceps"] },
    { id: generateId(), name: "Dumbbell Row", muscles: ["back", "biceps", "forearms"] },
    { id: generateId(), name: "Dumbbell Shoulder Press", muscles: ["shoulders", "triceps"] },
    { id: generateId(), name: "Romanian Deadlift", muscles: ["hamstrings", "glutes", "back"] },
    { id: generateId(), name: "Clean and Jerk", muscles: ["quads", "glutes", "shoulders", "triceps", "traps", "core"] },
    { id: generateId(), name: "Snatch", muscles: ["quads", "glutes", "shoulders", "triceps", "traps", "core"] },
    { id: generateId(), name: "Incline Bench Press", muscles: ["chest", "shoulders", "triceps"] },
    { id: generateId(), name: "Decline Bench Press", muscles: ["chest", "triceps"] },
    { id: generateId(), name: "Close-Grip Bench Press", muscles: ["triceps", "chest", "shoulders"] },
    { id: generateId(), name: "Sumo Deadlift", muscles: ["quads", "glutes", "hamstrings", "back", "traps"] },
    { id: generateId(), name: "Front Squat", muscles: ["quads", "glutes", "core"] },
    { id: generateId(), name: "Hack Squat", muscles: ["quads", "glutes", "hamstrings"] },
    { id: generateId(), name: "Bulgarian Split Squat", muscles: ["quads", "glutes", "hamstrings", "core"] },
    { id: generateId(), name: "Good Morning", muscles: ["hamstrings", "glutes", "back"] },
    { id: generateId(), name: "Skullcrusher", muscles: ["triceps"] },
    { id: generateId(), name: "Hammer Curl", muscles: ["biceps", "forearms"] },
    { id: generateId(), name: "Concentration Curl", muscles: ["biceps"] },
    { id: generateId(), name: "Preacher Curl", muscles: ["biceps"] },
    { id: generateId(), name: "Triceps Pushdown", muscles: ["triceps"] },
    { id: generateId(), name: "Bent-Over Lateral Raise", muscles: ["shoulders"] },
    { id: generateId(), name: "Upright Row", muscles: ["shoulders", "traps"] },
    { id: generateId(), name: "Arnold Press", muscles: ["shoulders", "triceps"] },
    { id: generateId(), name: "Shrugs", muscles: ["traps"] },
    { id: generateId(), name: "Seated Cable Row", muscles: ["back", "biceps"] },
    { id: generateId(), name: "Lat Pulldown", muscles: ["back", "biceps", "forearms"] },
    { id: generateId(), name: "Chin-up", muscles: ["back", "biceps"] },
    { id: generateId(), name: "Weighted Push-up", muscles: ["chest", "shoulders", "triceps"] },
    { id: generateId(), name: "Glute Bridge", muscles: ["glutes", "hamstrings"] },
    { id: generateId(), name: "Hip Thrust", muscles: ["glutes", "hamstrings"] },
    { id: generateId(), name: "Kettlebell Swing", muscles: ["glutes", "hamstrings", "back", "shoulders"] },
    { id: generateId(), name: "Turkish Get-up", muscles: ["shoulders", "core", "glutes", "quads"] },
    { id: generateId(), name: "Goblet Squat", muscles: ["quads", "glutes", "core"] },
    { id: generateId(), name: "Zercher Squat", muscles: ["quads", "glutes", "core", "forearms"] },
    { id: generateId(), name: "Power Clean", muscles: ["quads", "glutes", "traps", "shoulders", "core"] },
    { id: generateId(), name: "Power Snatch", muscles: ["quads", "glutes", "traps", "shoulders", "core"] },
    { id: generateId(), name: "Push Press", muscles: ["shoulders", "triceps", "quads"] },
    { id: generateId(), name: "Farmer's Walk", muscles: ["forearms", "traps", "core", "quads"] },
    { id: generateId(), name: "Z Press", muscles: ["shoulders", "triceps", "core"] },
    { id: generateId(), name: "Face Pull", muscles: ["shoulders", "traps", "back"] },
    { id: generateId(), name: "Dumbbell Pullover", muscles: ["chest", "back", "triceps"] },
    { id: generateId(), name: "Barbell Pullover", muscles: ["chest", "back", "triceps"] },
    { id: generateId(), name: "Reverse Fly", muscles: ["shoulders", "back"] },
    { id: generateId(), name: "Wrist Curl", muscles: ["forearms"] },
    { id: generateId(), name: "Reverse Wrist Curl", muscles: ["forearms"] },
    { id: generateId(), name: "Box Squat", muscles: ["quads", "glutes", "hamstrings"] },
    { id: generateId(), name: "Pin Squat", muscles: ["quads", "glutes", "hamstrings"] },
    { id: generateId(), name: "Rack Pull", muscles: ["back", "traps", "glutes", "hamstrings"] },
    { id: generateId(), name: "Deficit Deadlift", muscles: ["back", "glutes", "hamstrings", "quads"] },
    { id: generateId(), name: "Stiff-Legged Deadlift", muscles: ["hamstrings", "glutes", "back"] },
    { id: generateId(), name: "Single-Leg Romanian Deadlift", muscles: ["hamstrings", "glutes", "core"] },
    { id: generateId(), name: "Step-up", muscles: ["quads", "glutes", "hamstrings"] },
    { id: generateId(), name: "Dumbbell Fly", muscles: ["chest"] },
    { id: generateId(), name: "Cable Crossover", muscles: ["chest"] },
    { id: generateId(), name: "Pec Deck Fly", muscles: ["chest"] },
    { id: generateId(), name: "Leg Adduction Machine", muscles: ["adductors"] },
    { id: generateId(), name: "Leg Abduction Machine", muscles: ["abductors", "glutes"] },
    { id: generateId(), name: "Seated Calf Raise", muscles: ["calves"] },
    { id: generateId(), name: "Standing Calf Raise", muscles: ["calves"] },
    { id: generateId(), name: "Clean Pull", muscles: ["back", "traps", "glutes", "hamstrings"] },
    { id: generateId(), name: "Snatch Pull", muscles: ["back", "traps", "glutes", "hamstrings"] },
    { id: generateId(), name: "Jerk Drive", muscles: ["quads", "glutes", "shoulders"] },
    { id: generateId(), name: "Split Jerk", muscles: ["quads", "glutes", "shoulders", "triceps"] },
    { id: generateId(), name: "Power Jerk", muscles: ["quads", "glutes", "shoulders", "triceps"] },
    { id: generateId(), name: "Squat Jerk", muscles: ["quads", "glutes", "shoulders", "triceps"] },
    { id: generateId(), name: "Hang Clean", muscles: ["quads", "glutes", "traps", "shoulders"] },
    { id: generateId(), name: "Hang Snatch", muscles: ["quads", "glutes", "traps", "shoulders"] },
    { id: generateId(), name: "Muscle Snatch", muscles: ["shoulders", "traps", "back"] },
    { id: generateId(), name: "Snatch Balance", muscles: ["quads", "shoulders", "core"] },
    { id: generateId(), name: "Anderson Squat", muscles: ["quads", "glutes", "hamstrings"] },
    { id: generateId(), name: "Safety Bar Squat", muscles: ["quads", "glutes", "back"] },
    { id: generateId(), name: "Belt Squat", muscles: ["quads", "glutes", "hamstrings"] },
    { id: generateId(), name: "Hatfield Squat", muscles: ["quads", "glutes", "hamstrings"] },
    { id: generateId(), name: "Single Leg Squat (Pistol Squat)", muscles: ["quads", "glutes", "hamstrings", "core"] },
    { id: generateId(), name: "Sissy Squat", muscles: ["quads"] },
    { id: generateId(), name: "Jefferson Deadlift", muscles: ["quads", "glutes", "hamstrings", "back"] },
    { id: generateId(), name: "Suitcase Deadlift", muscles: ["back", "obliques", "forearms", "traps"] },
    { id: generateId(), name: "Trap Bar Deadlift", muscles: ["quads", "glutes", "hamstrings", "back"] },
    { id: generateId(), name: "Board Press", muscles: ["chest", "triceps", "shoulders"] },
    { id: generateId(), name: "Floor Press", muscles: ["chest", "triceps", "shoulders"] },
    { id: generateId(), name: "Spoto Press", muscles: ["chest", "triceps", "shoulders"] },
    { id: generateId(), name: "Larsen Press", muscles: ["chest", "triceps", "shoulders"] },
    { id: generateId(), name: "Wide Grip Bench Press", muscles: ["chest", "shoulders"] },
    { id: generateId(), name: "Reverse Grip Bench Press", muscles: ["chest", "triceps"] },
    { id: generateId(), name: "Guillotine Press", muscles: ["chest", "shoulders"] },
    { id: generateId(), name: "Dumbbell Floor Press", muscles: ["chest", "triceps"] },
    { id: generateId(), name: "Single Arm Dumbbell Bench Press", muscles: ["chest", "triceps", "shoulders", "core"] },
    { id: generateId(), name: "Seated Barbell Press", muscles: ["shoulders", "triceps"] },
    { id: generateId(), name: "Seated Dumbbell Press", muscles: ["shoulders", "triceps"] },
    { id: generateId(), name: "Viking Press", muscles: ["shoulders", "triceps", "traps"] },
    { id: generateId(), name: "Log Press", muscles: ["shoulders", "triceps", "traps", "core"] },
    { id: generateId(), name: "Axle Press", muscles: ["shoulders", "triceps", "forearms"] },
    { id: generateId(), name: "Bradford Press", muscles: ["shoulders", "traps"] },
    { id: generateId(), name: "Klokov Press", muscles: ["shoulders", "triceps", "traps"] },
    { id: generateId(), name: "Behind The Neck Press", muscles: ["shoulders", "triceps", "traps"] },
    { id: generateId(), name: "Pendlay Row", muscles: ["back", "biceps", "forearms"] },
    { id: generateId(), name: "T-Bar Row", muscles: ["back", "biceps", "forearms"] },
    { id: generateId(), name: "Chest Supported Row", muscles: ["back", "biceps"] },
    { id: generateId(), name: "Meadows Row", muscles: ["back", "biceps", "forearms"] },
    { id: generateId(), name: "Kroc Row", muscles: ["back", "biceps", "forearms", "traps"] },
    { id: generateId(), name: "Single Arm Cable Row", muscles: ["back", "biceps", "core"] },
    { id: generateId(), name: "High Row", muscles: ["back", "traps", "biceps"] },
    { id: generateId(), name: "Inverted Row", muscles: ["back", "biceps"] },
    { id: generateId(), name: "Yates Row", muscles: ["back", "biceps", "forearms"] },
    { id: generateId(), name: "Seal Row", muscles: ["back", "biceps"] },
    { id: generateId(), name: "Weighted Muscle Up", muscles: ["back", "biceps", "triceps", "shoulders", "chest"] },
    { id: generateId(), name: "Wide Grip Pull-up", muscles: ["back", "biceps"] },
    { id: generateId(), name: "Neutral Grip Pull-up", muscles: ["back", "biceps"] },
    { id: generateId(), name: "Sternum Chin-up", muscles: ["back", "biceps"] },
    { id: generateId(), name: "Towel Pull-up", muscles: ["back", "biceps", "forearms"] },
    { id: generateId(), name: "Cable Curl", muscles: ["biceps"] },
    { id: generateId(), name: "Spider Curl", muscles: ["biceps"] },
    { id: generateId(), name: "Incline Dumbbell Curl", muscles: ["biceps"] },
    { id: generateId(), name: "Drag Curl", muscles: ["biceps"] },
    { id: generateId(), name: "Reverse Curl", muscles: ["forearms", "biceps"] },
    { id: generateId(), name: "Zottman Curl", muscles: ["biceps", "forearms"] },
    { id: generateId(), name: "Waiter's Curl", muscles: ["biceps", "forearms"] },
    { id: generateId(), name: "Overhead Dumbbell Extension", muscles: ["triceps"] },
    { id: generateId(), name: "Cable Overhead Extension", muscles: ["triceps"] },
    { id: generateId(), name: "JM Press", muscles: ["triceps", "shoulders"] },
    { id: generateId(), name: "Tate Press", muscles: ["triceps"] },
    { id: generateId(), name: "Close Grip Push-up", muscles: ["triceps", "chest", "shoulders"] },
    { id: generateId(), name: "Machine Dip", muscles: ["chest", "triceps"] },
    { id: generateId(), name: "Weighted Bench Dip", muscles: ["triceps", "chest", "shoulders"] },
    { id: generateId(), name: "Weighted Ring Dip", muscles: ["chest", "triceps", "shoulders"] },
    { id: generateId(), name: "Dumbbell Kickback", muscles: ["triceps"] },
    { id: generateId(), name: "Cable Kickback", muscles: ["triceps"] },
    { id: generateId(), name: "Cable Lateral Raise", muscles: ["shoulders"] },
    { id: generateId(), name: "Leaning Dumbbell Lateral Raise", muscles: ["shoulders"] },
    { id: generateId(), name: "Cable Front Raise", muscles: ["shoulders"] },
    { id: generateId(), name: "Plate Front Raise", muscles: ["shoulders"] },
    { id: generateId(), name: "Dumbbell Rear Delt Fly", muscles: ["shoulders"] },
    { id: generateId(), name: "Cable Rear Delt Fly", muscles: ["shoulders"] },
    { id: generateId(), name: "Lu Raise", muscles: ["shoulders", "traps"] },
    { id: generateId(), name: "Y-Raise", muscles: ["shoulders", "traps"] },
    { id: generateId(), name: "Powell Raise", muscles: ["shoulders"] },
    { id: generateId(), name: "Cuban Press", muscles: ["shoulders", "traps"] },
    { id: generateId(), name: "Scott Press", muscles: ["shoulders"] },
    { id: generateId(), name: "Reverse Lunge", muscles: ["quads", "glutes", "hamstrings"] },
    { id: generateId(), name: "Walking Lunge", muscles: ["quads", "glutes", "hamstrings"] },
    { id: generateId(), name: "Curtsy Lunge", muscles: ["glutes", "quads", "adductors"] },
    { id: generateId(), name: "Glute Kickback Machine", muscles: ["glutes"] },
    { id: generateId(), name: "Cable Glute Kickback", muscles: ["glutes"] },
    { id: generateId(), name: "Reverse Hyperextension", muscles: ["glutes", "hamstrings", "back"] },
    { id: generateId(), name: "Weighted Hyperextension", muscles: ["back", "glutes", "hamstrings"] },
    { id: generateId(), name: "Donkey Calf Raise", muscles: ["calves"] },
    { id: generateId(), name: "Tibialis Raise", muscles: ["tibialis anterior"] },
    { id: generateId(), name: "Seated Leg Curl", muscles: ["hamstrings"] },
    { id: generateId(), name: "Lying Leg Curl", muscles: ["hamstrings"] },
    { id: generateId(), name: "Standing Leg Curl", muscles: ["hamstrings"] },
    { id: generateId(), name: "Glute Ham Raise", muscles: ["hamstrings", "glutes", "back"] },
    { id: generateId(), name: "Atlas Stone Lift", muscles: ["back", "legs", "arms", "core"] },
    { id: generateId(), name: "Log Clean and Press", muscles: ["legs", "back", "shoulders", "triceps"] },
    { id: generateId(), name: "Axle Clean and Press", muscles: ["legs", "back", "shoulders", "triceps", "forearms"] },
    { id: generateId(), name: "Tire Flip", muscles: ["legs", "back", "shoulders", "arms"] },
    { id: generateId(), name: "Yoke Walk", muscles: ["legs", "back", "core", "traps"] },
    { id: generateId(), name: "Sandbag Carry", muscles: ["legs", "back", "arms", "core"] },
    { id: generateId(), name: "Sandbag Load", muscles: ["legs", "back", "arms", "core"] },
    { id: generateId(), name: "Keg Toss", muscles: ["legs", "back", "shoulders", "arms"] },
    { id: generateId(), name: "Husafell Stone Carry", muscles: ["legs", "back", "arms", "core"] },
    { id: generateId(), name: "Weighted Crunch", muscles: ["abs"] },
    { id: generateId(), name: "Cable Crunch", muscles: ["abs"] },
    { id: generateId(), name: "Weighted Plank", muscles: ["abs", "core"] },
    { id: generateId(), name: "Dumbbell Side Bend", muscles: ["obliques"] },
    { id: generateId(), name: "Cable Side Bend", muscles: ["obliques"] },
    { id: generateId(), name: "Weighted Russian Twist", muscles: ["obliques", "abs"] },
    { id: generateId(), name: "Woodchopper (Cable High-to-Low)", muscles: ["obliques", "abs"] },
    { id: generateId(), name: "Woodchopper (Cable Low-to-High)", muscles: ["obliques", "abs"] },
    { id: generateId(), name: "Pallof Press", muscles: ["core", "obliques"] },
    { id: generateId(), name: "Weighted Ab Rollout", muscles: ["abs", "core"] },
    { id: generateId(), name: "Weighted Hanging Leg Raise", muscles: ["abs", "hip flexors"] },
    { id: generateId(), name: "Landmine Twist", muscles: ["obliques", "core"] },
    { id: generateId(), name: "Suitcase Carry", muscles: ["obliques", "forearms", "traps"] },
    { id: generateId(), name: "Pinch Grip Hold", muscles: ["forearms"] },
    { id: generateId(), name: "Neck Harness Extension", muscles: ["neck"] },
    { id: generateId(), name: "Neck Harness Flexion", muscles: ["neck"] },
    { id: generateId(), name: "Behind the Back Shrug", muscles: ["traps"] },
    { id: generateId(), name: "Snatch Grip Deadlift", muscles: ["back", "traps", "glutes", "hamstrings"] },
    { id: generateId(), name: "Clean Grip Deadlift", muscles: ["back", "traps", "glutes", "hamstrings"] },
    { id: generateId(), name: "Kettlebell Windmill", muscles: ["obliques", "shoulders", "hamstrings"] },
    { id: generateId(), name: "Dumbbell Windmill", muscles: ["obliques", "shoulders", "hamstrings"] },
    { id: generateId(), name: "Bottoms Up Press", muscles: ["shoulders", "forearms", "core"] },
    { id: generateId(), name: "Machine Chest Press (Incline)", muscles: ["chest", "shoulders", "triceps"] },
    { id: generateId(), name: "Machine Chest Press (Flat)", muscles: ["chest", "shoulders", "triceps"] },
    { id: generateId(), name: "Machine Chest Press (Decline)", muscles: ["chest", "triceps"] },
    { id: generateId(), name: "Machine Shoulder Press", muscles: ["shoulders", "triceps"] },
    { id: generateId(), name: "Machine High Row", muscles: ["back", "traps", "biceps"] },
    { id: generateId(), name: "Machine Low Row", muscles: ["back", "biceps"] },
    { id: generateId(), name: "Machine Wide Grip Row", muscles: ["back", "biceps"] },
    { id: generateId(), name: "Machine Neutral Grip Row", muscles: ["back", "biceps"] },
    { id: generateId(), name: "Machine Bicep Curl", muscles: ["biceps"] },
    { id: generateId(), name: "Machine Triceps Extension", muscles: ["triceps"] },
    { id: generateId(), name: "Machine Lateral Raise", muscles: ["shoulders"] },
    { id: generateId(), name: "Machine Rear Delt Fly", muscles: ["shoulders"] },
    { id: generateId(), name: "Seated Dip Machine", muscles: ["chest", "triceps"] },
    { id: generateId(), name: "Cable Pull-Through", muscles: ["glutes", "hamstrings"] },
    { id: generateId(), name: "Single Arm Lat Pulldown", muscles: ["back", "biceps", "core"] },
    { id: generateId(), name: "Straight Arm Pulldown", muscles: ["back", "chest"] },
    { id: generateId(), name: "Cable Hammer Curl (Rope)", muscles: ["biceps", "forearms"] },
    { id: generateId(), name: "Overhead Cable Curl", muscles: ["biceps"] },
    { id: generateId(), name: "Single Arm Triceps Pushdown", muscles: ["triceps"] },
    { id: generateId(), name: "Reverse Grip Triceps Pushdown", muscles: ["triceps"] },
    { id: generateId(), name: "Lying Cable Curl", muscles: ["biceps"] },
    { id: generateId(), name: "Decline Dumbbell Bench Press", muscles: ["chest", "triceps"] },
    { id: generateId(), name: "Incline Dumbbell Fly", muscles: ["chest"] },
    { id: generateId(), name: "Decline Dumbbell Fly", muscles: ["chest"] },
    { id: generateId(), name: "Bent Press", muscles: ["shoulders", "obliques", "legs"] },
    { id: generateId(), name: "Svend Press", muscles: ["chest", "shoulders"] },
    { id: generateId(), name: "Plate Pinch Curl", muscles: ["biceps", "forearms"] },
    { id: generateId(), name: "Barbell Hack Squat (Behind Back)", muscles: ["quads", "glutes"] },
    { id: generateId(), name: "Conan's Wheel", muscles: ["legs", "back", "core", "shoulders"] },
    { id: generateId(), name: "V-Bar Pulldown", muscles: ["back", "biceps"] },
    { id: generateId(), name: "Rope Face Pull", muscles: ["shoulders", "traps", "back"] },
    { id: generateId(), name: "Cross Body Hammer Curl", muscles: ["biceps", "forearms"] },
    { id: generateId(), name: "Waiter's Walk", muscles: ["shoulders", "core", "forearms"] },
    { id: generateId(), name: "Barbell Jefferson Curl", muscles: ["back", "hamstrings"] },
    { id: generateId(), name: "Barbell Rollout", muscles: ["abs", "core", "shoulders"] },
    { id: generateId(), name: "Standing Calf Raise Machine", muscles: ["calves"] },
    { id: generateId(), name: "Single Leg Extension Machine", muscles: ["quads"] },
    { id: generateId(), name: "Single Leg Curl Machine", muscles: ["hamstrings"] },
    { id: generateId(), name: "Standing Hip Abduction Machine", muscles: ["glutes", "abductors"] },
    { id: generateId(), name: "Standing Hip Adduction Machine", muscles: ["adductors"] },
    { id: generateId(), name: "Weighted Band Pull-Apart", muscles: ["shoulders", "back", "traps"] },
    { id: generateId(), name: "Thor's Hammer (Levering)", muscles: ["forearms", "wrists"] },
    { id: generateId(), name: "Wrist Roller", muscles: ["forearms", "wrists"] },
    { id: generateId(), name: "Heavy Gripper Work", muscles: ["forearms", "grip"] },
    { id: generateId(), name: "Fat Bar Bench Press", muscles: ["chest", "shoulders", "triceps", "forearms"] },
    { id: generateId(), name: "Fat Bar Deadlift", muscles: ["back", "glutes", "hamstrings", "forearms"] },
    { id: generateId(), name: "Fat Bar Curls", muscles: ["biceps", "forearms"] },
    { id: generateId(), name: "Snatch Grip Push Press", muscles: ["shoulders", "triceps", "legs"] },
    { id: generateId(), name: "Clean Grip Push Press", muscles: ["shoulders", "triceps", "legs"] },
    { id: generateId(), name: "One Arm Dumbbell Snatch", muscles: ["shoulders", "traps", "legs", "core"] },
    { id: generateId(), name: "One Arm Dumbbell Clean and Jerk", muscles: ["shoulders", "legs", "core"] },
    { id: generateId(), name: "Circus Dumbbell Press", muscles: ["shoulders", "triceps", "core"] },
    { id: generateId(), name: "Zercher Carry", muscles: ["legs", "back", "core", "forearms"] },
    { id: generateId(), name: "Sandbag Squat", muscles: ["quads", "glutes", "back", "core"] },
    { id: generateId(), name: "Sandbag Press", muscles: ["shoulders", "triceps", "core"] },
    { id: generateId(), name: "Sandbag Row", muscles: ["back", "biceps", "core"] },
    { id: generateId(), name: "Block Weight Lift", muscles: ["legs", "back", "grip"] },
    { id: generateId(), name: "Incline Dumbbell Row", muscles: ["back", "biceps"] },
    { id: generateId(), name: "Seated Good Morning", muscles: ["hamstrings", "glutes", "back"] },
    { id: generateId(), name: "Lumberjack Squat (Landmine)", muscles: ["quads", "glutes", "shoulders"] },
    { id: generateId(), name: "Pause Squat", muscles: ["quads", "glutes", "hamstrings"] },
    { id: generateId(), name: "Pause Deadlift", muscles: ["back", "glutes", "hamstrings"] },
    { id: generateId(), name: "Pause Bench Press", muscles: ["chest", "shoulders", "triceps"] },
    { id: generateId(), name: "Single Leg Press", muscles: ["quads", "glutes", "hamstrings"] },
    { id: generateId(), name: "Calf Press on Leg Press Machine", muscles: ["calves"] },
    { id: generateId(), name: "Reverse Pec Deck", muscles: ["shoulders", "back"] },
    { id: generateId(), name: "Smith Machine Squat", muscles: ["quads", "glutes", "hamstrings"] },
    { id: generateId(), name: "Smith Machine Bench Press", muscles: ["chest", "shoulders", "triceps"] },
    { id: generateId(), name: "Smith Machine Overhead Press", muscles: ["shoulders", "triceps"] },
    { id: generateId(), name: "Smith Machine Row", muscles: ["back", "biceps"] },
    { id: generateId(), name: '  name: "Smith Machine Row', muscles: ["back", "biceps"] },
    { id: generateId(), name: "Smith Machine Shrug", muscles: ["traps"] },
    { id: generateId(), name: "Walking Barbell Lunge", muscles: ["quads", "glutes", "hamstrings"] },
    { id: generateId(), name: "Barbell Step Up", muscles: ["quads", "glutes", "hamstrings"] },
    { id: generateId(), name: "Weighted Side Lunge", muscles: ["quads", "glutes", "adductors"] },
    { id: generateId(), name: "Landmine Press (Single Arm)", muscles: ["shoulders", "triceps", "core"] },
    { id: generateId(), name: "Landmine Press (Double Arm)", muscles: ["shoulders", "triceps"] },
    { id: generateId(), name: "Landmine Row", muscles: ["back", "biceps"] },
    { id: generateId(), name: "Chest Supported T-Bar Row", muscles: ["back", "biceps"] },
    { id: generateId(), name: "Weighted Decline Sit-up", muscles: ["abs"] },
    { id: generateId(), name: "Weighted GHD Sit-up", muscles: ["abs", "hip flexors"] },
    { id: generateId(), name: "Cable Pull Over", muscles: ["back", "chest"] },
    { id: generateId(), name: "Dumbbell Power Snatch", muscles: ["shoulders", "traps", "legs"] },
    { id: generateId(), name: "Dumbbell Hang Clean", muscles: ["shoulders", "traps", "legs"] },
    { id: generateId(), name: "Weighted Isometric Holds", muscles: ["varies by position"] },
    { id: generateId(), name: "Ab Rollout", muscles: ["abs", "core", "shoulders"] },
    { id: generateId(), name: "Back Extension", muscles: ["back", "hamstrings", "glutes"] },
    { id: generateId(), name: "Back Squat", muscles: ["quads", "hamstrings", "glutes", "legs"] },
    { id: generateId(), name: "Bar Triceps Pushdown", muscles: ["triceps"] },
    { id: generateId(), name: "Barbell Curl", muscles: ["biceps", "forearms"] },
    { id: generateId(), name: "Barbell Floor Press", muscles: ["chest", "triceps"] },
    { id: generateId(), name: "Barbell Hip Thrust", muscles: ["glutes", "hamstrings"] },
    { id: generateId(), name: "Barbell Shrug", muscles: ["traps"] },
    { id: generateId(), name: "Bench Dips", muscles: ["triceps"] },
    { id: generateId(), name: "Bent-Over Row", muscles: ["back"] },
    { id: generateId(), name: "Box Jump", muscles: ["quads", "hamstrings"] },
    { id: generateId(), name: "Cable Fly", muscles: ["chest"] },
  ]

  // Create exercise ID map for reference in templates
  const exerciseIdMap: Record<string, string> = {}
  defaultExercises.forEach((exercise) => {
    exerciseIdMap[exercise.name] = exercise.id
  })

  // Default template - Full Body Workout
  const defaultTemplate: WorkoutTemplate = {
    id: generateId(),
    name: "Full Body Workout",
    lastUsed: new Date().toISOString(), // Set as recently used
    exercises: [
      {
        exerciseId: exerciseIdMap["Squat"] || generateId(),
        exerciseName: "Squat",
        sets: [
          { targetReps: 10, restTime: 90 },
          { targetReps: 10, restTime: 90 },
          { targetReps: 8, restTime: 90 },
        ],
      },
      {
        exerciseId: exerciseIdMap["Bench Press"] || generateId(),
        exerciseName: "Bench Press",
        sets: [
          { targetReps: 12, restTime: 60 },
          { targetReps: 10, restTime: 60 },
          { targetReps: 8, restTime: 60 },
        ],
      },
      {
        exerciseId: exerciseIdMap["Barbell Row"] || generateId(),
        exerciseName: "Barbell Row",
        sets: [
          { targetReps: 12, restTime: 60 },
          { targetReps: 12, restTime: 60 },
          { targetReps: 10, restTime: 60 },
        ],
      },
      {
        exerciseId: exerciseIdMap["Overhead Press"] || generateId(),
        exerciseName: "Overhead Press",
        sets: [
          { targetReps: 10, restTime: 60 },
          { targetReps: 10, restTime: 60 },
          { targetReps: 8, restTime: 60 },
        ],
      },
      {
        exerciseId: exerciseIdMap["Bicep Curl"] || generateId(),
        exerciseName: "Bicep Curl",
        sets: [
          { targetReps: 12, restTime: 45 },
          { targetReps: 12, restTime: 45 },
          { targetReps: 12, restTime: 45 },
        ],
      },
      {
        exerciseId: exerciseIdMap["Tricep Extension"] || generateId(),
        exerciseName: "Tricep Extension",
        sets: [
          { targetReps: 12, restTime: 45 },
          { targetReps: 12, restTime: 45 },
          { targetReps: 12, restTime: 45 },
        ],
      },
    ],
  }

  // Save defaults to localStorage
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings))
  localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(defaultProfile))
  localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(defaultExercises))
  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify([defaultTemplate]))
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

