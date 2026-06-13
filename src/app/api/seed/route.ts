import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const today = new Date();
    const metricsToInsert = [];
    
    // Generate 90 days of realistic dummy data
    for (let i = 90; i >= 1; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      
      // Random realistic fluctuations
      const rhr = Math.floor(Math.random() * (68 - 55 + 1) + 55);
      const hrv = Math.floor(Math.random() * (60 - 35 + 1) + 35);
      const steps = Math.floor(Math.random() * (12000 - 4000 + 1) + 4000);
      const activeCals = Math.floor(Math.random() * (800 - 300 + 1) + 300);
      
      metricsToInsert.push({
        date: dateString,
        resting_heart_rate: rhr,
        hrv_avg: hrv,
        steps: steps,
        active_calories: activeCals,
        sleep_core_mins: Math.floor(Math.random() * (400 - 300 + 1) + 300)
      });
    }

    const { error: dbError } = await supabase
      .from('health_metrics')
      .upsert(metricsToInsert);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // Insert a dummy insight for today to populate the new UI immediately
    const todayStr = new Date().toISOString().split('T')[0];
    await supabase.from('daily_insights').upsert({
      date: todayStr,
      readiness_score: 88,
      summary_briefing: "Good morning! Your mock data has been injected successfully.",
      monthly_pattern_insight: "Over the last 30 days, your cardiovascular baseline has improved significantly. The days you hit 10,000+ steps correlated strongly with a +15% boost in deep sleep.",
      stress_analysis: "Low stress indicated by stable HRV.",
      fitness_recommendation: "Push hard today, you are fully recovered.",
      weight_trend_analysis: "Stable over the last week."
    });

    return NextResponse.json({ success: true, message: "Successfully injected 90 days of mock data! Check your dashboard." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
