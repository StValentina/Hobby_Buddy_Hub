import './styles/main.css';
import { Router } from './utils/router.js';
import ComponentsLoader from './components/loader.js';

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize header/footer components FIRST
  ComponentsLoader.initialize();
  
  // Then initialize router
  Router.init();
  
  // Load initial page based on current URL
  await Router.loadPage(`${window.location.pathname}${window.location.search}`);
});
