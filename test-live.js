async function test() {
  try {
    const payload = {
      date: new Date().toISOString().split('T')[0],
      resting_heart_rate: 65,
      hrv_avg: 50,
      steps: 8000,
      active_calories: 500,
      sleep_core_mins: 250,
      sleep_deep_mins: 60,
      sleep_rem_mins: 90
    };

    const resp = await fetch('https://health-os-rosy.vercel.app/api/ingest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer Loopupyc@6'
      },
      body: JSON.stringify(payload)
    });
    
    const data = await resp.json();
    console.log("Live API Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}
test();
