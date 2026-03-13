# Hobby Buddy Hub - Multi-Page Application

A vanilla JavaScript multi-page application (MPA) built with Vite, Bootstrap, and Supabase.

## Project Structure

```
Hobby_Buddy_Hub/
├── pages/                          # Application pages (Multi-Page structure)
│   ├── index/                      # Home page
│   │   ├── index.html              # Page HTML
│   │   ├── style.css               # Page styles
│   │   └── script.js               # Page scripts
│   │
│   ├── dashboard/                  # Dashboard page
│   │   ├── index.html              # Page HTML
│   │   ├── style.css               # Page styles
│   │   └── script.js               # Page scripts
│   │
│   └── components/                 # Shared components
│       ├── header.html             # Navigation bar (included on all pages)
│       └── footer.html             # Footer (included on all pages)
│
├── public/                          # Static assets
│   ├── css/
│   │   └── global.css              # Global styles (all pages)
│   ├── js/
│   │   └── global.js               # Global utilities
│   └── images/                     # Images, icons, etc.
│
├── index.html                       # Main entry point
├── package.json                     # Dependencies
├── vite.config.js                   # Vite configuration (MPA setup)
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore rules
└── README.md                        # This file

```

## Features

✅ Multi-Page Application (MPA) - Each page has its own HTML, CSS, JS  
✅ Shared Header & Footer components (auto-loaded)  
✅ Responsive design (mobile/tablet/desktop)  
✅ Bootstrap 5 components  
✅ Custom CSS with responsive breakpoints  
✅ Vite build tool for fast development  
✅ Vanilla JavaScript (no frameworks)  
✅ Easy to add new pages  

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

## Page Structure

Each page folder contains three files:

### index.html
- Contains the complete page HTML
- Includes Bootstrap CDN links
- Loads global CSS and page-specific CSS
- Has placeholders for header and footer (`id="header-container"` & `id="footer-container"`)

### style.css
- Page-specific styles
- Complements global CSS
- Only loaded when page is active

### script.js
- Page-specific JavaScript
- Calls `setActiveNav()` to highlight active navigation link
- Handles page initialization and events

## How to Add a New Page

### 1. Create Page Folder

```bash
mkdir pages/mypage
```

### 2. Create Page Files

**pages/mypage/index.html**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Page - Hobby Buddy Hub</title>
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
    <link rel="stylesheet" href="/public/css/global.css">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header id="header-container"></header>
    
    <main class="min-vh-100">
        <div class="container py-4">
            <h1>My Page</h1>
            <!-- Page content here -->
        </div>
    </main>
    
    <footer id="footer-container"></footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="/public/js/global.js"></script>
    <script src="script.js"></script>
</body>
</html>
```

**pages/mypage/style.css**
```css
/* Page-specific styles */
```

**pages/mypage/script.js**
```javascript
document.addEventListener('DOMContentLoaded', () => {
    setActiveNav('My Page');
});
```

### 3. Update Vite Config

Add the new page to `vite.config.js`:

```javascript
input: {
  main: resolve(__dirname, 'index.html'),
  mypage: resolve(__dirname, 'pages/mypage/index.html'),
  // ... other pages
},
```

### 4. Add Navigation Link

Update `pages/components/header.html` to include the new page:

```html
<li class="nav-item">
    <a class="nav-link" href="/pages/mypage/index.html">
        <i class="bi bi-icon me-1"></i>My Page
    </a>
</li>
```

## Global Components

### Header (`pages/components/header.html`)
- Navigation bar
- Auto-loaded on all pages
- Contains links to all pages
- Active link highlighting

### Footer (`pages/components/footer.html`)
- Footer with links and social media
- Auto-loaded on all pages

Both components are loaded automatically by `public/js/global.js` on page load.

## Styling System

### Global CSS (`public/css/global.css`)
- Base styles for all pages
- CSS variables for colors
- Typography
- Responsive breakpoints
- Animations

### Page CSS (`pages/*/style.css`)
- Page-specific customizations
- Complements global styles

## Navigation

Simply use standard HTML links to navigate between pages:

```html
<a href="/pages/dashboard/index.html">Dashboard</a>
<a href="/pages/index/index.html">Home</a>
```

No need for special routing or JavaScript - full page navigation.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Technologies

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Build Tool**: Vite
- **UI Framework**: Bootstrap 5
- **Icons**: Bootstrap Icons
- **Backend**: Supabase (planned integration)
- **Hosting**: Netlify/Vercel (planned)

## Next Steps

1. Create authentication pages (login, register)
2. Create browse hobbies page
3. Create events listing and details pages
4. Integrate Supabase authentication
5. Add user profile management
6. Implement event creation and management
7. Add search and filtering functionality

## Troubleshooting

### Header/Footer not loading
Make sure the path in `public/js/global.js` is correct for your environment.

### Styles not applying
Check that global.css and page-specific style.css are properly linked in the HTML file.

### Navigation not working
Use proper relative paths like `/pages/pagename/index.html` for navigation links.

## License

MIT License - 2026 Hobby Buddy Hub
