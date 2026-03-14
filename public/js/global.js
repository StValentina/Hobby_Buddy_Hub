/**
 * Global utility functions
 */

// Load HTML component (header/footer)
export async function loadComponent(componentPath, containerId) {
  try {
    const response = await fetch(componentPath);
    const html = await response.text();
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = html;
    }
  } catch (error) {
    console.error(`Error loading component from ${componentPath}:`, error);
  }
}

// Initialize global components
export function initializeGlobalComponents() {
  const basePath = getBasePath();
  loadComponent(`${basePath}pages/components/header.html`, 'header-container');
  loadComponent(`${basePath}pages/components/footer.html`, 'footer-container');
}

// Get base path for multi-page setup
export function getBasePath() {
  const currentPath = window.location.pathname;
  const pagesIndex = currentPath.indexOf('/pages/');
  
  if (pagesIndex !== -1) {
    return currentPath.substring(0, pagesIndex + 1);
  }
  
  return '/';
}

// Logout handler (placeholder)
export function handleLogout(event) {
  event.preventDefault();
  console.log('Logout clicked');
  // TODO: Implement logout functionality
}

// Set active navigation link
export function setActiveNav(pageName) {
  const navLinks = document.querySelectorAll('.navbar-nav a.nav-link');
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.textContent.toLowerCase().includes(pageName.toLowerCase())) {
      link.classList.add('active');
    }
  });
}

// Initialize global components when DOM is ready
document.addEventListener('DOMContentLoaded', initializeGlobalComponents);

// Keep backwards compatibility for scripts that access these helpers on window
window.loadComponent = loadComponent;
window.initializeGlobalComponents = initializeGlobalComponents;
window.getBasePath = getBasePath;
window.handleLogout = handleLogout;
window.setActiveNav = setActiveNav;
