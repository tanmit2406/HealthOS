import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// We use service role key for the ingest endpoint to bypass RLS, 
// or anon key if it's open for development.
export const supabase = createClient(supabaseUrl, supabaseKey);
