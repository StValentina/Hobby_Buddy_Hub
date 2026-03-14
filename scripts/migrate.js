#!/usr/bin/env node

/**
 * Database Migration Runner for Hobby Buddy Hub
 * 
 * Runs all pending SQL migrations against Supabase in sequential order.
 * 
 * Usage:
 *   npm run db:setup          # Run all pending migrations
 *   node scripts/migrate.js   # Direct execution
 * 
 * Requirements:
 *   - .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_KEY set
 *   - Supabase project initialized with proper auth token
 * 
 * How it works:
 *   1. Tracks migration history in _schema_migrations table
 *   2. Reads all .sql files from supabase/migrations/ directory
 *   3. Executes only migrations not yet applied
 *   4. Records each successful migration in _schema_migrations
 *   5. Reports results and any errors
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Load Environment Variables from .env.local
// ============================================================================

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.error(`❌ Error: .env.local not found at ${envPath}`);
    process.exit(1);
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

loadEnvFile();

// ============================================================================
// Configuration
// ============================================================================

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_KEY;
const MIGRATIONS_DIR = path.join(__dirname, '../supabase/migrations');

// Validate configuration
if (!SUPABASE_URL) {
  console.error('❌ Error: VITE_SUPABASE_URL is not configured in .env.local');
  console.error('\n📋 Configuration needed:');
  console.error('1. Open your Supabase project dashboard: https://supabase.com/dashboard');
  console.error('2. Go to Settings → API');
  console.error('3. Copy these values to .env.local:');
  console.error('   VITE_SUPABASE_URL=https://your-project.supabase.co');
  console.error('   VITE_SUPABASE_KEY=<copy anon public key>');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=<copy service_role secret key>');
  console.error('\n4. Re-run: npm run db:setup\n');
  process.exit(1);
}

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY is not set in .env.local');
  console.error('\n⚠️  For migrations, use SUPABASE_SERVICE_ROLE_KEY (the service role secret)');
  console.error('\n📋 Steps to get it:');
  console.error('1. Go to: https://supabase.com/dashboard → Your Project → Settings → API');
  console.error('2. Under "SERVICE ROLE SECRET", copy the full key');
  console.error('3. Add to .env.local:');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=eyJ...<paste entire key>');
  console.error('\n4. Save and re-run: npm run db:setup\n');
  process.exit(1);
}

// ============================================================================
// Logging Utilities
// ============================================================================

const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  warn: (msg) => console.warn(`⚠️  ${msg}`),
  header: (msg) => console.log(`\n${'='.repeat(70)}\n${msg}\n${'='.repeat(70)}`),
};

// ============================================================================
// Supabase API Client
// ============================================================================

/**
 * Execute raw SQL via Supabase REST API using fetch (Node.js 18+)
 */
async function executeSQLFetch(sql) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
      },
      body: JSON.stringify({ sql }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    return { success: true };
  } catch (err) {
    throw err;
  }
}

// ============================================================================
// Migration Tracking
// ============================================================================
// Migration Tracking
// ============================================================================

/**
 * Initialize migration tracking table if it doesn't exist
 */
async function initializeMigrationTracking() {
  const initSQL = `
    CREATE TABLE IF NOT EXISTS _schema_migrations (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
  
  try {
    await executeSQLFetch(initSQL);
    return true;
  } catch (err) {
    log.warn(`Could not create migration tracking table: ${err.message}`);
    return false;
  }
}

/**
 * Get list of already-applied migrations
 */
async function getAppliedMigrations() {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/_schema_migrations?select=name`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        // Table doesn't exist yet
        return [];
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data.map(row => row.name) : [];
  } catch (err) {
    // Table doesn't exist yet or fetch failed - return empty list
    return [];
  }
}

/**
 * Record a migration as applied
 */
async function recordMigration(name) {
  const sql = `
    INSERT INTO _schema_migrations (name) VALUES ('${name}')
    ON CONFLICT (name) DO NOTHING;
  `;
  
  try {
    await executeSQLFetch(sql);
    return true;
  } catch (err) {
    log.warn(`Could not record migration ${name}: ${err.message}`);
    return true; // Don't fail the entire process
  }
}

// ============================================================================
// Migration Discovery and Execution
// ============================================================================

/**
 * Read and sort migration files
 */
function getMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    throw new Error(`Migrations directory not found: ${MIGRATIONS_DIR}`);
  }
  
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort(); // Sorts by filename/timestamp
  
  return files;
}

/**
 * Read migration file content
 */
function readMigration(filename) {
  const filePath = path.join(MIGRATIONS_DIR, filename);
  return fs.readFileSync(filePath, 'utf8');
}

/**
 * Execute a single migration
 */
async function executeMigration(name, sql) {
  log.info(`Running migration: ${name}`);
  
  try {
    await executeSQLFetch(sql);
    await recordMigration(name);
    log.success(`Migration applied: ${name}`);
    return { success: true, name };
  } catch (err) {
    log.error(`Failed to apply migration ${name}: ${err.message}`);
    return { success: false, name, error: err.message };
  }
}

// ============================================================================
// Main Migration Runner
// ============================================================================

async function runMigrations() {
  log.header('🗄️  Hobby Buddy Hub - Database Migration Runner');
  
  try {
    // Initialize tracking
    log.info('Initializing migration tracking...');
    await initializeMigrationTracking();
    
    // Get list of migration files
    log.info('Discovering migrations...');
    const migrationFiles = getMigrationFiles();
    
    if (migrationFiles.length === 0) {
      log.warn('No migration files found in supabase/migrations/');
      return;
    }
    
    log.info(`Found ${migrationFiles.length} migration(s)`);
    
    // Get list of already-applied migrations
    const appliedMigrations = await getAppliedMigrations();
    log.info(`${appliedMigrations.length} migration(s) already applied`);
    
    // Identify pending migrations
    const pendingMigrations = migrationFiles.filter(f => !appliedMigrations.includes(f));
    
    if (pendingMigrations.length === 0) {
      log.success('All migrations have been applied. Database is up to date.');
      return;
    }
    
    log.info(`\n${pendingMigrations.length} migration(s) pending:`);
    pendingMigrations.forEach(m => log.info(`  - ${m}`));
    
    // Execute pending migrations sequentially
    log.header('Executing Pending Migrations');
    
    const results = [];
    for (const migrationFile of pendingMigrations) {
      const sql = readMigration(migrationFile);
      const result = await executeMigration(migrationFile, sql);
      results.push(result);
      
      if (!result.success) {
        log.error('\n⚠️  Stopping at first failure. Fix the error and re-run migrations.');
        process.exit(1);
      }
    }
    
    // Summary
    log.header('Migration Summary');
    const successful = results.filter(r => r.success).length;
    log.success(`${successful}/${results.length} migrations applied successfully`);
    
    if (successful === results.length) {
      log.success('\n🎉 Database migration complete! Your schema is ready.');
    }
    
  } catch (err) {
    log.error(`\nFatal error: ${err.message}`);
    log.error('\nTroubleshooting:');
    log.error('1. Verify VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
    log.error('2. Ensure Supabase project is accessible');
    log.error('3. Check that migrations/sql files exist and are valid SQL');
    process.exit(1);
  }
}

// ============================================================================
// Execution
// ============================================================================

runMigrations().catch(err => {
  log.error(err.message);
  process.exit(1);
});
