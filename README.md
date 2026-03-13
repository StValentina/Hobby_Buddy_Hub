# Hobby Buddy Hub - Multi-Page Application

A vanilla JavaScript multi-page application built with Vite, Bootstrap, and Supabase.

## Project Structure

```
src/
├── pages/              # Application pages (dynamically routed)
│   ├── index/         # Home page (/)
│   └── dashboard/     # Dashboard page (/dashboard)
├── components/        # Reusable components
│   ├── header.js      # Navigation header
│   └── footer.js      # Footer component
├── services/          # API and business logic
│   └── api.js        # Supabase API service
├── utils/            # Utility functions
│   └── router.js     # Client-side router
├── styles/           # Global styles
│   └── main.css      # Main stylesheet
├── config.js         # Configuration
├── app.js           # App initialization
└── main.js          # Entry point

public/              # Static assets

index.html           # Main HTML file

package.json         # Dependencies
vite.config.js       # Vite configuration
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory with your Supabase credentials:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_KEY=your-supabase-anon-key
```

### 3. Development Server

Start the development server:

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

Output files will be in the `dist/` directory.

### 5. Preview Production Build

```bash
npm run preview
```

## Architecture

### Routing System

The application uses a custom client-side router (`src/utils/router.js`) that:
- Maps URL paths to page components
- Handles page transitions with animations
- Manages browser history (back/forward buttons)
- Prevents full page reloads

### Page Structure

Each page is a class that implements:
- `render()` - Renders the page content
- `setup()` - Optional setup logic (event listeners, data loading)
- `teardown()` - Optional cleanup logic

Example:
```javascript
export class IndexPage {
  async render() {
    // Render HTML content
  }
  
  async setup() {
    // Setup event listeners, load data
  }
  
  teardown() {
    // Cleanup
  }
}
```

### Component System

Components (Header, Footer) follow a similar pattern:
- `render()` - Render component HTML
- `teardown()` - Cleanup

### Responsive Design

Uses Bootstrap 5 for responsive grid system with custom CSS for:
- Mobile-first design
- Breakpoints: xs, sm (576px), md (768px), lg (992px), xl (1200px), xxl (1400px)
- Custom animations and transitions

## Adding New Pages

1. Create a new directory in `src/pages/` (e.g., `src/pages/login/`)
2. Create `login.js` with a page class
3. Register the route in `src/utils/router.js`:

```javascript
import { LoginPage } from '../pages/login/login.js';

Router.registerRoute('/login', LoginPage);
```

4. Create navigation links using `href="/login"` (router handles clicks)

## Navigation

Navigation links automatically work via the router's click handler:

```html
<a href="/dashboard">Go to Dashboard</a>
```

No need to manually call JavaScript functions.

## Features

✅ Multi-page routing without page reloads
✅ Responsive design (mobile/tablet/desktop)
✅ Bootstrap 5 components and utilities
✅ Modular page and component structure
✅ Vanilla JavaScript (no frameworks)
✅ Browser history support (back/forward buttons)
✅ Supabase integration ready
✅ Custom animations and transitions

## Technologies

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Build Tool**: Vite
- **UI Framework**: Bootstrap 5
- **Icons**: Bootstrap Icons
- **Backend**: Supabase (planned)
- **Hosting**: Netlify/Vercel (planned)

## Next Steps

- Implement authentication pages (login, register)
- Create browse hobbies page
- Create events listing and details pages
- Integrate Supabase authentication
- Add user profile management
- Implement event creation and management
- Add search and filtering functionality

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT License - 2026 Hobby Buddy Hub
