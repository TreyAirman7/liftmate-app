"use client"

import { useState, useEffect } from "react"
import { Clock, Dumbbell, Play, Search, Calendar } from "lucide-react"
import { useThemeContext } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { WorkoutTemplate } from "@/lib/data-manager"
import DataManager from "@/lib/data-manager"

interface TemplateSelectorProps {
  onSelectTemplate: (template: WorkoutTemplate) => void
  onCancel: () => void // Add onCancel prop
}

export default function TemplateSelector({ onSelectTemplate, onCancel }: TemplateSelectorProps) {
  const { themeColor } = useThemeContext()
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [recentTemplates, setRecentTemplates] = useState<WorkoutTemplate[]>([])

  // Load templates on mount
  useEffect(() => {
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

      // Set recent templates (last 3 used)
      setRecentTemplates(templates.filter((t) => t.lastUsed).slice(0, 3))
    } catch (error) {
      console.error("Failed to load templates:", error)
      setTemplates([])
      setRecentTemplates([])
    }
  }, [])

  // Filter templates based on search
  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Format last used date
  const formatLastUsed = (dateString: string | null): string => {
    if (!dateString) return "Never used"

    try {
      const date = new Date(dateString)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (error) {
      return "Recently"
    }
  }

  // Count total sets in a template
  const countTotalSets = (template: WorkoutTemplate): number => {
    return template.exercises.reduce((total, exercise) => total + exercise.sets.length, 0)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="p-4 bg-primary text-primary-foreground flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Workout Templates</h1> {/* Added text-white */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="text-primary-foreground hover:bg-primary/80"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      {/* Search bar */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            className="w-full bg-card text-card-foreground border border-border rounded-md py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Recent templates section */}
      {recentTemplates.length > 0 && !searchQuery && (
        <div className="px-4 mb-6">
          <h2 className="text-xl font-bold mb-4">Recent Templates</h2>
          <div className="space-y-4">
            {recentTemplates.map((template) => (
              <div key={template.id} className="bg-card rounded-lg overflow-hidden border border-border">
                <div
                  className="p-4 border-b border-gray-800"
                  style={{ borderColor: themeColor === "default" ? "#FFA500" : "var(--md-primary)" }}
                >
                  <h3 className="text-xl font-bold">{template.name}</h3>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Last used: {formatLastUsed(template.lastUsed)}</span>
                  </div>

                  <div className="flex items-center text-muted-foreground">
                    <Dumbbell className="h-4 w-4 mr-2" />
                    <span>
                      {template.exercises.length} exercise{template.exercises.length !== 1 ? "s" : ""},{" "}
                      {countTotalSets(template)} set{countTotalSets(template) !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <button
                    className="w-full py-3 rounded-md font-bold text-primary-foreground bg-primary hover:bg-primary/90 flex items-center justify-center"
                    onClick={() => onSelectTemplate(template)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    START WORKOUT
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All templates */}
      <div className="px-4 pb-20">
        <h2 className="text-xl font-bold mb-4">{searchQuery ? "Search Results" : "All Templates"}</h2>

        {filteredTemplates.length === 0 ? (
          <div className="bg-card rounded-lg p-6 text-center">
            <p className="text-muted-foreground">No templates found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="bg-card rounded-lg overflow-hidden border border-border">
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold">{template.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{formatLastUsed(template.lastUsed)}</span>
                    </div>
                  </div>

                  <button
                    className="p-3 rounded-full bg-primary hover:bg-primary/90"
                    onClick={() => onSelectTemplate(template)}
                  >
                    <Play className="h-5 w-5 text-primary-foreground" />
                  </button>
                </div>

                <div
                  className="px-4 py-3 border-t border-gray-800 flex justify-between items-center text-sm"
                  style={{ borderColor: themeColor === "default" ? "#FFA500" : "var(--md-primary)" }}
                >
                  <div className="flex items-center">
                    <Dumbbell className="h-4 w-4 mr-2" />
                    <span>
                      {template.exercises.length} exercise{template.exercises.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div>
                    <span>
                      {countTotalSets(template)} set{countTotalSets(template) !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
