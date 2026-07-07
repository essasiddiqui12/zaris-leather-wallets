// Supabase Configuration
const SUPABASE_URL = 'https://amxnphzlplxljtrrirnu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFteG5waHpscGx4bGp0cnJpcm51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMzk2NTUsImV4cCI6MjA5ODgxNTY1NX0.TQJwZSTrY-055mbgUSzAnjEoHXurleg0hUmKW9aHeQ8';

// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
