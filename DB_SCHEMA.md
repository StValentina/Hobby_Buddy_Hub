# Database Schema – Hobby Buddy Hub

This document describes the database structure for the Hobby Buddy Hub application.

The app uses **Supabase PostgreSQL**.

The schema is designed to support:

- authentication
- user profiles
- hobbies
- hobby events
- event participation
- activity locations *(not yet developed)*
- role-based permissions
- file uploads
- tags for hobbies

---

## General Notes

- Authentication is handled by **Supabase Auth**
- Every authenticated user has a related row in the `profiles` table
- Roles are stored separately and used for authorization
- Many-to-many relationships are implemented with junction tables
- Foreign keys must be used to preserve relational integrity
- All schema changes must be made through migrations

---

## Main Tables Overview

Main entities:

- profiles
- user_roles
- hobbies
- tags
- user_hobbies
- hobby_tags
- locations *(not yet developed)*
- events
- event_tags
- event_participants
- connections

---

## 1. profiles

Stores public user profile information.

### Purpose

Extends the Supabase `auth.users` table with application-specific profile data.

### Fields

- `id` – UUID, primary key, references `auth.users(id)`
- `full_name` – text, required
- `email` – text, optional (synced from auth.users during signup)
- `bio` – text, optional
- `avatar_url` – text, optional
- `city` – text, optional
- `created_at` – timestamp, default now()
- `updated_at` – timestamp, default now()

### Notes

- One profile per authenticated user
- A profile is created automatically after registration via trigger
- Email is populated from Supabase Auth and kept in sync
- Avatar URL points to files in Supabase Storage (avatars bucket)
- Profile data is used for display across the application

---

## 2. user_roles

Stores the role of each user.

### Purpose

Supports role-based access control.

### Fields

- `id` – UUID, primary key, default generated
- `user_id` – UUID, required, references `profiles(id)`
- `role` – enum `roles`, required
- `created_at` – timestamp, default now()

### Allowed Roles

- `seeker`
- `host`
- `admin`

### Notes

- Most users will have one role
- A simple implementation can enforce one row per user
- Default role after registration can be `seeker`
- Optional: allow users to choose between `seeker` and `host` during sign-up

---

## 3. hobbies

Stores hobby categories available in the platform.

#### Purpose

Allows users to browse hobbies and connect events and users to hobbies.

### Fields

- `id` – UUID, primary key, default generated
- `name` – text, required, unique
- `description` – text, optional
- `image_url` – text, optional
- `created_at` – timestamp, default now()

### Example Values

- Hiking
- Photography
- Chess
- Cooking
- Painting
- Dancing
- Literature
- Traveling

### Notes

- Usually managed by admin
- May be seeded initially with predefined hobbies

---

## 4. tags

Stores reusable interest and activity style tags.

### Purpose

Allows hobbies and events to be categorized with descriptive tags that support filtering, searching and better matching between users, hobbies and activities.

### Fields

- `id` – UUID, primary key, default generated
- `name` – text, required, unique
- `created_at` – timestamp, default now()

### Example Values

- Casual / Just for fun
- Beginner friendly
- Skill building
- Collaborative
- Relaxing / mindful
- Adventure seeker
- Nature relaxation
- Book discussions
- Reading for relaxation
- Recipe exploration
- Cooking together
- Experimental cuisine
- City exploration
- Nature trips
- Weekend escapes

### Notes

- Tags are reusable across hobbies and events
- Usually managed by admin
- Tags can be seeded initially

---

## 5. user_hobbies

Junction table between users and hobbies.

### Purpose

Stores which hobbies belong to a user profile.

### Fields

- `id` – UUID, primary key, default generated
- `profile_id` – UUID, required, references `profiles(id)`
- `hobby_id` – UUID, required, references `hobbies(id)`
- `created_at` – timestamp, default now()

### Constraints

- Unique pair: (`profile_id`, `hobby_id`)

### Notes

- A user can have many hobbies
- A hobby can belong to many users

---

## 6. hobby_tags

Junction table between hobbies and tags.

### Purpose

Stores which tags describe a hobby.

### Fields

- `id` – UUID, primary key, default generated
- `hobby_id` – UUID, required, references `hobbies(id)`
- `tag_id` – UUID, required, references `tags(id)`
- `created_at` – timestamp, default now()

### Constraints

- Unique pair: (`hobby_id`, `tag_id`)

### Notes

- A hobby can have many tags
- A tag can be used for many hobbies

---

## 7. locations *(not yet developed)*

Stores locations where hobby activities can happen.

### Purpose

Supports event organization and browsing of activity places.

### Fields

- `id` – UUID, primary key, default generated
- `name` – text, required
- `city` – text, optional
- `address` – text, optional
- `description` – text, optional
- `image_url` – text, optional
- `created_by` – UUID, optional, references `profiles(id)`
- `created_at` – timestamp, default now()

### Example Values

- Vitosha Mountain
- Borisova Garden
- Local Art Studio
- Community Chess Club
- Downtown Coffee House

### Notes

- Can be created by admin only, or by hosts if you want extended functionality
- Events reference a location

---

## 8. events

Stores hobby events created by hosts.

### Purpose

Main event entity in the application.

### Fields

- `id` – UUID, primary key, default generated
- `title` – text, required
- `description` – text, optional
- `hobby_id` – UUID, required, references `hobbies(id)`
- `host_id` – UUID, required, references `profiles(id)`
- `location_id` – UUID, required, references `locations(id)`
- `event_date` – timestamp, required
- `max_participants` – integer, required
- `image_url` – text, optional
- `created_at` – timestamp, default now()
- `updated_at` – timestamp, default now()

### Notes

- Only hosts and admins can create events
- A host can manage only their own events
- Users can view event details and join events

---

## 9. event_tags

Junction table between events and tags.

### Purpose

Stores which tags describe a specific event.

### Fields

- `id` – UUID, primary key, default generated
- `event_id` – UUID, required, references `events(id)`
- `tag_id` – UUID, required, references `tags(id)`
- `created_at` – timestamp, default now()

### Constraints

- Unique pair: (`event_id`, `tag_id`)

### Notes

- An event can have many tags
- A tag can be used for many events
- Event tags may be more specific than hobby tags

---

## 10. event_participants

Junction table between users and events.

### Purpose

Tracks which users joined which events.

### Fields

- `id` – UUID, primary key, default generated
- `event_id` – UUID, required, references `events(id)`
- `profile_id` – UUID, required, references `profiles(id)`
- `joined_at` – timestamp, default now()
- `status` – text or enum, optional

### Example Status Values

- joined
- cancelled
- pending

### Constraints

- Unique pair: (`event_id`, `profile_id`)

### Notes

- A user can join many events
- An event can have many participants
- The host should not be duplicated as participant unless explicitly allowed

---

## 11. connections

Tracks user connections and friend requests.

### Purpose

Enables users to connect with each other and manage friendship relationships.

### Fields

- `id` – UUID, primary key, default generated
- `requester_id` – UUID, required, references `profiles(id)`
- `receiver_id` – UUID, required, references `profiles(id)`
- `status` – text, required, default: `'pending'`
- `created_at` – timestamp, default now()

### Allowed Status Values

- `pending` – Connection request sent, awaiting response
- `accepted` – Connection request accepted, users are connected
- `rejected` – Connection request rejected
- `blocked` – User blocked the other user

### Constraints

- Foreign keys ensure referential integrity
- `requester_id` must be different from `receiver_id` (cannot connect to self)
- Unique pair: (`requester_id`, `receiver_id`) prevents duplicate requests in same direction

### Notes

- Tracks one-directional request and response flow
- Users can view connections they initiated or received
- Users can accept/reject/block connections
- Deleted connections cascade from profiles (when user deletes account)
- Indexed on requester_id, receiver_id, and status for efficient queries

## Relationships Summary

### One-to-One

- `auth.users` → `profiles`

### One-to-Many

- `profiles` → `events` (host creates many events)
- `locations` → `events`
- `hobbies` → `events`

### Many-to-Many

- `profiles` ↔ `hobbies` through `user_hobbies`
- `hobbies` ↔ `tags` through `hobby_tags`
- `events` ↔ `tags` through `event_tags`
- `profiles` ↔ `events` through `event_participants`
- `profiles` ↔ `profiles` through `connections` (self-referential for user relationships)

---

## Suggested Enums

### roles

Values:

- seeker
- host
- admin

### Optional event_participation_status

Values:

- joined
- cancelled
- pending

---

## Suggested Storage Buckets

Use Supabase Storage for:

### `avatars`
Stores user profile images
- File naming: `{user_id}/{filename}`
- Public read access enabled
- Upload URL stored in profiles.avatar_url

### `hobbies`
Stores hobby category cover images
- File naming: `{hobby_id}/{filename}`
- Public read access enabled
- Upload URL stored in hobbies.image_url

Optional future bucket:

### `locations`
Stores images for hobby locations
- File naming: `{location_id}/{filename}`
- Public read access enabled
- Upload URL stored in locations.image_url

### `events`
Stores event cover/banner images
- File naming: `{event_id}/{filename}`
- Public read access enabled
- Upload URL stored in events.image_url

---

## Suggested Access Rules

### Public Read Access

These can usually be publicly readable:

- hobbies
- tags
- hobby_tags
- locations
- events
- event_tags
- public profiles

### Authenticated User Access

Authenticated users can:

- update their own profile
- manage their own user hobbies
- join and leave events
- create connection requests to other users
- accept/reject/block connection requests
- view their own connections and pending requests

### Host Access

Hosts can:

- create events
- edit their own events
- delete their own events
- view participants for their own events
- manage tags for their own events

### Admin Access

Admins can:

- manage hobbies
- manage tags
- manage hobby tags
- manage locations
- manage all events
- manage event tags
- manage roles
- moderate platform data

---

## Suggested RLS Logic

### profiles

- users can read profiles
- users can update only their own profile

### user_roles

- users can read their own role
- admins can manage all roles

### hobbies

- everyone can read
- only admins can insert, update, delete

### tags

- everyone can read
- only admins can insert, update, delete

### user_hobbies

- users can manage only their own hobbies
- admins can read all if needed

### hobby_tags

- everyone can read
- only admins can insert, update, delete

### locations *(not yet developed)*

- everyone can read
- only admins or hosts can create
- only creator or admin can edit/delete

### events

- everyone can read
- only hosts/admins can create
- only event host or admin can update/delete

### event_tags

- everyone can read
- only event host or admin can insert/delete

### event_participants

- authenticated users can join events for themselves
- users can remove only their own participation
- hosts can read participants for their events
- admins can read/manage all

### connections

- users can view their own connections (as requester or receiver)
- users can create connection requests (as requester)
- users can update received connection requests (as receiver)
- users can delete their own connections (as requester or receiver)

---

## Recommended Validation Rules

### profiles

- `full_name` should not be empty
- `bio` should have a reasonable max length

### hobbies

- `name` must be unique
- `name` should not be empty

### tags

- `name` must be unique
- `name` should not be empty

### hobby_tags

- no duplicate hobby-tag pairs

### events

- `title` should not be empty
- `event_date` must be in the future when creating
- `max_participants` must be greater than 0

### event_tags

- no duplicate event-tag pairs

### event_participants

- no duplicate joins
- do not allow joining if max participants is reached

---

## Example User Flows Supported by This Schema

### Registration

1. User signs up with Supabase Auth
2. A profile row is created
3. A default role row is created

### Browse hobbies

1. User opens hobbies page
2. App fetches data from `hobbies`

### Add hobbies to profile

1. User selects hobbies
2. App inserts rows into `user_hobbies`

### Browse hobbies by tags

1. User opens hobbies page
2. App fetches hobby-tag relationships from `hobby_tags`
3. App displays related tag badges for each hobby

### Create event

1. Host opens create event page
2. Chooses hobby and location
3. Chooses optional tags
4. Submits form
5. App inserts row into `events`
6. App inserts related rows into `event_tags`

### Join event

1. User opens event details
2. Clicks Join
3. App inserts row into `event_participants`

### Send connection request

1. User opens another user's profile
2. Clicks "Send Connection Request" or "Add as Connection"
3. App inserts row into `connections` with status `'pending'`
4. Requester can view their sent requests
5. Receiver is notified of connection request

### Accept/Reject connection

1. User opens "Connection Requests" or similar page
2. Views pending connection requests
3. Clicks Accept or Reject on a request
4. App updates `connections` row with status `'accepted'` or `'rejected'`
5. Connection status is reflected in user interface

### View profile

1. App fetches `profiles`
2. App fetches related hobbies and events
3. App checks connection status via `connections` table
4. Displays connection status button if applicable

---

## Implementation Status

### ✅ Completed

- SQL schema fully designed with all tables, relationships, and constraints
- 22 migration files created and applied in `supabase/migrations/`:
  - `001_enums_and_base_tables.sql` – Enums, profiles, user_roles, hobbies, tags
  - `002_junction_and_relationship_tables.sql` – user_hobbies, hobby_tags, locations, events, event_tags, event_participants
  - `003_auth_triggers.sql` – Auto-create profiles on signup, auto-assign default roles, update timestamps
  - `004_rls_policies.sql` – Fine-grained row-level security for all tables
  - `005_seed_data.sql` – Initial hobbies (15), tags (20), and locations (10) with relationships
  - `006_fix_public_access.sql` – Public read policies for hobbies, tags, locations, events
  - `007_add_public_read_policies.sql` – Additional public read policies
  - `008_delete_hobbies.sql` – Fix hobby deletion to properly cascade
  - `009_add_email_to_profiles.sql` – Add email field to profiles table
  - `010_fix_email_unique_constraint.sql` – Make email field properly unique
  - `011_ensure_trigger_handles_email.sql` – Ensure profile trigger populates email
  - `012_verify_and_fix_rls.sql` – Verify and fix RLS policies
  - `013_setup_storage_bucket.sql` – Setup avatars bucket for Supabase Storage
  - `014_ensure_avatars_bucket_exists.sql` – Ensure avatars bucket is properly configured
  - `015_fix_ambiguous_user_id_helpers.sql` – Fix ambiguous user_id references in functions
  - `016_fix_events_rls_for_own_records.sql` – Fix RLS for event ownership queries
  - `017_align_roles_and_access_policies.sql` – Align roles with RLS policies
  - `018_enable_event_tags_insert_delete.sql` – Enable insert/delete for event tags
  - `019_fix_user_roles_admin_update.sql` – Fix admin permissions for user_roles
  - `020_ensure_hobbies_bucket_exists.sql` – Setup hobbies bucket for Supabase Storage
  - `021_create_connections_table.sql` – Create connections table for user-to-user relationships
  - `022_fix_tags_admin_update_permissions.sql` – Fix admin permissions for tag updates

### Database Features Implemented

- **Authentication**: Supabase Auth with automatic profile creation
- **User Profiles**: Full user profile management with avatar support
- **Role-Based Access Control**: Three roles (seeker, host, admin) with RLS enforcement
- **Hobby Management**: Browse and manage user hobbies with tag categorization
- **Event Management**: Complete event lifecycle (create, edit, delete, join)
- **User Connections**: Friend requests and connection management
- **File Storage**: Avatar and hobby image storage via Supabase Storage
- **Data Integrity**: Foreign keys, constraints, and validation rules
- **Performance**: Indexes on frequently queried columns for optimization
- **Row Level Security**: Granular access control at database level

### ⏭️ Next Steps

1. **Install dependencies**: `npm install` (adds `dotenv` for migration runner)
2. **Configure Supabase credentials** in `.env.local`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_KEY=your-public-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # For migrations
   ```
3. **Run migrations**: `npm run db:setup`
4. **Verify schema**: Check Supabase dashboard for tables and RLS policies
5. **Test auth trigger**: Create a user via Supabase Auth UI, verify profile auto-created
6. **Test connections**: Use the connections API to test friend request flows

### Current Architecture

**Frontend**: Vanilla JavaScript, HTML, CSS, Bootstrap
- `src/services/api.js` – APIService for database operations
- `src/pages/*` – Multi-page application structure
- `src/components/*` – Reusable components (header, footer, loader)

**Backend**: Supabase PostgreSQL
- 11 tables with proper relationships
- RLS policies for security
- Triggers for automation
- Indexes for performance

**Storage**: Supabase Storage
- `avatars` bucket – User profile images
- `hobbies` bucket – Hobby category images
- Optional `locations` bucket – Location images

### API Integration

The `APIService` class in [src/services/api.js](src/services/api.js) provides methods for:
- Authentication (register, login, logout)
- User profiles (getProfile, updateProfile)
- Hobbies (getHobbies, getHobbyById)
- Events (getEvents, getEventById, createEvent, joinEvent)
- Connections (getConnections, sendConnectionRequest, acceptConnection, rejectConnection)
- File uploads (avatar, event images)

### Schema Improvements Applied

**Event Participation Status**: Uses PostgreSQL enum `event_participation_status` instead of plain text. Values: `joined`, `cancelled`, `pending`.

**Connection Status**: Uses CHECK constraint to enforce valid status values. Values: `pending`, `accepted`, `rejected`, `blocked`.

These improvements ensure data integrity by enforcing valid values at the database level rather than relying on application validation.

### Production Considerations

- **Service Role Key**: Migration script uses `SUPABASE_SERVICE_ROLE_KEY` for full permissions. Keep this secret and use only for migrations.
- **Migration Idempotency**: Migrations are designed to be idempotent where possible (e.g., `CREATE TABLE IF NOT EXISTS`).
- **Audit Trail**: The `_schema_migrations` table tracks applied migrations. Never manually edit this table.
- **RLS Policies**: All tables have RLS enabled. Policies follow the principle of least privilege:
  - Public tables (hobbies, tags, locations, events) are readable by all
  - User data (profiles, connections) are user-controlled
  - Events and participants follow host/seeker/admin hierarchy
  - Connections are bidirectional visibility (requester and receiver can see)
- **Cascade Deletes**: Profile deletions cascade to connections, events, and event_participants
- **Performance**: Indexes created on all foreign keys and frequently queried columns
- **Backup**: Always test migrations on a development branch first

---

## Common Query Patterns

These patterns demonstrate how to retrieve data efficiently from the database using the schema design.

### Retrieve User Profile with Hobbies

```sql
SELECT 
  p.*,
  ARRAY_AGG(h.name) as hobbies
FROM profiles p
LEFT JOIN user_hobbies uh ON p.id = uh.profile_id
LEFT JOIN hobbies h ON uh.hobby_id = h.id
WHERE p.id = $1
GROUP BY p.id;
```

### Get All Events for a Hobby with Participant Count

```sql
SELECT 
  e.*,
  h.name as hobby_name,
  COUNT(DISTINCT ep.profile_id) as participant_count
FROM events e
JOIN hobbies h ON e.hobby_id = h.id
LEFT JOIN event_participants ep ON e.id = ep.event_id
WHERE e.hobby_id = $1
GROUP BY e.id, h.id
ORDER BY e.event_date ASC;
```

### Get User's Accepted Connections

```sql
SELECT 
  CASE 
    WHEN c.requester_id = $1 THEN c.receiver_id 
    ELSE c.requester_id 
  END as connected_user_id,
  p.full_name,
  p.avatar_url,
  c.status,
  c.created_at
FROM connections c
JOIN profiles p ON (
  (c.requester_id = $1 AND p.id = c.receiver_id) OR
  (c.receiver_id = $1 AND p.id = c.requester_id)
)
WHERE c.status = 'accepted'
  AND (c.requester_id = $1 OR c.receiver_id = $1);
```

### Get Pending Connection Requests for User

```sql
SELECT 
  c.id,
  c.requester_id,
  p.full_name,
  p.avatar_url,
  c.created_at
FROM connections c
JOIN profiles p ON c.requester_id = p.id
WHERE c.receiver_id = $1 
  AND c.status = 'pending'
ORDER BY c.created_at DESC;
```

### Get Hobbies with Associated Tags

```sql
SELECT 
  h.*,
  ARRAY_AGG(JSON_BUILD_OBJECT('id', t.id, 'name', t.name)) as tags
FROM hobbies h
LEFT JOIN hobby_tags ht ON h.id = ht.hobby_id
LEFT JOIN tags t ON ht.tag_id = t.id
GROUP BY h.id
ORDER BY h.name ASC;
```

### Get User's Upcoming Events

```sql
SELECT 
  e.*,
  h.name as hobby_name,
  l.address as location_address,
  (SELECT COUNT(*) FROM event_participants WHERE event_id = e.id) as participant_count
FROM events e
JOIN hobbies h ON e.hobby_id = h.id
JOIN locations l ON e.location_id = l.id
WHERE e.id IN (
  SELECT event_id FROM event_participants WHERE profile_id = $1
)
AND e.event_date > now()
ORDER BY e.event_date ASC;
```

---

## Database Performance Tips

1. **Use indexes**: All foreign key columns and status fields are indexed
2. **Eager loading**: Load related data with JOINs rather than N+1 queries
3. **Aggregate functions**: Use ARRAY_AGG for relationships instead of multiple queries
4. **Filter early**: Apply WHERE clauses before JOINs when possible
5. **Pagination**: Use LIMIT and OFFSET for large result sets
6. **Connection pooling**: Supabase handles connection pooling automatically

---

## Troubleshooting Common Issues

### Foreign Key Constraint Violations

**Problem**: Getting error when trying to insert/update records
**Solution**: Verify:
- Parent record exists before referencing it
- Profile exists for user (should be auto-created on signup)
- Referenced IDs match the expected UUID format

### RLS Policy Denial

**Problem**: Getting "permission denied" when querying data
**Solution**:
- Verify user is authenticated (has valid JWT)
- Check if user's role matches policy requirements
- Ensure RLS policies are correctly configured in migrations
- Check that the user has permission for the operation (SELECT, INSERT, UPDATE, DELETE)

### Silent Data Retrieval Failures

**Problem**: Queries return empty results unexpectedly
**Solution**:
- Check RLS policies on the table
- Verify filters in WHERE clause match actual data
- Check data types match (UUID vs string)
- Enable query logging in Supabase to see actual queries

---

## Migration Strategy

### How Migrations Work

1. **Migration Files**: SQL files in `supabase/migrations/` numbered sequentially
2. **Tracking**: Supabase tracks applied migrations in `_schema_migrations` table
3. **Ordering**: Migrations execute in numerical order (001, 002, etc.)
4. **Idempotency**: Each migration should be safe to run multiple times

### Migration Categories

**Schema Migrations**:
- `001_enums_and_base_tables.sql` – Domain models
- `002_junction_and_relationship_tables.sql` – Relationships
- `013_setup_storage_bucket.sql` – File storage setup
- `021_create_connections_table.sql` – Feature additions

**Trigger and Function Migrations**:
- `003_auth_triggers.sql` – Automation on data changes
- `015_fix_ambiguous_user_id_helpers.sql` – Helper functions

**Policy Migrations**:
- `004_rls_policies.sql` – Security controls
- `006_fix_public_access.sql` – Access refinements
- `016_fix_events_rls_for_own_records.sql` – Bug fixes
- `017_align_roles_and_access_policies.sql` – Policy alignment

**Data Migrations**:
- `005_seed_data.sql` – Initial data population
- `009_add_email_to_profiles.sql` – Schema modifications with data handling

### Running Migrations Manually

```bash
# Run all pending migrations
npm run db:setup

# Or manually via Supabase CLI
supabase migration up
```

### Creating New Migrations

1. Create new file: `supabase/migrations/NNN_description.sql`
2. Use sequential numbering
3. Include IF NOT EXISTS checks for idempotency
4. Add RLS policies for new tables
5. Test on development branch first
6. Apply and verify in Supabase dashboard

### Rollback Strategy

**Note**: Supabase doesn't support automatic rollbacks. Instead:

1. Create a new migration that undoes the changes
2. Test in development branch
3. Apply the fix migration
4. Never delete applied migrations

Example revert migration:
```sql
-- 023_revert_feature.sql
DROP TABLE IF EXISTS feature_table;
DROP POLICY IF EXISTS policy_name ON table_name;
```

---

## References and Resources

- [Supabase Database Documentation](https://supabase.com/docs/guides/database)
- [Row Level Security (RLS) Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Project Architecture](PROJECT_CONTEXT.md)
- [Authentication Guide](AUTHENTICATION.md)
- [API Service Documentation](src/services/api.js)
