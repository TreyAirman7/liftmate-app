import { WorkoutTemplate } from "./data-manager";

export const preloadedTemplates: WorkoutTemplate[] = [
  {
    id: "template-1",
    name: "Full Body Base",
    description: "Balanced full body routine targeting major muscle groups",
    category: "Full Body",
    lastUsed: null,
    exercises: [
      {
        exerciseId: "exercise-13",
        exerciseName: "Barbell Squat",
        sets: [
          { targetReps: 10, restTime: 90 },
          { targetReps: 10, restTime: 90 },
          { targetReps: 10, restTime: 90 },
          { targetReps: 10, restTime: 90 }
        ]
      },
      {
        exerciseId: "exercise-1",
        exerciseName: "Barbell Bench Press",
        sets: [
          { targetReps: 10, restTime: 90 },
          { targetReps: 10, restTime: 90 },
          { targetReps: 10, restTime: 90 },
          { targetReps: 10, restTime: 90 }
        ]
      },
      {
        exerciseId: "exercise-32",
        exerciseName: "Barbell Row",
        sets: [
          { targetReps: 10, restTime: 90 },
          { targetReps: 10, restTime: 90 },
          { targetReps: 10, restTime: 90 },
          { targetReps: 10, restTime: 90 }
        ]
      },
      {
        exerciseId: "exercise-42",
        exerciseName: "Overhead Press (Barbell)",
        sets: [
          { targetReps: 10, restTime: 90 },
          { targetReps: 10, restTime: 90 },
          { targetReps: 10, restTime: 90 },
          { targetReps: 10, restTime: 90 }
        ]
      }
    ]
  },
  {
    id: "template-2",
    name: "Push Day",
    description: "Focus on chest, shoulders, and triceps",
    category: "Push",
    lastUsed: null,
    exercises: [
      {
        exerciseId: "exercise-1",
        exerciseName: "Barbell Bench Press",
        sets: [
          { targetReps: 10, restTime: 90 },
          { targetReps: 10, restTime: 90 },
          { targetReps: 10, restTime: 90 },
          { targetReps: 10, restTime: 90 }
        ]
      },
      {
        exerciseId: "exercise-42",
        exerciseName: "Overhead Press (Barbell)",
        sets: [
          { targetReps: 10, restTime: 90 },
          { targetReps: 10, restTime: 90 },
          { targetReps: 10, restTime: 90 },
          { targetReps: 10, restTime: 90 }
        ]
      },
      {
        exerciseId: "exercise-8",
        exerciseName: "Dips",
        sets: [
          { targetReps: 10, restTime: 90 },
          { targetReps: 10, restTime: 90 },
          { targetReps: 10, restTime: 90 },
          { targetReps: 10, restTime: 90 }
        ]
      },
      {
        exerciseId: "exercise-59",
        exerciseName: "Cable Triceps Pushdown",
        sets: [
          { targetReps: 12, restTime: 60 },
          { targetReps: 12, restTime: 60 },
          { targetReps: 12, restTime: 60 },
          { targetReps: 12, restTime: 60 }
        ]
      }
    ]
  },
  {
    id: "template-3",
    name: "Pull Day",
    description: "Focus on back and biceps",
    category: "Pull",
    lastUsed: null,
    exercises: [
      {
        exerciseId: "exercise-32",
        exerciseName: "Barbell Row",
        sets: [
          { targetReps: 10, restTime: 90 },
          { targetReps: 10, restTime: 90 },
          { targetReps: 10, restTime: 90 },
          { targetReps: 10, restTime: 90 }
        ]
      },
      {
        exerciseId: "exercise-36",
        exerciseName: "Lat Pulldown",
        sets: [
          { targetReps: 10, restTime: 90 },
          { targetReps: 10, restTime: 90 },
          { targetReps: 10, restTime: 90 },
          { targetReps: 10, restTime: 90 }
        ]
      },
      {
        exerciseId: "exercise-39",
        exerciseName: "Face Pulls",
        sets: [
          { targetReps: 12, restTime: 60 },
          { targetReps: 12, restTime: 60 },
          { targetReps: 12, restTime: 60 },
          { targetReps: 12, restTime: 60 }
        ]
      },
      {
        exerciseId: "exercise-51",
        exerciseName: "Barbell Bicep Curl",
        sets: [
          { targetReps: 12, restTime: 60 },
          { targetReps: 12, restTime: 60 },
          { targetReps: 12, restTime: 60 },
          { targetReps: 12, restTime: 60 }
        ]
      }
    ]
  },
  {
    id: "template-4",
    name: "Leg Day",
    description: "Focus on quadriceps, hamstrings, and calves",
    category: "Legs",
    lastUsed: null,
    exercises: [
      {
        exerciseId: "exercise-13",
        exerciseName: "Barbell Squat",
        sets: [
          { targetReps: 10, restTime: 90 },
          { targetReps: 10, restTime: 90 },
          { targetReps: 10, restTime: 90 },
          { targetReps: 10, restTime: 90 }
        ]
      },
      {
        exerciseId: "exercise-16",
        exerciseName: "Leg Press",
        sets: [
          { targetReps: 10, restTime: 90 },
          { targetReps: 10, restTime: 90 },
          { targetReps: 10, restTime: 90 },
          { targetReps: 10, restTime: 90 }
        ]
      },
      {
        exerciseId: "exercise-19",
        exerciseName: "Leg Curl (Seated)",
        sets: [
          { targetReps: 12, restTime: 60 },
          { targetReps: 12, restTime: 60 },
          { targetReps: 12, restTime: 60 },
          { targetReps: 12, restTime: 60 }
        ]
      },
      {
        exerciseId: "exercise-25",
        exerciseName: "Calf Raise (Standing)",
        sets: [
          { targetReps: 15, restTime: 60 },
          { targetReps: 15, restTime: 60 },
          { targetReps: 15, restTime: 60 },
          { targetReps: 15, restTime: 60 }
        ]
      }
    ]
  },
  {
    id: "template-5",
    name: "Upper Body Strength",
    description: "Strength-focused upper body routine",
    category: "Upper Body",
    lastUsed: null,
    exercises: [
      {
        exerciseId: "exercise-3",
        exerciseName: "Incline Barbell Bench Press",
        sets: [
          { targetReps: 5, restTime: 120 },
          { targetReps: 5, restTime: 120 },
          { targetReps: 5, restTime: 120 }
        ]
      },
      {
        exerciseId: "exercise-32",
        exerciseName: "Barbell Row",
        sets: [
          { targetReps: 5, restTime: 120 },
          { targetReps: 5, restTime: 120 },
          { targetReps: 5, restTime: 120 }
        ]
      },
      {
        exerciseId: "exercise-42",
        exerciseName: "Overhead Press (Barbell)",
        sets: [
          { targetReps: 5, restTime: 120 },
          { targetReps: 5, restTime: 120 },
          { targetReps: 5, restTime: 120 }
        ]
      },
      {
        exerciseId: "exercise-37",
        exerciseName: "Pull-ups",
        sets: [
          { targetReps: 5, restTime: 120 },
          { targetReps: 5, restTime: 120 },
          { targetReps: 5, restTime: 120 }
        ]
      },
      {
        exerciseId: "exercise-8",
        exerciseName: "Dips",
        sets: [
          { targetReps: 5, restTime: 120 },
          { targetReps: 5, restTime: 120 },
          { targetReps: 5, restTime: 120 }
        ]
      }
    ]
  },
  {
    id: "template-6",
    name: "Lower Body Strength",
    description: "Strength-focused lower body routine",
    category: "Lower Body",
    lastUsed: null,
    exercises: [
      {
        exerciseId: "exercise-27",
        exerciseName: "Barbell Deadlift",
        sets: [
          { targetReps: 5, restTime: 120 },
          { targetReps: 5, restTime: 120 },
          { targetReps: 5, restTime: 120 }
        ]
      },
      {
        exerciseId: "exercise-14",
        exerciseName: "Front Squat",
        sets: [
          { targetReps: 5, restTime: 120 },
          { targetReps: 5, restTime: 120 },
          { targetReps: 5, restTime: 120 }
        ]
      },
      {
        exerciseId: "exercise-24",
        exerciseName: "Hip Thrust (Barbell)",
        sets: [
          { targetReps: 5, restTime: 120 },
          { targetReps: 5, restTime: 120 },
          { targetReps: 5, restTime: 120 }
        ]
      },
      {
        exerciseId: "exercise-19",
        exerciseName: "Leg Curl (Seated)",
        sets: [
          { targetReps: 5, restTime: 120 },
          { targetReps: 5, restTime: 120 },
          { targetReps: 5, restTime: 120 }
        ]
      },
      {
        exerciseId: "exercise-25",
        exerciseName: "Calf Raise (Standing)",
        sets: [
          { targetReps: 5, restTime: 120 },
          { targetReps: 5, restTime: 120 },
          { targetReps: 5, restTime: 120 }
        ]
      }
    ]
  },
  {
    id: "template-7",
    name: "Chest & Back",
    description: "Combined chest and back routine",
    category: "Chest & Back",
    lastUsed: null,
    exercises: [
      {
        exerciseId: "exercise-3",
        exerciseName: "Incline Barbell Bench Press",
        sets: [
          { targetReps: 8, restTime: 90 },
          { targetReps: 8, restTime: 90 },
          { targetReps: 8, restTime: 90 }
        ]
      },
      {
        exerciseId: "exercise-1",
        exerciseName: "Barbell Bench Press",
        sets: [
          { targetReps: 8, restTime: 90 },
          { targetReps: 8, restTime: 90 },
          { targetReps: 8, restTime: 90 }
        ]
      },
      {
        exerciseId: "exercise-32",
        exerciseName: "Barbell Row",
        sets: [
          { targetReps: 8, restTime: 90 },
          { targetReps: 8, restTime: 90 },
          { targetReps: 8, restTime: 90 }
        ]
      },
      {
        exerciseId: "exercise-36",
        exerciseName: "Lat Pulldown",
        sets: [
          { targetReps: 8, restTime: 90 },
          { targetReps: 8, restTime: 90 },
          { targetReps: 8, restTime: 90 }
        ]
      },
      {
        exerciseId: "exercise-10",
        exerciseName: "Dumbbell Flyes",
        sets: [
          { targetReps: 12, restTime: 60 },
          { targetReps: 12, restTime: 60 },
          { targetReps: 12, restTime: 60 }
        ]
      }
    ]
  },
  {
    id: "template-8",
    name: "Arms & Shoulders",
    description: "Emphasis on arms and shoulders",
    category: "Arms & Shoulders",
    lastUsed: null,
    exercises: [
      {
        exerciseId: "exercise-51",
        exerciseName: "Barbell Bicep Curl",
        sets: [
          { targetReps: 12, restTime: 60 },
          { targetReps: 12, restTime: 60 },
          { targetReps: 12, restTime: 60 }
        ]
      },
      {
        exerciseId: "exercise-59",
        exerciseName: "Cable Triceps Pushdown",
        sets: [
          { targetReps: 12, restTime: 60 },
          { targetReps: 12, restTime: 60 },
          { targetReps: 12, restTime: 60 }
        ]
      },
      {
        exerciseId: "exercise-42",
        exerciseName: "Overhead Press (Barbell)",
        sets: [
          { targetReps: 8, restTime: 90 },
          { targetReps: 8, restTime: 90 },
          { targetReps: 8, restTime: 90 }
        ]
      },
      {
        exerciseId: "exercise-46",
        exerciseName: "Lateral Raises",
        sets: [
          { targetReps: 12, restTime: 60 },
          { targetReps: 12, restTime: 60 },
          { targetReps: 12, restTime: 60 }
        ]
      },
      {
        exerciseId: "exercise-40",
        exerciseName: "Shrugs (Barbell)",
        sets: [
          { targetReps: 10, restTime: 60 },
          { targetReps: 10, restTime: 60 },
          { targetReps: 10, restTime: 60 }
        ]
      }
    ]
  }
];