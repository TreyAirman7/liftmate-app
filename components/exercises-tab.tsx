"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion" // Import motion
import { Clipboard, Search, Plus, Edit, Trash } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import DataManager from "@/lib/data-manager"
import { showSuccessToast } from "@/lib/toast"
import { useLoading } from "@/lib/loading-context"
import { LoadingIndicator } from "@/components/ui/loading-indicator"

interface Exercise {
  id: string
  name: string
  muscles: string[]
}

export default function ExercisesTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMuscle, setSelectedMuscle] = useState("all")
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [newExerciseName, setNewExerciseName] = useState("")
  const [selectedMuscles, setSelectedMuscles] = useState<Record<string, boolean>>({})
  const [isLoadingExercises, setIsLoadingExercises] = useState(true)
  const { showLoading, hideLoading } = useLoading()

  const muscleGroups = [
    { id: "all", name: "All" },
    { id: "chest", name: "Chest" },
    { id: "back", name: "Back" },
    { id: "shoulders", name: "Shoulders" },
    { id: "biceps", name: "Biceps" },
    { id: "triceps", name: "Triceps" },
    { id: "forearms", name: "Forearms" },
    { id: "abs", name: "Abs" },
    { id: "legs", name: "Legs" },
    { id: "quads", name: "Quads" },
    { id: "hamstrings", name: "Hamstrings" },
    { id: "glutes", name: "Glutes" },
    { id: "calves", name: "Calves" },
    { id: "traps", name: "Traps" },
    { id: "obliques", name: "Obliques" },
    { id: "neck", name: "Neck" },
  ]

  // Load exercises on mount
  useEffect(() => {
    const loadExercises = async () => {
      setIsLoadingExercises(true)
      try {
        // Initialize storage if needed
        DataManager.initializeStorage()

        // Get exercises from localStorage
        const exercises = DataManager.getExercises()

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setExercises(exercises)
      } catch (error) {
        console.error("Failed to load exercises:", error)
        setExercises([])
      } finally {
        setIsLoadingExercises(false)
      }
    }

    loadExercises()
  }, [])

  // Filter exercises based on search and muscle filter
  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesMuscle = selectedMuscle === "all" || exercise.muscles.includes(selectedMuscle)
    return matchesSearch && matchesMuscle
  })

  // Handle muscle checkbox change
  const handleMuscleChange = (muscle: string, checked: boolean) => {
    setSelectedMuscles({
      ...selectedMuscles,
      [muscle]: checked,
    })
  }

  // Add new exercise
  const handleAddExercise = async () => {
    if (!newExerciseName.trim()) return

    const selectedMusclesList = Object.entries(selectedMuscles)
      .filter(([_, isSelected]) => isSelected)
      .map(([muscle]) => muscle)

    if (selectedMusclesList.length === 0) return

    // Show loading indicator
    showLoading()

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newExercise: Exercise = {
        id: DataManager.generateId(),
        name: newExerciseName.trim(),
        muscles: selectedMusclesList,
      }

      // Add to state
      const updatedExercises = [...exercises, newExercise]
      setExercises(updatedExercises)

      // Save to localStorage
      DataManager.saveExercise(newExercise)

      // Reset form
      setNewExerciseName("")
      setSelectedMuscles({})

      // Show success toast
      showSuccessToast(`Exercise "${newExerciseName}" added successfully`)
    } catch (error) {
      console.error("Failed to add exercise:", error)
    } finally {
      // Hide loading indicator
      hideLoading()
    }
  }

  // Delete exercise
  const handleDeleteExercise = async (id: string) => {
    const exerciseToDelete = exercises.find((e) => e.id === id)
    if (!exerciseToDelete) return

    // Show loading indicator
    showLoading()

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Remove from state
      const updatedExercises = exercises.filter((e) => e.id !== id)
      setExercises(updatedExercises)

      // Remove from localStorage
      DataManager.deleteExercise(id)

      // Show success toast
      showSuccessToast(`Exercise "${exerciseToDelete.name}" deleted`)
    } catch (error) {
      console.error("Failed to delete exercise:", error)
    } finally {
      // Hide loading indicator
      hideLoading()
    }
  }

  return (
    <div className="flex flex-col items-center p-4 space-y-6">
      {/* Exercise Library Header */}
      <div className="flex items-center justify-between w-full max-w-4xl">
        <div className="flex items-center gap-3">
          <Clipboard className="h-10 w-10" />
          <h2 className="text-2xl font-bold">Exercise Library</h2>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 rounded-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Exercise
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Exercise</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="exercise-name">Exercise Name</Label>
                <Input
                  id="exercise-name"
                  placeholder="e.g. Incline Bench Press"
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Target Muscles</Label>
                <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                  {muscleGroups
                    .filter((m) => m.id !== "all")
                    .map((muscle) => (
                      <div key={muscle.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`muscle-${muscle.id}`}
                          checked={selectedMuscles[muscle.id] || false}
                          onCheckedChange={(checked) => handleMuscleChange(muscle.id, checked as boolean)}
                        />
                        <Label htmlFor={`muscle-${muscle.id}`}>{muscle.name}</Label>
                      </div>
                    ))}
                </div>
              </div>

              <Button
                className="w-full bg-primary hover:bg-primary/90"
                onClick={handleAddExercise}
                disabled={!newExerciseName.trim() || Object.values(selectedMuscles).filter(Boolean).length === 0}
              >
                Save Exercise
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="w-full max-w-4xl space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            className="pl-10 bg-primary/5 border-primary/20 focus:bg-primary/10 focus:border-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Muscle Group Filter */}
        <div className="flex overflow-x-auto pb-2 space-x-2 no-scrollbar horizontal-scroll">
          {muscleGroups.map((muscle) => (
            <Button
              key={muscle.id}
              variant={selectedMuscle === muscle.id ? "default" : "outline"}
              className={`rounded-full ${selectedMuscle === muscle.id ? "bg-primary hover:bg-primary/90" : "border-primary/20 hover:bg-primary/10"}`}
              onClick={() => setSelectedMuscle(muscle.id)}
              size="sm"
            >
              {muscle.name}
            </Button>
          ))}
        </div>

        {/* Exercise Grid */}
        {isLoadingExercises ? (
          <div className="flex justify-center py-20">
            <LoadingIndicator size="lg" />
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            {searchQuery || selectedMuscle !== "all"
              ? "No exercises match your search criteria"
              : "No exercises added yet. Add your first exercise!"}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExercises.map((exercise) => (
              <motion.div
                key={exercise.id} // Key moved to motion.div for animation tracking
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }} // Trigger when 20% is visible
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <Card
                  className="overflow-hidden border-primary/20 hover:border-primary transition-all duration-200 ease-in-out bg-primary/5 hover:bg-primary/10 hover:shadow-md hover:-translate-y-px"
                >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-lg">{exercise.name}</h3>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary/70 hover:text-primary">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive/70 hover:text-destructive"
                        onClick={() => handleDeleteExercise(exercise.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {exercise.muscles.map((muscle) => (
                      <Badge key={muscle} variant="muscle" className="text-xs">
                        {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

