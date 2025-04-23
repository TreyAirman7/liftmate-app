"use client"

import { Card, CardContent } from "@/components/ui/card"
import dayjs from "dayjs"
import type { PredictionMetadata } from "@/lib/performance-prediction"

interface PredictionMetadataProps {
  metadata: PredictionMetadata
}

export function PredictionMetadata({ metadata }: PredictionMetadataProps) {
  // Format date for display
  const formatDate = (dateString: string): string => {
    return dayjs(dateString).format("MMM D, YYYY")
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pt-4">
      <CardContent className="p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Analysis based on:</h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
          <li>• {metadata.workoutCount} recorded workout sessions</li>
          <li>• Training frequency: {metadata.frequency} sessions per week</li>
          <li>• {metadata.modelType}</li>
          <li>• Last updated: {formatDate(metadata.lastUpdated)}</li>
        </ul>
      </CardContent>
    </Card>
  )
}