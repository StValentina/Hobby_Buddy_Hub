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
        dashboard: resolve(__dirname, 'pages/dashboard/index.html'),
        index: resolve(__dirname, 'pages/index/index.html'),
        hobbies: resolve(__dirname, 'pages/hobbies/index.html'),
        hobbyDetails: resolve(__dirname, 'pages/hobby-details/index.html'),
        events: resolve(__dirname, 'pages/events/index.html'),
        eventDetails: resolve(__dirname, 'pages/event-details/index.html'),
        profile: resolve(__dirname, 'pages/profile/index.html'),
        people: resolve(__dirname, 'pages/people/index.html'),
        login: resolve(__dirname, 'pages/auth/login.html'),
        register: resolve(__dirname, 'pages/auth/register.html'),
      },
    },
  },
});
