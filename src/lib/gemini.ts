import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateDailyInsights(todayData: any, historicalData: any[]) {
  const prompt = `
You are a world-class sports scientist, physician, and health coach. 
Your client has provided you with their Apple Health data from yesterday, and their historical data for baseline comparison.

Analyze this data and generate a JSON response strictly conforming to the following structure. Do not output anything other than the JSON object.

{
  "readiness_score": integer (0-100, calculate based on HRV, resting heart rate, and sleep quality compared to baseline),
  "summary_briefing": string (A short, personalized morning greeting and summary of their recovery),
  "stress_analysis": string (An analysis of their physical stress levels, citing specific HRV/RHR numbers),
  "fitness_recommendation": string (Actionable advice on what kind of workout they should do today based on readiness),
  "weight_trend_analysis": string (A quick note on their weight vs active calories)
}

Today's Data:
${JSON.stringify(todayData, null, 2)}

Previous 14 Days Data:
${JSON.stringify(historicalData, null, 2)}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    } else {
      throw new Error("No text response from Gemini");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      readiness_score: 50,
      summary_briefing: "Error generating insights today.",
      stress_analysis: "Data unavailable.",
      fitness_recommendation: "Take it easy today.",
      weight_trend_analysis: "Data unavailable."
    };
  }
}
