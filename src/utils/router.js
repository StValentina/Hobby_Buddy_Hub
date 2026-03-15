/**
 * Client-side SPA router for Hobby Buddy Hub
 * Dynamically loads and renders pages based на routes
 */

class AppRouter {
  constructor() {
    this.routes = new Map();
    this.baseStyles = new Set();
    this.baseScripts = new Set();
  }

  /**
   * Initialize routes mapping logical URLs to HTML file paths
   */
  init() {
    // Remember styles that belong to the shell document and should stay loaded.
    document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
      const href = link.getAttribute('href');
      if (href) {
        this.baseStyles.add(href);
      }
    });

    // Remember scripts that belong to the shell document and should stay loaded.
    document.querySelectorAll('script[src]').forEach((script) => {
      const src = script.getAttribute('src');
      if (src) {
        this.baseScripts.add(src);
      }
    });

    this.registerRoute('/', '/pages/home.html');
    this.registerRoute('/login', '/pages/auth/login.html');
    this.registerRoute('/register', '/pages/auth/register.html');
    this.registerRoute('/hobbies', '/pages/hobbies.html');
    this.registerRoute('/people', '/pages/people.html');
    this.registerRoute('/events', '/pages/events.html');
    this.registerRoute('/create-event', '/pages/create-event.html');
    this.registerRoute('/profile', '/pages/profile.html');
    this.registerRoute('/admin', '/pages/admin.html');
    this.registerRoute('/dashboard', '/pages/dashboard.html');
    this.registerRoute('/hobbies/:id', '/pages/hobby-details.html');
    this.registerRoute('/events/:id', '/pages/event-details.html');
  }

  /**
   * Register a route mapping
   */
  registerRoute(path, filePath) {
    this.routes.set(path, filePath);
  }

  /**
   * Navigate to path and load page
   */
  navigate(path) {
    window.history.pushState({}, '', path);
    this.loadPage(path);
  }

  /**
   * Resolve logical route to physical file path and query params
   */
  resolveRoute(pathname, search = '') {
    if (pathname !== '/' && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }

    // Guard against accidental navigation to Supabase API paths.
    if (
      pathname.startsWith('/rest/v1') ||
      pathname.startsWith('/auth/v1') ||
      pathname.startsWith('/storage/v1')
    ) {
      console.error(`Invalid app route: ${pathname}. This looks like a Supabase API path.`);
      return {
        filePath: this.routes.get('/'),
        query: ''
      };
    }

    // Try dynamic routes (e.g., /events/123, /hobbies/456)
    const eventMatch = pathname.match(/^\/events\/([^/]+)$/);
    if (eventMatch) {
      return {
        filePath: this.routes.get('/events/:id'),
        query: `?id=${encodeURIComponent(eventMatch[1])}`
      };
    }

    const hobbyMatch = pathname.match(/^\/hobbies\/([^/]+)$/);
    if (hobbyMatch) {
      return {
        filePath: this.routes.get('/hobbies/:id'),
        query: `?id=${encodeURIComponent(hobbyMatch[1])}`
      };
    }

    // Direct route lookup
    const filePath = this.routes.get(pathname);
    if (filePath) {
      return { filePath, query: '' };
    }

    // Backward compat: query-based detail routes (e.g., /events?id=123)
    const params = new URLSearchParams(search);
    if (pathname === '/events' && params.get('id')) {
      return {
        filePath: this.routes.get('/events/:id'),
        query: search
      };
    }
    if (pathname === '/hobbies' && params.get('id')) {
      return {
        filePath: this.routes.get('/hobbies/:id'),
        query: search
      };
    }

    return null;
  }

  /**
   * Load a page by fetching and rendering its HTML
   */
  async loadPage(fullPath) {
    let url;
    try {
      url = new URL(fullPath, window.location.origin);
      const resolved = this.resolveRoute(url.pathname, url.search);

      if (!resolved) {
        console.error(`Route not found: ${url.pathname}`);
        this.showErrorPage();
        return;
      }

      console.log(`🚀 Loading: ${url.pathname}`);

      // Fetch the HTML for the page
      const fetchUrl = `${resolved.filePath}${resolved.query}`;
      console.log(`📡 Fetching: ${fetchUrl}`);
      
      const response = await fetch(fetchUrl, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${fetchUrl}`);
      }

      const html = await response.text();
      const parser = new DOMParser();
      const pageDoc = parser.parseFromString(html, 'text/html');

      // Update page title
      document.title = pageDoc.title;

      // Remove previously injected page styles from old route.
      document
        .querySelectorAll('link[data-router-page-style="true"]')
        .forEach((link) => link.remove());

      // Add page-specific styles from fetched page (supports both dev and production assets).
      pageDoc
        .querySelectorAll('link[rel="stylesheet"]')
        .forEach((link) => {
          const href = link.getAttribute('href');
          if (!href || this.baseStyles.has(href)) {
            return;
          }

          const alreadyPresent = document.head.querySelector(`link[rel="stylesheet"][href="${href}"]`);
          if (alreadyPresent) {
            return;
          }

          const newLink = document.createElement('link');
          newLink.rel = 'stylesheet';
          newLink.href = href;
          newLink.setAttribute('data-router-page-style', 'true');
          document.head.appendChild(newLink);
        });

      // Remove previously injected page scripts from old route.
      document
        .querySelectorAll('script[data-router-page-script="true"]')
        .forEach((script) => script.remove());

      // Inject page scripts from fetched document (head + body) so route logic executes.
      pageDoc
        .querySelectorAll('script[src]')
        .forEach((script) => {
          const src = script.getAttribute('src');
          if (!src || this.baseScripts.has(src)) {
            return;
          }

          const newScript = document.createElement('script');
          newScript.src = src;
          newScript.setAttribute('data-router-page-script', 'true');

          if (script.type) {
            newScript.type = script.type;
          }

          if (script.hasAttribute('crossorigin')) {
            newScript.setAttribute('crossorigin', script.getAttribute('crossorigin') || '');
          }

          document.body.appendChild(newScript);
        });

      // Extract main content from page (skip header/footer)
      const mainContent = pageDoc.querySelector('main') || pageDoc.body;
      
      // Replace only the main content area (not header/footer)
      const appContainer = document.querySelector('#app') || document.querySelector('main');
      if (appContainer) {
        appContainer.innerHTML = mainContent.innerHTML;
      } else {
        // Fallback: replace body if no app container found
        document.body.innerHTML = pageDoc.body.innerHTML;
      }

      // Inline scripts inserted with innerHTML are inert; recreate them so they execute.
      const scripts = Array.from(document.querySelectorAll('main script, #app script'));
      scripts.forEach((oldScript) => {
        const newScript = document.createElement('script');

        if (oldScript.type) {
          newScript.type = oldScript.type;
        }

        const src = oldScript.getAttribute('src');
        if (src) {
          newScript.src = src;
        } else {
          newScript.textContent = oldScript.textContent;
        }

        oldScript.replaceWith(newScript);
      });

      console.log(`✅ Page loaded: ${url.pathname}`);
    } catch (error) {
      const failedPath = url ? url.pathname : String(fullPath || 'unknown');
      console.error(`❌ Error loading ${failedPath}:`, error);
      this.showErrorPage();
    }
  }

  /**
   * Show error page
   */
  showErrorPage() {
    const main = document.querySelector('main');
    if (main) {
      main.innerHTML = `
        <div class="container mt-5">
          <div class="alert alert-danger">
            <h4>Page Not Found</h4>
            <p>The page you're looking for doesn't exist.</p>
            <a href="/" class="btn btn-primary">Go Home</a>
          </div>
        </div>
      `;
      return;
    }

    document.body.innerHTML = `
      <main class="min-vh-100 d-flex align-items-center">
        <div class="container mt-5">
          <div class="alert alert-danger">
            <h4>Page Not Found</h4>
            <p>The page you're looking for doesn't exist.</p>
            <a href="/" class="btn btn-primary">Go Home</a>
          </div>
        </div>
      </main>
    `;
  }
}

export const Router = new AppRouter();
