import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'edge';

export async function GET() {
  const { data, error } = await supabase.from('daily_insights').select('*').order('date', { ascending: false }).limit(2);
  if (error) return NextResponse.json({ error });
  return NextResponse.json(data);
}
