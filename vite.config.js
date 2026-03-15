import { defineConfig } from 'vite';
import { resolve } from 'path';

function logicalRouteRewritePlugin() {
  return {
    name: 'logical-route-rewrite',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (!req.url) {
          next();
          return;
        }

        const requestUrl = new URL(req.url, 'http://localhost');
        const pathname = requestUrl.pathname;
        const search = requestUrl.search;

        const staticRewrites = {
          '/': '/index.html',
          '/dashboard': '/pages/dashboard.html',
          '/login': '/pages/auth/login.html',
          '/register': '/pages/auth/register.html',
          '/hobbies': '/pages/hobbies.html',
          '/events': '/pages/events.html',
          '/people': '/pages/people.html',
          '/profile': '/pages/profile.html',
          '/create-event': '/pages/create-event.html',
          '/admin': '/pages/admin.html',
          '/auth/diagnostics': '/pages/auth/diagnostics.html',
        };

        if (staticRewrites[pathname]) {
          req.url = `${staticRewrites[pathname]}${search}`;
          next();
          return;
        }

        const eventMatch = pathname.match(/^\/events\/([^/]+)$/);
        if (eventMatch) {
          const id = encodeURIComponent(eventMatch[1]);
          req.url = `/pages/event-details.html?id=${id}`;
          next();
          return;
        }

        const hobbyMatch = pathname.match(/^\/hobbies\/([^/]+)$/);
        if (hobbyMatch) {
          const id = encodeURIComponent(hobbyMatch[1]);
          req.url = `/pages/hobby-details.html?id=${id}`;
          next();
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [logicalRouteRewritePlugin()],
  server: {
    port: 5173,
    open: true,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    },
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'pages/dashboard.html'),
        home: resolve(__dirname, 'pages/home.html'),
        hobbies: resolve(__dirname, 'pages/hobbies.html'),
        hobbyDetails: resolve(__dirname, 'pages/hobby-details.html'),
        events: resolve(__dirname, 'pages/events.html'),
        eventDetails: resolve(__dirname, 'pages/event-details.html'),
        profile: resolve(__dirname, 'pages/profile.html'),
        people: resolve(__dirname, 'pages/people.html'),
        admin: resolve(__dirname, 'pages/admin.html'),
        createEvent: resolve(__dirname, 'pages/create-event.html'),
        login: resolve(__dirname, 'pages/auth/login.html'),
        register: resolve(__dirname, 'pages/auth/register.html'),
        diagnostics: resolve(__dirname, 'pages/auth/diagnostics.html'),
      },
    },
  },
});
