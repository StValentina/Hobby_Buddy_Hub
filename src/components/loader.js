/**
 * Components Loader
 * Centralized initialization of all global components (Header, Footer)
 * This file automatically initializes and renders all page components
 * Just import this at the end of any page to get automatic component rendering
 */

import { Header } from './header.js';
import { Footer } from './footer.js';

// Signal global HTML fetch loader to skip duplicate header/footer requests.
window.__USE_JS_COMPONENTS__ = true;

class ComponentsLoader {
  static initialize() {
    // Initialize Header
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
      try {
        const header = new Header();
        header.render();
      } catch (error) {
        console.error('ComponentsLoader: Error rendering header:', error);
      }
    }
    
    // Initialize Footer
    const footerContainer = document.getElementById('footer-container');
    if (footerContainer) {
      try {
        const footer = new Footer();
        footer.render();
      } catch (error) {
        console.error('ComponentsLoader: Error rendering footer:', error);
      }
    }
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  // DOM is still loading
  document.addEventListener('DOMContentLoaded', () => {
    ComponentsLoader.initialize();
  });
} else {
  // DOM is already loaded
  ComponentsLoader.initialize();
}

export default ComponentsLoader;
