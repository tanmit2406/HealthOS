import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateDailyInsights } from '@/lib/gemini';

export const runtime = 'edge'; // Use Edge runtime to avoid 10s hobby timeout


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
    const metrics: any = {};
    for (const [key, value] of Object.entries(rawMetrics)) {
      if (value !== "" && value !== null && value !== undefined && !isNaN(Number(value))) {
        metrics[key] = Number(value);
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

    // 2. Fetch last 14 days of data for baseline
    const { data: historicalData, error: histError } = await supabase
      .from('health_metrics')
      .select('*')
      .lt('date', date)
      .order('date', { ascending: false })
      .limit(14);

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
        summary_briefing: insights.summary_briefing,
        stress_analysis: insights.stress_analysis,
        fitness_recommendation: insights.fitness_recommendation,
        weight_trend_analysis: insights.weight_trend_analysis
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
