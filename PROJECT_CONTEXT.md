# Project Context – Hobby Buddy Hub

Hobby Buddy Hub is a platform that helps people discover hobbies, find others with similar interests, and organize hobby-related activities and events.

The platform connects users who want to participate in hobbies with users who organize hobby events.

The application is designed as a **multi-page JavaScript web app** built with HTML, CSS, Bootstrap, Vanilla JavaScript and Supabase.

---

# Main Idea

Many people want to start a new hobby but do not know:

- where to practice it
- who else shares the same interest
- what events exist nearby

Hobby Buddy Hub solves this by providing:

- a catalog of hobbies
- a list of people with shared interests
- hobby-related events
- locations suitable for activities

---

# Main User Types

### Hobby Seeker

A user who wants to discover hobbies and join activities.

Capabilities:

- browse hobbies
- search for people with similar interests
- view events
- join events
- manage their profile

---

### Hobby Host

A user who organizes hobby events.

Capabilities:

- create events
- edit events
- delete events
- manage event participants
- choose event location
- upload event images

Hosts can also participate in events created by others.

---

### Admin

Platform administrator.

Capabilities:

- manage users
- manage hobbies
- manage events
- manage locations
- moderate inappropriate content

---

# Core Features

The application supports the following functionality.

### Authentication ✅

Users can:

- register
- log in
- log out
- session persistence across page reloads

Authentication is implemented with **Supabase Auth**.

**Status**: Fully implemented with JWT tokens and localStorage persistence.

---

### User Profiles ✅

Each user has a profile that contains:

- name
- email
- avatar image
- short bio
- hobbies list
- city/location
- created and updated timestamps

Users can:
- view their own profile
- edit their own profile
- upload/change avatar image
- manage their hobbies

**Status**: Fully implemented with profile management and image uploads.

---

### Hobby Discovery ✅

Users can browse a list of hobbies with filtering and discovery features.

Available hobbies:

- Paint Art
- Hiking
- Music & Instruments
- Cooking
- Literature & Reading
- Chess
- Dancing
- Photography
- Cycling Sport
- Yoga & Meditation
- Rock Climbing
- Travel & Exploration

Each hobby displays:

- name and description
- cover image
- related events
- interest tags
- number of participants
- hobby details page

Interest tags include:

- Adventure
- All Ages
- Beginner Friendly
- Casual
- Competitive
- Creative
- Cultural
- Evening Activity
- Group Activity
- Indoor
- Just for Fun
- Mindful
- Nature
- Outdoor
- Relaxing
- Skill Building
- Social
- Sport
- Weekend Activity

**Status**: Fully implemented with hobby browsing, details page, and tag filtering.

---

### Hobby Events ✅

Users can view, create, and manage events organized by hobby hosts.

Each event contains:

- title and description
- hobby category
- location *(location management not yet developed)*
- event date and time
- host information
- maximum participants capacity
- current participant list
- event cover image
- event tags

Features:
- Browse all events with filtering
- View event details and participant list
- Join/leave events
- Hosts can create events
- Hosts can edit their own events
- Hosts can delete their own events

**Status**: Fully implemented with event creation, browsing, and participation management.

---

### Event Participation ✅

Users can:

- join events
- view event participants
- leave events
- see other participants interested in same hobby

Hosts can:
- view all participants for their events
- see participant details
- manage event capacity

**Status**: Fully implemented with participant tracking and management.

---

### User Connections ✅

Users can connect with each other to build their network.

Features:
- Send connection requests to other users
- View pending connection requests
- Accept or reject connection requests
- Block users if needed
- View list of accepted connections
- Manage your network

Connection statuses:
- `pending` – Connection request sent, awaiting response
- `accepted` – Connected users can see each other
- `rejected` – Request declined
- `blocked` – User blocked the connection

**Status**: Fully implemented with connection request system and management.

---

### Hobby Locations ❌ *(not yet developed)*

Location management is planned but not yet fully developed in the UI.

Planned features:
- Users can browse locations where hobby activities can take place
- View location details and nearby events
- See hobbies associated with locations

Example locations:

- parks
- mountains
- cafés
- studios
- sports centers

Planned location information:

- name and address
- description
- cover image
- related hobbies
- upcoming events at location

**Status**: Database tables exist but UI functionality not yet implemented.

---

# Database Model

The platform uses Supabase PostgreSQL with 11 tables.

Main tables:

- profiles – User profile information
- user_roles – Role assignment (seeker, host, admin)
- hobbies – Hobby categories
- tags – Interest and activity tags
- hobby_tags – Hobby-tag relationships
- locations – Activity locations *(not yet developed)*
- events – Hobby events
- event_tags – Event-tag relationships
- event_participants – Event participation tracking
- user_hobbies – User hobby interests
- connections – User-to-user connections and friend requests

Relationships:

- profiles ↔ user_hobbies ↔ hobbies
- hobbies ↔ hobby_tags ↔ tags
- events ↔ hobbies
- events ↔ profiles (host)
- events ↔ event_tags ↔ tags
- events ↔ event_participants ↔ profiles
- events ↔ locations
- profiles ↔ connections ↔ profiles (self-referential)

For detailed schema information, see [DB_SCHEMA.md](DB_SCHEMA.md).  

---

# Application Pages

The application is multi-page with responsive navigation.

Implemented pages:

- **/** – Home page with introduction
- **/login** – User login
- **/register** – User registration
- **/hobbies** – Browse all hobbies
- **/hobby-details** – Single hobby details and related events
- **/events** – Browse all events
- **/event-details** – Single event details and participants
- **/create-event** – Create new event (hosts only)
- **/profile** – User profile management
- **/dashboard** – User dashboard with summary
- **/people** – Browse and discover other users
- **/my-connections** – User's network and connections
- **/admin** – Admin panel for platform management

Planned pages:

- **/locations** – Hobby locations page *(not yet developed)*

---

# Technology Stack

**Frontend**:
- HTML5
- CSS3
- Bootstrap 5
- Vanilla JavaScript (ES6+)
- Vite (build tool)

**Backend**:
- Supabase PostgreSQL
- Supabase Authentication
- Supabase Storage
- Row Level Security (RLS) policies

**Deployment**:
- Ready for Netlify/Vercel
- GitHub for version control

---

# Design Principles

The application is designed to be:

- **Simple** – Clear and intuitive user interface
- **Clean** – Minimal and focused UI elements
- **Responsive** – Works on desktop, tablet, and mobile
- **Easy to navigate** – Clear navigation between pages

Uses Bootstrap components and modern UI patterns.

---

# Implementation Status

## ✅ Completed Features

- User authentication (register, login, logout, session persistence)
- User profiles (create, edit, avatar upload)
- Hobby discovery and browsing
- Hobby details page
- Event creation and management
- Event browsing and joining
- User connections and friend requests
- Role-based access control (seeker, host, admin)
- Admin panel for content management
- Dashboard for user overview
- People discovery and browsing
- Responsive navigation with Bootstrap
- Comprehensive documentation

## ❌ Not Yet Developed

- Hobby locations page and management
- Advanced search and filtering (partial)
- Event editing by hosts
- User profile customization (partial)
- Email notifications
- Event ratings and reviews
- User recommendations
- Analytics dashboard

## 📋 Database & Infrastructure

- 22 migrations applied
- All required tables created
- RLS policies implemented
- Storage buckets configured
- Row Level Security enforced
- Comprehensive indexing for performance

For detailed database information, see [DB_SCHEMA.md](DB_SCHEMA.md).  
For authentication details, see [AUTHENTICATION.md](AUTHENTICATION.md).

