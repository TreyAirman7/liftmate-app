"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Black_Ops_One } from "next/font/google"
import { TrendingUp, Target, Lightbulb } from "lucide-react"

// Initialize the font
const blackOpsOne = Black_Ops_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
})

interface PerformanceInsightsProps {
  insights: string[]
}

export function PerformanceInsights({ insights }: PerformanceInsightsProps) {
  // Map insight to appropriate icon
  const getInsightIcon = (insight: string, index: number) => {
    if (insight.includes("increasing") || insight.includes("rate")) {
      return <TrendingUp className="text-blue-500 dark:text-blue-400 mt-1 mr-3 h-5 w-5 flex-shrink-0" />
    } else if (insight.includes("track") || insight.includes("goal")) {
      return <Target className="text-blue-500 dark:text-blue-400 mt-1 mr-3 h-5 w-5 flex-shrink-0" />
    } else {
      return <Lightbulb className="text-yellow-500 dark:text-yellow-400 mt-1 mr-3 h-5 w-5 flex-shrink-0" />
    }
  }

  return (
    <Card className="bg-gray-100 dark:bg-gray-800 p-4">
      <h2 className={`text-lg font-bold text-gray-800 dark:text-gray-200 mb-2 ${blackOpsOne.className}`}>
        Performance Insights
      </h2>
      <CardContent className="p-0 space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-start">
            {getInsightIcon(insight, index)}
            <p className="text-gray-700 dark:text-gray-300">{insight}</p>
          </div>
        ))}
        {insights.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400">
            Not enough data to generate insights yet. Keep logging your workouts!
          </p>
        )}
      </CardContent>
    </Card>
  )
}