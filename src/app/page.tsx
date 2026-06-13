import { supabase } from '@/lib/supabase';
import DashboardClient from '@/components/DashboardClient';

// Ensure the page isn't statically cached so we get fresh data
export const revalidate = 0;

export default async function Home() {
  // Fetch the latest 30 days of metrics
  const { data: metrics, error: metricsError } = await supabase
    .from('health_metrics')
    .select('*')
    .order('date', { ascending: false })
    .limit(30);

  // Fetch the latest insight
  const { data: insights, error: insightsError } = await supabase
    .from('daily_insights')
    .select('*')
    .order('date', { ascending: false })
    .limit(1);

  if (metricsError) {
    console.error("Error fetching metrics:", metricsError);
  }

  return (
    <main>
      <DashboardClient metrics={metrics || []} insights={insights || []} />
    </main>
  );
}
