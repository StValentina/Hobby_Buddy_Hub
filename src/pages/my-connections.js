/**
 * My Connections Page JavaScript
 */

import { apiService } from '/src/services/api.js';

/**
 * Initialize my connections page
 */
document.addEventListener('DOMContentLoaded', async () => {
    window.setActiveNav('My Connections');
    
    // Check if user is authenticated
    if (!apiService.isAuthenticated()) {
        window.location.href = '/login';
        return;
    }
    
    await loadConnections();
});

/**
 * Load user's accepted connections
 */
async function loadConnections() {
    try {
        const currentUser = apiService.getCurrentUser();
        if (!currentUser) {
            console.error('No current user found');
            window.location.href = '/login';
            return;
        }
        
        console.log(`Loading connections for user ${currentUser.id}...`);
        
        // Fetch all accepted connections
        const connections = await apiService.getAcceptedConnections(currentUser.id);
        
        console.log('Connections fetched:', connections);
        
        // Display connections
        displayConnections(connections);
    } catch (error) {
        console.error('Error loading connections:', error);
        displayConnectionsError(error.message);
    }
}

/**
 * Display connections in a grid layout
 */
function displayConnections(connections) {
    const container = document.getElementById('connectionsContainer');
    
    if (!connections || connections.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="bi bi-people" style="font-size: 3rem; color: #ccc;"></i>
                <p class="mt-3">You don't have any connections yet. Start by connecting with people who share your hobbies!</p>
                <a href="/people" class="btn btn-primary mt-3">Find People</a>
            </div>
        `;
        return;
    }
    
    // Create connection cards grid
    const connectionsHtml = connections.map(conn => `
        <div class="col-lg-4 col-md-6 col-sm-12">
            <div class="connection-card h-100">
                <!-- User Avatar -->
                <div class="connection-avatar">
                    ${conn.avatar_url 
                        ? `<img src="${conn.avatar_url}" alt="${conn.name}" class="avatar-image">` 
                        : `<div class="avatar-placeholder"><i class="bi bi-person-fill"></i></div>`
                    }
                </div>
                
                <!-- User Info -->
                <div class="connection-info text-center">
                    <h5 class="fw-bold text-dark mb-2">
                        <a href="/profile?viewUserId=${conn.connected_user_id}" class="text-decoration-none text-dark">
                            ${conn.name}
                        </a>
                    </h5>
                    
                    <div class="connection-details">
                        <p class="text-muted mb-2">
                            <i class="bi bi-geo-alt"></i> ${conn.city}
                        </p>
                        <small class="text-muted">
                            Connected on ${formatDate(conn.connected_at)}
                        </small>
                    </div>
                    
                    <!-- Action Button -->
                    <a href="/profile?viewUserId=${conn.connected_user_id}" class="btn btn-sm btn-outline-primary mt-3 w-100">
                        <i class="bi bi-person me-1"></i>View Profile
                    </a>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = `<div class="row g-4">${connectionsHtml}</div>`;
}

/**
 * Display error message
 */
function displayConnectionsError(errorMessage) {
    const container = document.getElementById('connectionsContainer');
    container.innerHTML = `
        <div class="alert alert-danger" role="alert">
            <i class="bi bi-exclamation-triangle me-2"></i>
            <strong>Error loading connections:</strong> ${errorMessage}
        </div>
    `;
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}
