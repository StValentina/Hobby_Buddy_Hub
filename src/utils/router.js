/**
 * Simple client-side router for multi-page application
 */

import { IndexPage } from '../pages/home.js';
import { DashboardPage } from '../pages/dashboard.js';

class AppRouter {
  constructor() {
    this.routes = new Map();
    this.currentPage = null;
  }

  /**
   * Initialize all routes
   */
  init() {
    this.registerRoute('/', IndexPage);
    this.registerRoute('/dashboard', DashboardPage);
    
    // Add more routes here as pages are created
    // this.registerRoute('/login', LoginPage);
    // this.registerRoute('/projects/:id', ProjectDetailsPage);
  }

  /**
   * Register a route with its page handler
   */
  registerRoute(path, pageClass) {
    this.routes.set(path, pageClass);
  }

  /**
   * Navigate to a specific path
   */
  navigate(path) {
    window.history.pushState({}, '', path);
    this.loadPage(path);
  }

  /**
   * Load and render a page based on path
   */
  async loadPage(path) {
    // Normalize path (remove trailing slash except for root)
    if (path !== '/' && path.endsWith('/')) {
      path = path.slice(0, -1);
    }

    const PageClass = this.routes.get(path);
    
    if (!PageClass) {
      console.error(`Route not found: ${path}`);
      this.loadErrorPage();
      return;
    }

    try {
      // Teardown previous page
      if (this.currentPage && this.currentPage.teardown) {
        this.currentPage.teardown();
      }

      // Create and initialize new page
      this.currentPage = new PageClass();
      await this.currentPage.render();

      // Set up page after rendering if needed
      if (this.currentPage.setup) {
        await this.currentPage.setup();
      }
    } catch (error) {
      console.error(`Error loading page: ${path}`, error);
      this.loadErrorPage();
    }
  }

  /**
   * Display error page
   */
  loadErrorPage() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="container mt-5">
        <div class="alert alert-danger" role="alert">
          <h4 class="alert-heading">Page Not Found</h4>
          <p>The page you are looking for does not exist.</p>
          <a href="/" class="btn btn-primary">Go Home</a>
        </div>
      </div>
    `;
  }
}

export const Router = new AppRouter();
