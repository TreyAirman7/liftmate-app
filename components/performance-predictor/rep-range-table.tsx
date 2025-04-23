"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Black_Ops_One } from "next/font/google"
import dayjs from "dayjs"
import type { RepRangePrediction } from "@/lib/performance-prediction"

// Initialize the font
const blackOpsOne = Black_Ops_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
})

interface RepRangeTableProps {
  repRangePredictions: RepRangePrediction[]
}

export function RepRangeTable({ repRangePredictions }: RepRangeTableProps) {
  // Format date for display
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "N/A"
    return dayjs(dateString).format("MMM D, YYYY")
  }

  return (
    <div>
      <h2 className={`text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 ${blackOpsOne.className}`}>
        Rep Range Predictions
      </h2>
      <div className="overflow-x-auto">
        <Table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
          <TableHeader className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            <TableRow>
              <TableHead className="py-3 px-4 text-left">Rep Range</TableHead>
              <TableHead className="py-3 px-4 text-left">Current Max</TableHead>
              <TableHead className="py-3 px-4 text-left">Predicted Max</TableHead>
              <TableHead className="py-3 px-4 text-left">Est. Achievement</TableHead>
              <TableHead className="py-3 px-4 text-left">Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
            {repRangePredictions.map((prediction, index) => (
              <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                <TableCell className="py-3 px-4 font-medium">{prediction.repRange}</TableCell>
                <TableCell className="py-3 px-4">{prediction.currentMax} lbs</TableCell>
                <TableCell className="py-3 px-4">{prediction.predictedMax} lbs</TableCell>
                <TableCell className="py-3 px-4">{formatDate(prediction.estimatedAchievement)}</TableCell>
                <TableCell className="py-3 px-4 w-1/5">
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div className="text-xs text-right w-full font-semibold inline-block text-blue-600 dark:text-blue-400">
                        {prediction.progressPercentage}%
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-200 dark:bg-blue-900">
                      <div 
                        style={{ width: `${prediction.progressPercentage}%` }} 
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 dark:bg-blue-400"
                      ></div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}