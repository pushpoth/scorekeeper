// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://nqdgmyibzwswycvgscmt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xZGdteWliendzd3ljdmdzY210Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzMjIwNjQsImV4cCI6MjA1ODg5ODA2NH0.YwPfGR5RJAn6TqBrDeT2RsJc67HVfaVeutqJ4Pv-LXQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);