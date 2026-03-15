/**
 * Header component - Responsive navigation bar with authentication support
 */

import { apiService } from '../services/api.js';

export class Header {
  constructor() {
    this.container = document.getElementById('header-container');
    this.apiService = apiService;
    if (!this.container) {
      console.error('Header container not found!');
    }
  }

  render() {
    // Force refresh of auth token from localStorage on every render
    // This ensures we catch new logins immediately after auth pages redirect
    apiService.authToken = apiService.getAuthToken();
    
    const isAuthenticated = apiService.isAuthenticated();
    const user = isAuthenticated ? apiService.getCurrentUser() : null;

    if (isAuthenticated && user) {
      // Load user profile asynchronously to get full name
      this.renderAuthenticatedUI(user);
    } else {
      this.renderUnauthenticatedUI();
    }
  }

  /**
   * Render authenticated UI with user profile loaded asynchronously
   */
  async renderAuthenticatedUI(user) {
    let userDisplayName = user?.email || 'User';
    let isAdmin = false;
    
    try {
      // Load independent resources in parallel to reduce header render latency.
      const [profile, role] = await Promise.all([
        this.apiService.getProfile(user.id),
        this.apiService.getUserRole(user.id)
      ]);

      if (profile?.full_name) {
        userDisplayName = profile.full_name;
      }
      isAdmin = role === 'admin';
    } catch (error) {
      console.warn('Failed to load user profile for header display:', error);
      // Fall back to email if profile load fails
    }

    const adminNavHtml = isAdmin ? `
        <li class="nav-item">
          <a class="nav-link" href="/admin">
            <i class="bi bi-shield-lock me-1"></i>Admin
          </a>
        </li>
      ` : '';

    const adminDropdownItem = isAdmin ? `
            <li><a class="dropdown-item" href="/admin">
              <i class="bi bi-shield-lock me-2"></i>Admin Panel
            </a></li>
      ` : '';

    const authHtml = `
        ${adminNavHtml}
        <li class="nav-item dropdown">
          <a 
            class="nav-link dropdown-toggle" 
            href="#" 
            id="navbarDropdown" 
            role="button" 
            data-bs-toggle="dropdown" 
            aria-expanded="false"
          >
            <i class="bi bi-person-circle me-1"></i>${userDisplayName}
          </a>
          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
            <li><a class="dropdown-item" href="/profile">
              <i class="bi bi-person me-2"></i>Profile
            </a></li>
            <li><a class="dropdown-item" href="/dashboard">
              <i class="bi bi-speedometer2 me-2"></i>Dashboard
            </a></li>
            ${adminDropdownItem}
            <li><a class="dropdown-item" onclick="showSettingsModal(event)">
              <i class="bi bi-gear me-2"></i>Settings
            </a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#" onclick="headerLogout(event)">
              <i class="bi bi-box-arrow-right me-2"></i>Logout
            </a></li>
          </ul>
        </li>
      `;

    this.renderNavbar(authHtml);
  }

  /**
   * Render unauthenticated UI
   */
  renderUnauthenticatedUI() {
    const authHtml = `
        <li class="nav-item">
          <a class="nav-link" href="/login">
            <i class="bi bi-box-arrow-in-right me-1"></i>Login
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link btn btn-primary btn-sm text-white ms-2" href="/register">
            <i class="bi bi-person-plus me-1"></i>Sign Up
          </a>
        </li>
      `;

    this.renderNavbar(authHtml);
  }

  /**
   * Render the navbar with the given auth HTML
   */
  renderNavbar(authHtml) {
    const isAuthenticated = this.apiService.isAuthenticated();

    this.container.innerHTML = `
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm">
        <div class="container-fluid">
          <a class="navbar-brand fw-bold" href="/">
            <i class="bi bi-star-fill text-warning me-2"></i>Hobby Buddy Hub
          </a>
          
          <button 
            class="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav" 
            aria-controls="navbarNav" 
            aria-expanded="false" 
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>

          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
              <li class="nav-item">
                <a class="nav-link" href="/">
                  <i class="bi bi-house me-1"></i>Home
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="/hobbies">
                  <i class="bi bi-star me-1"></i>Hobbies
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="/events">
                  <i class="bi bi-calendar-event me-1"></i>Events
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="/people">
                  <i class="bi bi-people me-1"></i>Find People
                </a>
              </li>
              ${authHtml}
            </ul>
          </div>
        </div>
      </nav>
    `;
    // Ensure Bootstrap dropdown functionality is initialized
    this.initializeDropdowns();
  }

  initializeDropdowns() {
    // Bootstrap dropdowns should auto-initialize, but we can add additional event handling if needed
    const dropdowns = this.container.querySelectorAll('[data-bs-toggle="dropdown"]');
    dropdowns.forEach(dropdown => {
      // allow Bootstrap to handle click/toggle behavior; keep listener placeholder for future hooks
    });
  }

  teardown() {
    this.container.innerHTML = '';
  }
}

// Global logout handler
window.headerLogout = function(event) {
  event.preventDefault();
  
  try {
    apiService.logout();

    // Redirect to login page
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout error:', error);
    alert('Failed to logout. Please try again.');
  }
};
