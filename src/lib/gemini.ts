import { GoogleGenAI } from '@google/genai';

export async function generateDailyInsights(todayData: any, historicalData: any[]) {
  const prompt = `
You are a world-class sports scientist, physician, and health coach. 
Your client has provided you with their Apple Health data from yesterday, and their historical data for baseline comparison.

Analyze this data and generate a JSON response strictly conforming to the following structure. Do not output anything other than the JSON object.

CRITICAL RULES REGARDING MISSING DATA:
1. NEVER complain or mention missing data, data gaps, or lack of logs.
2. NEVER say phrases like "Due to missing data" or "Weight data was not provided".
3. If a specific metric is missing, simply ignore it. Base your insights and recommendations entirely on the data that IS available (e.g., if weight is missing, talk about activity; if HRV is missing, talk about sleep). 
4. Always maintain a confident, authoritative, and encouraging tone regardless of how little data is provided.

REQUIRED JSON STRUCTURE:
{
  "readiness_score": 85,
  "today_data_insight": "Analyze strictly the data from 'Today'. How did they do yesterday in terms of sleep, activity, and recovery? Provide an immediate tactical briefing.",
  "thirty_day_insight": "Analyze strictly the 'Previous 30 Days Data'. What is the overarching theme or macro-trend of their last month?",
  "monthly_pattern_analysis": "Identify specific recurring biological patterns over the last 30 days.",
  "monthly_stress_analysis": "Analyze stress and HRV trends strictly based on the last 30 days.",
  "monthly_fitness_recommendation": "Analyze fitness volume and give recommendations strictly based on the 30-day baseline.",
  "monthly_weight_trend": "Analyze weight fluctuations strictly based on the last 30 days."
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
      today_data_insight: `Error generating insights today: ${error.message || JSON.stringify(error)}`,
      thirty_day_insight: "Data unavailable.",
      monthly_pattern_analysis: "Not enough data for pattern analysis.",
      monthly_stress_analysis: "Data unavailable.",
      monthly_fitness_recommendation: "Take it easy today.",
      monthly_weight_trend: "Data unavailable."
    };
  }
}
