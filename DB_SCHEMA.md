# Database Schema – Hobby Buddy Hub

This document describes the database structure for the Hobby Buddy Hub application.

The app uses **Supabase PostgreSQL**.

The schema is designed to support:

- authentication
- user profiles
- hobbies
- hobby events
- event participation
- activity locations
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
- locations
- events
- event_tags
- event_participants

---

## 1. profiles

Stores public user profile information.

### Purpose

Extends the Supabase `auth.users` table with application-specific profile data.

### Fields

- `id` – UUID, primary key, references `auth.users(id)`
- `full_name` – text, required
- `bio` – text, optional
- `avatar_url` – text, optional
- `city` – text, optional
- `created_at` – timestamp, default now()
- `updated_at` – timestamp, default now()

### Notes

- One profile per authenticated user
- A profile is created automatically after registration

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

## 7. locations

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

### `event-images`
Stores event cover images

Optional future bucket:

### `location-images`
Stores images for hobby locations

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

### locations

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

### View profile

1. App fetches `profiles`
2. App fetches related hobbies and events

---

## Implementation Status

### ✅ Completed

- SQL schema fully designed with all tables, relationships, and constraints
- 5 migration files created in `supabase/migrations/`:
  - `001_enums_and_base_tables.sql` – Enums, profiles, user_roles, hobbies, tags
  - `002_junction_and_relationship_tables.sql` – user_hobbies, hobby_tags, locations, events, event_tags, event_participants
  - `003_auth_triggers.sql` – Auto-create profiles on signup, auto-assign default roles, update timestamps
  - `004_rls_policies.sql` – Fine-grained row-level security for all tables
  - `005_seed_data.sql` – Initial hobbies (15), tags (20), and locations (10) with relationships
- Migration runner script created (`scripts/migrate.js`)
- npm script added: `npm run db:setup`

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

### Schema Improvements Applied

**Event Participation Status**: Uses PostgreSQL enum `event_participation_status` instead of plain text. Values: `joined`, `cancelled`, `pending`.

This improves data integrity by enforcing valid status values at the database level rather than relying on application validation.

### Production Considerations

- **Service Role Key**: Migration script uses `SUPABASE_SERVICE_ROLE_KEY` for full permissions. Keep this secret and use only for migrations.
- **Migration Idempotency**: Migrations are designed to be idempotent where possible (e.g., `CREATE TABLE IF NOT EXISTS`).
- **Audit Trail**: The `_schema_migrations` table tracks applied migrations. Never manually edit this table.
- **RLS Policies**: All tables have RLS enabled. Policies follow the principle of least privilege:
  - Public tables (hobbies, tags, locations) are readable by all
  - User data (profiles, hobbies) are user-controlled
  - Events and participants follow host/seeker/admin hierarchy
- **Performance**: Indexes created on all foreign keys and frequently queried columns
- **Backup**: Always test migrations on a development branch first
