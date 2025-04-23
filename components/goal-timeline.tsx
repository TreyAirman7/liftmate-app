"use client"

import React, { useRef, useState, useEffect } from 'react'; // Import hooks
import dayjs from 'dayjs';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UserGoal, GoalMilestone } from '@/lib/data-manager'; // Assuming UserGoal is defined here
import { cn } from "@/lib/utils"; // For conditional classes

interface GoalTimelineProps {
  goal: UserGoal; // The processed goal data with calculations
  recommendations: string[];
}

// Helper to format date nicely
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "N/A";
  return dayjs(dateString).format('MMM D, YYYY');
};

// Helper to get theme color class - Adapt based on actual theme implementation if needed
// This uses primary color for now, might need adjustment if goals have specific colors
const getThemeColorClass = (type: 'bg' | 'border' | 'text' | 'fill' | 'stroke' | 'light-bg' | 'dark-bg'): string => {
  switch (type) {
    case 'bg': return 'bg-primary';
    case 'border': return 'border-primary';
    case 'text': return 'text-primary';
    case 'fill': return 'fill-primary';
    case 'stroke': return 'stroke-primary';
    case 'light-bg': return 'bg-primary/10'; // Example light background
    case 'dark-bg': return 'bg-primary/80'; // Example darker background
    default: return '';
  }
};

const GoalTimeline: React.FC<GoalTimelineProps> = ({ goal, recommendations }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800); // Default width, will update
  const timelineHeight = 150; // Reduced height
  const padding = 50; // Keep padding relative to internal coordinate system
  const svgWidth = '100%'; // SVG element fills container

  // Get container width dynamically
  useEffect(() => {
    const observeTarget = containerRef.current;
    if (!observeTarget) return;

    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width } = entries[0].contentRect;
        setContainerWidth(width); // Update state with actual width
      }
    });

    resizeObserver.observe(observeTarget);

    // Initial measurement in case ResizeObserver is slow
    setContainerWidth(observeTarget.offsetWidth);


    return () => {
      resizeObserver.unobserve(observeTarget);
    };
  }, []);


  const startDate = dayjs(goal.startDate);
  // Use projectedDate if available, otherwise use userTargetDate or estimate a reasonable end date
  const endDate = dayjs(goal.projectedDate || goal.userTargetDate || dayjs(goal.startDate).add(6, 'month')); // Fallback end date
  const today = dayjs();

  // Ensure endDate is after startDate
  const effectiveEndDate = endDate.isAfter(startDate) ? endDate : startDate.add(1, 'day'); // Ensure at least one day duration

  const totalDays = effectiveEndDate.diff(startDate, 'day');
  const daysPassed = Math.max(0, today.diff(startDate, 'day')); // Ensure daysPassed is not negative

  // Calculate progress percentage based on time passed relative to the *projected* or target end date
  const progressPercent = totalDays > 0 ? Math.min(100, Math.max(0, (daysPassed / totalDays) * 100)) : 0;

  // Function to calculate x position on timeline
  const getXPosition = (dateString: string | null | undefined): number => {
    if (!dateString || totalDays <= 0) return padding; // Default to start if no date or invalid range
    const targetDate = dayjs(dateString);
    const dayPosition = Math.max(0, targetDate.diff(startDate, 'day')); // Ensure position is not negative
    // Use dynamic containerWidth for calculation
    return padding + Math.min(1, dayPosition / totalDays) * (containerWidth - 2 * padding);
  };

  // Calculate current progress value for display (0-100)
  const currentProgressValue = goal.targetValue > goal.startValue
    ? Math.min(100, Math.max(0, ((goal.currentValue ?? goal.startValue) - goal.startValue) / (goal.targetValue - goal.startValue) * 100))
    : (goal.currentValue ?? goal.startValue) >= goal.targetValue ? 100 : 0;


  return (
    <Card className="w-full max-w-5xl mx-auto shadow-lg rounded-xl mt-6 border-l-4 border-primary">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground">{goal.exerciseName || `Goal: ${goal.targetValue} ${goal.targetUnit}`}</CardTitle>
        <div className="flex flex-wrap justify-between items-start text-sm mt-1">
          <p className="text-muted-foreground">
            Current: <span className="font-semibold text-foreground">{goal.currentValue ?? goal.startValue} {goal.targetUnit}</span> →
            Target: <span className="font-semibold text-foreground">{goal.targetValue} {goal.targetUnit}</span>
          </p>
          <div className="text-right">
            <p className="text-muted-foreground">Started: {formatDate(goal.startDate)}</p>
            <p className="">
              Projected:
              <span className={cn("font-semibold ml-1", getThemeColorClass('text'))}>
                {formatDate(goal.projectedDate)}
              </span>
              {goal.userTargetDate && goal.userTargetDate !== goal.projectedDate && (
                 <span className="text-xs text-muted-foreground ml-1">(Target: {formatDate(goal.userTargetDate)})</span>
              )}
            </p>
            {goal.confidence !== null && goal.confidence !== undefined && (
              <div className="flex items-center justify-end mt-1">
                <span className="text-xs text-muted-foreground mr-1">Confidence:</span>
                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-2 rounded-full", getThemeColorClass('bg'))}
                    style={{ width: `${goal.confidence * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
         {/* Overall Progress Bar */}
         <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{currentProgressValue.toFixed(0)}%</span>
            </div>
            <Progress value={currentProgressValue} className="h-2" />
         </div>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Timeline visualization container */}
        {/* Removed overflow-x-auto */}
        <div ref={containerRef} className="relative pb-16 mt-4 w-full">
          {/* Use dynamic containerWidth in viewBox */}
          <svg width={svgWidth} height={timelineHeight} viewBox={`0 0 ${containerWidth} ${timelineHeight}`} preserveAspectRatio="xMidYMid meet">
            {/* Timeline base line */}
            <line
              x1={padding}
              y1={timelineHeight / 2}
              x2={containerWidth - padding}
              y2={timelineHeight / 2}
              className="stroke-muted" // Use theme variable
              strokeWidth="4"
            />

            {/* Progress line */}
            <line
              x1={padding}
              y1={timelineHeight / 2}
              x2={padding + ((containerWidth - 2 * padding) * progressPercent / 100)}
              y2={timelineHeight / 2}
              className={cn(getThemeColorClass('stroke'))}
              strokeWidth="4"
              // Add animation if desired
            />

            {/* Projected line */}
            <line
              x1={padding + ((containerWidth - 2 * padding) * progressPercent / 100)}
              y1={timelineHeight / 2}
              x2={containerWidth - padding}
              y2={timelineHeight / 2}
              className={cn(getThemeColorClass('stroke'), "opacity-60")}
              strokeWidth="4"
              strokeDasharray="5,5"
              // Add animation if desired
            />

            {/* Confidence area - Optional, can be complex to implement accurately */}
            {/* <rect
              x={padding + ((timelineWidth - 2 * padding) * progressPercent / 100)}
              y={timelineHeight/2 - 20 * (1 - (goal.confidence ?? 0))}
              width={Math.max(0, timelineWidth - padding - (padding + ((timelineWidth - 2 * padding) * progressPercent / 100)))}
              height={40 * (1 - (goal.confidence ?? 0))}
              className={cn(getThemeColorClass('fill'), "opacity-10")} // Very subtle
              rx="4"
            /> */}

            {/* Today marker */}
             <TooltipProvider delayDuration={100}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <g transform={`translate(${getXPosition(today.toISOString())}, ${timelineHeight / 2})`}>
                            <circle
                                cx="0"
                                cy="0"
                                r="8"
                                className="fill-muted-foreground timeline-marker" // Use theme color
                            />
                             <line x1="0" y1="-15" x2="0" y2="15" className="stroke-muted-foreground" strokeWidth="1.5"/>
                        </g>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Today ({formatDate(today.toISOString())})</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>


            {/* Milestone markers */}
            {goal.milestones?.map((milestone, index) => (
              <TooltipProvider key={index} delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <g transform={`translate(${getXPosition(milestone.targetDate)}, ${timelineHeight / 2})`}>
                      <circle
                        cx="0"
                        cy="0"
                        r="10"
                        fill={milestone.achievedDate ? 'hsl(var(--primary))' : 'hsl(var(--background))'}
                        stroke={milestone.achievedDate ? 'hsl(var(--primary))' : 'hsl(var(--primary))'}
                        strokeWidth="2"
                        className={cn("timeline-marker", milestone.achievedDate ? "milestone-achieved" : "")}
                      />
                      {milestone.achievedDate && (
                        <text
                          x="0"
                          y="0"
                          textAnchor="middle"
                          fill="hsl(var(--primary-foreground))" // Contrast color
                          fontSize="10"
                          dy="3.5" // Adjust vertical alignment
                        >✓</text>
                     )}
                      {/* Value label ABOVE marker */}
                      <text
                         x="0"
                         y={-20} // Position ABOVE marker
                         textAnchor="middle"
                         className="fill-foreground font-medium" // Use theme text color
                         fontSize="12"
                       >{milestone.value} {goal.targetUnit}</text>
                      {/* Date label BELOW marker */}
                       <text
                         x="0"
                         y={25} // Position BELOW marker
                         textAnchor="middle"
                         className="fill-muted-foreground" // Use muted text color
                         fontSize="10"
                       >{formatDate(milestone.targetDate)}</text>
                   </g>
                 </TooltipTrigger>
                 <TooltipContent>
                    <p>Milestone: {milestone.value} {goal.targetUnit}</p>
                    <p>Target Date: {formatDate(milestone.targetDate)}</p>
                    {milestone.achievedDate && <p>Achieved: {formatDate(milestone.achievedDate)}</p>}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}

            {/* Target Goal Marker */}
            <TooltipProvider delayDuration={100}>
               <Tooltip>
                 <TooltipTrigger asChild>
                   <g transform={`translate(${getXPosition(effectiveEndDate.toISOString())}, ${timelineHeight / 2})`}>
                     {/* Use a different shape or style for the target marker */}
                     <rect
                       x="-8"
                       y="-8"
                       width="16"
                       height="16"
                       rx="3" // Slightly rounded square
                       fill={'hsl(var(--background))'}
                       stroke={'hsl(var(--primary))'}
                       strokeWidth="2.5"
                       className="timeline-marker"
                     />
                      {/* Value label ABOVE marker */}
                      <text
                         x="0"
                         y={-20} // Position ABOVE marker
                         textAnchor="middle"
                         className="fill-foreground font-semibold" // Make target bold
                         fontSize="12"
                       >{goal.targetValue} {goal.targetUnit}</text>
                      {/* Date label BELOW marker */}
                       <text
                         x="0"
                         y={25} // Position BELOW marker
                         textAnchor="middle"
                         className="fill-muted-foreground"
                         fontSize="10"
                       >{formatDate(effectiveEndDate.toISOString())}</text>
                   </g>
                 </TooltipTrigger>
                 <TooltipContent>
                   <p>Target Goal: {goal.targetValue} {goal.targetUnit}</p>
                   <p>Projected/Target Date: {formatDate(effectiveEndDate.toISOString())}</p>
                 </TooltipContent>
               </Tooltip>
             </TooltipProvider>

          </svg>
        </div>

        {/* Timeline legend */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-[-2rem] mb-6 text-xs text-muted-foreground">
          <div className="flex items-center">
            <div className={cn("w-3 h-3 rounded-full mr-1.5", getThemeColorClass('bg'))}></div>
            <span>Completed Progress</span>
          </div>
          <div className="flex items-center">
            <div className={cn("w-3 h-3 rounded-full mr-1.5 opacity-60", getThemeColorClass('bg'))} style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 4px)' }}></div>
            <span>Projected Progress</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-background border-2 border-primary rounded-full mr-1.5"></div>
            <span>Upcoming Milestone</span>
          </div>
           <div className="flex items-center">
            <div className="w-3 h-3 bg-background border-[2.5px] border-primary rounded-[3px] mr-1.5"></div>
            <span>Target Goal</span>
          </div>
          <div className="flex items-center">
            <div className={cn("w-3 h-3 rounded-full mr-1.5 relative flex items-center justify-center", getThemeColorClass('bg'))}>
              <span className="text-primary-foreground text-[8px] font-bold">✓</span>
            </div>
            <span>Achieved Milestone</span>
          </div>
           <div className="flex items-center">
            <div className="w-3 h-3 bg-muted-foreground rounded-full mr-1.5"></div>
            <span>Today</span>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div className="mt-6 p-4 border border-border rounded-lg bg-muted/50">
            <h3 className="text-md font-semibold text-foreground mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("mr-2", getThemeColorClass('text'))}><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6v6l4 2"/><path d="M12 12h.01"/></svg>
              Training Recommendations
            </h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mt-0.5 mr-2 flex-shrink-0"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoalTimeline;