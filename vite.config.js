import { defineConfig } from 'vite';
import { resolve } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';

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
          '/my-connections': '/pages/my-connections.html',
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
          req.url = '/pages/event-details.html';
          next();
          return;
        }

        const hobbyMatch = pathname.match(/^\/hobbies\/([^/]+)$/);
        if (hobbyMatch) {
          req.url = '/pages/hobby-details.html';
          next();
          return;
        }

        const peopleMatch = pathname.match(/^\/people\/([^/]+)$/);
        if (peopleMatch) {
          req.url = '/pages/profile.html';
          next();
          return;
        }

        next();
      });
    },
  };
}

function copyNetlifyRedirectsPlugin() {
  return {
    name: 'copy-netlify-redirects',
    closeBundle() {
      const sourcePath = resolve(__dirname, 'public/_redirects');
      const targetPath = resolve(__dirname, 'dist/_redirects');

      if (!existsSync(sourcePath)) {
        return;
      }

      const redirectsContent = readFileSync(sourcePath, 'utf8');
      writeFileSync(targetPath, redirectsContent, 'utf8');
      console.log('Copied public/_redirects -> dist/_redirects');
    },
  };
}

export default defineConfig({
  plugins: [logicalRouteRewritePlugin(), copyNetlifyRedirectsPlugin()],
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
        hobbies: resolve(__dirname, 'pages/hobbies.html'),
        hobbyDetails: resolve(__dirname, 'pages/hobby-details.html'),
        events: resolve(__dirname, 'pages/events.html'),
        eventDetails: resolve(__dirname, 'pages/event-details.html'),
        profile: resolve(__dirname, 'pages/profile.html'),
        people: resolve(__dirname, 'pages/people.html'),
        myConnections: resolve(__dirname, 'pages/my-connections.html'),
        admin: resolve(__dirname, 'pages/admin.html'),
        createEvent: resolve(__dirname, 'pages/create-event.html'),
        login: resolve(__dirname, 'pages/auth/login.html'),
        register: resolve(__dirname, 'pages/auth/register.html'),
        diagnostics: resolve(__dirname, 'pages/auth/diagnostics.html'),
      },
    },
  },
});
