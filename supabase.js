// Supabase client initialization
const supabaseUrl = 'https://hdkufsiwpjrhejbmrgdr.supabase.co'; // Your Supabase URL from the redirect URI
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhka3Vmc2l3cGpyaGVqYm1yZ2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NDg4NDIsImV4cCI6MjA2MDAyNDg0Mn0.-5EMDlo1pT7a_WVbUJop31G0qTnoQ_03P57sQ7gz58A'; // Your Supabase anon public key

// Initialize the Supabase client
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

// Export the supabase client
window.supabaseClient = supabase;
