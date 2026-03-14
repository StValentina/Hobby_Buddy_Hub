#!/usr/bin/env node

/**
 * 🗄️ Hobby Buddy Hub - Manual Migration Guide
 * 
 * Usage:
 *   npm run db:setup
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.join(__dirname, '../supabase/migrations');

console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║          🗄️  Hobby Buddy Hub - Database Migration Guide                   ║
╚═══════════════════════════════════════════════════════════════════════════╝

✅ Configuration is valid!

To set up your database, follow these steps:

STEP 1: Open Supabase SQL Editor
────────────────────────────────
  1. Go to: https://supabase.com/dashboard
  2. Select your project (aglrtqittgdmpnrapfoi)
  3. Click "SQL Editor" (left sidebar)
  4. Click "+ New Query"

STEP 2: Copy & Run Each Migration File (in order)
──────────────────────────────────────────────────
`);

const migrations = fs.readdirSync(MIGRATIONS_DIR)
  .filter(f => f.endsWith('.sql'))
  .sort();

console.log(`\nYou have ${migrations.length} migration files:\n`);

migrations.forEach((file, i) => {
  const filePath = path.join(MIGRATIONS_DIR, file);
  const size = fs.statSync(filePath).size;
  console.log(`${i + 1}. ${file.padEnd(45)} (${size} bytes)`);
});

console.log(`

For each file:
  ├─ Open: supabase/migrations/${migrations[0]}
  ├─ Copy ALL contents
  ├─ Paste in Supabase SQL Editor
  ├─ Click "Run" (Ctrl+Enter)
  └─ Wait for success ✓

Then repeat for files ${migrations[1]}, ${migrations[2]}, ${migrations[3]}, ${migrations[4]}

STEP 3: Verify Success
──────────────────────
Run this query in Supabase SQL Editor:

  SELECT COUNT(*) as tables FROM information_schema.tables 
  WHERE table_schema = 'public';

Should show: 10 tables

STEP 4: Check Seed Data
───────────────────────
  SELECT COUNT(*) FROM hobbies;      -- Should be 15
  SELECT COUNT(*) FROM tags;          -- Should be 20
  SELECT COUNT(*) FROM locations;     -- Should be 10

═══════════════════════════════════════════════════════════════════════════

📂 Migration Files Location:
   ${path.relative(process.cwd(), MIGRATIONS_DIR)}

📖 Need Help?
   • Supabase Docs: https://supabase.com/docs
   • This project: See MIGRATION_GUIDE.md

🚀 When done, your database will be ready for development!
`);
