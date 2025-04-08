"use client"

import { useState } from "react"
import TemplateSelector from "./template-selector"
import WorkoutLogger from "./workout-logger"
import type { WorkoutTemplate } from "@/lib/data-manager"

interface WorkoutFlowProps {
  onComplete: (workout: any) => void
  onCancel: () => void
  selectedTemplate?: WorkoutTemplate | null
}

export default function WorkoutFlow({ onComplete, onCancel, selectedTemplate }: WorkoutFlowProps) {
  const [selectedTemplateState, setSelectedTemplateState] = useState<WorkoutTemplate | null>(selectedTemplate || null)

  // Handle template selection
  const handleSelectTemplate = (template: WorkoutTemplate) => {
    setSelectedTemplateState(template)
  }

  // If no template is selected, show template selector
  if (!selectedTemplateState) {
    return <TemplateSelector onSelectTemplate={handleSelectTemplate} onCancel={onCancel} /> // Pass onCancel
  }

  // Otherwise, show workout logger
  return <WorkoutLogger template={selectedTemplateState} onComplete={onComplete} onCancel={onCancel} />
}

