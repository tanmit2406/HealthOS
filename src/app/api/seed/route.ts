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

    return NextResponse.json({ success: true, message: "Successfully injected 90 days of mock data! Check your dashboard." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
