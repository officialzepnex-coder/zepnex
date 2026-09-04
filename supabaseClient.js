import { createClient } from '@supabase/supabase-js'

// Hardcode your public keys here so your project connects directly
const supabaseUrl = 'sb_publishable_uhwvB8dtoA-9zZ-cervEkw_PHeO-sql'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5cXF1aHhmY3hpZHJ6aGFpempuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNDgyNzAsImV4cCI6MjEwMzkyNDI3MH0.YF9ciuzvSli26SfCSdiuynpRtndCdE4uWDckkjZoWI0' 

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
