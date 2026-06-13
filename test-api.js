const url = 'https://health-os-rosy.vercel.app/api/ingest';
const data = {
  date: "2026-06-13",
  resting_heart_rate: 60,
  hrv_avg: 45,
  sleep_core_mins: 300,
  steps: 5000,
  active_calories: 500
};

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer Loopupyc@6'
  },
  body: JSON.stringify(data)
})
.then(async res => {
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Response:', text);
})
.catch(err => {
  console.error('Fetch error:', err);
});
