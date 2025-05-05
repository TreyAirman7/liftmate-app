import { NextRequest, NextResponse } from "next/server";

function formatUserContext(userContext: any): string {
  if (!userContext) return "";
  // Format each datapoint for clarity and brevity, with explicit units for body weight
  return `
User Profile:
- Name: ${userContext.name ?? "N/A"}
- Age: ${userContext.age ?? "N/A"}
- Gender: ${userContext.gender ?? "N/A"}
- Height: ${userContext.height ?? "N/A"}
- Body Weight: ${userContext.bodyWeight ?? "N/A"}
- Workout Goals: ${userContext.goal ?? "N/A"}
- Total workouts logged: ${userContext.totalWorkouts ?? "N/A"}
- Average workouts per week: ${userContext.avgWorkoutsPerWeek ?? "N/A"}
- Average workout duration: ${userContext.avgWorkoutDuration ?? "N/A"}
- Muscle Group Focus percentages: ${userContext.muscleGroupFocus ?? "N/A"}
- Personal Records: ${userContext.personalRecords ?? "N/A"}
- Workouts logged in the last 27 days: ${userContext.workoutsLast27Days ?? "N/A"}
- Estimated one rep maxes: ${userContext.oneRepMaxes ?? "N/A"}
- Improvement percentages achieved for each exercise: ${userContext.improvementPercentages ?? "N/A"}
- Body Weight trends logged: ${userContext.bodyWeightTrends ?? "N/A"}
- Last 10 workouts logged: ${userContext.last10Workouts ?? "N/A"}
- Last 5 workout details (date, exercise, sets): 
${userContext.last5WorkoutDetails ?? "N/A"}
`.trim();
}

export async function POST(req: NextRequest) {
  try {
    const { question, userContext, model } = await req.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Missing or invalid question" }, { status: 400 });
    }

    const modelName = typeof model === "string" && model.length > 0 ? model : "gemma3:1b";

    // Compose the full prompt for the LLM
    const userContextText = formatUserContext(userContext);
    const prompt = `
You are a helpful workout advisor for the LiftMate application. The following is the user's profile and workout data:

${userContextText}

Given this context, answer the user's question below in a single concise paragraph (no more than 4 sentences). Be practical, safe, and motivating. Do not repeat the user's data in your answer.

User's question: ${question}
`;

    // Prepare Ollama API payload
    const ollamaPayload = {
      model: modelName,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: false,
    };

    // Call local Ollama API
    const ollamaRes = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ollamaPayload),
    });

    if (!ollamaRes.ok) {
      const errorText = await ollamaRes.text();
      return NextResponse.json({ error: "Ollama API error", details: errorText }, { status: 500 });
    }

    const ollamaData = await ollamaRes.json();
    const answer = ollamaData?.message?.content || "No response from LLM.";

    return NextResponse.json({ answer, model: modelName });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error", details: error?.message || error }, { status: 500 });
  }
}