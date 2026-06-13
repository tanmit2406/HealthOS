const fs = require('fs');
const readline = require('readline');

const FILE_PATH = './apple_health_export/export.xml';

// Target range
const START_DATE = new Date('2026-03-03T00:00:00Z');
const END_DATE = new Date('2026-06-12T23:59:59Z');

const dataByDate = {}; 

const typeMapping = {
  'HKQuantityTypeIdentifierRestingHeartRate': 'resting_heart_rate',
  'HKQuantityTypeIdentifierHeartRateVariabilitySDNN': 'hrv_avg',
  'HKQuantityTypeIdentifierStepCount': 'steps',
  'HKQuantityTypeIdentifierActiveEnergyBurned': 'active_calories'
};

const rl = readline.createInterface({
  input: fs.createReadStream(FILE_PATH),
  crlfDelay: Infinity
});

const recordRegex = /<Record(.*?)>/;
const getAttr = (str, attr) => {
  const match = str.match(new RegExp(`${attr}="([^"]+)"`));
  return match ? match[1] : null;
};

rl.on('line', (line) => {
  const match = line.match(recordRegex);
  if (!match) return;
  const attrs = match[1];
  
  const type = getAttr(attrs, 'type');
  if (!type) return;

  const startDateStr = getAttr(attrs, 'startDate');
  const endDateStr = getAttr(attrs, 'endDate');
  const valueStr = getAttr(attrs, 'value');

  if (!startDateStr || !valueStr) return;
  
  const isoStr = startDateStr.replace(' ', 'T').replace(' ', '');
  const parsedDate = new Date(isoStr);

  if (parsedDate < START_DATE || parsedDate > END_DATE) return;

  // Use local day relative to the user to avoid UTC timezone shifting
  // But we can just use the YYYY-MM-DD from the string directly!
  const dateKey = startDateStr.split(' ')[0];

  if (!dataByDate[dateKey]) {
    dataByDate[dateKey] = {
      resting_heart_rate: { sum: 0, count: 0 },
      hrv_avg: { sum: 0, count: 0 },
      steps: 0,
      active_calories: 0,
      sleep_core_mins: 0,
      sleep_deep_mins: 0,
      sleep_rem_mins: 0
    };
  }

  const daily = dataByDate[dateKey];

  if (typeMapping[type]) {
    const val = parseFloat(valueStr);
    if (isNaN(val)) return;

    if (type === 'HKQuantityTypeIdentifierStepCount' || type === 'HKQuantityTypeIdentifierActiveEnergyBurned') {
      daily[typeMapping[type]] += val;
    } else {
      daily[typeMapping[type]].sum += val;
      daily[typeMapping[type]].count += 1;
    }
  } else if (type === 'HKCategoryTypeIdentifierSleepAnalysis') {
    if (valueStr.includes('Asleep')) {
      const endIso = endDateStr.replace(' ', 'T').replace(' ', '');
      const endObj = new Date(endIso);
      const mins = (endObj - parsedDate) / 60000;
      
      const wakeDateKey = endDateStr.split(' ')[0];
      if (!dataByDate[wakeDateKey]) {
        dataByDate[wakeDateKey] = {
          resting_heart_rate: { sum: 0, count: 0 }, hrv_avg: { sum: 0, count: 0 },
          steps: 0, active_calories: 0, sleep_core_mins: 0, sleep_deep_mins: 0, sleep_rem_mins: 0
        };
      }

      if (valueStr.includes('Core')) dataByDate[wakeDateKey].sleep_core_mins += mins;
      else if (valueStr.includes('Deep')) dataByDate[wakeDateKey].sleep_deep_mins += mins;
      else if (valueStr.includes('REM')) dataByDate[wakeDateKey].sleep_rem_mins += mins;
    }
  }
});

rl.on('close', async () => {
  console.log('Finished parsing XML. Processing records...');
  
  const results = [];
  for (const [date, data] of Object.entries(dataByDate)) {
    const finalData = {
      date,
      steps: Math.round(data.steps) || null,
      active_calories: Math.round(data.active_calories) || null,
      sleep_core_mins: Math.round(data.sleep_core_mins) || null,
      sleep_deep_mins: Math.round(data.sleep_deep_mins) || null,
      sleep_rem_mins: Math.round(data.sleep_rem_mins) || null
    };

    if (data.resting_heart_rate.count > 0) {
      finalData.resting_heart_rate = Math.round(data.resting_heart_rate.sum / data.resting_heart_rate.count);
    } else {
      finalData.resting_heart_rate = null;
    }
    
    if (data.hrv_avg.count > 0) {
      finalData.hrv_avg = Math.round((data.hrv_avg.sum / data.hrv_avg.count) * 100) / 100;
    } else {
      finalData.hrv_avg = null;
    }

    results.push(finalData);
  }

  console.log(`Found ${results.length} days of data. Sending to API sequentially...`);

  for (const payload of results) {
    try {
      const resp = await fetch('https://health-os-rosy.vercel.app/api/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer Loopupyc@6'
        },
        body: JSON.stringify(payload)
      });
      console.log(`Sent ${payload.date}: Status ${resp.status}`);
      // Sleep for 200ms to be gentle on Vercel
      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      console.error(`Failed ${payload.date}`, err.message);
    }
  }
  
  console.log('Successfully imported all data!');
});
