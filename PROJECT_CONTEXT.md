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

The application must support the following functionality.

### Authentication

Users can:

- register
- log in
- log out

Authentication is implemented with **Supabase Auth**.

---

### User Profiles

Each user has a profile that contains:

- name
- avatar image
- short bio
- hobbies
- upcoming events
- past events

Users can edit their own profile.

---

### Hobby Discovery

Users can browse a list of hobbies.

Example hobbies:

- Hiking
- Photography
- Chess
- Cooking
- Painting
- Dancing
- Literature
- Traveling

Each hobby can have:

- description
- image
- related events
- interest tags

Example interest tags:

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

---

### Hobby Events

Users can view events organized by hobby hosts.

Example events:

- Sunday Hiking – Vitosha
- Photography Walk
- Board Games Night
- Morning Jogging

Each event contains:

- title
- hobby category
- description
- location
- date
- host
- maximum participants
- list of participants
- image

Users can join events.

---

### Event Participation

Users can:

- join events
- view event participants
- leave events

Hosts can manage participants for their events.

---

### Hobby Locations

Users can browse locations where hobby activities can take place.

Examples:

- parks
- mountains
- cafés
- studios
- sports centers

Each location contains:

- name
- address
- description
- related hobbies

---

# Database Model

The platform uses Supabase PostgreSQL.

Main tables:

profiles
user_roles
hobbies
tags
hobby_tags
locations
events
event_tags
event_participants
user_hobbies

Relationships:

profiles ↔ user_hobbies ↔ hobbies   
hobbies ↔ hobby_tags ↔ tags     
events ↔ hobbies    
events ↔ profiles (host)    
events ↔ event_tags ↔ tags  
events ↔ event_participants ↔ profiles  
events ↔ locations  

---

# Application Pages

The application is multi-page.

Pages include:

Home page  
Login page  
Register page  
Browse hobbies  
Find people  
Events list  
Event details  
Create event  
Edit event  
User profile  
Locations page  
Admin dashboard

---

# Design Principles

The application should be:

simple  
clean  
responsive  
easy to navigate  

Use Bootstrap components and modern UI patterns.

