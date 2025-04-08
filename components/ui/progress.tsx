"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { motion } from "framer-motion" // Import motion
 
import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  showValue?: boolean
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, showValue = false, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <motion.div // Change to motion.div wrapping the Indicator or make Indicator a motion component
      className="h-full w-full flex-1 bg-primary" // Removed transition class
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      initial={{ transform: `translateX(-100%)` }} // Start from 0% visually
      animate={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }} // Add spring transition
    />
    {showValue && (
      <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-primary-foreground">
        {Math.round(value || 0)}%
      </div>
    )}
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
