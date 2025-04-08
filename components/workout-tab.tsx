"use client"

import { useState, useEffect } from "react"
import { Dumbbell, ChevronRight, FileText, Play, Plus, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import WorkoutTracker from "@/components/active-workout/workout-tracker"
import WorkoutSummary from "@/components/active-workout/workout-summary"
import WorkoutFlow from "@/components/active-workout/workout-flow"
import TemplateCreator from "@/components/template-creator"
import TemplatePreview from "@/components/template-preview"
import type { CompletedWorkout, WorkoutTemplate } from "@/lib/data-manager"
import DataManager from "@/lib/data-manager"
import { showSuccessToast, showErrorToast } from "@/lib/toast"

interface WorkoutTabProps {
  userName: string
  greeting: string
}

type WorkoutState = "idle" | "template" | "active" | "summary" | "preview"

// Define sort options
type SortOption = "name" | "lastUsed" | "exercises" | "sets"

export default function WorkoutTab({ userName, greeting }: WorkoutTabProps) {
  const [workoutState, setWorkoutState] = useState<WorkoutState>("idle")
  const [currentWorkout, setCurrentWorkout] = useState<CompletedWorkout | null>(null)
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [templateCreatorOpen, setTemplateCreatorOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null)
  const [templateToDelete, setTemplateToDelete] = useState<WorkoutTemplate | null>(null)
  const [templateToEdit, setTemplateToEdit] = useState<WorkoutTemplate | null>(null)
  const [templateToPreview, setTemplateToPreview] = useState<WorkoutTemplate | null>(null)
  const [sortOption, setSortOption] = useState<SortOption>("lastUsed")
  const [filterCategory, setFilterCategory] = useState<string>("all")

  // Add useEffect to load templates on mount
  useEffect(() => {
    loadTemplates()
  }, [])

  // Function to load templates
  const loadTemplates = () => {
    try {
      // Initialize storage if needed
      DataManager.initializeStorage()

      // Get templates from localStorage
      const loadedTemplates = DataManager.getTemplates()

      setTemplates(loadedTemplates)
    } catch (error) {
      console.error("Failed to load templates:", error)
      setTemplates([])
    }
  }

  // Sort templates based on selected option
  const sortedTemplates = [...templates].sort((a, b) => {
    switch (sortOption) {
      case "name":
        return a.name.localeCompare(b.name)
      case "lastUsed":
        if (!a.lastUsed) return 1
        if (!b.lastUsed) return -1
        return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
      case "exercises":
        return b.exercises.length - a.exercises.length
      case "sets":
        const aSets = a.exercises.reduce((total, ex) => total + ex.sets.length, 0)
        const bSets = b.exercises.reduce((total, ex) => total + ex.sets.length, 0)
        return bSets - aSets
      default:
        return 0
    }
  })

  // Filter templates by category
  const filteredTemplates =
    filterCategory === "all"
      ? sortedTemplates
      : sortedTemplates.filter((template) => template.category === filterCategory)

  // Get unique categories from templates
  const categories = ["all", ...new Set(templates.map((t) => t.category || "uncategorized").filter(Boolean))]

  // Start a new workout
  const startNewWorkout = () => {
    setWorkoutState("active")
  }

  // Start template selection flow
  const startTemplateFlow = (template?: WorkoutTemplate) => {
    if (template) {
      // If a template is provided, pass it to the WorkoutFlow component
      setSelectedTemplate(template)
    } else {
      // Otherwise, let the user select a template
      setSelectedTemplate(null)
    }
    setWorkoutState("template")
  }

  // Handle workout completion
  const handleWorkoutComplete = (workout: CompletedWorkout) => {
    setCurrentWorkout(workout)
    setWorkoutState("summary")
  }

  // Handle workout cancellation
  const handleWorkoutCancel = () => {
    setWorkoutState("idle")
    setCurrentWorkout(null)
    setSelectedTemplate(null)
  }

  // Save completed workout
  const saveWorkout = (workout: CompletedWorkout) => {
    try {
      // Save to localStorage
      DataManager.saveWorkout(workout)

      // Reset state
      setWorkoutState("idle")
      setCurrentWorkout(null)
    } catch (error) {
      console.error("Failed to save workout:", error)
    }
  }

  // Handle template creation
  const handleTemplateCreated = (template: WorkoutTemplate) => {
    // Reload templates to ensure we have the latest data
    loadTemplates()
    // Close the template creator
    setTemplateCreatorOpen(false)
    // Show success message
    showSuccessToast(`Template "${template.name}" created successfully`)
  }

  // Handle template edit
  const handleEditTemplate = (template: WorkoutTemplate) => {
    setTemplateToEdit(template)
    setTemplateCreatorOpen(true)
  }

  // Handle template update
  const handleTemplateUpdated = (template: WorkoutTemplate) => {
    // Reload templates to ensure we have the latest data
    loadTemplates()
    // Close the template creator
    setTemplateCreatorOpen(false)
    // Reset edit state
    setTemplateToEdit(null)
    // Show success message
    showSuccessToast(`Template "${template.name}" updated successfully`)
  }

  // Handle template deletion
  const handleDeleteTemplate = (template: WorkoutTemplate) => {
    setTemplateToDelete(template)
  }

  // Confirm template deletion
  const confirmDeleteTemplate = () => {
    if (!templateToDelete) return

    try {
      // Delete template from storage
      DataManager.deleteTemplate(templateToDelete.id)

      // Update state
      setTemplates((prevTemplates) => prevTemplates.filter((t) => t.id !== templateToDelete.id))

      // Show success message
      showSuccessToast(`Template "${templateToDelete.name}" deleted successfully`)
    } catch (error) {
      console.error("Failed to delete template:", error)
      showErrorToast("Failed to delete template")
    } finally {
      // Reset delete state
      setTemplateToDelete(null)
    }
  }

  // Handle template preview
  const handlePreviewTemplate = (template: WorkoutTemplate) => {
    setTemplateToPreview(template)
    setWorkoutState("preview")
  }

  // Close template preview
  const closePreview = () => {
    setTemplateToPreview(null)
    setWorkoutState("idle")
  }

  // Render based on workout state
  if (workoutState === "active") {
    return <WorkoutTracker onComplete={handleWorkoutComplete} onCancel={handleWorkoutCancel} initialExercises={[]} />
  }

  if (workoutState === "template") {
    return (
      <WorkoutFlow
        onComplete={handleWorkoutComplete}
        onCancel={handleWorkoutCancel}
        selectedTemplate={selectedTemplate}
      />
    )
  }

  if (workoutState === "summary" && currentWorkout) {
    return <WorkoutSummary workout={currentWorkout} onSave={saveWorkout} onSaveAsTemplate={() => {}} />
  }

  if (workoutState === "preview" && templateToPreview) {
    return (
      <TemplatePreview
        template={templateToPreview}
        onClose={closePreview}
        onStart={() => {
          setSelectedTemplate(templateToPreview)
          setWorkoutState("template")
        }}
      />
    )
  }

  // Default idle state
  return (
    <div className="flex flex-col items-center p-4 space-y-6">
      {/* Current Workout Header */}
      <div className="flex flex-col items-center space-y-2 w-full">
        <Dumbbell className="h-10 w-10" />
        <h2 className="text-2xl font-bold">Current Workout</h2>
      </div>

      <div className="w-full max-w-md">
        <div className="border-b border-border pb-4 mb-4">
          <p className="text-center text-lg">
            {greeting}, {userName}! Ready for your workout?
          </p>
        </div>

        {/* Quick Start Button */}
        <Button className="w-full bg-primary hover:bg-primary/90 mb-6" onClick={startNewWorkout}>
          <Play className="h-4 w-4 mr-2" />
          Start New Workout
        </Button>

        {/* Template Workout Card */}
        <Card className="mb-8 bg-card border-primary/50">
          <CardContent className="flex flex-col items-center p-6 space-y-4">
            <div className="h-16 w-16 rounded-full template-icon-container flex items-center justify-center">
              <FileText className="h-8 w-8 template-icon" />
            </div>

            <h3 className="text-xl font-semibold">Template Workout</h3>
            <p className="text-center text-muted-foreground">Use a saved workout template</p>

            <Button className="bg-primary hover:bg-primary/90 text-white" onClick={() => startTemplateFlow()}>
              Use Template <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Template Creator */}
        <TemplateCreator
          open={templateCreatorOpen}
          onOpenChange={setTemplateCreatorOpen}
          onTemplateCreated={handleTemplateCreated}
          onTemplateUpdated={handleTemplateUpdated}
          templateToEdit={templateToEdit}
        />

        {/* Delete Template Confirmation Dialog */}
        <AlertDialog open={!!templateToDelete} onOpenChange={(open) => !open && setTemplateToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Template</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{templateToDelete?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteTemplate} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* My Templates Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6" />
              <h3 className="text-xl font-semibold">My Templates</h3>
            </div>
            <Button
              variant="outline"
              className="rounded-full bg-primary hover:bg-primary/90 text-white"
              onClick={() => {
                setTemplateToEdit(null)
                setTemplateCreatorOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-1" /> New Template
            </Button>
          </div>

          {/* Filter and Sort Controls */}
          <div className="flex justify-between items-center mb-4 gap-2">
            {/* Category Filter */}
            <div className="flex overflow-x-auto space-x-2 pb-2 no-scrollbar">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={filterCategory === category ? "default" : "outline"}
                  size="sm"
                  className={filterCategory === category ? "bg-primary" : ""}
                  onClick={() => setFilterCategory(category)}
                >
                  {category === "all" ? "All" : category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Sort:{" "}
                  {sortOption === "name"
                    ? "Name"
                    : sortOption === "lastUsed"
                      ? "Recent"
                      : sortOption === "exercises"
                        ? "Exercises"
                        : "Sets"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortOption("name")}>Name</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption("lastUsed")}>Recently Used</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption("exercises")}>Most Exercises</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption("sets")}>Most Sets</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {filteredTemplates.length === 0 ? (
            <div className="text-center py-6 bg-muted/20 rounded-lg border border-border">
              <p className="text-muted-foreground">
                {templates.length === 0
                  ? "No templates yet. Create your first workout template!"
                  : "No templates match the selected category."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="overflow-hidden hover:border-primary transition-all duration-200 ease-in-out hover:shadow-md hover:-translate-y-px">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="cursor-pointer" onClick={() => handlePreviewTemplate(template)}>
                        <h4 className="font-medium text-lg">{template.name}</h4>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">
                            {template.exercises.length} exercises,{" "}
                            {template.exercises.reduce((total, ex) => total + ex.sets.length, 0)} sets
                          </p>
                          {template.category && (
                            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                              {template.category}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => startTemplateFlow(template)}
                        >
                          <Play className="h-4 w-4" />
                          <span className="sr-only">Start workout</span>
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">More options</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handlePreviewTemplate(template)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteTemplate(template)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

