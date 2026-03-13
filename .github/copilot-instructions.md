# Project Assignment

## Hobby Buddy Hub 

Hobby Buddy Hub is a platform that helps people discover hobbies, find others with similar interests, and organize hobby-related activities and events.

The platform connects users who want to participate in hobbies with users who organize hobby events.

Users can register and log in, explore hobbies, view events, join activities, and create events. Hosts can organize activities and manage participants.

The application is designed as a **multi-page JavaScript web app** built with HTML, CSS, Bootstrap, Vanilla JavaScript and Supabase.

# Project Requirements
## Technologies
**Front-end**: JavaScript app, HTML, CSS, Bootstrap  
* JavaScript and Bootstrap. Use UI libraries and components of your choice. Keep it simple, without TypeScript and UI frameworks like React and Vue.

**Back-end**: Supabase  
* Use Supabase as a backend (database, authentication and storage).
 
**Authentication**: Supabase Auth  
**Storage**: Supabase Storage  
**Build tools**: Node.js, npm, Vite  
**API**: Supabase REST API  
**Hosting**: Netlify or Vercel  
**Source code**: GitHub

    
## Architecture
* Use a **client-server architecture**: JavaScript frontend app with Supabase backend, communicating via the Supabase REST API.
* *Use **Node.js, npm and Vite** to structure your app with modular components.     
* Use **multi-page navigation** (instead of single page with popups) and keep each page in separate file.       
* Use **modular design**: split the app into self-contained components (e.g. UI pages, services, utils) to improve project maintenance. Avoid big and complex monolith code.                    

## UI Guidelines

* Use HTML, CSS, Bootstrap and Vanilla JS for the front-end.

* Use Bootstrap components and utilities to create a responsive and user-friendly interface.

* Implement modern, responsive UI design with semantic HTML.

* Use a consistent color scheme and typography throughout the app.

* Use icons and visual cues where appropriate.

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

## Backend
* Use **Supabase** as a backend to keep all your app data.  
* Use **Supabase DB** for data tables.
* Use **Supabase Auth** for authentication (users, register, login, logout) and authorization with JWT tokens.
* Use **Supabase Storage** to upload photos and files at the server-side.

## Database
* Expected main tables:

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

* Use best practices to design the Supabase DB schema, including normalization, indexing, and relationships.

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

#### When changing the DB schema:

* Always use migrations.

* After applying a migration in Supabase, keep a copy of the migration SQL file in the repository.

* Never edit existing migrations after they have been applied.  

* Always create a new migration for schema changes.

## Storage

* Use Supabase Storage for file uploads.

Examples:

Profile images  
Event cover images  

* Files should be stored in organized buckets.

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
