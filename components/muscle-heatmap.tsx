"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useThemeContext } from "@/components/theme-provider"
import { PieChart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CompletedWorkout } from "@/lib/data-manager"

interface MuscleHeatmapProps {
  workoutData: CompletedWorkout[]
  className?: string
}

export default function MuscleHeatmap({ workoutData, className = "" }: MuscleHeatmapProps) {
  const [currentView, setCurrentView] = useState<"front" | "back">("front")
  const { themeColor } = useThemeContext()
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true) // Add loading state
  const [muscleIntensities, setMuscleIntensities] = useState<{
    front: Record<string, number>
    back: Record<string, number>
  }>({
    front: {},
    back: {},
  })

  // Calculate muscle intensities based on workout data
  useEffect(() => {
    if (!workoutData || workoutData.length === 0) return

    const muscleMap: Record<string, { volume: number; count: number }> = {}

    // Process workout data to calculate volume per muscle group
    workoutData.forEach((workout) => {
      if (!workout.exercises) return

      workout.exercises.forEach((exercise: any) => {
        // Get the exercise details to find muscle groups
        const exerciseDetails = getExerciseDetails(exercise.exerciseId)
        if (!exerciseDetails || !exerciseDetails.muscles) return

        // Calculate volume for this exercise (weight * reps)
        const exerciseVolume = exercise.sets.reduce((total: number, set: any) => {
          return total + set.weight * set.reps
        }, 0)

        // Distribute volume across muscle groups
        exerciseDetails.muscles.forEach((muscle: string) => {
          if (!muscleMap[muscle]) {
            muscleMap[muscle] = { volume: 0, count: 0 }
          }
          muscleMap[muscle].volume += exerciseVolume
          muscleMap[muscle].count += 1
        })
      })
    })

    // Convert to intensity levels (0-5 scale)
    const intensities: Record<string, number> = {}

    // Find max volume for normalization
    const volumes = Object.values(muscleMap).map((m) => m.volume)
    const maxVolume = Math.max(...volumes, 1) // Avoid division by zero

    // Calculate normalized intensities
    Object.entries(muscleMap).forEach(([muscle, data]) => {
      // Normalize to 0-5 scale
      intensities[muscle] = Math.min(5, Math.round((data.volume / maxVolume) * 5))
    })

    // Set front and back view intensities with comprehensive muscle mapping
    setMuscleIntensities({
      front: {
        chest: intensities.chest || 0,
        shoulders: intensities.shoulders || 0,
        biceps: intensities.biceps || 0,
        forearms: intensities.forearms || 0,
        abs: intensities.abs || 0,
        obliques: intensities.obliques || 0,
        quads: intensities.quads || 0,
        calves: intensities.calves || 0,
        neck: intensities.neck || 0,
        adductors: intensities.adductors || 0,
        hip_flexors: intensities.hip_flexors || 0,
        serratus: intensities.serratus || 0,
        triceps: intensities.triceps || 0, // Visible from front too
      },
      back: {
        back: intensities.back || 0,
        lats: intensities.lats || 0,
        traps: intensities.traps || 0,
        shoulders: intensities.shoulders || 0, // Shared with front
        triceps: intensities.triceps || 0,
        forearms: intensities.forearms || 0, // Shared with front
        glutes: intensities.glutes || 0,
        hamstrings: intensities.hamstrings || 0,
        calves: intensities.calves || 0, // Shared with front
        obliques: intensities.obliques || 0, // Shared with front
        rhomboids: intensities.rhomboids || 0,
        spinal_erectors: intensities.spinal_erectors || 0,
        rear_delts: intensities.rear_delts || 0,
      },
    })
    setLoading(false) // Set loading to false after calculation
  }, [workoutData])

  // Helper function to get exercise details
  function getExerciseDetails(exerciseId: string) {
    try {
      // Get exercises from localStorage
      const exercises = JSON.parse(localStorage.getItem("liftmate-exercises") || "[]")
      return exercises.find((e: any) => e.id === exerciseId)
    } catch (error) {
      console.error("Failed to get exercise details:", error)
      return null
    }
  }

  // Show tooltip
  const showTooltip = (event: React.MouseEvent, text: string) => {
    if (!tooltipRef.current) return

    tooltipRef.current.textContent = text
    tooltipRef.current.style.display = "block"
    tooltipRef.current.style.left = `${event.clientX + 15}px`
    tooltipRef.current.style.top = `${event.clientY}px`

    // Fade in
    requestAnimationFrame(() => {
      if (tooltipRef.current) tooltipRef.current.style.opacity = "1"
    })
  }

  // Hide tooltip
  const hideTooltip = () => {
    if (!tooltipRef.current) return

    tooltipRef.current.style.opacity = "0"
    setTimeout(() => {
      if (tooltipRef.current && tooltipRef.current.style.opacity === "0") {
        tooltipRef.current.style.display = "none"
      }
    }, 200)
  }

  // Format muscle name for display
  const formatMuscleName = (name: string): string => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <PieChart className="h-5 w-5 mr-2" />
          Muscle Focus Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 relative min-h-[300px]"> {/* Added min-height for loading state */}
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full max-w-[250px] h-[250px] bg-muted rounded-lg animate-pulse"></div> {/* Pulsing Skeleton */}
          </div>
        ) : (
          <div className="muscle-heatmap-container">
          <div className="muscle-map-controls">
            <button
              className={`muscle-view-button ${currentView === "front" ? "active" : ""}`}
              onClick={() => setCurrentView("front")}
              style={
                {
                  "--active-color": `var(--md-primary)`,
                  "--active-text": "#000",
                } as React.CSSProperties
              }
            >
              Front View
            </button>
            <button
              className={`muscle-view-button ${currentView === "back" ? "active" : ""}`}
              onClick={() => setCurrentView("back")}
              style={
                {
                  "--active-color": `var(--md-primary)`,
                  "--active-text": "#000",
                } as React.CSSProperties
              }
            >
              Back View
            </button>
          </div>

          <div className="muscle-map-svg-container">
            <div id="muscle-map-front" className={`muscle-map ${currentView === "front" ? "active" : ""}`}>
              <svg viewBox="0 0 206.326 206.326" xmlns="http://www.w3.org/2000/svg">
                <title>Heatmap - Front View</title>
                <path
                  className="body-outline"
                  d="M104.265,117.959c-0.304,3.58,2.126,22.529,3.38,29.959c0.597,3.52,2.234,9.255,1.645,12.3 c-0.841,4.244-1.084,9.736-0.621,12.934c0.292,1.942,1.211,10.899-0.104,14.175c-0.688,1.718-1.949,10.522-1.949,10.522 c-3.285,8.294-1.431,7.886-1.431,7.886c1.017,1.248,2.759,0.098,2.759,0.098c1.327,0.846,2.246-0.201,2.246-0.201 c1.139,0.943,2.467-0.116,2.467-0.116c1.431,0.743,2.758-0.627,2.758-0.627c0.822,0.414,1.023-0.109,1.023-0.109 c2.466-0.158-1.376-8.05-1.376-8.05c-0.92-7.088,0.913-11.033,0.913-11.033c6.004-17.805,6.309-22.53,3.909-29.24 c-0.676-1.937-0.847-2.704-0.536-3.545c0.719-1.941,0.195-9.748,1.072-12.848c1.692-5.979,3.361-21.142,4.231-28.217 c1.169-9.53-4.141-22.308-4.141-22.308c-1.163-5.2,0.542-23.727,0.542-23.727c2.381,3.705,2.29,10.245,2.29,10.245 c-0.378,6.859,5.541,17.342,5.541,17.342c2.844,4.332,3.921,8.442,3.921,8.747c0,1.248-0.273,4.269-0.273,4.269l0.109,2.631 c0.049,0.67,0.426,2.977,0.365,4.092c-0.444,6.862,0.646,5.571,0.646,5.571c0.92,0,1.931-5.522,1.931-5.522 c0,1.424-0.348,5.687,0.42,7.295c0.919,1.918,1.595-0.329,1.607-0.78c0.243-8.737,0.768-6.448,0.768-6.448 c0.511,7.088,1.139,8.689,2.265,8.135c0.853-0.407,0.073-8.506,0.073-8.506c1.461,4.811,2.569,5.577,2.569,5.577 c2.411,1.693,0.92-2.983,0.585-3.909c-1.784-4.92-1.839-6.625-1.839-6.625c2.229,4.421,3.909,4.257,3.909,4.257 c2.174-0.694-1.9-6.954-4.287-9.953c-1.218-1.528-2.789-3.574-3.245-4.789c-0.743-2.058-1.304-8.674-1.304-8.674 c-0.225-7.807-2.155-11.198-2.155-11.198c-3.3-5.282-3.921-15.135-3.921-15.135l-0.146-16.635 c-1.157-11.347-9.518-11.429-9.518-11.429c-8.451-1.258-9.627-3.988-9.627-3.988c-1.79-2.576-0.767-7.514-0.767-7.514 c1.485-1.208,2.058-4.415,2.058-4.415c2.466-1.891,2.345-4.658,1.206-4.628c-0.914,0.024-0.707-0.733-0.707-0.733 C115.068,0.636,104.01,0,104.01,0h-1.688c0,0-11.063,0.636-9.523,13.089c0,0,0.207,0.758-0.715,0.733 c-1.136-0.03-1.242,2.737,1.215,4.628c0,0,0.572,3.206,2.058,4.415c0,0,1.023,4.938-0.767,7.514c0,0-1.172,2.73-9.627,3.988 c0,0-8.375,0.082-9.514,11.429l-0.158,16.635c0,0-0.609,9.853-3.922,15.135c0,0-1.921,3.392-2.143,11.198 c0,0-0.563,6.616-1.303,8.674c-0.451,1.209-2.021,3.255-3.249,4.789c-2.408,2.993-6.455,9.24-4.29,9.953 c0,0,1.689,0.164,3.909-4.257c0,0-0.046,1.693-1.827,6.625c-0.35,0.914-1.839,5.59,0.573,3.909c0,0,1.117-0.767,2.569-5.577 c0,0-0.779,8.099,0.088,8.506c1.133,0.555,1.751-1.047,2.262-8.135c0,0,0.524-2.289,0.767,6.448 c0.012,0.451,0.673,2.698,1.596,0.78c0.779-1.608,0.429-5.864,0.429-7.295c0,0,0.999,5.522,1.933,5.522 c0,0,1.099,1.291,0.648-5.571c-0.073-1.121,0.32-3.422,0.369-4.092l0.106-2.631c0,0-0.274-3.014-0.274-4.269 c0-0.311,1.078-4.415,3.921-8.747c0,0,5.913-10.488,5.532-17.342c0,0-0.082-6.54,2.299-10.245c0,0,1.69,18.526,0.545,23.727 c0,0-5.319,12.778-4.146,22.308c0.864,7.094,2.53,22.237,4.226,28.217c0.886,3.094,0.362,10.899,1.072,12.848 c0.32,0.847,0.152,1.627-0.536,3.545c-2.387,6.71-2.083,11.436,3.921,29.24c0,0,1.848,3.945,0.914,11.033 c0,0-3.836,7.892-1.379,8.05c0,0,0.192,0.523,1.023,0.109c0,0,1.327,1.37,2.761,0.627c0,0,1.328,1.06,2.463,0.116 c0,0,0.91,1.047,2.237,0.201c0,0,1.742,1.175,2.777-0.098c0,0,1.839,0.408-1.435-7.886c0,0-1.254-8.793-1.945-10.522 c-1.318-3.275-0.387-12.251-0.106-14.175c0.453-3.216,0.21-8.695-0.618-12.934c-0.606-3.038,1.035-8.774,1.641-12.3 c1.245-7.423,3.685-26.373,3.38-29.959l1.008,0.354C103.809,118.312,104.265,117.959,104.265,117.959z"
                />

                {/* Front view muscle groups */}
                <path
                  id="chest"
                  className={`muscle-group intensity-${muscleIntensities.front.chest || 0}`}
                  d="M92,40 C92,45 92,50 94,55 C96,60 100,65 103,65 C106,65 110,60 112,55 C114,50 114,45 114,40 Z"
                  data-muscle="chest"
                  onMouseMove={(e) => showTooltip(e, "Chest")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="shoulders-left"
                  className={`muscle-group intensity-${muscleIntensities.front.shoulders || 0}`}
                  d="M87,35 C82,35 77,40 75,45 C73,50 72,55 77,58 C82,55 87,50 87,45 Z"
                  data-muscle="shoulders"
                  onMouseMove={(e) => showTooltip(e, "Shoulders")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="shoulders-right"
                  className={`muscle-group intensity-${muscleIntensities.front.shoulders || 0}`}
                  d="M119,35 C124,35 129,40 131,45 C133,50 134,55 129,58 C124,55 119,50 119,45 Z"
                  data-muscle="shoulders"
                  onMouseMove={(e) => showTooltip(e, "Shoulders")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="biceps-left"
                  className={`muscle-group intensity-${muscleIntensities.front.biceps || 0}`}
                  d="M80,60 C77,62 75,66 74,74 C73,77 75,81 77,82 C80,81 83,79 84,74 C85,68 83,60 80,60 Z"
                  data-muscle="biceps"
                  onMouseMove={(e) => showTooltip(e, "Biceps")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="biceps-right"
                  className={`muscle-group intensity-${muscleIntensities.front.biceps || 0}`}
                  d="M126,60 C129,62 131,66 132,74 C133,77 131,81 129,82 C126,81 123,79 122,74 C121,68 123,60 126,60 Z"
                  data-muscle="biceps"
                  onMouseMove={(e) => showTooltip(e, "Biceps")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="forearms-left"
                  className={`muscle-group intensity-${muscleIntensities.front.forearms || 0}`}
                  d="M77,84 C72,87 69,91 67,95 C67,97 67,99 69,101 C71,98 74,95 76,92 C78,87 79,85 77,84 Z"
                  data-muscle="forearms"
                  onMouseMove={(e) => showTooltip(e, "Forearms")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="forearms-right"
                  className={`muscle-group intensity-${muscleIntensities.front.forearms || 0}`}
                  d="M129,84 C134,87 137,91 139,95 C139,97 139,99 137,101 C135,98 132,95 130,92 C128,87 127,85 129,84 Z"
                  data-muscle="forearms"
                  onMouseMove={(e) => showTooltip(e, "Forearms")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="abs-upper"
                  className={`muscle-group intensity-${muscleIntensities.front.abs || 0}`}
                  d="M97,65 C100,65 106,65 109,65 C109,70 109,75 103,75 C97,75 97,70 97,65 Z"
                  data-muscle="abs"
                  onMouseMove={(e) => showTooltip(e, "Abs")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="abs-middle"
                  className={`muscle-group intensity-${muscleIntensities.front.abs || 0}`}
                  d="M97,77 C100,77 106,77 109,77 C109,82 109,87 103,87 C97,87 97,82 97,77 Z"
                  data-muscle="abs"
                  onMouseMove={(e) => showTooltip(e, "Abs")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="abs-lower"
                  className={`muscle-group intensity-${muscleIntensities.front.abs || 0}`}
                  d="M97,89 C100,89 106,89 109,89 C109,94 109,99 103,99 C97,99 97,94 97,89 Z"
                  data-muscle="abs"
                  onMouseMove={(e) => showTooltip(e, "Abs")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="obliques-left"
                  className={`muscle-group intensity-${muscleIntensities.front.obliques || 0}`}
                  d="M95,65 C95,70 95,80 95,95 C93,97 90,99 88,99 C86,97 87,90 88,80 C89,70 90,67 95,65 Z"
                  data-muscle="obliques"
                  onMouseMove={(e) => showTooltip(e, "Obliques")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="obliques-right"
                  className={`muscle-group intensity-${muscleIntensities.front.obliques || 0}`}
                  d="M111,65 C111,70 111,80 111,95 C113,97 116,99 118,99 C120,97 119,90 118,80 C117,70 116,67 111,65 Z"
                  data-muscle="obliques"
                  onMouseMove={(e) => showTooltip(e, "Obliques")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="quads-left"
                  className={`muscle-group intensity-${muscleIntensities.front.quads || 0}`}
                  d="M90,115 C90,120 89,127 89,135 C86,142 86,147 90,147 C94,145 96,140 97,135 C98,127 98,120 96,115 C94,112 92,112 90,115 Z"
                  data-muscle="quads"
                  onMouseMove={(e) => showTooltip(e, "Quads")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="quads-right"
                  className={`muscle-group intensity-${muscleIntensities.front.quads || 0}`}
                  d="M116,115 C116,120 117,127 117,135 C120,142 120,147 116,147 C112,145 110,140 109,135 C108,127 108,120 110,115 C112,112 114,112 116,115 Z"
                  data-muscle="quads"
                  onMouseMove={(e) => showTooltip(e, "Quads")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="calves-left"
                  className={`muscle-group intensity-${muscleIntensities.front.calves || 0}`}
                  d="M93,146 C90,151 89,161 91,181 C93,194 95,204 95,146 Z"
                  data-muscle="calves"
                  onMouseMove={(e) => showTooltip(e, "Calves")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="calves-right"
                  className={`muscle-group intensity-${muscleIntensities.front.calves || 0}`}
                  d="M113,146 C116,151 117,161 115,181 C113,194 111,204 111,146 Z"
                  data-muscle="calves"
                  onMouseMove={(e) => showTooltip(e, "Calves")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="neck"
                  className={`muscle-group intensity-${muscleIntensities.front.neck || 0}`}
                  d="M98,22 L104,22 L108,40 L94,40 Z"
                  data-muscle="neck"
                  transform="translate(2, 0)"
                  onMouseMove={(e) => showTooltip(e, "Neck")}
                  onMouseLeave={hideTooltip}
                ></path>

                {/* Additional front muscles */}
                <path
                  id="serratus-left"
                  className={`muscle-group intensity-${muscleIntensities.front.serratus || 0}`}
                  d="M88,65 C86,70 85,75 85,80 C85,85 86,90 88,95 C90,93 91,90 92,85 C93,80 93,75 92,70 C91,67 90,65 88,65 Z"
                  data-muscle="serratus"
                  onMouseMove={(e) => showTooltip(e, "Serratus")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="serratus-right"
                  className={`muscle-group intensity-${muscleIntensities.front.serratus || 0}`}
                  d="M118,65 C120,70 121,75 121,80 C121,85 120,90 118,95 C116,93 115,90 114,85 C113,80 113,75 114,70 C115,67 116,65 118,65 Z"
                  data-muscle="serratus"
                  onMouseMove={(e) => showTooltip(e, "Serratus")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="adductors-left"
                  className={`muscle-group intensity-${muscleIntensities.front.adductors || 0}`}
                  d="M97,115 C97,120 97,125 97,130 C97,135 97,140 97,145 C99,143 100,140 101,135 C102,130 102,125 101,120 C100,117 99,115 97,115 Z"
                  data-muscle="adductors"
                  onMouseMove={(e) => showTooltip(e, "Adductors")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="adductors-right"
                  className={`muscle-group intensity-${muscleIntensities.front.adductors || 0}`}
                  d="M109,115 C109,120 109,125 109,130 C109,135 109,140 109,145 C107,143 106,140 105,135 C104,130 104,125 105,120 C106,117 107,115 109,115 Z"
                  data-muscle="adductors"
                  onMouseMove={(e) => showTooltip(e, "Adductors")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="triceps-front-left"
                  className={`muscle-group intensity-${muscleIntensities.front.triceps || 0}`}
                  d="M82,60 C80,65 79,70 79,75 C79,80 80,85 82,90 C84,88 85,85 86,80 C87,75 87,70 86,65 C85,62 84,60 82,60 Z"
                  data-muscle="triceps"
                  onMouseMove={(e) => showTooltip(e, "Triceps")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="triceps-front-right"
                  className={`muscle-group intensity-${muscleIntensities.front.triceps || 0}`}
                  d="M124,60 C126,65 127,70 127,75 C127,80 126,85 124,90 C122,88 121,85 120,80 C119,75 119,70 120,65 C121,62 122,60 124,60 Z"
                  data-muscle="triceps"
                  onMouseMove={(e) => showTooltip(e, "Triceps")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="hip-flexors-left"
                  className={`muscle-group intensity-${muscleIntensities.front.hip_flexors || 0}`}
                  d="M95,99 C95,102 95,105 95,108 C95,111 95,114 95,117 C97,115 98,112 99,109 C100,106 100,103 99,100 C98,99 97,98 95,99 Z"
                  data-muscle="hip_flexors"
                  onMouseMove={(e) => showTooltip(e, "Hip Flexors")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="hip-flexors-right"
                  className={`muscle-group intensity-${muscleIntensities.front.hip_flexors || 0}`}
                  d="M111,99 C111,102 111,105 111,108 C111,111 111,114 111,117 C109,115 108,112 107,109 C106,106 106,103 107,100 C108,99 109,98 111,99 Z"
                  data-muscle="hip_flexors"
                  onMouseMove={(e) => showTooltip(e, "Hip Flexors")}
                  onMouseLeave={hideTooltip}
                ></path>
              </svg>
            </div>
            <div id="muscle-map-back" className={`muscle-map ${currentView === "back" ? "active" : ""}`}>
              <svg viewBox="0 0 206.326 206.326" xmlns="http://www.w3.org/2000/svg">
                <title>Heatmap - Back View</title>
                <path
                  className="body-outline"
                  d="M104.265,117.959c-0.304,3.58,2.126,22.529,3.38,29.959c0.597,3.52,2.234,9.255,1.645,12.3 c-0.841,4.244-1.084,9.736-0.621,12.934c0.292,1.942,1.211,10.899-0.104,14.175c-0.688,1.718-1.949,10.522-1.949,10.522 c-3.285,8.294-1.431,7.886-1.431,7.886c1.017,1.248,2.759,0.098,2.759,0.098c1.327,0.846,2.246-0.201,2.246-0.201 c1.139,0.943,2.467-0.116,2.467-0.116c1.431,0.743,2.758-0.627,2.758-0.627c0.822,0.414,1.023-0.109,1.023-0.109 c2.466-0.158-1.376-8.05-1.376-8.05c-0.92-7.088,0.913-11.033,0.913-11.033c6.004-17.805,6.309-22.53,3.909-29.24 c-0.676-1.937-0.847-2.704-0.536-3.545c0.719-1.941,0.195-9.748,1.072-12.848c1.692-5.979,3.361-21.142,4.231-28.217 c1.169-9.53-4.141-22.308-4.141-22.308c-1.163-5.2,0.542-23.727,0.542-23.727c2.381,3.705,2.29,10.245,2.29,10.245 c-0.378,6.859,5.541,17.342,5.541,17.342c2.844,4.332,3.921,8.442,3.921,8.747c0,1.248-0.273,4.269-0.273,4.269l0.109,2.631 c0.049,0.67,0.426,2.977,0.365,4.092c-0.444,6.862,0.646,5.571,0.646,5.571c0.92,0,1.931-5.522,1.931-5.522 c0,1.424-0.348,5.687,0.42,7.295c0.919,1.918,1.595-0.329,1.607-0.78c0.243-8.737,0.768-6.448,0.768-6.448 c0.511,7.088,1.139,8.689,2.265,8.135c0.853-0.407,0.073-8.506,0.073-8.506c1.461,4.811,2.569,5.577,2.569,5.577 c2.411,1.693,0.92-2.983,0.585-3.909c-1.784-4.92-1.839-6.625-1.839-6.625c2.229,4.421,3.909,4.257,3.909,4.257 c2.174-0.694-1.9-6.954-4.287-9.953c-1.218-1.528-2.789-3.574-3.245-4.789c-0.743-2.058-1.304-8.674-1.304-8.674 c-0.225-7.807-2.155-11.198-2.155-11.198c-3.3-5.282-3.921-15.135-3.921-15.135l-0.146-16.635 c-1.157-11.347-9.518-11.429-9.518-11.429c-8.451-1.258-9.627-3.988-9.627-3.988c-1.79-2.576-0.767-7.514-0.767-7.514 c1.485-1.208,2.058-4.415,2.058-4.415c2.466-1.891,2.345-4.658,1.206-4.628c-0.914,0.024-0.707-0.733-0.707-0.733 C115.068,0.636,104.01,0,104.01,0h-1.688c0,0-11.063,0.636-9.523,13.089c0,0,0.207,0.758-0.715,0.733 c-1.136-0.03-1.242,2.737,1.215,4.628c0,0,0.572,3.206,2.058,4.415c0,0,1.023,4.938-0.767,7.514c0,0-1.172,2.73-9.627,3.988 c0,0-8.375,0.082-9.514,11.429l-0.158,16.635c0,0-0.609,9.853-3.922,15.135c0,0-1.921,3.392-2.143,11.198 c0,0-0.563,6.616-1.303,8.674c-0.451,1.209-2.021,3.255-3.249,4.789c-2.408,2.993-6.455,9.24-4.29,9.953 c0,0,1.689,0.164,3.909-4.257c0,0-0.046,1.693-1.827,6.625c-0.35,0.914-1.839,5.59,0.573,3.909c0,0,1.117-0.767,2.569-5.577 c0,0-0.779,8.099,0.088,8.506c1.133,0.555,1.751-1.047,2.262-8.135c0,0,0.524-2.289,0.767,6.448 c0.012,0.451,0.673,2.698,1.596,0.78c0.779-1.608,0.429-5.864,0.429-7.295c0,0,0.999,5.522,1.933,5.522 c0,0,1.099,1.291,0.648-5.571c-0.073-1.121,0.32-3.422,0.369-4.092l0.106-2.631c0,0-0.274-3.014-0.274-4.269 c0-0.311,1.078-4.415,3.921-8.747c0,0,5.913-10.488,5.532-17.342c0,0-0.082-6.54,2.299-10.245c0,0,1.69,18.526,0.545,23.727 c0,0-5.319,12.778-4.146,22.308c0.864,7.094,2.53,22.237,4.226,28.217c0.886,3.094,0.362,10.899,1.072,12.848 c0.32,0.847,0.152,1.627-0.536,3.545c-2.387,6.71-2.083,11.436,3.921,29.24c0,0,1.848,3.945,0.914,11.033 c0,0-3.836,7.892-1.379,8.05c0,0,0.192,0.523,1.023,0.109c0,0,1.327,1.37,2.761,0.627c0,0,1.328,1.06,2.463,0.116 c0,0,0.91,1.047,2.237,0.201c0,0,1.742,1.175,2.777-0.098c0,0,1.839,0.408-1.435-7.886c0,0-1.254-8.793-1.945-10.522 c-1.318-3.275-0.387-12.251-0.106-14.175c0.453-3.216,0.21-8.695-0.618-12.934c-0.606-3.038,1.035-8.774,1.641-12.3 c1.245-7.423,3.685-26.373,3.38-29.959l1.008,0.354C103.809,118.312,104.265,117.959,104.265,117.959z"
                />

                {/* Back view muscle groups */}
                <path
                  id="traps-left"
                  className={`muscle-group intensity-${muscleIntensities.back.traps || 0}`}
                  d="M84,32 C89,30 97,28 100,28 C101,29 101,30 101,32 C101,34 100,36 97,38 C94,39 89,40 85,40 C83,39 82,36 82,35 C82,34 83,33 84,32 Z"
                  data-muscle="traps"
                  onMouseMove={(e) => showTooltip(e, "Traps")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="traps-right"
                  className={`muscle-group intensity-${muscleIntensities.back.traps || 0}`}
                  d="M122,32 C117,30 109,28 106,28 C105,29 105,30 105,32 C105,34 106,36 109,38 C112,39 117,40 121,40 C123,39 124,36 124,35 C124,34 123,33 122,32 Z"
                  data-muscle="traps"
                  onMouseMove={(e) => showTooltip(e, "Traps")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="upper-back"
                  className={`muscle-group intensity-${muscleIntensities.back.back || 0}`}
                  d="M88,47 C93,49 97,52 103,52 C109,52 113,49 118,47 C117,52 116,57 113,62 C108,65 105,67 103,67 C101,67 96,65 93,62 C90,57 89,52 88,47 Z"
                  data-muscle="back"
                  onMouseMove={(e) => showTooltip(e, "Upper Back")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="lats-left"
                  className={`muscle-group intensity-${muscleIntensities.back.lats || 0}`}
                  d="M90,50 C92,52 93,54 95,56 C94,58 92,60 89,62 C87,63 86,64 88,65 C89,66 90,65 91,63 C93,60 92,58 92,56 C93,54 92,52 90,50 Z"
                  data-muscle="lats"
                  onMouseMove={(e) => showTooltip(e, "Lats")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="lats-right"
                  className={`muscle-group intensity-${muscleIntensities.back.lats || 0}`}
                  d="M116,50 C114,52 113,54 111,56 C112,58 114,60 117,62 C119,63 120,64 118,65 C117,66 116,65 115,63 C113,60 114,58 114,56 C113,54 114,52 116,50 Z"
                  data-muscle="lats"
                  onMouseMove={(e) => showTooltip(e, "Lats")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="mid-back"
                  className={`muscle-group intensity-${muscleIntensities.back.back || 0}`}
                  d="M93,62 C98,65 101,67 103,67 C105,67 108,65 113,62 C113,67 113,72 113,77 C108,79 106,81 103,81 C100,81 98,79 93,77 C93,72 93,67 93,62 Z"
                  data-muscle="back"
                  onMouseMove={(e) => showTooltip(e, "Mid Back")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="lower-back"
                  className={`muscle-group intensity-${muscleIntensities.back.back || 0}`}
                  d="M93,77 C98,79 100,81 103,81 C106,81 108,79 113,77 C113,82 113,87 113,92 C108,94 106,96 103,96 C100,96 98,94 93,92 C93,87 93,82 93,77 Z"
                  data-muscle="back"
                  onMouseMove={(e) => showTooltip(e, "Lower Back")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="triceps-left"
                  className={`muscle-group intensity-${muscleIntensities.back.triceps || 0}`}
                  d="M79,43 C76,46 75,50 74,54 C73,58 73,62 73,68 C72,72 74,75 76,76 C79,75 81,72 82,68 C83,62 84,58 84,54 C84,50 82,46 79,43 Z"
                  data-muscle="triceps"
                  onMouseMove={(e) => showTooltip(e, "Triceps")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="triceps-right"
                  className={`muscle-group intensity-${muscleIntensities.back.triceps || 0}`}
                  d="M127,43 C130,46 131,50 132,54 C133,58 133,62 133,68 C134,72 132,75 130,76 C127,75 125,72 124,68 C123,62 122,58 122,54 C122,50 124,46 127,43 Z"
                  data-muscle="triceps"
                  onMouseMove={(e) => showTooltip(e, "Triceps")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="forearms-left-back"
                  className={`muscle-group intensity-${muscleIntensities.back.forearms || 0}`}
                  d="M77,84 C72,87 69,91 67,95 C67,97 67,99 69,101 C71,98 74,95 76,92 C78,87 79,85 77,84 Z"
                  data-muscle="forearms"
                  onMouseMove={(e) => showTooltip(e, "Forearms")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="forearms-right-back"
                  className={`muscle-group intensity-${muscleIntensities.back.forearms || 0}`}
                  d="M129,84 C134,87 137,91 139,95 C139,97 139,99 137,101 C135,98 132,95 130,92 C128,87 127,85 129,84 Z"
                  data-muscle="forearms"
                  onMouseMove={(e) => showTooltip(e, "Forearms")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="glutes"
                  className={`muscle-group intensity-${muscleIntensities.back.glutes || 0}`}
                  d="M87,100 C82,106 82,114 87,119 C92,123 102,123 103,119 C104,123 114,123 119,119 C124,114 124,106 119,100 C114,96 104,96 103,100 C102,96 92,96 87,100 Z"
                  data-muscle="glutes"
                  onMouseMove={(e) => showTooltip(e, "Glutes")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="hamstrings-left"
                  className={`muscle-group intensity-${muscleIntensities.back.hamstrings || 0}`}
                  d="M90,123 C95,125 100,127 102,127 C102,130 102,135 102,141 C100,144 96,146 90,146 C88,144 87,141 87,137 C87,133 88,128 90,123 Z"
                  data-muscle="hamstrings"
                  onMouseMove={(e) => showTooltip(e, "Hamstrings")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="hamstrings-right"
                  className={`muscle-group intensity-${muscleIntensities.back.hamstrings || 0}`}
                  d="M116,123 C111,125 106,127 104,127 C104,130 104,135 104,141 C106,144 110,146 116,146 C118,144 119,141 119,137 C119,133 118,128 116,123 Z"
                  data-muscle="hamstrings"
                  onMouseMove={(e) => showTooltip(e, "Hamstrings")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="calves-left-back"
                  className={`muscle-group intensity-${muscleIntensities.back.calves || 0}`}
                  d="M92,146 C89,151 88,161 90,181 C92,194 94,204 94,146 Z"
                  data-muscle="calves"
                  onMouseMove={(e) => showTooltip(e, "Calves")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="calves-right-back"
                  className={`muscle-group intensity-${muscleIntensities.back.calves || 0}`}
                  d="M114,146 C117,151 118,161 116,181 C114,194 112,204 112,146 Z"
                  data-muscle="calves"
                  onMouseMove={(e) => showTooltip(e, "Calves")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="shoulders-left-back"
                  className={`muscle-group intensity-${muscleIntensities.back.shoulders || 0}`}
                  d="M87,35 C82,35 77,40 75,45 C73,50 72,55 77,58 C82,55 87,50 87,45 Z"
                  data-muscle="shoulders"
                  onMouseMove={(e) => showTooltip(e, "Shoulders")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="shoulders-right-back"
                  className={`muscle-group intensity-${muscleIntensities.back.shoulders || 0}`}
                  d="M119,35 C124,35 129,40 131,45 C133,50 134,55 129,58 C124,55 119,50 119,45 Z"
                  data-muscle="shoulders"
                  onMouseMove={(e) => showTooltip(e, "Shoulders")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="obliques-left-back"
                  className={`muscle-group intensity-${muscleIntensities.back.obliques || 0}`}
                  d="M95,65 C95,70 95,80 95,95 C93,97 90,99 88,99 C86,97 87,90 88,80 C89,70 90,67 95,65 Z"
                  data-muscle="obliques"
                  onMouseMove={(e) => showTooltip(e, "Obliques")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="obliques-right-back"
                  className={`muscle-group intensity-${muscleIntensities.back.obliques || 0}`}
                  d="M111,65 C111,70 111,80 111,95 C113,97 116,99 118,99 C120,97 119,90 118,80 C117,70 116,67 111,65 Z"
                  data-muscle="obliques"
                  onMouseMove={(e) => showTooltip(e, "Obliques")}
                  onMouseLeave={hideTooltip}
                ></path>

                {/* Additional back muscles */}
                <path
                  id="rhomboids-left"
                  className={`muscle-group intensity-${muscleIntensities.back.rhomboids || 0}`}
                  d="M93,45 C95,47 97,49 99,50 C99,53 99,56 97,59 C95,61 93,62 91,60 C90,58 90,55 91,52 C91,49 92,47 93,45 Z"
                  data-muscle="rhomboids"
                  onMouseMove={(e) => showTooltip(e, "Rhomboids")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="rhomboids-right"
                  className={`muscle-group intensity-${muscleIntensities.back.rhomboids || 0}`}
                  d="M113,45 C111,47 109,49 107,50 C107,53 107,56 109,59 C111,61 113,62 115,60 C116,58 116,55 115,52 C115,49 114,47 113,45 Z"
                  data-muscle="rhomboids"
                  onMouseMove={(e) => showTooltip(e, "Rhomboids")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="rear-delts-left"
                  className={`muscle-group intensity-${muscleIntensities.back.rear_delts || 0}`}
                  d="M85,40 C83,42 82,45 82,48 C82,51 83,54 85,56 C87,54 88,51 88,48 C88,45 87,42 85,40 Z"
                  data-muscle="rear_delts"
                  onMouseMove={(e) => showTooltip(e, "Rear Delts")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="rear-delts-right"
                  className={`muscle-group intensity-${muscleIntensities.back.rear_delts || 0}`}
                  d="M121,40 C123,42 124,45 124,48 C124,51 123,54 121,56 C119,54 118,51 118,48 C118,45 119,42 121,40 Z"
                  data-muscle="rear_delts"
                  onMouseMove={(e) => showTooltip(e, "Rear Delts")}
                  onMouseLeave={hideTooltip}
                ></path>
                <path
                  id="spinal-erectors"
                  className={`muscle-group intensity-${muscleIntensities.back.spinal_erectors || 0}`}
                  d="M101,50 C102,55 103,60 103,65 C103,70 103,75 103,80 C103,85 103,90 103,95 C104,90 104,85 104,80 C104,75 104,70 104,65 C104,60 103,55 102,50 C102,48 101,48 101,50 Z"
                  data-muscle="spinal_erectors"
                  onMouseMove={(e) => showTooltip(e, "Spinal Erectors")}
                  onMouseLeave={hideTooltip}
                ></path>
              </svg>
            </div>
            {/* Tooltip - Enhanced with CSS transition */}
            <div
              id="tooltip"
              ref={tooltipRef}
              className="tooltip absolute bg-black text-white text-xs rounded py-1 px-2 pointer-events-none opacity-0 transition-opacity duration-200 ease-in-out z-10"
              style={{ display: 'none' }} // Initially hidden
            ></div>
          </div>

          <div className="muscle-group-legend">
            <div className="legend-title">Intensity Level</div>
            <div
              className="legend-scale"
              style={{
                background: `linear-gradient(to right, 
                rgba(var(--md-primary-rgb), 0.2), 
                rgba(var(--md-primary-rgb), 0.4), 
                rgba(var(--md-primary-rgb), 0.6), 
                rgba(var(--md-primary-rgb), 0.8), 
                rgba(var(--md-primary-rgb), 1.0))`,
              }}
            ></div>
            <div className="legend-labels">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        </div>
       )} {/* Close conditional rendering block */}
      </CardContent>
 
      <style jsx>{`
        .muscle-heatmap-container {
          /* Add styles if needed */
        }
        .muscle-map-controls {
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;
          gap: 0.5rem;
        }
        .muscle-view-button {
          padding: 0.5rem 1rem;
          border: 1px solid #ccc;
          border-radius: 0.375rem; /* rounded-md */
          background-color: transparent;
          color: inherit;
          cursor: pointer;
          transition: background-color 0.2s, color 0.2s;
        }
        .muscle-view-button.active {
          background-color: var(--active-color, #0D9488); /* Use theme color */
          color: var(--active-text, #fff); /* Use theme text color */
          border-color: var(--active-color, #0D9488);
        }
        .muscle-map-svg-container {
          position: relative;
          width: 100%;
          max-width: 300px; /* Adjust as needed */
          margin: 0 auto;
        }
        .muscle-map {
          display: none;
          width: 100%;
          height: auto;
        }
        .muscle-map.active {
          display: block;
        }
        .body-outline {
          fill: none;
          stroke: #999; /* Outline color */
          stroke-width: 0.5;
        }
        .muscle-group {
          fill: rgba(var(--md-primary-rgb), 0.1); /* Default low intensity color */
          stroke: #555; /* Muscle definition lines */
          stroke-width: 0.2;
          cursor: pointer;
          transition: fill 0.3s ease-in-out, filter 0.2s ease-in-out; /* Added transition for fill and filter */
        }
        .muscle-group:hover {
          filter: brightness(1.3); /* Subtle brightness increase on hover */
          /* Or use opacity: .muscle-group:hover { opacity: 0.8; } */
        }
 
        /* Intensity levels - using theme primary color */
        .intensity-1 { fill: rgba(var(--md-primary-rgb), 0.2); }
        .intensity-2 { fill: rgba(var(--md-primary-rgb), 0.4); }
        .intensity-3 { fill: rgba(var(--md-primary-rgb), 0.6); }
        .intensity-4 { fill: rgba(var(--md-primary-rgb), 0.8); }
        .intensity-5 { fill: rgba(var(--md-primary-rgb), 1.0); }
 
        .muscle-group-legend {
          margin-top: 1rem;
          text-align: center;
        }
        .legend-title {
          font-size: 0.875rem; /* text-sm */
          color: var(--muted-foreground);
          margin-bottom: 0.25rem;
        }
        .legend-scale {
          height: 10px;
          border-radius: 5px;
          margin-bottom: 0.25rem;
        }
        .legend-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem; /* text-xs */
          color: var(--muted-foreground);
        }
 
        /* Tooltip styles are now handled by Tailwind classes on the element */
      `}</style>
    </Card>

  )
}
