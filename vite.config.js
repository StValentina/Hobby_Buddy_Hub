import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 5173,
    open: true,
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
        events: resolve(__dirname, 'pages/events/index.html'),
        eventDetails: resolve(__dirname, 'pages/event-details/index.html'),
        profile: resolve(__dirname, 'pages/profile/index.html'),
        people: resolve(__dirname, 'pages/people/index.html'),
        // Add more pages here as needed
        // login: resolve(__dirname, 'pages/login/index.html'),
        // register: resolve(__dirname, 'pages/register/index.html'),
      },
    },
  },
});
