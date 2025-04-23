"use client"

import { useState, useEffect, useMemo } from "react"
import { Target, Plus, Check, Dumbbell, Weight, Calendar, Trash2, TrendingUp, Info } from "lucide-react"
import { useWorkouts } from "@/lib/workout-context" // Import the context hook
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import DataManager, { UserGoal, CompletedWorkout, Exercise, GoalUnit } from "@/lib/data-manager"
import { processGoalTimelineData } from "@/lib/goal-calculations"
import GoalTimeline from "@/components/goal-timeline" // Import the new component
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"


// Define available units based on GoalUnit type
const goalUnits: GoalUnit[] = ['kg', 'lbs', 'reps', 'visits', 'minutes'];

export default function GoalsTab() {
  const { workouts: allWorkouts } = useWorkouts(); // Get workouts from context
  const [userGoals, setUserGoals] = useState<UserGoal[]>([])
  // Removed local allWorkouts state
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([])

  // State for the "Add Goal" dialog form
  const [newGoalType, setNewGoalType] = useState<UserGoal['goalType'] | ''>('')
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("")
  const [targetValue, setTargetValue] = useState<string>("")
  const [startValue, setStartValue] = useState<string>("")
  const [targetUnit, setTargetUnit] = useState<GoalUnit | ''>('')
  const [userTargetDate, setUserTargetDate] = useState<string>("") // Optional target date

  const [isAddGoalDialogOpen, setIsAddGoalDialogOpen] = useState(false)

  // Fetch non-workout data on component mount
  useEffect(() => {
    // Initialize storage (safe to call multiple times)
    DataManager.initializeStorage();
    setUserGoals(DataManager.getGoals())
    setAvailableExercises(DataManager.getExercises())
    // No longer need to fetch allWorkouts here, it comes from context
  }, [])

  // Process goals with calculations using useMemo for efficiency
  // Dependency array now includes allWorkouts from context
  const processedGoalsData = useMemo(() => {
    return userGoals.map(goal => processGoalTimelineData(goal, allWorkouts));
  }, [userGoals, allWorkouts]);

  const activeGoalsData = processedGoalsData.filter(data => !data.processedGoal.completed);
  const completedGoalsData = processedGoalsData.filter(data => data.processedGoal.completed);


  const handleDeleteGoal = (id: string) => {
    DataManager.deleteGoal(id)
    setUserGoals(DataManager.getGoals()) // Re-fetch goals to update state
  }

  const handleAddGoal = () => {
    // Validation
    if (!newGoalType || !targetValue || !startValue || !targetUnit) return;
    if (newGoalType === 'exercise' && !selectedExerciseId) return;

    const selectedExercise = availableExercises.find(ex => ex.id === selectedExerciseId);

    const newGoal: UserGoal = {
      id: DataManager.generateId(),
      goalType: newGoalType,
      exerciseId: newGoalType === 'exercise' ? selectedExerciseId : null,
      exerciseName: newGoalType === 'exercise' ? selectedExercise?.name : null,
      targetValue: Number(targetValue),
      targetUnit: targetUnit,
      startValue: Number(startValue),
      startDate: new Date().toISOString(), // Set start date to now
      userTargetDate: userTargetDate || null, // Optional user target date
      // Calculated fields will be populated by processGoalTimelineData
      currentValue: Number(startValue), // Initialize current value with start value
      completed: false, // Initialize as not completed
      // Automatically add starting milestone
      milestones: [
        {
          value: Number(startValue),
          targetDate: new Date().toISOString(), // Use current date as target for start milestone
          achievedDate: new Date().toISOString(), // Mark start as achieved immediately
        }
        // We could add the target milestone here if userTargetDate is set,
        // but let's keep it simple and let the timeline visualization handle the end point.
        // { value: Number(targetValue), targetDate: userTargetDate || projectedDate || calculatedEndDate }
      ],
    };

    DataManager.saveGoal(newGoal);
    setUserGoals(DataManager.getGoals()); // Re-fetch goals

    // Reset form state and close dialog
    setNewGoalType('');
    setSelectedExerciseId('');
    setTargetValue('');
    setStartValue('');
    setTargetUnit('');
    setUserTargetDate('');
    setIsAddGoalDialogOpen(false);
  };

  // Helper to get exercise name from ID
  const getExerciseName = (id: string | null | undefined): string => {
      if (!id) return "N/A";
      return availableExercises.find(ex => ex.id === id)?.name || "Unknown Exercise";
  }

  return (
    // Increased padding-bottom to avoid overlap with bottom nav
    <div className="flex flex-col items-center p-4 space-y-6 pb-24">
      {/* Goals Header */}
      <div className="flex flex-col items-center space-y-2 w-full">
        <Target className="h-10 w-10" />
        <h2 className="text-2xl font-bold">Goals</h2>
      </div>

      {/* Changed max-w-md to max-w-3xl to accommodate wider timeline */}
      <div className="w-full max-w-3xl space-y-6">
        {/* Add Goal Button & Dialog */}
        <Dialog open={isAddGoalDialogOpen} onOpenChange={setIsAddGoalDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Add New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            {/* Added max-h and overflow-y-auto for scrolling */}
            <div className="grid gap-4 py-4 max-h-[65vh] overflow-y-auto pr-6">
              {/* Goal Type Selection */}
              <div className="space-y-2">
                <Label>Goal Type</Label>
                <RadioGroup value={newGoalType} onValueChange={(value) => setNewGoalType(value as UserGoal['goalType'])} className="grid grid-cols-2 gap-2">
                   {/* Simplified Radio Options */}
                   {(['exercise', 'weight', 'visits', 'duration'] as UserGoal['goalType'][]).map((type) => (
                     <Label key={type} htmlFor={`goal-${type}`} className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer [&:has(:checked)]:bg-muted [&:has(:checked)]:border-primary">
                       <RadioGroupItem id={`goal-${type}`} value={type} />
                       <span className="flex items-center capitalize">
                         {type === 'exercise' && <Dumbbell className="h-4 w-4 mr-1.5" />}
                         {type === 'weight' && <Weight className="h-4 w-4 mr-1.5" />}
                         {type === 'visits' && <Calendar className="h-4 w-4 mr-1.5" />}
                         {type === 'duration' && <TrendingUp className="h-4 w-4 mr-1.5" />} {/* Example icon */}
                         {type}
                       </span>
                     </Label>
                   ))}
                 </RadioGroup>
              </div>

              {/* Exercise Selection (Conditional) */}
              {newGoalType === "exercise" && (
                <div className="space-y-2">
                  <Label htmlFor="exercise">Exercise</Label>
                  <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
                    <SelectTrigger id="exercise">
                      <SelectValue placeholder="Select Exercise" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableExercises.map(ex => (
                        <SelectItem key={ex.id} value={ex.id}>{ex.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Start Value Input */}
              <div className="space-y-2">
                <Label htmlFor="startValue">Starting Value</Label>
                <Input
                  id="startValue"
                  type="number"
                  placeholder="e.g., 185 or 10"
                  value={startValue}
                  onChange={(e) => setStartValue(e.target.value)}
                  required
                />
              </div>

              {/* Target Value Input */}
              <div className="space-y-2">
                <Label htmlFor="targetValue">Target Value</Label>
                <Input
                  id="targetValue"
                  type="number"
                  placeholder="e.g., 225 or 5"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  required
                />
              </div>

              {/* Target Unit Selection */}
              <div className="space-y-2">
                <Label htmlFor="targetUnit">Unit</Label>
                <Select value={targetUnit} onValueChange={(value) => setTargetUnit(value as GoalUnit)}>
                  <SelectTrigger id="targetUnit">
                    <SelectValue placeholder="Select Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {goalUnits.map(unit => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

               {/* Optional Target Date */}
               <div className="space-y-2">
                 <Label htmlFor="userTargetDate">Optional Target Date</Label>
                 <Input
                   id="userTargetDate"
                   type="date"
                   value={userTargetDate}
                   onChange={(e) => setUserTargetDate(e.target.value)}
                 />
               </div>

            </div>
            <DialogFooter>
              <DialogClose asChild>
                 <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                onClick={handleAddGoal}
                disabled={!newGoalType || !targetValue || !startValue || !targetUnit || (newGoalType === "exercise" && !selectedExerciseId)}
              >
                Save Goal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Active Goals Section */}
        {activeGoalsData.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center"><TrendingUp className="mr-2 h-5 w-5 text-primary"/>Active Goals</h3>
            {activeGoalsData.map(({ processedGoal, recommendations }) => (
              <div key={processedGoal.id} className="space-y-4">
                 {/* Render GoalTimeline component */}
                 <GoalTimeline goal={processedGoal} recommendations={recommendations} />
              </div>
            ))}
          </div>
        )}

         {/* Separator */}
         {activeGoalsData.length > 0 && completedGoalsData.length > 0 && (
             <hr className="my-6 border-border" />
         )}

        {/* Completed Goals Section */}
        {completedGoalsData.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center"><Check className="mr-2 h-5 w-5 text-green-500"/>Completed Goals</h3>
            {completedGoalsData.map(({ processedGoal }) => (
              <Card key={processedGoal.id} className="overflow-hidden border-l-4 border-green-500 bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{processedGoal.exerciseName || `Goal: ${processedGoal.targetValue} ${processedGoal.targetUnit}`}</h4>
                      <p className="text-sm text-muted-foreground capitalize">{processedGoal.goalType} Goal</p>
                       <p className="text-xs text-muted-foreground mt-1">
                           Completed on: {processedGoal.milestones?.find(m => m.value >= processedGoal.targetValue && m.achievedDate)
                               ? new Date(processedGoal.milestones.find(m => m.value >= processedGoal.targetValue && m.achievedDate)!.achievedDate!).toLocaleDateString()
                               : 'N/A'}
                       </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                         <p className="font-bold text-green-600">
                           {processedGoal.targetValue} {processedGoal.targetUnit}
                         </p>
                         <p className="text-xs text-muted-foreground">Achieved!</p>
                      </div>
                      <div className="h-7 w-7 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                              onClick={() => handleDeleteGoal(processedGoal.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete goal</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete Goal</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

         {/* Placeholder if no goals */}
         {userGoals.length === 0 && (
             <Card className="mt-6 border-dashed border-border">
                 <CardContent className="p-6 text-center text-muted-foreground">
                     <Target className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                     <p>No goals set yet.</p>
                     <p>Click "Add New Goal" to get started!</p>
                 </CardContent>
             </Card>
         )}
      </div>
    </div>
  );
}

