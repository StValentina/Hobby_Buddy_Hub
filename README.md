# Hobby Buddy Hub

A multi-page JavaScript web application that helps people discover hobbies, find others with similar interests, and organize hobby-related activities and events.

**Tech Stack**: Vanilla JavaScript • HTML5 • CSS3 • Bootstrap 5 • Vite • Supabase

---

## 📋 Project Overview

Hobby Buddy Hub is a community platform connecting **hobby seekers** (who want to discover and join activities) with **hobby hosts** (who organize events). The platform includes role-based access control and admin management for platform content.

**Key Features**:
- User authentication and profiles
- Browse hobbies with interest tags
- Create, manage, and join events
- User connections and networking
- Role-based access control (seeker, host, admin)
- Admin panel for platform management

For detailed feature description, see [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md).

---

## 🏗️ Architecture

### Frontend
- **Type**: Multi-page application (MPA)
- **Framework**: Vanilla JavaScript (ES6+)
- **Build Tool**: Vite
- **UI**: Bootstrap 5 with custom CSS
- **Structure**: Self-contained pages with shared components

### Backend
- **Database**: Supabase PostgreSQL (11 tables)
- **Authentication**: Supabase Auth (JWT tokens)
- **Storage**: Supabase Storage (avatars, event images, hobby images)
- **Security**: Row Level Security (RLS) policies
- **Migrations**: 22 applied migrations with full schema


**Relationships**: User profiles connect to hobbies, events, and other users. Events link hobbies with locations and participants. Full schema details in [DB_SCHEMA.md](DB_SCHEMA.md).

---

## 📁 Project Structure

```
Hobby_Buddy_Hub/
├── src/
│   ├── config.js               # Supabase configuration
│   ├── components/             # Reusable UI components
│   │   ├── header.js
│   │   ├── footer.js
│   │   └── loader.js
│   ├── pages/                  # Page-specific logic
│   │   ├── home.js
│   │   ├── hobbies.js
│   │   ├── events.js
│   │   ├── profile.js
│   │   ├── auth/
│   │   │   ├── login.js
│   │   │   └── register.js
│   │   └── ...
│   ├── services/
│   │   └── api.js              # APIService for Supabase operations
│   ├── styles/                 # Component and page styles
│   └── utils/                  # Shared utilities
│
├── pages/                      # HTML page templates
│   ├── hobbies.html
│   ├── hobby-details.html
│   ├── events.html
│   ├── event-details.html
│   ├── create-event.html
│   ├── profile.html
│   ├── dashboard.html
│   ├── people.html
│   ├── my-connections.html
│   ├── admin.html
│   ├── auth/
│   │   ├── login.html
│   │   └── register.html
│   └── components/
│       ├── header.html
│       └── footer.html
│
├── public/                     # Static assets
│   ├── css/
│   │   └── global.css
│   └── js/
│       └── global.js
│
├── supabase/
│   ├── migrations/             # 22 database migrations
│   └── queries/                # SQL utilities
│
├── index.html                  # Main entry point
├── vite.config.js              # Build configuration
├── package.json
└── README.md
```

**Key Files**:
- `src/services/api.js` – APIService class for all database operations
- `src/components/header.js` – Navigation with authentication support
- `supabase/migrations/` – Database schema and setup
- `index.html` – Home page entry point
- `pages/*.html` – Page templates
- `src/pages/*.js` – Page logic and event handlers

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Supabase account with a project

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase
Create `.env.local` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # For migrations only
```

### 3. Run Database Migrations
```bash
npm run db:setup
```

This applies all 22 migrations to set up the database schema.

### 4. Start Development Server
```bash
npm run dev
```

App runs at `http://localhost:5173`

### 5. Build for Production
```bash
npm run build
npm run preview
```

---

## 📚 Documentation

- **[PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)** – Features, user types, implementation status
- **[DB_SCHEMA.md](DB_SCHEMA.md)** – Database tables, relationships, RLS policies, migrations
- **[AUTHENTICATION.md](AUTHENTICATION.md)** – Auth flow, role-based access, troubleshooting
- **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** – Database migration instructions

---

## ✅ Current Status

**Implemented**: Authentication, user profiles, hobby discovery, event management, user connections, admin panel, dashboard

**Not Yet Developed**: Hobby locations page, event editing by hosts, email notifications, advanced search, analytics

See [Implementation Status](PROJECT_CONTEXT.md#implementation-status) for details.

---

## 🔧 Technologies

**Frontend**: Vanilla JavaScript • HTML5 • CSS3 • Bootstrap 5 • Vite

**Backend**: Supabase PostgreSQL • Supabase Auth • Supabase Storage

**Deployment**: Netlify

**Version Control**: GitHub

---

## 📝 License

MIT License – 2026 Hobby Buddy Hub
