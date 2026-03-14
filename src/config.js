/**
 * Environment configuration
 */

const ENV = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_KEY: import.meta.env.VITE_SUPABASE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5173',
};

export default ENV;
