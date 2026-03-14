import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 5173,
    open: true,
    headers: {
      // Prevent caching in development
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    }
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
