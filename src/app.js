import { Router } from './utils/router.js';

export async function initApp() {
  // Initialize router with page routes
  Router.init();
  
  // Load initial page based on current URL
  Router.loadPage(window.location.pathname);
}
