# Database Migration Guide – Hobby Buddy Hub

This guide explains how to set up the Hobby Buddy Hub PostgreSQL database schema using the automated migration system.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

This installs all required packages including `dotenv` for environment variable management.

### 2. Configure Supabase Credentials

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**Where to find these values:**
- **URL**: Supabase Dashboard → Project Settings → API → Project URL
- **Public Key**: Supabase Dashboard → Project Settings → API → anon key
- **Service Role Key**: Supabase Dashboard → Project Settings → API → service_role key

⚠️ **IMPORTANT**: The service role key is sensitive and should never be committed to version control or exposed in the frontend. Use it only for server-side operations and migrations.

### 3. Run Migrations

```bash
npm run db:setup
```

This command:
1. Reads all `.sql` files from `supabase/migrations/` in order
2. Tracks which migrations have been applied using the `_schema_migrations` table
3. Executes only pending (not yet applied) migrations
4. Reports success/failure for each migration
5. Stops on the first error (for your safety)

**Expected output:**
```
================================================================================
🗄️  Hobby Buddy Hub - Database Migration Runner
================================================================================

ℹ️  Initializing migration tracking...
ℹ️  Discovering migrations...
ℹ️  Found 22 migration(s)
ℹ️  0 migration(s) already applied

22 migration(s) pending:
  - 001_enums_and_base_tables.sql
  - 002_junction_and_relationship_tables.sql
  - 003_auth_triggers.sql
  - 004_rls_policies.sql
  - 005_seed_data.sql
  - 006_fix_public_access.sql
  - ... (and 16 more migrations)
  - 022_fix_tags_admin_update_permissions.sql

================================================================================
Executing Pending Migrations
================================================================================

ℹ️  Running migration: 001_enums_and_base_tables.sql
✅ Migration applied: 001_enums_and_base_tables.sql
...
✅ Migration applied: 022_fix_tags_admin_update_permissions.sql

================================================================================
Migration Summary
================================================================================

✅ 22/22 migrations applied successfully

🎉 Database migration complete! Your schema is ready.
```

---

## Migration Files

All migrations are in `supabase/migrations/` and are executed in alphabetical order:

### 001_enums_and_base_tables.sql
Creates PostgreSQL enums and foundational tables:
- Enum: `roles` (seeker, host, admin)
- Enum: `event_participation_status` (joined, cancelled, pending)
- Table: `profiles` (extends auth.users)
- Table: `user_roles` (tracks user roles)
- Table: `hobbies` (hobby categories)
- Table: `tags` (descriptive tags)

**What it does**: Sets up the basic structure with role-based access enums and core entity tables.

### 002_junction_and_relationship_tables.sql
Creates relationship/junction tables and event entities:
- Table: `user_hobbies` (many-to-many: profiles ↔ hobbies)
- Table: `hobby_tags` (many-to-many: hobbies ↔ tags)
- Table: `locations` (event venue/location data)
- Table: `events` (hobby events organized by hosts)
- Table: `event_tags` (many-to-many: events ↔ tags)
- Table: `event_participants` (many-to-many: profiles ↔ events with status)

**What it does**: Implements many-to-many relationships and the main event/participation system.

### 003_auth_triggers.sql
Creates database triggers for Supabase Auth integration:
- **Trigger** `on_auth_user_created`: Auto-creates profile & assigns default role when user signs up
- **Trigger** `update_profiles_updated_at`: Auto-updates `updated_at` timestamp on profile changes
- **Trigger** `update_events_updated_at`: Auto-updates `updated_at` timestamp on event changes
- **Functions**: Helper functions for role checking (`is_admin()`, `is_host()`, `is_seeker()`)

**What it does**: Automates user onboarding and provides helper functions for RLS policies.

### 004_rls_policies.sql
Implements Row-Level Security (RLS) policies to restrict data access:
- **profiles**: Users can read all profiles; update only their own
- **user_roles**: Users see own role; admins manage all roles
- **hobbies**: Everyone reads; admins manage
- **tags**: Everyone reads; admins manage
- **user_hobbies**: Users manage own; admins manage all
- **hobby_tags**: Everyone reads; admins manage
- **locations**: Everyone reads; admins manage creations
- **events**: Everyone reads; hosts/admins create and manage own
- **event_tags**: Everyone reads; event host/admin manage
- **event_participants**: Complex policy for user participation, host visibility, admin override

**What it does**: Enforces fine-grained access control at the database level.

### 005_seed_data.sql
Populates initial data for development and testing:
- **12 hobbies**: Paint Art, Hiking, Music & Instruments, Cooking, Literature & Reading, Chess, Dancing, Photography, Cycling Sport, Yoga & Meditation, Rock Climbing, Travel & Exploration
- **19 tags**: Adventure, All Ages, Beginner Friendly, Casual, Competitive, Creative, Cultural, Evening Activity, Group Activity, Indoor, Just for Fun, Mindful, Nature, Outdoor, Relaxing, Skill Building, Social, Sport, Weekend Activity
- **10 locations**: Real/realistic venue names (Vitosha Mountain, Borisova Garden, Community Chess Club, etc.)
- **~130+ hobby-tag relationships**: Links hobbies to descriptive tags

**What it does**: Provides realistic sample data for application testing and demonstration.

### 006_fix_public_access.sql through 022_fix_tags_admin_update_permissions.sql
These migrations (006-022) handle:
- Public read access policies for data viewing
- Email field addition to profiles
- Email uniqueness constraints
- Profile trigger enhancements
- RLS policy verification and fixes
- Storage bucket setup (avatars, hobbies)
- Function fixes (ambiguous user_id references)
- Event RLS policy refinements
- Role and access policy alignment
- Event tags insert/delete permissions
- Admin update permissions
- Connections table for user-to-user relationships
- Tag admin update permissions

**What they do**: Fine-tune security policies, add new features (connections), and ensure all RLS policies work correctly with the application's business logic.

---

## Verification Steps

After running migrations, verify the setup is correct:

### 1. Check All Tables Exist
In Supabase SQL Editor, run:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see ~11 tables:
- connections
- event_participants
- event_tags
- events
- hobby_tags
- hobbies
- locations
- profiles
- tags
- user_hobbies
- user_roles

### 2. Verify Enums Were Created
```sql
SELECT enum_name, enum_value 
FROM pg_enum 
ORDER BY enum_name, enumsortorder;
```

Should show:
- `event_participation_status`: joined, cancelled, pending
- `roles`: seeker, host, admin

### 3. Check Seed Data
```sql
SELECT COUNT(*) as hobby_count FROM hobbies;        -- Should be 12
SELECT COUNT(*) as tag_count FROM tags;              -- Should be 19
SELECT COUNT(*) as location_count FROM locations;    -- Should be 10
SELECT COUNT(*) as hobby_tag_count FROM hobby_tags;  -- Should be ~130+
SELECT COUNT(*) as connection_count FROM connections; -- Should be 0 (grows with users)
```

### 4. Verify RLS is Enabled
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
```

All tables should show `rowsecurity = true`.

### 5. Test Auth Trigger
1. Go to Supabase Dashboard → Authentication → Users
2. Create a test user with email/password
3. Go back to Supabase Dashboard → SQL Editor
4. Run: `SELECT * FROM profiles WHERE id = 'USER_ID_HERE';`
5. You should see a profile row auto-created with the user's email as full_name
6. Run: `SELECT * FROM user_roles WHERE user_id = 'USER_ID_HERE';`
7. You should see a role row with `role = 'seeker'`

### 6. Test RLS Policy
Create a policy test to ensure RLS is working:
```sql
-- As authenticated user, you should be able to read all profiles
SELECT * FROM profiles LIMIT 1;

-- But you should NOT be able to update another user's profile
UPDATE profiles SET bio = 'hacked' WHERE id != auth.uid();
-- This should fail or affect 0 rows
```

---

## Rollback & Reset

### Reset Everything (Development Only)

⚠️ **This will delete all data and schema!** Only use in development.

**Option 1: Supabase Dashboard**
1. Go to Supabase Dashboard → SQL Editor
2. Run: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`
3. Re-run migrations: `npm run db:setup`

**Option 2: Command**
```bash
npm run db:reset
```

### Rollback Specific Migration

Currently, the migration system doesn't support automatic rollback. To revert a specific migration:
1. Stop at the error (migrations stop on first failure)
2. Fix the SQL error in the migration file
3. Either:
   - Delete the row from `_schema_migrations` table for that migration, or
   - Drop the affected tables/functions and re-run `npm run db:setup`

**Future enhancement**: Add rollback function to `scripts/migrate.js`.

---

## Common Issues

### ❌ "VITE_SUPABASE_URL is not set in .env.local"

**Solution**: Ensure `.env.local` exists and has the correct format:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
```

### ❌ "SUPABASE_SERVICE_ROLE_KEY is not set"

**Solution**: Add service role key to `.env.local`:
```
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Get the service role key from: Supabase Dashboard → Project Settings → API → Service Role.

### ❌ "HTTP 401: Unauthorized"

**Cause**: Invalid or expired API key.

**Solution**:
1. Verify the key in `.env.local` matches Supabase dashboard
2. Check the key hasn't been rotated
3. Ensure you're using the service role key (not anon key) for SUPABASE_SERVICE_ROLE_KEY

### ❌ "Relation 'public.hobbies' already exists"

**Cause**: Migration was already applied but tracking didn't record it.

**Solution**:
1. Check if the table actually exists: `SELECT * FROM hobbies LIMIT 1;`
2. If it exists, manually insert into migrations table:
   ```sql
   INSERT INTO _schema_migrations (name) VALUES ('001_enums_and_base_tables.sql');
   ```
3. Re-run: `npm run db:setup`

### ❌ Migration Stuck / Service Unavailable

**Cause**: Supabase project temporarily unavailable or API overloaded.

**Solution**:
1. Check Supabase status page: https://status.supabase.com/
2. Wait a few minutes and retry: `npm run db:setup`
3. If issue persists, contact Supabase support

---

## Advanced: Manual Migration Execution

For advanced use cases, you can execute migrations manually:

### Execute a Single Migration Directly
```bash
# Using Supabase SQL Editor in web dashboard
-- Copy & paste contents of supabase/migrations/001_enums_and_base_tables.sql
-- Then run it
-- Then manually record: INSERT INTO _schema_migrations (name) VALUES ('001_enums_and_base_tables.sql');
```

### Execute Via Command Line (with Supabase CLI)
```bash
# Install Supabase CLI
npm install -g supabase

# Push migrations
supabase db push
```

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] All 22 migrations run successfully on development database
- [ ] RLS policies tested with different user roles (seeker, host, admin)
- [ ] Seed data verified (12 hobbies, 19 tags, 10 locations populated)
- [ ] No errors in application logs when fetching data
- [ ] User signup → profile auto-creation → role auto-assignment working
- [ ] Event creation and participation workflows functional
- [ ] Connection requests feature working
- [ ] Supabase backup created before migration
- [ ] Service role key stored securely (not in code/repo)

### Deployment Steps

1. **Create Supabase production project** (if separate from development)
2. **Backup production database** (via Supabase dashboard)
3. **Set production environment variables**:
   ```
   VITE_SUPABASE_URL=https://prod-project.supabase.co
   VITE_SUPABASE_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...  # Keep secret!
   ```
4. **Run migrations**: `npm run db:setup`
5. **Verify schema**: Spot-check key tables exist with expected structure
6. **Monitor application**: Watch for any RLS-related errors
7. **Document**: Record migration execution time, any issues, and who performed it

### Post-Deployment

- Monitor application logs for RLS violations or access errors
- Test user signup → profile auto-creation → role auto-assignment
- Verify event creation and participation workflows
- Test user connections (send/accept connection requests)
- Keep backup of service role key somewhere secure (password manager, etc.)
- Note: Hobby locations UI is not yet fully developed; database tables exist for future implementation

---

## Architecture Notes

### Why Migrations?

Migrations allow you to:
- ✅ Track all schema changes in version control
- ✅ Replay the exact schema state on any environment
- ✅ Collaborate on database changes with team members
- ✅ Know exactly what changed and in what order
- ✅ Roll back or forward between versions (future improvement)

### Why RLS?

Row-Level Security:
- ✅ Enforces access control at database level (more secure than app-level checks)
- ✅ Prevents accidental data leaks if frontend has bugs
- ✅ Works regardless of how data is accessed (API, direct SQL, etc.)
- ✅ Supported natively by Supabase

### Why Triggers?

Database triggers:
- ✅ Auto-create profiles when users sign up (no separate backend needed)
- ✅ Auto-assign default role (seeker) without application logic
- ✅ Keep timestamps accurate without app coordination
- ✅ Guaranteed to run consistently

---

## Additional Resources

- **Supabase Documentation**: https://supabase.com/docs
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Hobby Buddy Hub Database Schema**: [DB_SCHEMA.md](DB_SCHEMA.md)
- **Authentication Guide**: [AUTHENTICATION.md](AUTHENTICATION.md)
- **Project Architecture**: [README.md](README.md)
- **Project Overview**: [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)

---

## Support

If you encounter issues:

1. Check this guide's "Common Issues" section
2. Review the migration file's SQL for syntax errors
3. Check Supabase logs: Dashboard → Logs → Edge Function / Database
4. Verify environment variables in `.env.local`
5. Check Supabase project status at https://status.supabase.com/

For bugs in the migration system itself, create an issue with:
- Error message and full output from `npm run db:setup`
- Your Supabase project configuration (URL, version)
- Which migration failed
- Steps to reproduce
