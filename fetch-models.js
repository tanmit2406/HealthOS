const fs = require('fs');

async function test() {
  const env = fs.readFileSync('.env.local', 'utf8');
  const apiKeyLine = env.split('\n').find(l => l.startsWith('GEMINI_API_KEY='));
  if (!apiKeyLine) return console.log("NO API KEY");
  const apiKey = apiKeyLine.split('=')[1].trim();

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log("Models:", data.models.map(m => m.name).join('\n'));
  } catch (err) {
    console.error("Gemini Error:", err);
  }
}
test();
