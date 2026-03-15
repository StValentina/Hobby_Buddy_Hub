/**
 * Environment configuration
 */

function normalizeEnv(value) {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

const ENV = {
  SUPABASE_URL: normalizeEnv(import.meta.env.VITE_SUPABASE_URL),
  SUPABASE_KEY: normalizeEnv(
    import.meta.env.VITE_SUPABASE_KEY ||
      import.meta.env.VITE_SUPABASE_ANON_KEY ||
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  ),
  API_BASE_URL: normalizeEnv(import.meta.env.VITE_API_BASE_URL) || 'http://localhost:5173',
};

export default ENV;
