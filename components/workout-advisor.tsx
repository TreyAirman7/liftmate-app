"use client";
import React, { useState } from "react";
import { useThemeContext } from "@/components/theme-provider";
import { useTheme } from "next-themes";
import { themeColors } from "@/lib/theme-utils";
import DataManager from "@/lib/data-manager";
import dayjs from "dayjs";

// Map of exercise names to primary muscle groups (expand as needed)
const EXERCISE_MUSCLE_MAP: Record<string, string> = {
  "Barbell Bench Press": "Chest",
  "Dumbbell Bench Press": "Chest",
  "Incline Bench Press": "Chest",
  "Push Up": "Chest",
  "Pull Up": "Back",
  "Lat Pulldown": "Back",
  "Barbell Row": "Back",
  "Deadlift": "Back",
  "Squat": "Legs",
  "Leg Press": "Legs",
  "Lunge": "Legs",
  "Leg Extension": "Legs",
  "Leg Curl": "Legs",
  "Shoulder Press": "Shoulders",
  "Lateral Raise": "Shoulders",
  "Bicep Curl": "Arms",
  "Tricep Extension": "Arms",
  // Add more as needed
};

const AVAILABLE_MODELS = [
  { label: "Fast Model", value: "gemma3:1b" },
  { label: "Smart Model", value: "gemma3:4b" }
];

type Last5WorkoutDetail = {
  date: string;
  exercises: {
    name: string;
    sets: { weight: number; reps: number }[];
  }[];
};

type UserContext = {
  name?: string;
  age?: number;
  gender?: string;
  height?: number;
  goal?: string;
  bodyWeight?: string;
  totalWorkouts: number;
  avgWorkoutsPerWeek: number;
  avgWorkoutDuration: number;
  muscleGroupFocus: string;
  personalRecords: string;
  workoutsLast27Days: number;
  oneRepMaxes: string;
  improvementPercentages: string;
  bodyWeightTrends: string;
  last10Workouts: string;
  last5WorkoutDetails: string;
};

function getProfileFromLocalStorage(): any {
  try {
    const raw = localStorage.getItem("userProfile");
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function summarizeWorkouts(workouts: any[]): Omit<UserContext, "name" | "age" | "gender" | "height" | "goal" | "bodyWeight" | "last5WorkoutDetails" | "muscleGroupFocus"> {
  if (!workouts || workouts.length === 0) {
    return {
      totalWorkouts: 0,
      avgWorkoutsPerWeek: 0,
      avgWorkoutDuration: 0,
      personalRecords: "N/A",
      workoutsLast27Days: 0,
      oneRepMaxes: "N/A",
      improvementPercentages: "N/A",
      bodyWeightTrends: "N/A",
      last10Workouts: "N/A"
    };
  }

  const totalWorkouts = workouts.length;
  const firstDate = dayjs(workouts[workouts.length - 1].date);
  const lastDate = dayjs(workouts[0].date);
  const weeksDiff = Math.max(1, lastDate.diff(firstDate, "week"));
  const avgWorkoutsPerWeek = parseFloat((totalWorkouts / weeksDiff).toFixed(1));
  const avgWorkoutDuration = Math.round(
    workouts.reduce((sum: number, w: any) => sum + (w.duration || 0), 0) / totalWorkouts / 60
  );
  const cutoff = dayjs().subtract(27, "day");
  const workoutsLast27Days = workouts.filter((w: any) => dayjs(w.date).isAfter(cutoff)).length;
  const last10 = workouts.slice(0, 10).map((w: any) => ({
    date: w.date,
    exercises: w.exercises.map((e: any) => e.exerciseName).join(", "),
    duration: w.duration,
    volume: w.stats?.totalVolume
  }));

  return {
    totalWorkouts,
    avgWorkoutsPerWeek,
    avgWorkoutDuration,
    personalRecords: "See Stats Tab",
    workoutsLast27Days,
    oneRepMaxes: "See Stats Tab",
    improvementPercentages: "See Progress Tab",
    bodyWeightTrends: "See Progress Tab",
    last10Workouts: last10.map(w =>
      `Date: ${w.date}, Exercises: ${w.exercises}, Duration: ${Math.round((w.duration || 0) / 60)}min, Volume: ${w.volume ?? "N/A"}`
    ).join(" | ")
  };
}

function getMostRecentBodyWeightFromLog(): string {
  try {
    const raw = localStorage.getItem("liftmate-weight-entries");
    if (!raw) return "N/A";
    const entries = JSON.parse(raw);
    if (!Array.isArray(entries) || entries.length === 0) return "N/A";
    // Sort by date (newest first)
    entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latest = entries[0];
    if (typeof latest.weight === "number" && latest.weight > 0) {
      return `${latest.weight} lbs`;
    }
    return "N/A";
  } catch {
    return "N/A";
  }
}

function getLast5WorkoutDetails(workouts: any[]): string {
  const details: Last5WorkoutDetail[] = workouts.slice(0, 5).map((w: any) => ({
    date: w.date,
    exercises: (w.exercises || []).map((ex: any) => ({
      name: ex.exerciseName,
      sets: (ex.sets || []).map((set: any) => ({
        weight: set.weight,
        reps: set.reps
      }))
    }))
  }));

  return details.map(w =>
    `Date: ${w.date}\n` +
    w.exercises.map(ex =>
      `  Exercise: ${ex.name}\n` +
      ex.sets.map((set, idx) =>
        `    Set ${idx + 1}: ${set.weight} lbs x ${set.reps} reps`
      ).join("\n")
    ).join("\n")
  ).join("\n\n");
}

function calculateMuscleGroupFocus(workouts: any[]): string {
  // Calculate total volume per muscle group
  const muscleVolume: Record<string, number> = {};
  let totalVolume = 0;

  for (const workout of workouts) {
    if (workout.exercises && Array.isArray(workout.exercises)) {
      for (const ex of workout.exercises) {
        const muscle = EXERCISE_MUSCLE_MAP[ex.exerciseName] || "Other";
        let exVolume = 0;
        if (ex.sets && Array.isArray(ex.sets)) {
          for (const set of ex.sets) {
            if (typeof set.weight === "number" && typeof set.reps === "number") {
              exVolume += set.weight * set.reps;
            }
          }
        }
        muscleVolume[muscle] = (muscleVolume[muscle] || 0) + exVolume;
        totalVolume += exVolume;
      }
    }
  }
  if (totalVolume === 0) return "No data";

  // Calculate percentages
  const focusArr = Object.entries(muscleVolume)
    .map(([muscle, volume]) => ({
      muscle,
      percent: Math.round((volume / totalVolume) * 100)
    }))
    .filter(entry => entry.percent > 0)
    .sort((a, b) => b.percent - a.percent);

  return focusArr.map(entry => `${entry.muscle}: ${entry.percent}%`).join(", ");
}

export default function WorkoutAdvisor() {
  const { themeColor } = useThemeContext();
  const { resolvedTheme } = useTheme();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<string>(AVAILABLE_MODELS[0].value); // Default to Fast Model (gemma3:1b)

  // User context state
  const [userContext, setUserContext] = useState<UserContext | null>(null);

  // Get the current theme's primary color
  const color = themeColors[themeColor]?.primary || "#00796B";
  const isDark = resolvedTheme === "dark";

  // Gather user context fresh on every submit
  const gatherUserContext = (): UserContext => {
    // Prefer onboarding data from localStorage
    const profile = getProfileFromLocalStorage();
    const goalsArr = DataManager.getGoals?.() || [];
    const workouts = DataManager.getWorkouts?.() || [];

    const goals = goalsArr.map((g: any) =>
      g.goalType === "weight"
        ? `Weight: target ${g.targetValue}${g.targetUnit}`
        : `${g.exerciseName || "Exercise"}: target ${g.targetValue}${g.targetUnit}`
    ).join("; ");

    // Most recent body weight from explicit log
    const bodyWeight = getMostRecentBodyWeightFromLog();

    // Last 5 workout details (date, exercise, sets with weight/reps)
    const last5WorkoutDetails = getLast5WorkoutDetails(workouts);

    // Muscle group focus percentages
    const muscleGroupFocus = calculateMuscleGroupFocus(workouts);

    const workoutStats = summarizeWorkouts(workouts);

    return {
      name: profile.name || "",
      age: profile.age || "",
      gender: profile.gender || "",
      height: profile.height || "",
      goal: profile.goal || goals || "",
      bodyWeight,
      ...workoutStats,
      muscleGroupFocus,
      last5WorkoutDetails
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAnswer(null);

    // Gather user context at submit time
    const context = gatherUserContext();
    setUserContext(context);

    try {
      // Construct the URL using the environment variable pointing to the localtunnel/proxy
      const apiUrl = `${process.env.NEXT_PUBLIC_OLLAMA_URL}/api/chat`;
      console.log("Attempting to fetch from:", apiUrl); // Add log for debugging

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send only the necessary data to the proxy/Ollama
        body: JSON.stringify({
          model: model, // Pass the selected model
          messages: [ // Use the messages format Ollama expects
            { role: "system", content: `You are LiftMate AI, a helpful fitness advisor. Use the following user context to provide personalized advice:\n${JSON.stringify(context, null, 2)}` },
            { role: "user", content: question }
          ],
          stream: false // Assuming non-streaming for now
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to get advice.");
      } else {
        setAnswer(data.answer);
        if (data.model) setModel(data.model);
      }
    } catch (err: any) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="rounded-xl p-6 mb-8 shadow-md"
      style={{
        background: isDark
          ? "rgba(30,30,30,0.95)"
          : "rgba(255,255,255,0.95)",
        border: `2px solid ${color}`,
        boxShadow: `0 2px 16px 0 ${color}22`,
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <h2
          className="text-xl font-bold"
          style={{ color }}
        >
          Workout Advisor (AI)
        </h2>
        <span
          className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground border"
          style={{
            borderColor: color,
            background: isDark ? "#23272f" : "#f1f5f9",
            color: color,
            fontWeight: 600,
            marginLeft: 8,
          }}
          title="Current LLM Model"
        >
          Model: {AVAILABLE_MODELS.find(m => m.value === model)?.label || model}
        </span>
      </div>
      <div className="mb-3">
        <label className="text-xs font-semibold mr-2">Switch Model:</label>
        <select
          value={model}
          onChange={e => setModel(e.target.value)}
          className="rounded border px-2 py-1 text-sm"
          style={{ borderColor: color, color: isDark ? "#fff" : "#222", background: isDark ? "#23272f" : "#f8fafc" }}
        >
          {AVAILABLE_MODELS.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>
      <p className="mb-4 text-muted-foreground text-sm">
        Ask any workout or fitness question and get instant advice powered by your local AI.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          className="rounded-md border px-3 py-2 text-base resize-none focus:outline-none focus:ring-2"
          style={{
            borderColor: color,
            background: isDark ? "#18181b" : "#f8fafc",
            color: isDark ? "#fff" : "#222",
            minHeight: 64,
          }}
          placeholder="Type your workout question..."
          value={question}
          onChange={e => setQuestion(e.target.value)}
          disabled={loading}
          required
        />
        <button
          type="submit"
          className="rounded-md font-semibold px-4 py-2 transition-colors"
          style={{
            background: color,
            color: "#fff",
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          disabled={loading || !question.trim()}
        >
          {loading ? "Thinking..." : "Get Advice"}
        </button>
      </form>
      {error && (
        <div className="mt-3 text-red-500 text-sm">{error}</div>
      )}
      {answer && (
        <div
          className="mt-4 p-4 rounded-md"
          style={{
            background: isDark ? "#23272f" : "#f1f5f9",
            border: `1px solid ${color}`,
            color: isDark ? "#fff" : "#222",
          }}
        >
          <span className="font-semibold" style={{ color }}>AI:</span>
          <span className="ml-2 whitespace-pre-line">{answer}</span>
        </div>
      )}
    </div>
  );
}