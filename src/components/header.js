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
    console.log('=== HEADER RENDER START ===');
    
    // Force refresh of auth token from localStorage on every render
    // This ensures we catch new logins immediately after auth pages redirect
    apiService.authToken = apiService.getAuthToken();
    
    const isAuthenticated = apiService.isAuthenticated();
    const user = isAuthenticated ? apiService.getCurrentUser() : null;
    
    console.log('Header render - isAuthenticated:', isAuthenticated);
    console.log('Header render - user:', user);
    console.log('Header render - authToken:', apiService.authToken);
    console.log('Header render - token parts:', apiService.authToken ? apiService.authToken.split('.').length : 'NO TOKEN');

    if (isAuthenticated && user) {
      console.log('Rendering AUTHENTICATED UI for:', user.email);
      // Load user profile asynchronously to get full name
      this.renderAuthenticatedUI(user);
    } else {
      console.log('Rendering UNAUTHENTICATED UI (showing Login/Sign Up)');
      this.renderUnauthenticatedUI();
    }
  }

  /**
   * Render authenticated UI with user profile loaded asynchronously
   */
  async renderAuthenticatedUI(user) {
    let userDisplayName = user?.email || 'User';
    
    try {
      // Load user profile to get full name
      const profile = await this.apiService.getProfile(user.id);
      if (profile?.full_name) {
        userDisplayName = profile.full_name;
      }
    } catch (error) {
      console.warn('Failed to load user profile for header display:', error);
      // Fall back to email if profile load fails
    }

    const authHtml = `
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
          <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
            <li><a class="dropdown-item" href="/pages/profile.html">
              <i class="bi bi-person me-2"></i>Profile
            </a></li>
            <li><a class="dropdown-item" href="/pages/dashboard.html">
              <i class="bi bi-speedometer2 me-2"></i>Dashboard
            </a></li>
            <li><a class="dropdown-item" href="#">
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
          <a class="nav-link" href="/pages/auth/login.html">
            <i class="bi bi-box-arrow-in-right me-1"></i>Login
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link btn btn-primary btn-sm text-white ms-2" href="/pages/auth/register.html">
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
                <a class="nav-link" href="/pages/hobbies.html">
                  <i class="bi bi-star me-1"></i>Hobbies
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="/pages/events.html">
                  <i class="bi bi-calendar-event me-1"></i>Events
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="/pages/people.html">
                  <i class="bi bi-people me-1"></i>Find People
                </a>
              </li>
              ${isAuthenticated ? `
              <li class="nav-item">
                <a class="nav-link" href="/pages/dashboard.html">
                  <i class="bi bi-speedometer2 me-1"></i>Dashboard
                </a>
              </li>
              ` : ''}
              ${authHtml}
            </ul>
          </div>
        </div>
      </nav>
    `;
    
    console.log('=== HEADER RENDER END ===');

    // Ensure Bootstrap dropdown functionality is initialized
    this.initializeDropdowns();
  }

  initializeDropdowns() {
    // Bootstrap dropdowns should auto-initialize, but we can add additional event handling if needed
    const dropdowns = this.container.querySelectorAll('[data-bs-toggle="dropdown"]');
    dropdowns.forEach(dropdown => {
      dropdown.addEventListener('click', (e) => {
        e.preventDefault();
      });
    });
  }

  teardown() {
    this.container.innerHTML = '';
  }
}

// Global logout handler
window.headerLogout = function(event) {
  event.preventDefault();
  console.log('Logging out...');
  
  try {
    apiService.logout();
    console.log('User logged out successfully');
    
    // Redirect to login page
    window.location.href = '/pages/auth/login.html';
  } catch (error) {
    console.error('Logout error:', error);
    alert('Failed to logout. Please try again.');
  }
};
