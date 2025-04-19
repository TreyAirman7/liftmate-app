"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion" // Import motion
import { X, Plus, Grip, Save } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { showErrorToast, showSuccessToast } from "@/lib/toast"
import type { Exercise, WorkoutTemplate } from "@/lib/data-manager"
import DataManager from "@/lib/data-manager"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers"

interface TemplateCreatorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTemplateCreated?: (template: WorkoutTemplate) => void
  onTemplateUpdated?: (template: WorkoutTemplate) => void
  templateToEdit?: WorkoutTemplate | null
}

interface TemplateExercise {
  id: string
  exerciseId: string
  exerciseName: string
  sets: {
    targetReps: number
    restTime: number
  }[]
}

interface ExerciseItemProps {
  exercise: TemplateExercise
  onRemove: (id: string) => void
}

// Predefined categories
const PREDEFINED_CATEGORIES = [
  "Push",
  "Pull",
  "Legs",
  "Upper Body",
  "Lower Body",
  "Full Body",
  "Core",
  "Cardio",
  "Custom",
]

// Sortable exercise item component
const SortableExerciseItem = ({ exercise, onRemove }: ExerciseItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: exercise.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout // Enable layout animation for smooth reordering
      initial={{ opacity: 0, y: -10 }} // Entry animation
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }} // Exit animation (slide left)
      transition={{ duration: 0.2 }}
      className="bg-black rounded-lg mb-4 overflow-hidden border border-white"
    >
      <div className="flex items-center justify-between p-3 border-b border-white">
        <div className="flex items-center">
          <div className="mr-2 cursor-grab touch-manipulation" {...attributes} {...listeners}>
            <Grip className="h-5 w-5 text-primary/70" />
          </div>
          <h3 className="text-lg font-bold">{exercise.exerciseName}</h3>
        </div>
        {/* Remove button removed as per user feedback to avoid confusion */}
      </div>
      <div className="p-3 space-y-2">
        {exercise.sets.map((set, index) => (
          <div
            key={index}
            className="text-sm text-muted-foreground border-b border-white/30 pb-2 last:border-0 last:pb-0"
          >
            Set {index + 1}: {set.targetReps} reps, {set.restTime} sec rest
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// Exercise selection dialog
const ExerciseSelector = ({
  open,
  onOpenChange,
  onSelectExercise,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectExercise: (exercise: Exercise) => void
}) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [exercises, setExercises] = useState<Exercise[]>([])

  // Load exercises on mount
  useEffect(() => {
    if (open) {
      try {
        const exercises = DataManager.getExercises()
        setExercises(exercises)
      } catch (error) {
        console.error("Failed to load exercises:", error)
        setExercises([])
      }
    }
  }, [open])

  // Filter exercises based on search
  const filteredExercises = exercises.filter((exercise) =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 border-0 overflow-hidden bg-[#222222]"> {/* Changed max-w-2xl to max-w-4xl */}
        <DialogDescription className="sr-only">
          Template creation dialog. Fill out the form and save your template.
        </DialogDescription>
        <div className="flex items-center justify-between p-4 border-b border-[#333333]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Add Exercise to Template</DialogTitle>
          </DialogHeader>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <label className="text-sm font-medium mb-1 block text-white">Search Exercise</label>
            <Input
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#333333] border-[#444444] text-white"
            />
          </div>

          <div className="h-[calc(100vh-160px)] w-full max-w-none overflow-y-auto space-y-6">
            {filteredExercises.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No exercises found</div>
            ) : (
              filteredExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="pb-4 border-b border-white/30 last:border-0 cursor-pointer"
                  onClick={() => onSelectExercise(exercise)}
                >
                  <h3 className="text-xl font-bold mb-2 text-white hover:text-primary transition-colors">
                    {exercise.name}
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {exercise.muscles.map((muscle) => (
                      <Badge key={muscle} variant="outline" className="text-xs bg-[#444444] text-white">
                        {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Update the SetConfigurator dialog styling
const SetConfigurator = ({
  open,
  onOpenChange,
  exercise,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  exercise: Exercise | null
  onSave: (exercise: TemplateExercise) => void
}) => {
  const [sets, setSets] = useState<{ targetReps: number; restTime: number }[]>([{ targetReps: 10, restTime: 60 }])

  // Update set configuration
  const updateSet = (index: number, field: "targetReps" | "restTime", value: number) => {
    const newSets = [...sets]
    newSets[index][field] = value
    setSets(newSets)
  }

  // Add another set
  const addSet = () => {
    setSets([...sets, { targetReps: 10, restTime: 60 }])
  }

  // Remove a set
  const removeSet = (index: number) => {
    const newSets = [...sets]
    newSets.splice(index, 1)
    setSets(newSets)
  }

  // Save exercise with sets
  const handleSave = (e: React.MouseEvent<HTMLButtonElement>) => { // Accept event
    e.stopPropagation(); // Stop event propagation

    if (!exercise) {
      console.error("No exercise selected")
      return
    }

    try {
      console.log("Saving exercise:", exercise.name, "with sets:", sets)

      const templateExercise = {
        id: DataManager.generateId(),
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        sets: sets,
      }

      onSave(templateExercise)

      // Instead of checking if onOpenChange is a function, just call it with false
      // This will close the dialog
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving exercise:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 border-0 overflow-hidden bg-[#222222]"> {/* Changed max-w-2xl to max-w-4xl */}
        <DialogDescription className="sr-only">Configure sets for the selected exercise.</DialogDescription>
        <div className="flex items-center justify-between p-4 border-b border-[#333333]">
          <DialogHeader>
             <DialogTitle className="text-xl font-bold text-white">{exercise?.name || "Configure Exercise"}</DialogTitle>
          </DialogHeader>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={() => {
              if (typeof onOpenChange === "function") {
                onOpenChange(false)
              }
            }}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-medium mb-3 text-white">Sets</h3>

          <div className="space-y-4 h-[calc(100vh-160px)] w-full max-w-none overflow-y-auto overscroll-contain">
            {sets.map((set, index) => (
              <div key={index} className="p-4 bg-[#333333] rounded-lg border border-white">
                <div className="flex justify-between items-center mb-3 border-b border-white pb-2">
                  <h4 className="font-medium text-white">Set {index + 1}</h4>
                  {sets.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive/80"
                      onClick={() => removeSet(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Target Reps</label>
                    <Input
                      type="number"
                      value={set.targetReps}
                      onChange={(e) => updateSet(index, "targetReps", Number.parseInt(e.target.value) || 0)}
                      min={1}
                      className="bg-[#444444] border-[#555555] text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Rest Time (seconds)</label>
                    <Input
                      type="number"
                      value={set.restTime}
                      onChange={(e) => updateSet(index, "restTime", Number.parseInt(e.target.value) || 0)}
                      min={0}
                      className="bg-[#444444] border-[#555555] text-white"
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              className="w-full bg-primary hover:bg-primary/90 text-black font-semibold"
              onClick={addSet}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Set
            </Button>
          </div>

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              className="bg-[#333333] hover:bg-[#444444] border-[#444444] text-white uppercase"
              onClick={() => {
                if (typeof onOpenChange === "function") {
                  onOpenChange(false)
                }
              }}
            >
              Back
            </Button>

            <Button
              type="button"
              className="bg-primary hover:bg-primary/90 text-black uppercase font-semibold"
              onClick={handleSave}
            >
              Add to Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Update the main dialog to use the custom styling classes
export default function TemplateCreator({
  open,
  onOpenChange,
  onTemplateCreated,
  onTemplateUpdated,
  templateToEdit,
}: TemplateCreatorProps) {
  const [templateName, setTemplateName] = useState("")
  const [templateDescription, setTemplateDescription] = useState("")
  const [templateCategory, setTemplateCategory] = useState<string>("")
  const [customCategory, setCustomCategory] = useState<string>("")
  const [exercises, setExercises] = useState<TemplateExercise[]>([])
  const [exerciseSelectorOpen, setExerciseSelectorOpen] = useState(false)
  const [setConfiguratorOpen, setSetConfiguratorOpen] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [nameError, setNameError] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Initialize form when editing a template
  useEffect(() => {
    if (templateToEdit && open) {
      setTemplateName(templateToEdit.name)
      setTemplateDescription(templateToEdit.description || "")
      setTemplateCategory(templateToEdit.category || "")
      // Map exercises from templateToEdit and add a unique ID for DnD
      setExercises(
        templateToEdit.exercises.map((ex) => ({
          ...ex,
          id: DataManager.generateId(), // Add unique ID for sortable item
        }))
      )
      setIsEditMode(true)
    } else if (open) {
      // Reset form when creating a new template
      resetForm()
      setIsEditMode(false)
    }
  }, [templateToEdit, open])

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = exercises.findIndex((ex) => ex.id === active.id)
      const newIndex = exercises.findIndex((ex) => ex.id === over.id)

      const newExercises = [...exercises]
      const [removed] = newExercises.splice(oldIndex, 1)
      newExercises.splice(newIndex, 0, removed)

      setExercises(newExercises)
    }
  }

  // Open exercise selector
  const openExerciseSelector = () => {
    setExerciseSelectorOpen(true)
  }

  // Handle exercise selection
  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise)
    setExerciseSelectorOpen(false)
    setSetConfiguratorOpen(true)
  }

  // Add exercise with sets to template
  const addExerciseToTemplate = (exercise: TemplateExercise) => {
    console.log("Adding exercise to template:", exercise)
    setExercises([...exercises, exercise])
    // Close the set configurator dialog
    setSetConfiguratorOpen(false)
  }

  // Remove exercise from template
  const removeExercise = (id: string) => {
    setExercises(exercises.filter((ex) => ex.id !== id))
  }

  // Reset form
  const resetForm = () => {
    setTemplateName("")
    setTemplateDescription("")
    setTemplateCategory("")
    setCustomCategory("")
    setExercises([])
    setNameError(false)
  }

  // Handle dialog close
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm()
    }
    onOpenChange(open)
  }

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setTemplateCategory(value)
    if (value !== "Custom") {
      setCustomCategory("")
    }
  }

  // Save template
  const saveTemplate = () => {
    // Validate form
    if (!templateName.trim()) {
      setNameError(true)
      showErrorToast("Please enter a template name")
      return
    }

    if (exercises.length === 0) {
      showErrorToast("Please add at least one exercise to the template")
      return
    }

    // Determine final category
    const finalCategory =
      templateCategory === "Custom" && customCategory.trim() ? customCategory.trim() : templateCategory

    // Create template
    const template: WorkoutTemplate = {
      id: isEditMode && templateToEdit ? templateToEdit.id : DataManager.generateId(),
      name: templateName.trim(),
      description: templateDescription.trim() || null,
      category: finalCategory || null,
      lastUsed: isEditMode && templateToEdit?.lastUsed ? templateToEdit.lastUsed : null,
      exercises: exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        sets: ex.sets,
      })),
    }

    // Save template
    try {
      DataManager.saveTemplate(template)

      if (isEditMode) {
        // Notify parent of update
        if (onTemplateUpdated) {
          onTemplateUpdated(template)
        }
      } else {
        // Notify parent of creation
        if (onTemplateCreated) {
          onTemplateCreated(template)
        }
      }

      // Close dialog
      handleOpenChange(false)

      // Show success message
      showSuccessToast("Template saved successfully!")
    } catch (error) {
      console.error("Failed to save template:", error)
      showErrorToast("Failed to save template. Please try again.")
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="template-creator-dialog max-w-4xl p-0 border-0 overflow-hidden bg-[#222222]"> {/* Changed max-w-2xl to max-w-4xl */}
          <DialogDescription className="sr-only">{isEditMode ? "Edit workout template" : "Create a new workout template"}</DialogDescription>
          <div className="flex items-center justify-between p-4 !bg-black">
            <DialogHeader>
               <DialogTitle className="text-xl font-bold text-white">{isEditMode ? "Edit Template" : "Create New Template"}</DialogTitle>
            </DialogHeader>
            {/* Default close button from DialogContent will be used */}
          </div>

          <div className="p-4 h-[calc(100vh-80px)] w-full max-w-none overflow-y-auto overscroll-contain">
            <div className="mb-6 w-full">
              <label className={`text-sm font-medium mb-1 block text-black dark:text-white ${nameError ? "text-destructive dark:text-destructive" : ""}`}>
                Template Name
              </label>
              <Input
                placeholder="E.g., Push Day, Leg Day, Full Body"
                value={templateName}
                onChange={(e) => {
                  setTemplateName(e.target.value)
                  if (e.target.value.trim()) setNameError(false)
                }}
                className="!bg-[#000000] text-white placeholder:text-white dark:placeholder:text-gray-400 border-gray-700 [&:not(:focus)]:bg-[#000000] [&:focus]:bg-[#000000]"
              />
              {nameError && <p className="text-destructive text-xs mt-1">Please enter a template name</p>}
            </div>

            <div className="mb-6">
              <label className="text-sm font-medium mb-1 block text-black dark:text-white">Description (Optional)</label>
              <Textarea
                placeholder="Add a description for your template"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                className="!bg-[#000000] text-white placeholder:text-white dark:placeholder:text-gray-400 border-gray-700 [&:not(:focus)]:bg-[#000000] [&:focus]:bg-[#000000]"
              />
            </div>

            <div className="mb-6">
              <label className="text-sm font-medium mb-1 block text-black dark:text-white">Category (Optional)</label>
              <Select value={templateCategory} onValueChange={handleCategoryChange}>
                {/* Apply placeholder targeting to Trigger */}
                <SelectTrigger className="!bg-[#000000] text-white data-[placeholder]:text-white border-gray-700">
                  {/* Removed explicit className from SelectValue */}
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-[#222222] border-gray-700">
                  <SelectItem value="none">None</SelectItem>
                  {PREDEFINED_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {templateCategory === "Custom" && (
                <div className="mt-2">
                  <Input
                    placeholder="Enter custom category"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="!bg-[#000000] text-white placeholder:text-white dark:placeholder:text-gray-400 border-gray-700"
                  />
                </div>
              )}
            </div>

            <h3 className="text-lg font-medium mb-4 text-black dark:text-white">Exercises</h3>

            <div className="h-[calc(100vh-400px)] w-full max-w-none overflow-y-auto mb-6">
              {exercises.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No exercises added yet</div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                  modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                >
                  <SortableContext items={exercises.map((ex) => ex.id)} strategy={verticalListSortingStrategy}>
                    <AnimatePresence> {/* Wrap list items for exit animations */}
                      {exercises.map((exercise) => (
                        <SortableExerciseItem key={exercise.id} exercise={exercise} onRemove={removeExercise} />
                      ))}
                    </AnimatePresence>
                  </SortableContext>
                </DndContext>
              )}
            </div>

            <Button
              variant="outline"
              className="add-exercise-btn w-full mb-6 bg-primary hover:bg-primary/90 text-black font-semibold rounded-full"
              onClick={openExerciseSelector}
            >
              Add Exercise
            </Button>

            <div className="flex flex-col space-y-4">
              <Button
                className="save-btn bg-primary hover:bg-primary/90 text-black uppercase font-semibold py-6 text-lg shadow-lg"
                onClick={saveTemplate}
              >
                <Save className="h-5 w-5 mr-2" />
                {isEditMode ? "Update Template" : "Save Template"}
              </Button>

              <Button
                variant="outline"
                className="cancel-btn bg-[#333333] hover:bg-[#444444] border-[#444444] text-white"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Exercise selector dialog */}
      <ExerciseSelector
        open={exerciseSelectorOpen}
        onOpenChange={setExerciseSelectorOpen}
        onSelectExercise={handleSelectExercise}
      />

      {/* Set configurator dialog */}
      <SetConfigurator
        open={setConfiguratorOpen}
        onOpenChange={(open: boolean) => setSetConfiguratorOpen(open)}
        exercise={selectedExercise}
        onSave={addExerciseToTemplate}
      />
    </>
  )
}
