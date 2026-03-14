/**
 * Dashboard Page JavaScript
 */

import { apiService } from '/src/services/api.js';

/**
 * Initialize dashboard page
 */
function initDashboard() {
    window.setActiveNav('Dashboard');
    loadDashboardData();
}

/**
 * Load dashboard data from database
 */
async function loadDashboardData() {
    try {
        // Load user's hobbies count
        const hobbiesResponse = await apiService.fetchUserHobbies();
        const hobbiesCount = hobbiesResponse ? hobbiesResponse.length : 0;
        document.getElementById('hobbiesCount')?.textContent || hobbiesCount;

        // Load events
        const eventsResponse = await apiService.fetchEvents();
        const eventsCount = eventsResponse ? eventsResponse.length : 0;
        document.getElementById('eventsCount')?.textContent || eventsCount;

        // Load upcoming events
        loadUpcomingEvents();
        loadSuggestedHobbies();
        loadUserHobbies();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

/**
 * Load upcoming events for display
 */
async function loadUpcomingEvents() {
    try {
        const events = await apiService.fetchEvents();
        const container = document.getElementById('upcomingEventsContainer');
        
        if (!container) return;

        // Show only upcoming events (first 3)
        const upcomingEvents = events.slice(0, 3);
        
        if (upcomingEvents.length === 0) {
            container.innerHTML = '<p class="text-muted">No upcoming events yet</p>';
            return;
        }

        container.innerHTML = upcomingEvents.map(event => `
            <div class="event-item mb-3 pb-3 border-bottom">
                <h6 class="fw-bold mb-1">${event.title}</h6>
                <small class="text-muted d-block">${event.location}</small>
                <small class="d-block"><i class="bi bi-calendar3"></i> ${event.date}</small>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading upcoming events:', error);
    }
}

/**
 * Load suggested hobbies
 */
async function loadSuggestedHobbies() {
    try {
        const hobbies = await apiService.fetchHobbies();
        const container = document.getElementById('suggestedHobbiesContainer');
        
        if (!container || !hobbies || hobbies.length === 0) return;

        // Show random hobbies (first 3)
        const suggested = hobbies.slice(0, 3);
        
        container.innerHTML = suggested.map(hobby => `
            <div class="hobby-chip me-2 mb-2">
                <span class="me-2">${hobby.icon || '🎯'}</span>
                <span>${hobby.name}</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading suggested hobbies:', error);
    }
}

/**
 * Load user's hobbies for my hobbies section
 */
async function loadUserHobbies() {
    try {
        const hobbies = await apiService.fetchUserHobbies();
        const container = document.getElementById('myHobbiesContainer');
        
        if (!container) return;

        if (!hobbies || hobbies.length === 0) {
            container.innerHTML = '<p class="text-muted">No hobbies yet</p>';
            return;
        }

        // Display hobbies as badges
        container.innerHTML = hobbies.map(hobby => `
            <span class="badge bg-primary me-2 mb-2">${hobby.name}</span>
        `).join('');
    } catch (error) {
        console.error('Error loading user hobbies:', error);
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', initDashboard);
