/**
 * Components Loader
 * Centralized initialization of all global components (Header, Footer)
 * This file automatically initializes and renders all page components
 * Just import this at the end of any page to get automatic component rendering
 */

import { Header } from './header.js';
import { Footer } from './footer.js';

class ComponentsLoader {
  static initialize() {
    console.log('ComponentsLoader: Initializing global components...');
    
    // Initialize Header
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
      console.log('ComponentsLoader: Rendering Header component');
      try {
        const header = new Header();
        header.render();
      } catch (error) {
        console.error('ComponentsLoader: Error rendering header:', error);
      }
    } else {
      console.warn('ComponentsLoader: No header-container element found on page');
    }
    
    // Initialize Footer
    const footerContainer = document.getElementById('footer-container');
    if (footerContainer) {
      console.log('ComponentsLoader: Rendering Footer component');
      try {
        const footer = new Footer();
        footer.render();
      } catch (error) {
        console.error('ComponentsLoader: Error rendering footer:', error);
      }
    } else {
      console.warn('ComponentsLoader: No footer-container element found on page');
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
