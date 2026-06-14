import { GoogleGenAI } from '@google/genai';

export async function generateDailyInsights(todayData: any, historicalData: any[]) {
  const prompt = `
You are a world-class sports scientist, physician, and health coach. 
Your client has provided you with their Apple Health data from yesterday, and their historical data for baseline comparison.

Analyze this data and generate a JSON response strictly conforming to the following structure. Do not output anything other than the JSON object.

{
  "readiness_score": 85,
  "summary_briefing": "Short string",
  "monthly_pattern_insight": "Short string",
  "stress_analysis": "Short string",
  "fitness_recommendation": "Short string",
  "weight_trend_analysis": "Short string"
}

Today's Data:
${JSON.stringify(todayData)}

Previous 30 Days Data:
${JSON.stringify(historicalData)}
`;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    } else {
      throw new Error(`Empty response from Gemini.`);
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    return {
      readiness_score: 50,
      summary_briefing: `Error generating insights today: ${error.message || JSON.stringify(error)}`,
      monthly_pattern_insight: "Not enough data for pattern analysis.",
      stress_analysis: "Data unavailable.",
      fitness_recommendation: "Take it easy today.",
      weight_trend_analysis: "Data unavailable."
    };
  }
}
