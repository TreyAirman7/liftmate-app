"use client"

import { useState, useEffect } from "react"
import { X, Edit, HelpCircle, Play, Clock, Dumbbell } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import type { WorkoutTemplate } from "@/lib/data-manager"
import DataManager from "@/lib/data-manager"

interface WorkoutTemplatesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectTemplate: (template: WorkoutTemplate) => void
}

export default function WorkoutTemplatesDialog({ open, onOpenChange, onSelectTemplate }: WorkoutTemplatesDialogProps) {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])

  // Load templates on mount
  useEffect(() => {
    const loadTemplates = () => {
      try {
        // Initialize storage if needed
        DataManager.initializeStorage()

        // Get templates from localStorage
        const templates = DataManager.getTemplates()

        // Sort by last used (most recent first)
        templates.sort((a, b) => {
          if (!a.lastUsed) return 1
          if (!b.lastUsed) return -1
          return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
        })

        setTemplates(templates)
      } catch (error) {
        console.error("Failed to load templates:", error)
        setTemplates([])
      }
    }

    if (open) {
      loadTemplates()
    }
  }, [open])

  // Format last used date
  const formatLastUsed = (dateString: string | null): string => {
    if (!dateString) return "Never"

    const date = new Date(dateString)
    const now = new Date()

    // If today (compare year, month, and day)
    if (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    ) {
      return "Today"
    }

    // If yesterday
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (
      date.getFullYear() === yesterday.getFullYear() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getDate() === yesterday.getDate()
    ) {
      return "Yesterday"
    }

    // Otherwise show relative time or date
    try {
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (error) {
      // Fallback to simple date format if formatDistanceToNow fails
      return date.toLocaleDateString()
    }
  }

  // Add a function to count total sets in a template
  const countTotalSets = (template: WorkoutTemplate): number => {
    return template.exercises.reduce((total, exercise) => total + exercise.sets.length, 0)
  }

  // Update the template card rendering to show the total sets count
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="template-dialog max-w-md p-0 border-0 overflow-hidden bg-background">
        <div className="flex items-center justify-between p-4 bg-primary">
          <h2 className="text-xl font-bold text-primary-foreground">Select Workout Template</h2>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 max-h-[70vh] overflow-y-auto overscroll-contain space-y-4">
          {templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No templates available. Complete a workout and save it as a template.
            </div>
          ) : (
            templates.map((template) => (
              <div
                key={template.id}
                className="template-card rounded-lg overflow-hidden border border-primary/20 bg-primary/10"
              >
                <div className="p-4 flex justify-between items-start">
                  <h3 className="text-xl font-bold">{template.name}</h3>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary-foreground/70 hover:text-primary-foreground"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary-foreground/70 hover:text-primary-foreground"
                    >
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="border-t border-primary/20 p-4 space-y-4">
                  <div className="flex items-center text-sm text-primary-foreground/80">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Last used: {formatLastUsed(template.lastUsed)}</span>
                  </div>

                  <div className="flex items-center text-sm text-primary-foreground/80">
                    <Dumbbell className="h-4 w-4 mr-2" />
                    <span>
                      {template.exercises.length} exercise{template.exercises.length !== 1 ? "s" : ""},{" "}
                      {countTotalSets(template)} set{countTotalSets(template) !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => onSelectTemplate(template)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    START WORKOUT
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

