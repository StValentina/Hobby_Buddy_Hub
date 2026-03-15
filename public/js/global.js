/**
 * Global utility functions
 */

const componentCache = new Map();

// Load HTML component (header/footer)
export async function loadComponent(componentPath, containerId) {
  try {
    const container = document.getElementById(containerId);
    if (!container) {
      return;
    }

    // Do not overwrite containers that were already rendered by dynamic JS components.
    if (container.innerHTML.trim().length > 0) {
      return;
    }

    let html = componentCache.get(componentPath);
    if (!html) {
      const response = await fetch(componentPath, { cache: 'force-cache' });
      if (!response.ok) {
        console.warn(`Component not found: ${componentPath} (${response.status})`);
        return;
      }
      html = await response.text();
      componentCache.set(componentPath, html);
    }

    container.innerHTML = html;
  } catch (error) {
    console.error(`Error loading component from ${componentPath}:`, error);
  }
}

// Initialize global components
export function initializeGlobalComponents() {
  // Skip HTML fetch-based component loading when JS components loader is active.
  if (window.__USE_JS_COMPONENTS__ === true) {
    return;
  }

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

/**
 * Show connection requests modal
 */
window.showConnectionRequests = async function(event) {
  event.preventDefault();
  
  // Import API service
  const { apiService } = await import('/src/services/api.js');
  
  try {
    // Check if user is authenticated
    if (!apiService.isAuthenticated()) {
      alert('Please log in to view connection requests');
      window.location.href = '/login';
      return;
    }

    // Fetch pending connection requests
    const requests = await apiService.getPendingConnectionRequests();
    
    // Create or update modal
    let modal = document.getElementById('connectionRequestsModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'connectionRequestsModal';
      modal.className = 'modal fade';
      modal.setAttribute('tabindex', '-1');
      modal.setAttribute('aria-labelledby', 'connectionRequestsLabel');
      modal.setAttribute('aria-hidden', 'true');
      document.body.appendChild(modal);
    }

    // Build requests HTML
    const requestsHtml = requests.length === 0 
      ? '<p class="text-muted text-center p-3">No pending connection requests</p>'
      : requests.map(req => `
          <div class="card mb-2" data-request-id="${req.id}">
            <div class="card-body d-flex align-items-center justify-content-between p-3">
              <div class="d-flex align-items-center gap-3">
                <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #667eea99 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">
                  ${req.requester.avatar_url ? `<img src="${req.requester.avatar_url}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` : '<i class="bi bi-person-fill"></i>'}
                </div>
                <div>
                  <a href="/profile?viewUserId=${req.requester_id}" class="text-decoration-none text-dark fw-bold d-block">${req.requester.name}</a>
                  <small class="text-muted">${req.requester.city || 'Location unknown'}</small>
                  <br>
                  <small class="text-muted">Wants to connect</small>
                </div>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-success accept-request" data-request-id="${req.id}">
                  <i class="bi bi-check-lg"></i> Accept
                </button>
                <button class="btn btn-sm btn-secondary reject-request" data-request-id="${req.id}">
                  <i class="bi bi-x-lg"></i> Reject
                </button>
              </div>
            </div>
          </div>
        `).join('');

    // Update modal content
    modal.innerHTML = `
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="connectionRequestsLabel">
              <i class="bi bi-inbox me-2"></i>Connection Requests
              ${requests.length > 0 ? `<span class="badge bg-primary ms-2">${requests.length}</span>` : ''}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" style="max-height: 500px; overflow-y: auto;">
            ${requestsHtml}
          </div>
        </div>
      </div>
    `;

    // Show modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    // Add event listeners for accept/reject buttons
    const acceptButtons = modal.querySelectorAll('.accept-request');
    const rejectButtons = modal.querySelectorAll('.reject-request');

    acceptButtons.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const requestId = e.currentTarget.getAttribute('data-request-id');
        try {
          await apiService.acceptConnectionRequest(requestId);
          const card = modal.querySelector(`[data-request-id="${requestId}"]`);
          if (card) card.remove();
          // Reload if no more requests
          if (modal.querySelectorAll('.card').length === 0) {
            modal.querySelector('.modal-body').innerHTML = '<p class="text-muted text-center p-3">No pending connection requests</p>';
          }
          // Update badge count
          updateConnectionRequestsBadge();
        } catch (error) {
          alert(`Failed to accept request: ${error.message}`);
        }
      });
    });

    rejectButtons.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const requestId = e.currentTarget.getAttribute('data-request-id');
        try {
          await apiService.rejectConnectionRequest(requestId);
          const card = modal.querySelector(`[data-request-id="${requestId}"]`);
          if (card) card.remove();
          // Reload if no more requests
          if (modal.querySelectorAll('.card').length === 0) {
            modal.querySelector('.modal-body').innerHTML = '<p class="text-muted text-center p-3">No pending connection requests</p>';
          }
          // Update badge count
          updateConnectionRequestsBadge();
        } catch (error) {
          alert(`Failed to reject request: ${error.message}`);
        }
      });
    });

    // Update badge
    updateConnectionRequestsBadge();
  } catch (error) {
    console.error('Failed to load connection requests:', error);
    alert(`Error loading connection requests: ${error.message}`);
  }
};

/**
 * Update connection requests badge count
 */
window.updateConnectionRequestsBadge = async function() {
  try {
    const { apiService } = await import('/src/services/api.js');
    
    if (!apiService.isAuthenticated()) {
      return;
    }

    const requests = await apiService.getPendingConnectionRequests();
    const badge = document.getElementById('connectionRequestsBadge');
    
    if (badge) {
      if (requests.length > 0) {
        badge.textContent = requests.length;
        badge.style.display = 'inline';
      } else {
        badge.style.display = 'none';
      }
    }
  } catch (error) {
    console.error('Failed to update connection requests badge:', error);
  }
};

// Keep backwards compatibility for scripts that access these helpers on window
window.loadComponent = loadComponent;
window.initializeGlobalComponents = initializeGlobalComponents;
window.getBasePath = getBasePath;
window.handleLogout = handleLogout;
window.setActiveNav = setActiveNav;
