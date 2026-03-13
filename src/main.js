import './styles/main.css';
import { Router } from './utils/router.js';
import { initApp } from './app.js';

// Initialize the application
window.addEventListener('DOMContentLoaded', () => {
  initApp();
});

// Handle navigation
window.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="/"]');
  if (link) {
    e.preventDefault();
    const path = link.getAttribute('href');
    Router.navigate(path);
  }
});

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
  Router.loadPage(window.location.pathname);
});
