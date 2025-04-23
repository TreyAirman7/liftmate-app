import regression from 'regression';
import dayjs from 'dayjs';
import type { CompletedWorkout, ExerciseInWorkout, WorkoutSet } from './data-manager';

// Type definitions for performance prediction
export interface PerformancePrediction {
  currentOneRepMax: number;
  predictedOneRepMax: number;
  predictedDate: string | null;
  confidence: number;
  repRangePredictions: RepRangePrediction[];
  insights: string[];
  metadata: PredictionMetadata;
}

export interface RepRangePrediction {
  repRange: string;
  currentMax: number;
  predictedMax: number;
  estimatedAchievement: string | null;
  progressPercentage: number;
}

export interface PredictionMetadata {
  workoutCount: number;
  frequency: number;
  lastUpdated: string;
  modelType: string;
}

// Type definition for regression data points
type RegressionDataPoint = [number, number]; // [time_in_days, value]

/**
 * Calculates the maximum weight lifted for a specific exercise in a single workout.
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
 * Calculates the one-rep max using the Brzycki formula.
 * @param weight - The weight lifted.
 * @param reps - The number of reps performed.
 * @returns The estimated one-rep max.
 */
export const calculateOneRepMax = (weight: number, reps: number): number => {
  // Skip sets with very high reps (approaching 37) to avoid division by zero
  if (reps >= 36) return weight;
  
  // Calculate 1RM using Brzycki formula: weight × 36/(37-reps)
  return (weight * 36) / (37 - reps);
};

/**
 * Finds the best set for calculating one-rep max from a workout.
 * @param exerciseData - The exercise data from a completed workout.
 * @returns The best set and calculated one-rep max.
 */
export const findBestOneRepMaxSet = (exerciseData: ExerciseInWorkout): { weight: number; reps: number; oneRepMax: number } => {
  if (!exerciseData || !exerciseData.sets || exerciseData.sets.length === 0) {
    return { weight: 0, reps: 0, oneRepMax: 0 };
  }

  let highestOneRepMax = 0;
  let bestSet = { weight: 0, reps: 0 };

  exerciseData.sets.forEach((set) => {
    if (set.reps >= 36) return; // Skip sets with very high reps

    const oneRepMax = calculateOneRepMax(set.weight, set.reps);

    if (oneRepMax > highestOneRepMax) {
      highestOneRepMax = oneRepMax;
      bestSet = { weight: set.weight, reps: set.reps };
    }
  });

  return {
    weight: bestSet.weight,
    reps: bestSet.reps,
    oneRepMax: Math.round(highestOneRepMax)
  };
};

/**
 * Prepares data for regression analysis based on historical workout performance.
 * @param exerciseId - The ID of the exercise to analyze.
 * @param workouts - Array of all completed workouts.
 * @param timeframeMonths - Number of months to look back, or null for all time.
 * @returns An array of data points [days_since_first_workout, one_rep_max].
 */
/**
 * Prepares data for regression analysis based on historical workout performance.
 * Filters out future-dated workouts to prevent corrupting the trend.
 * @param exerciseId - The ID of the exercise to analyze.
 * @param workouts - Array of all completed workouts.
 * @param timeframeMonths - Number of months to look back, or null for all time.
 * @returns An array of data points [days_since_first_workout, one_rep_max].
 */
export const prepareRegressionData = (
  exerciseId: string,
  workouts: CompletedWorkout[],
  timeframeMonths: number | null = null
): RegressionDataPoint[] => {
  if (!exerciseId || workouts.length === 0) {
    return [];
  }

  // Filter out future-dated workouts (date after today)
  const today = dayjs().endOf('day');
  let filteredWorkouts = workouts.filter(w => dayjs(w.date).isBefore(today) || dayjs(w.date).isSame(today));

  // Filter workouts by timeframe if specified
  if (timeframeMonths !== null) {
    const cutoffDate = dayjs().subtract(timeframeMonths, 'month');
    filteredWorkouts = filteredWorkouts.filter(w => dayjs(w.date).isAfter(cutoffDate));
  }

  // Filter workouts that contain the specified exercise
  const relevantWorkouts = filteredWorkouts
    .filter(workout => workout.exercises.some(ex => ex.exerciseId === exerciseId))
    .sort((a, b) => dayjs(a.date).diff(dayjs(b.date))); // Sort by date ascending

  if (relevantWorkouts.length === 0) {
    return [];
  }

  // Get the first workout date as reference point
  const firstWorkoutDate = dayjs(relevantWorkouts[0].date);
  
  const dataPoints: RegressionDataPoint[] = [];

  relevantWorkouts.forEach(workout => {
    const exerciseData = workout.exercises.find(ex => ex.exerciseId === exerciseId);
    if (exerciseData) {
      const { oneRepMax } = findBestOneRepMaxSet(exerciseData);
      if (oneRepMax > 0) {
        const daysSinceFirst = dayjs(workout.date).diff(firstWorkoutDate, 'day');
        
        // Avoid duplicate entries for the same day, keep the highest 1RM
        const existingIndex = dataPoints.findIndex(dp => dp[0] === daysSinceFirst);
        if (existingIndex !== -1) {
          if (oneRepMax > dataPoints[existingIndex][1]) {
            dataPoints[existingIndex][1] = oneRepMax;
          }
        } else {
          dataPoints.push([daysSinceFirst, oneRepMax]);
        }
      }
    }
  });

  // Sort data points by day just in case
  dataPoints.sort((a, b) => a[0] - b[0]);

  return dataPoints;
};

/**
 * Performs linear regression on the prepared data.
 * @param data - Array of data points [[time, value], ...].
 * @returns Regression result object or null if regression cannot be performed.
 */
export const performLinearRegression = (data: RegressionDataPoint[]) => {
  // Need at least 2 data points for regression
  if (data.length < 2) {
    return null;
  }

  try {
    // Use linear regression: y = mx + b
    const result = regression.linear(data);
    return result;
  } catch (error) {
    console.error("Error performing linear regression:", error);
    return null;
  }
};

/**
 * Calculates the projected date to reach a target weight.
 * @param currentOneRepMax - Current one-rep max.
 * @param regressionResult - The result from performLinearRegression.
 * @param targetIncrease - Target increase percentage (0.1 = 10%).
 * @returns Projected completion date as ISO string, or null if calculation fails.
 */
export const calculateProjectedDate = (
  currentOneRepMax: number,
  regressionResult: regression.Result | null,
  targetIncrease: number = 0.1
): string | null => {
  // Ensure we have a valid regression result
  if (!regressionResult || !regressionResult.equation || regressionResult.equation.length < 2) {
    return null;
  }

  const [b, m] = regressionResult.equation; // y = mx + b
  
  // If slope is zero or negative, no projection is possible
  if (m <= 0) {
    return null;
  }

  const targetValue = currentOneRepMax * (1 + targetIncrease);
  
  // Calculate days needed to reach target: (targetValue - b) / m
  const daysNeeded = (targetValue - b) / m;
  
  // Check for invalid results
  if (!Number.isFinite(daysNeeded) || daysNeeded <= 0) {
    return null;
  }

  // Calculate the projected date
  const projectedDate = dayjs().add(Math.ceil(daysNeeded), 'day');
  return projectedDate.toISOString();
};

/**
 * Calculates the confidence level based on the R-squared value and data points.
 * @param regressionResult - The result from performLinearRegression.
 * @param dataPoints - Number of data points used in regression.
 * @returns Confidence level (0-1), or null if calculation fails.
 */
/**
 * Calculates the confidence level for the performance prediction.
 * Confidence is reduced by poor model fit (low R²), high variance (residuals), low data volume, and projecting far beyond the last data point.
 * @param regressionResult - The result from performLinearRegression.
 * @param dataPoints - Number of data points used in regression.
 * @param regressionData - The actual regression data points [[x, y], ...].
 * @param projectionHorizon - Number of days into the future being projected (default 180).
 * @returns Confidence level (0-1), or null if calculation fails.
 */
export const calculateConfidence = (
  regressionResult: regression.Result | null,
  dataPoints: number,
  regressionData?: [number, number][],
  projectionHorizon: number = 180
): number | null => {
  // Need a valid result with an r2 value
  if (!regressionResult || typeof regressionResult.r2 !== 'number' || !regressionData || regressionData.length < 2) {
    return null;
  }

  const r2 = regressionResult.r2;
  const m = regressionResult.equation[1]; // Slope from y = mx + b

  // If progression is non-positive (m <= 0), confidence is very low
  if (m <= 0) {
    return 0.05;
  }

  // --- Data volume penalty ---
  // Strong penalty for very low data points, moderate for low
  let dataPointFactor = 1;
  if (dataPoints < 3) {
    dataPointFactor = 0.3;
  } else if (dataPoints < 5) {
    dataPointFactor = 0.5;
  } else if (dataPoints < 10) {
    dataPointFactor = 0.8;
  }

  // --- Residuals penalty (variance/noise) ---
  // Calculate standard deviation of residuals (actual - predicted)
  const residuals = regressionData.map(([x, y]) => {
    const yPred = regressionResult.predict(x)[1];
    return y - yPred;
  });
  const meanResidual = residuals.reduce((sum, r) => sum + r, 0) / residuals.length;
  const stdResidual = Math.sqrt(residuals.reduce((sum, r) => sum + Math.pow(r - meanResidual, 2), 0) / residuals.length);

  // Normalize residual penalty by mean of y values
  const meanY = regressionData.reduce((sum, [, y]) => sum + y, 0) / regressionData.length;
  // If meanY is 0, set penalty to max
  let residualPenalty = 1;
  if (meanY > 0) {
    // If stddev is >20% of mean, strong penalty; if <5%, minimal penalty
    const ratio = stdResidual / meanY;
    if (ratio > 0.5) {
      residualPenalty = 0.3;
    } else if (ratio > 0.2) {
      residualPenalty = 0.6;
    } else if (ratio > 0.1) {
      residualPenalty = 0.8;
    } else {
      residualPenalty = 1;
    }
  } else {
    residualPenalty = 0.3;
  }

  // --- Projection distance penalty ---
  // If projecting far beyond last data point, reduce confidence
  const lastX = regressionData[regressionData.length - 1][0];
  let projectionPenalty = 1;
  if (projectionHorizon > lastX + 60) { // If projecting >60 days beyond last data
    projectionPenalty = 0.7;
  }
  if (projectionHorizon > lastX + 120) { // If projecting >120 days beyond last data
    projectionPenalty = 0.5;
  }

  // --- Combine all factors ---
  // Confidence is product of R², data, residual, and projection penalties
  let confidence = r2 * dataPointFactor * residualPenalty * projectionPenalty;

  // Cap confidence between 0.05 and 0.98, never allow 1 unless mathematically perfect
  confidence = Math.max(0.05, Math.min(0.98, confidence));

  // If R² is mathematically perfect, residuals are zero, and data is high, allow 0.99
  if (r2 === 1 && stdResidual === 0 && dataPoints >= 10) {
    confidence = 0.99;
  }

  return confidence;
};

/**
 * Generates rep range predictions based on current and projected one-rep max.
 * @param currentOneRepMax - Current one-rep max.
 * @param predictedOneRepMax - Predicted one-rep max.
 * @param projectedDate - Projected date to reach the predicted one-rep max.
 * @returns Array of rep range predictions.
 */
export const generateRepRangePredictions = (
  currentOneRepMax: number,
  predictedOneRepMax: number,
  projectedDate: string | null
): RepRangePrediction[] => {
  // Common rep ranges for strength training
  const repRanges = [
    { range: "1RM", factor: 1.0 },
    { range: "3RM", factor: 0.94 },
    { range: "5RM", factor: 0.89 },
    { range: "10RM", factor: 0.75 }
  ];

  // Calculate days until projected date
  let daysUntilProjection = 90; // Default to 90 days if no projection
  if (projectedDate) {
    daysUntilProjection = Math.max(1, dayjs(projectedDate).diff(dayjs(), 'day'));
  }

  return repRanges.map(({ range, factor }) => {
    const currentMax = Math.round(currentOneRepMax * factor);
    const predictedMax = Math.round(predictedOneRepMax * factor);
    
    // Calculate estimated achievement date (earlier for higher rep ranges)
    let estimatedAchievement: string | null = null;
    if (projectedDate) {
      // Higher rep ranges are achieved sooner
      const adjustedDays = Math.round(daysUntilProjection * (range === "1RM" ? 1 : 
                                                            range === "3RM" ? 0.85 : 
                                                            range === "5RM" ? 0.7 : 0.55));
      estimatedAchievement = dayjs().add(adjustedDays, 'day').toISOString();
    }
    
    // Calculate progress percentage (how close to predicted max)
    const progressPercentage = Math.min(100, Math.round(((currentMax - (currentOneRepMax * factor)) / 
                                                       ((predictedMax - (currentOneRepMax * factor)) || 1)) * 100));
    
    return {
      repRange: range,
      currentMax,
      predictedMax,
      estimatedAchievement,
      progressPercentage: Math.max(0, progressPercentage) // Ensure non-negative
    };
  });
};

/**
 * Generates insights based on performance data and predictions.
 * @param exerciseName - Name of the exercise.
 * @param currentOneRepMax - Current one-rep max.
 * @param predictedOneRepMax - Predicted one-rep max.
 * @param regressionResult - The result from performLinearRegression.
 * @param workouts - Array of relevant workouts.
 * @returns Array of insight strings.
 */
export const generateInsights = (
  exerciseName: string,
  currentOneRepMax: number,
  predictedOneRepMax: number,
  regressionResult: regression.Result | null,
  workouts: CompletedWorkout[]
): string[] => {
  const insights: string[] = [];
  
  // Calculate monthly growth rate if regression result exists
  if (regressionResult && regressionResult.equation[1] > 0) {
    const slope = regressionResult.equation[1]; // Weight increase per day
    const monthlyGrowth = (slope * 30 / currentOneRepMax) * 100; // Convert to percentage
    
    if (monthlyGrowth > 0) {
      insights.push(
        `Your ${exerciseName} strength is increasing at an average rate of ${monthlyGrowth.toFixed(1)}% per month.`
      );
    }
  }
  
  // Add insight about predicted growth
  if (predictedOneRepMax > currentOneRepMax) {
    const increase = predictedOneRepMax - currentOneRepMax;
    insights.push(
      `You're on track to add ${increase} lbs to your ${exerciseName} one-rep max in the coming months.`
    );
  }
  
  // Add training recommendation based on workout history
  const workoutFrequency = workouts.length > 0 ? 
    Math.min(7, Math.round((workouts.length / Math.max(1, dayjs().diff(dayjs(workouts[workouts.length - 1].date), 'week'))))) : 0;
  
  if (workoutFrequency < 2) {
    insights.push(
      `Consider increasing your training frequency to accelerate strength gains.`
    );
  } else if (currentOneRepMax > 0) {
    insights.push(
      `Consider adding more volume in the 70-80% of 1RM range (${Math.round(currentOneRepMax * 0.7)}-${Math.round(currentOneRepMax * 0.8)} lbs) to potentially accelerate your strength gains.`
    );
  }
  
  return insights;
};

/**
 * Calculates prediction metadata.
 * @param workouts - Array of relevant workouts.
 * @returns Prediction metadata.
 */
export const calculateMetadata = (workouts: CompletedWorkout[]): PredictionMetadata => {
  const workoutCount = workouts.length;
  
  // Calculate average workout frequency (workouts per week)
  let frequency = 0;
  if (workoutCount >= 2) {
    const firstDate = dayjs(workouts[0].date);
    const lastDate = dayjs(workouts[workoutCount - 1].date);
    const weeksDiff = Math.max(1, lastDate.diff(firstDate, 'week'));
    frequency = parseFloat((workoutCount / weeksDiff).toFixed(1));
  }
  
  return {
    workoutCount,
    frequency,
    lastUpdated: dayjs().toISOString(),
    modelType: "Linear progression with confidence adjustment"
  };
};

/**
 * Main function to generate performance predictions for an exercise.
 * @param exerciseId - ID of the exercise to analyze.
 * @param exerciseName - Name of the exercise.
 * @param workouts - Array of all completed workouts.
 * @param timeframeMonths - Number of months to look back, or null for all time.
 * @returns Performance prediction data or null if insufficient data.
 */
/**
 * Main function to generate performance predictions for an exercise.
 * Filters out future-dated workouts and uses a limiting returns model for projection.
 * Ensures the projection/trend line covers at least 6 months into the future.
 */
export const generatePerformancePrediction = (
  exerciseId: string,
  exerciseName: string,
  workouts: CompletedWorkout[],
  timeframeMonths: number | null = null
): PerformancePrediction | null => {
  // Filter out future-dated workouts (date after today)
  const today = dayjs().endOf('day');
  let filteredWorkouts = workouts.filter(w => dayjs(w.date).isBefore(today) || dayjs(w.date).isSame(today));

  // Filter workouts by timeframe if specified
  if (timeframeMonths !== null) {
    const cutoffDate = dayjs().subtract(timeframeMonths, 'month');
    filteredWorkouts = filteredWorkouts.filter(w => dayjs(w.date).isAfter(cutoffDate));
  }

  // Filter workouts that contain the specified exercise
  const relevantWorkouts = filteredWorkouts
    .filter(workout => workout.exercises.some(ex => ex.exerciseId === exerciseId))
    .sort((a, b) => dayjs(a.date).diff(dayjs(b.date))); // Sort by date ascending

  if (relevantWorkouts.length === 0) {
    return null; // No relevant workouts found
  }

  // Prepare regression data
  const regressionData = prepareRegressionData(exerciseId, filteredWorkouts, timeframeMonths);
  
  if (regressionData.length < 2) {
    // Not enough data points for regression
    // Return basic prediction with current 1RM but no projections
    const latestWorkout = relevantWorkouts[relevantWorkouts.length - 1];
    const exerciseData = latestWorkout.exercises.find(ex => ex.exerciseId === exerciseId);
    
    if (!exerciseData) return null;
    
    const { oneRepMax } = findBestOneRepMaxSet(exerciseData);
    
    if (oneRepMax <= 0) return null;
    
    return {
      currentOneRepMax: oneRepMax,
      predictedOneRepMax: oneRepMax,
      predictedDate: null,
      confidence: 0,
      repRangePredictions: generateRepRangePredictions(oneRepMax, oneRepMax, null),
      insights: ["Not enough workout history to generate predictions yet. Keep logging your workouts!"],
      metadata: calculateMetadata(relevantWorkouts)
    };
  }

  // Perform linear regression
  const regressionResult = performLinearRegression(regressionData);
  
  // Get current 1RM from the latest workout
  const latestWorkout = relevantWorkouts[relevantWorkouts.length - 1];
  const exerciseData = latestWorkout.exercises.find(ex => ex.exerciseId === exerciseId);
  
  if (!exerciseData) return null;
  
  const { oneRepMax: currentOneRepMax } = findBestOneRepMaxSet(exerciseData);
  
  if (currentOneRepMax <= 0) return null;

  // Limiting returns model: Use a logistic (sigmoid) curve for projection
  // y = L / (1 + exp(-k*(x-x0))) + b
  // We'll estimate L (max possible gain), k (rate), x0 (inflection), b (current 1RM baseline)
  // For simplicity, set L = 0.25 * currentOneRepMax (max 25% gain in 6 months), k = 0.03, x0 = 90 days (inflection at 3 months), b = currentOneRepMax

  const L = currentOneRepMax * 0.25;
  const k = 0.03;
  const x0 = 90;
  const b = currentOneRepMax;

  // Project at least 6 months (180 days) into the future
  const projectionDays = 180;

  // Calculate predicted 1RM at 6 months using the limiting returns model
  const predictedOneRepMax = Math.round(
    L / (1 + Math.exp(-k * (projectionDays - x0))) + b
  );

  // Projected date is 6 months from the last real workout
  const lastWorkoutDate = dayjs(latestWorkout.date);
  const projectedDate = lastWorkoutDate.add(projectionDays, 'day').toISOString();

  // Calculate confidence using improved logic (fit, data volume, variance, projection distance)
  const confidence =
    calculateConfidence(regressionResult, regressionData.length, regressionData, projectionDays) || 0;

  // Generate rep range predictions
  const repRangePredictions = generateRepRangePredictions(
    currentOneRepMax,
    predictedOneRepMax,
    projectedDate
  );

  // Generate insights
  const insights = generateInsights(
    exerciseName,
    currentOneRepMax,
    predictedOneRepMax,
    regressionResult,
    relevantWorkouts
  );

  // Calculate metadata
  const metadata = calculateMetadata(relevantWorkouts);

  return {
    currentOneRepMax,
    predictedOneRepMax,
    predictedDate: projectedDate,
    confidence,
    repRangePredictions,
    insights,
    metadata
  };
};

/**
 * Calculates the change in one-rep max compared to a previous period.
 * @param exerciseId - ID of the exercise to analyze.
 * @param workouts - Array of all completed workouts.
 * @param timeframeMonths - Number of months to compare against.
 * @returns Change in one-rep max or null if insufficient data.
 */
export const calculateOneRepMaxChange = (
  exerciseId: string,
  workouts: CompletedWorkout[],
  timeframeMonths: number = 1
): number | null => {
  if (!exerciseId || workouts.length === 0) {
    return null;
  }

  // Get relevant workouts with the specified exercise
  const relevantWorkouts = workouts
    .filter(workout => workout.exercises.some(ex => ex.exerciseId === exerciseId))
    .sort((a, b) => dayjs(b.date).diff(dayjs(a.date))); // Sort by date descending (newest first)

  if (relevantWorkouts.length === 0) {
    return null;
  }

  // Get current 1RM from the latest workout
  const latestWorkout = relevantWorkouts[0];
  const latestExerciseData = latestWorkout.exercises.find(ex => ex.exerciseId === exerciseId);
  
  if (!latestExerciseData) return null;
  
  const { oneRepMax: currentOneRepMax } = findBestOneRepMaxSet(latestExerciseData);
  
  if (currentOneRepMax <= 0) return null;

  // Find a workout from approximately timeframeMonths ago
  const targetDate = dayjs(latestWorkout.date).subtract(timeframeMonths, 'month');
  
  // Find the workout closest to the target date
  let closestWorkout = null;
  let smallestDiff = Number.MAX_SAFE_INTEGER;
  
  for (const workout of relevantWorkouts.slice(1)) { // Skip the latest workout
    const diff = Math.abs(dayjs(workout.date).diff(targetDate, 'day'));
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closestWorkout = workout;
    }
  }
  
  // If no previous workout or it's too recent, return null
  if (!closestWorkout || smallestDiff < 7) { // At least 7 days difference
    return null;
  }
  
  // Get previous 1RM
  const previousExerciseData = closestWorkout.exercises.find(ex => ex.exerciseId === exerciseId);
  
  if (!previousExerciseData) return null;
  
  const { oneRepMax: previousOneRepMax } = findBestOneRepMaxSet(previousExerciseData);
  
  if (previousOneRepMax <= 0) return null;
  
  // Calculate change
  return currentOneRepMax - previousOneRepMax;
};
/**
 * Generates confidence interval points for the limiting returns projection.
 * Returns an array of { day, lower, upper } for the projection period.
 * @param currentOneRepMax - Current 1RM.
 * @param projectionDays - Number of days to project.
 * @param confidence - Confidence value (0-1).
 * @returns Array of { day, lower, upper }.
 */
export function generateLimitingReturnsConfidenceRange(
  currentOneRepMax: number,
  projectionDays: number,
  confidence: number
): { day: number; lower: number; upper: number }[] {
  // Limiting returns model parameters (should match generatePerformancePrediction)
  const L = currentOneRepMax * 0.25;
  const k = 0.03;
  const x0 = 90;
  const b = currentOneRepMax;

  // Confidence interval width: higher confidence = narrower band
  const maxVariation = currentOneRepMax * 0.2 * (1 - confidence);

  const points: { day: number; lower: number; upper: number }[] = [];
  for (let day = 0; day <= projectionDays; day += 7) {
    const y = L / (1 + Math.exp(-k * (day - x0))) + b;
    points.push({
      day,
      lower: y - maxVariation,
      upper: y + maxVariation,
    });
  }
  return points;
}
