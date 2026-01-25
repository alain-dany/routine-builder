
import { createClient } from '@supabase/supabase-js';

// Fallback to placeholders to prevent "supabaseUrl is required" initialization error
// These will be replaced by actual values in Vercel environment variables
const supabaseUrl = (typeof process !== 'undefined' ? process.env?.SUPABASE_URL : '') || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = (typeof process !== 'undefined' ? process.env?.SUPABASE_ANON_KEY : '') || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
