const fs = require('fs');

async function test() {
  const env = fs.readFileSync('.env.local', 'utf8');
  const apiKeyLine = env.split('\n').find(l => l.startsWith('GEMINI_API_KEY='));
  if (!apiKeyLine) return console.log("NO API KEY");
  const apiKey = apiKeyLine.split('=')[1].trim();

  const historicalData = [{"date":"2026-06-13","resting_heart_rate":60,"hrv_avg":45,"steps":5000,"active_calories":400,"sleep_core_mins":200,"sleep_deep_mins":60,"sleep_rem_mins":90}];

  const prompt = `You are a highly analytical, empathetic health AI designed to read daily biometric data from Apple Health and provide personalized, actionable insights.

Analyze the user's health metrics for today and compare them to their historical baseline. 
Provide a "readiness_score" from 0 to 100 representing how recovered and ready for strain the user is.

Respond ONLY with a raw JSON object matching this exact structure:
{
  "readiness_score": 85,
  "summary_briefing": "Short string",
  "monthly_pattern_insight": "Short string",
  "stress_analysis": "Short string",
  "fitness_recommendation": "Short string",
  "weight_trend_analysis": "Short string"
}

Today's Data:
{"resting_heart_rate":60}

Previous 30 Days Data:
${JSON.stringify(historicalData)}`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const data = await response.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Gemini Error:", err);
  }
}
test();
