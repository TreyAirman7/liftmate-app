import regression from 'regression';
import dayjs from 'dayjs';
import type { CompletedWorkout, UserGoal, WorkoutSet, GoalMilestone, ExerciseInWorkout } from './data-manager';

// Type definition for regression data points
type RegressionDataPoint = [number, number]; // [time_in_days, value]

/**
 * Calculates the maximum weight lifted for a specific exercise in a single workout.
 * Considers only the maximum weight from all sets for that exercise.
 * @param exerciseData - The exercise data from a completed workout.
 * @returns The maximum weight lifted for that exercise in the workout, or 0 if no sets.
 */
const getMaxWeightForExercise = (exerciseData: ExerciseInWorkout): number => {
  if (!exerciseData || !exerciseData.sets || exerciseData.sets.length === 0) {
    return 0;
  }
  return Math.max(...exerciseData.sets.map(set => set.weight));
};

/**
 * Prepares data for linear regression based on historical workout performance for a specific exercise goal.
 * Uses the maximum weight lifted per workout session over time.
 * @param goal - The user goal object.
 * @param workouts - Array of all completed workouts.
 * @returns An array of data points [days_since_start, max_weight].
 */
const prepareRegressionData = (goal: UserGoal, workouts: CompletedWorkout[]): RegressionDataPoint[] => {
  if (!goal.exerciseId || !goal.startDate) {
    return [];
  }

  const goalStartDate = dayjs(goal.startDate);
  const relevantWorkouts = workouts
    .filter(workout => dayjs(workout.date).isAfter(goalStartDate.subtract(1, 'day'))) // Include workouts on or after start date
    .sort((a, b) => dayjs(a.date).diff(dayjs(b.date))); // Sort by date ascending

  const dataPoints: RegressionDataPoint[] = [];

  relevantWorkouts.forEach(workout => {
    const exerciseData = workout.exercises.find(ex => ex.exerciseId === goal.exerciseId);
    if (exerciseData) {
      const maxWeight = getMaxWeightForExercise(exerciseData);
      if (maxWeight > 0) {
        const daysSinceStart = dayjs(workout.date).diff(goalStartDate, 'day');
        // Avoid duplicate entries for the same day, keep the latest max weight if multiple workouts on same day
        const existingIndex = dataPoints.findIndex(dp => dp[0] === daysSinceStart);
        if (existingIndex !== -1) {
          if (maxWeight > dataPoints[existingIndex][1]) {
            dataPoints[existingIndex][1] = maxWeight;
          }
        } else {
          dataPoints.push([daysSinceStart, maxWeight]);
        }
      }
    }
  });

  // Ensure the start value is included if not already present from day 0 workout
  if (!dataPoints.some(dp => dp[0] === 0)) {
     dataPoints.unshift([0, goal.startValue]);
  } else {
    // If a workout happened on day 0, make sure the startValue is considered if it's higher
     const dayZeroIndex = dataPoints.findIndex(dp => dp[0] === 0);
     if (goal.startValue > dataPoints[dayZeroIndex][1]) {
        dataPoints[dayZeroIndex][1] = goal.startValue;
     }
  }


  // Sort data points by day just in case
  dataPoints.sort((a, b) => a[0] - b[0]);

  return dataPoints;
};

/**
 * Performs logarithmic regression on the prepared data.
 * Note: Logarithmic regression requires x > 0. We filter out the day 0 point.
 * @param data - Array of data points [[time, value], ...].
 * @returns Regression result object or null if regression cannot be performed.
 */
const performLogRegression = (data: RegressionDataPoint[]) => {
  // Filter out data points where time (days) is 0 or less, as ln(x) requires x > 0
  const logData = data.filter(point => point[0] > 0);

  // Need at least 2 data points for logarithmic regression after filtering
  if (logData.length < 2) {
    console.warn("Not enough data points (x > 0) for logarithmic regression.");
    return null;
  }

  try {
    // Use logarithmic regression: y = a + b * ln(x)
    // result.equation will be [a, b]
    const result = regression.logarithmic(logData);

    // Check if the coefficient 'b' is positive. If not, the model doesn't show progression.
    if (result.equation[1] <= 0) {
      console.warn("Logarithmic regression resulted in non-positive progression (b <= 0).");
      // Return the result but indicate it might not be useful for projection upwards
      // Or return null? Let's return the result for now, projection calculation will handle b <= 0.
    }

    return result; // { equation: [a, b], points: logData, string: 'y = a + b ln(x)', r2: ... }
  } catch (error) {
    console.error("Error performing logarithmic regression:", error);
    return null; // Return null on error
  }
};

/**
 * Calculates the projected completion date for a goal based on logarithmic regression.
 * Formula: y = a + b * ln(x)  =>  x = exp((y - a) / b)
 * @param goal - The user goal object.
 * @param regressionResult - The result from performLogRegression.
 * @returns Projected completion date as ISO string, or null if calculation fails.
 */
export const calculateProjectedDate = (goal: UserGoal, regressionResult: regression.Result | null): string | null => {
  // Ensure we have a valid regression result and the goal start date
  if (!regressionResult || !goal.startDate || !regressionResult.equation || regressionResult.equation.length < 2) {
    return null;
  }

  const a = regressionResult.equation[0]; // Intercept
  const b = regressionResult.equation[1]; // Coefficient for ln(x)

  // If b is zero or negative, the model doesn't predict reaching a higher target value.
  if (b <= 0) {
    // console.log("Projection not possible: Logarithmic coefficient (b) is non-positive.");
    return null;
  }

  // If the target value is already met or exceeded by the model's starting point (intercept 'a'),
  // projection isn't meaningful in the standard sense, or the model might be ill-fitting.
  // However, the regression is based on x > 0, so 'a' isn't exactly the value at day 0.
  // Let's check if the target is higher than the intercept. If not, maybe return null or current date?
  // For now, proceed, but be aware of potential issues if targetValue <= a.
  if (goal.targetValue <= a) {
     console.warn(`Target value (${goal.targetValue}) is not greater than the logarithmic intercept 'a' (${a}). Projection might be inaccurate or immediate.`);
     // Return null as we can't predict time to reach a value already theoretically surpassed by the model's base.
     return null;
  }


  // Calculate the number of days (x) needed to reach the target value (y)
  // y = a + b * ln(x)
  // (y - a) / b = ln(x)
  // x = exp((y - a) / b)
  const daysNeeded = Math.exp((goal.targetValue - a) / b);

  // Check for invalid results (NaN, Infinity, negative days)
  if (!Number.isFinite(daysNeeded) || daysNeeded <= 0) {
      // console.log("Projection calculation resulted in invalid daysNeeded:", daysNeeded);
      return null;
  }

  const projectedDate = dayjs(goal.startDate).add(Math.ceil(daysNeeded), 'day');

  // Optional: Add a cap to prevent extremely distant projections?
  // const maxProjectionYears = 10;
  // if (projectedDate.diff(dayjs(), 'year') > maxProjectionYears) {
  //   return null; // Projection too far in the future
  // }

  return projectedDate.toISOString();
};

/**
 * Calculates the confidence level based on the R-squared value from logarithmic regression.
 * @param regressionResult - The result from performLogRegression.
 * @returns Confidence level (0-1), or null if calculation fails.
 */
export const calculateConfidence = (regressionResult: regression.Result | null): number | null => {
  // Need a valid result with an r2 value
  if (!regressionResult || typeof regressionResult.r2 !== 'number') {
    return null;
  }

   // R-squared (coefficient of determination) indicates how well the logarithmic curve fits the data.
   // Value ranges from 0 to 1.
   const r2 = regressionResult.r2;
   const b = regressionResult.equation[1]; // Coefficient from y = a + b * ln(x)

   // If progression is non-positive (b <= 0), confidence is low, even if r2 is high.
   if (b <= 0) {
       return 0.1; // Assign minimal confidence if the model doesn't show upward trend
   }

   // Simple approach: directly use r2, capped.
   return Math.max(0.1, Math.min(1, r2)); // Use r2 instead of confidence
};

/**
 * Determines the achievement status of milestones based on workout history.
 * @param goal - The user goal object.
 * @param workouts - Array of all completed workouts.
 * @returns Updated array of milestones with achievement dates.
 */
export const updateMilestoneStatus = (goal: UserGoal, workouts: CompletedWorkout[]): GoalMilestone[] => {
    if (!goal.milestones || goal.milestones.length === 0 || !goal.exerciseId) {
        return goal.milestones || [];
    }

    const relevantWorkouts = workouts
        .filter(workout => goal.exerciseId && workout.exercises.some(ex => ex.exerciseId === goal.exerciseId))
        .sort((a, b) => dayjs(a.date).diff(dayjs(b.date))); // Sort by date

    const updatedMilestones = goal.milestones.map(milestone => {
        if (milestone.achievedDate) {
            return milestone; // Already achieved
        }

        let achievementDate: string | null = null;

        for (const workout of relevantWorkouts) {
            const exerciseData = workout.exercises.find(ex => ex.exerciseId === goal.exerciseId);
            if (exerciseData) {
                const maxWeight = getMaxWeightForExercise(exerciseData);
                if (maxWeight >= milestone.value) {
                    // Check if this achievement date is on or before the milestone target date for validity?
                    // For now, just record the first date it was achieved.
                    achievementDate = workout.date;
                    break; // Found the first achievement date
                }
            }
        }

        return {
            ...milestone,
            achievedDate: achievementDate,
        };
    });

    return updatedMilestones;
};


/**
 * Generates simple rule-based training recommendations.
 * @param goal - The user goal object.
 * @param regressionResult - The result from performLogRegression.
 * @param projectedDate - Calculated projected completion date.
 * @returns Array of recommendation strings.
 */
export const generateRecommendations = (
    goal: UserGoal,
    regressionResult: regression.Result | null,
    projectedDate: string | null
): string[] => {
    const recommendations: string[] = [];
    const today = dayjs();
    const goalStartDate = dayjs(goal.startDate);
    const daysPassed = today.diff(goalStartDate, 'day');

    // Basic recommendation if goal is set
    recommendations.push(`Focus on consistent training for your ${goal.exerciseName || 'goal'}.`);

    if (regressionResult && regressionResult.equation.length >= 2) {
        const a = regressionResult.equation[0]; // Intercept
        const b = regressionResult.equation[1]; // Coefficient

        // Logarithmic model implies diminishing returns. Recommendations might differ.
        if (b > 0) {
             // Calculate instantaneous rate of change at the latest data point? More complex.
             // Simpler: Check if projection exists.
             if (projectedDate) {
                 const projected = dayjs(projectedDate);
                 const daysRemaining = projected.diff(today, 'day');

                 if (goal.userTargetDate) {
                     const userTarget = dayjs(goal.userTargetDate);
                     if (projected.isAfter(userTarget)) {
                         recommendations.push("Projection exceeds target date. Increase intensity/frequency or adjust target date.");
                     } else {
                         recommendations.push("You're on track to meet your target date based on the current curve!");
                     }
                 } else if (daysRemaining > 0) {
                      // Provide estimated timeframe, acknowledging it's based on a curve
                      recommendations.push(`Projected completion in ~${daysRemaining} days, assuming current progression curve continues.`);
                 }
             } else {
                  // Projection failed even with b > 0 (e.g., target <= a or calculation issue)
                  recommendations.push("Could not calculate a projected date based on the current trend.");
             }

        } else if (daysPassed > 14) { // Only recommend if enough time has passed and b <= 0
             recommendations.push("Progression seems stalled or negative. Review training plan, nutrition, or recovery.");
        }

        // Add recommendation based on R^2 value (confidence)
        const confidence = calculateConfidence(regressionResult);
        if (confidence !== null) {
            if (confidence < 0.5 && daysPassed > 14) {
                 recommendations.push("Progress is inconsistent. Focus on sticking to your plan regularly.");
            } else if (confidence > 0.8) {
                 recommendations.push("Your progress is quite consistent!");
            }
        }
    } else if (daysPassed > 7) {
        recommendations.push("Not enough data for detailed recommendations yet. Keep logging your workouts!");
    }

    // Generic recommendations
    if (goal.goalType === 'exercise') {
        recommendations.push("Ensure proper form to maximize gains and prevent injury.");
        recommendations.push("Consider accessory exercises to support your main lifts.");
    }
    if (goal.goalType === 'weight') {
         recommendations.push("Monitor your nutrition and caloric intake closely.");
    }

    // Limit to 3-4 recommendations
    return recommendations.slice(0, 4);
};


// Main function to process goal data and return calculated values
export const processGoalTimelineData = (goal: UserGoal, allWorkouts: CompletedWorkout[]) => {
    const regressionData = prepareRegressionData(goal, allWorkouts);
    // Use logarithmic regression
    const regressionResult = performLogRegression(regressionData);
    const projectedDate = calculateProjectedDate(goal, regressionResult);
    const confidence = calculateConfidence(regressionResult);

    // --- Milestone auto-population logic ---
    // Clone milestones to avoid mutating original
    let milestones: GoalMilestone[] = Array.isArray(goal.milestones) ? [...goal.milestones] : [];

    // Always ensure a start milestone exists
    const startMilestoneExists = milestones.some(m => m.value === goal.startValue);
    if (!startMilestoneExists) {
        milestones.unshift({
            value: goal.startValue,
            targetDate: goal.startDate,
            achievedDate: goal.startDate,
        });
    }

    // Always ensure a target milestone exists
    const targetMilestoneExists = milestones.some(m => m.value === goal.targetValue);
    if (!targetMilestoneExists) {
        // Use userTargetDate, projectedDate, or fallback to 6 months after start
        let targetDate = goal.userTargetDate || projectedDate || dayjs(goal.startDate).add(6, 'month').toISOString();
        milestones.push({
            value: goal.targetValue,
            targetDate,
            achievedDate: null,
        });
    }

    // Optionally, add intermediate milestones (25%, 50%, 75%)
    const intermediatePercents = [0.25, 0.5, 0.75];
    intermediatePercents.forEach(percent => {
        const value = goal.startValue + (goal.targetValue - goal.startValue) * percent;
        // Only add if not already present and value is not equal to start/target
        if (
            !milestones.some(m => Math.abs(m.value - value) < 1e-6) &&
            value !== goal.startValue &&
            value !== goal.targetValue
        ) {
            // Estimate date for intermediate milestone
            let date: string;
            if (goal.startDate && (goal.userTargetDate || projectedDate)) {
                const start = dayjs(goal.startDate);
                const end = dayjs(goal.userTargetDate || projectedDate || start.add(6, 'month'));
                const days = end.diff(start, 'day');
                date = start.add(Math.round(days * percent), 'day').toISOString();
            } else {
                date = dayjs(goal.startDate).add(Math.round(180 * percent), 'day').toISOString();
            }
            milestones.push({
                value: Math.round(value * 100) / 100, // round to 2 decimals
                targetDate: date,
                achievedDate: null,
            });
        }
    });

    // Sort milestones by value ascending
    milestones.sort((a, b) => a.value - b.value);

    // Update milestone achievement status
    const updatedMilestones = updateMilestoneStatus(
        { ...goal, milestones }, // pass in the enriched milestones
        allWorkouts
    );

    const recommendations = generateRecommendations(goal, regressionResult, projectedDate);

    // Find current value based on the latest workout achieving the highest weight/reps etc.
    // This might need refinement depending on goal type. For exercise weight:
    let currentValue = goal.startValue;
    if (goal.goalType === 'exercise' && goal.exerciseId) {
         const relevantWorkouts = allWorkouts
            .filter(w => dayjs(w.date).isAfter(dayjs(goal.startDate).subtract(1, 'day')) && w.exercises.some(ex => ex.exerciseId === goal.exerciseId))
            .sort((a, b) => dayjs(b.date).diff(dayjs(a.date))); // Sort descending by date

        for (const workout of relevantWorkouts) {
             const exerciseData = workout.exercises.find(ex => ex.exerciseId === goal.exerciseId);
             if (exerciseData) {
                 currentValue = Math.max(currentValue, getMaxWeightForExercise(exerciseData));
             }
        }
         // Ensure current value doesn't exceed target
         currentValue = Math.min(currentValue, goal.targetValue);

    } else {
        // Placeholder for other goal types (weight, visits) - needs specific logic
        // For now, use the potentially updated goal.currentValue if available, else startValue
        currentValue = goal.currentValue ?? goal.startValue;
    }

    return {
        processedGoal: {
            ...goal,
            currentValue: currentValue, // Update current value based on calculation
            projectedDate,
            confidence,
            milestones: updatedMilestones,
            completed: currentValue >= goal.targetValue, // Mark completed if current meets target
        },
        recommendations,
    };
};