# Hobby Buddy Hub

Hobby Buddy Hub is a platform for discovering hobbies, finding people with similar interests, and organizing hobby-related events.

Users can register and log in, explore hobbies, view events, join activities, and create events. Hosts can organize activities and manage participants.

---

## Architecture and Tech Stack

Classical client-server app:

**Front-end**: JavaScript app, HTML, CSS, Bootstrap  
**Back-end**: Supabase  
**Database**: PostgreSQL  
**Authentication**: Supabase Auth  
**Storage**: Supabase Storage  
**Build tools**: Node.js, npm, Vite  
**API**: Supabase REST API  
**Hosting**: Netlify or Vercel  
**Source code**: GitHub

The application must remain a **multi-page JavaScript application**, not a SPA framework.

---

## Modular Design

* Use a modular code structure, with separate files for components, pages and features.

* Use ES6 modules to organize the code.

---

## UI Guidelines

* Use HTML, CSS, Bootstrap and Vanilla JS for the front-end.

* Use Bootstrap components and utilities to create a responsive and user-friendly interface.

* Implement modern, responsive UI design with semantic HTML.

* Use a consistent color scheme and typography throughout the app.

* Use icons and visual cues where appropriate.

---

## Pages and Navigation

#### Split the app into multiple pages.

Pages include:

* Home page  
* Login page  
* Registration page  
* Browse hobbies  
* Find people  
* Hobby events list  
* Event details page  
* Create event page  
* User profile page  
* Hobby locations page  
* Admin panel

Example URLs:

/  
/login  
/register  
/hobbies  
/people  
/events  
/events/{id}  
/create-event  
/profile  
/locations  
/admin  

* Use clear navigation between pages.

---

## Backend and Database

* Use Supabase as the backend and database.

* Use PostgreSQL as the database.

* Use Supabase Storage for file uploads (e.g. task attachments). 

Expected main tables:

profiles  
hobbies  
events  
event_participants  
locations  
user_hobbies  

* Relationships must be handled with foreign keys.

Example relationships:

profiles ↔ user_hobbies ↔ hobbies  
events ↔ hobbies  
events ↔ profiles (host)  
events ↔ event_participants ↔ profiles  
events ↔ locations  

#### When changing the DB schema:

* Always use migrations.

* After applying a migration in Supabase, keep a copy of the migration SQL file in the repository.

* Never edit existing migrations after they have been applied.  

* Always create a new migration for schema changes.

---

## Authentication and Authorization

* Use Supabase Auth for authentication.

Required features:

Register  
Login  
Logout  
Session persistence  

* Implement Role-Based Access Control.

Roles:

seeker – user who joins activities  
host – user who organizes events  
admin – user who manages platform content  

* Implement roles using a table:

user_roles

and an enum:

roles (seeker, host, admin)

* Use Row Level Security (RLS) policies to control access.

Examples:

Users can edit only their own profile.  
Hosts can edit only events they created.  
Participants can join events.  
Admins can manage all content.

---

## Storage

* Use Supabase Storage for file uploads.

Examples:

Profile images  
Event cover images  

* Files should be stored in organized buckets.

---

## Code Quality

Generated code must be:

Readable  
Modular  
Beginner-friendly  
Well-structured  

Avoid overly complex patterns.

Prefer simple functions and clear logic.

---

## What AI Should NOT Generate

Do NOT generate:

React  
Angular  
Vue  
Express backend  
MongoDB  
Firebase  
GraphQL  

The application must remain a **Vanilla JavaScript multi-page application using Supabase as backend**.

---

## Goal of the Project

The application must implement the following core features:

User authentication  
User profiles  
Hobby discovery  
Event creation and management  
Joining hobby events  
Browsing activity locations  
Role-based permissions