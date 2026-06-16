import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateDailyInsights } from '@/lib/gemini';

export const maxDuration = 60; // Allow up to 60 seconds to prevent Gemini timeout

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.INGEST_API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { date, ...rawMetrics } = body;

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    // Sanitize metrics: Convert empty strings from Shortcuts to null, and ensure numbers
    const integerColumns = [
      'resting_heart_rate', 'sleep_deep_mins', 'sleep_core_mins', 'sleep_rem_mins', 'total_sleep_mins',
      'steps', 'active_calories', 'workout_duration_mins'
    ];

    const metrics: any = {};
    for (const [key, value] of Object.entries(rawMetrics)) {
      if (value !== "" && value !== null && value !== undefined) {
        let strVal = String(value).toLowerCase();
        
        // Extract all numbers (including decimals). e.g. "28000 sec" -> 28000, "7.5 hr" -> 7.5
        let extractedNum = strVal.replace(/[^\d.]/g, '');
        let numValue = Number(extractedNum);

        if (!isNaN(numValue) && extractedNum !== '') {
          // If the shortcut passed seconds (e.g. 28000 sec), convert to minutes.
          // Note: If they passed "7 hrs 30 mins", this simple regex squashes it to "730", which is wrong. 
          // However, "Calculate Statistics" on Time usually outputs a single unit like seconds or minutes.
          if (strVal.includes('sec')) {
            numValue = numValue / 60;
          } else if (strVal.includes('hr') || strVal.includes('hour')) {
             // If it strictly says "7.5 hr" or similar
             if (!strVal.includes('min')) {
               numValue = numValue * 60;
             }
          }

          if (integerColumns.includes(key)) {
            metrics[key] = Math.round(numValue);
          } else {
            metrics[key] = Math.round(numValue * 100) / 100; // Round to 2 decimals
          }
        } else {
          metrics[key] = null;
        }
      } else {
        metrics[key] = null;
      }
    }

    // 1. Insert or update health metrics
    const { error: dbError } = await supabase
      .from('health_metrics')
      .upsert({ date, ...metrics })
      .select();

    if (dbError) {
      console.error("DB Error:", dbError);
      return NextResponse.json({ error: 'Database error', details: dbError }, { status: 500 });
    }

    // 2. Fetch last 30 days of data for baseline
    const { data: historicalData, error: histError } = await supabase
      .from('health_metrics')
      .select('*')
      .lt('date', date)
      .order('date', { ascending: false })
      .limit(30);

    if (histError) {
      console.error("History Error:", histError);
    }

    // 3. Generate Insights with Gemini
    const insights = await generateDailyInsights({ date, ...metrics }, historicalData || []);

    // 4. Save Insights
    const { error: insightError } = await supabase
      .from('daily_insights')
      .upsert({
        date,
        readiness_score: insights.readiness_score,
        today_data_insight: insights.today_data_insight,
        thirty_day_insight: insights.thirty_day_insight,
        monthly_pattern_insight: insights.monthly_pattern_analysis,
        stress_analysis: insights.monthly_stress_analysis,
        fitness_recommendation: insights.monthly_fitness_recommendation,
        weight_trend_analysis: insights.monthly_weight_trend
      });

    if (insightError) {
      console.error("Insight DB Error:", insightError);
    }

    return NextResponse.json({ success: true, insights });
  } catch (error: any) {
    console.error("Ingest Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
