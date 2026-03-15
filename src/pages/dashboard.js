/**
 * Dashboard Page JavaScript
 */

import { apiService } from '/src/services/api.js';

/**
 * Initialize dashboard page
 */
document.addEventListener('DOMContentLoaded', async () => {
    window.setActiveNav('Dashboard');
    
    // Check if user is authenticated
    if (!apiService.isAuthenticated()) {
        window.location.href = '/login';
        return;
    }
    
    await loadDashboardData();
    initializeFilters();
});

/**
 * Load dashboard data from database
 */
async function loadDashboardData() {
    try {
        const currentUser = apiService.getCurrentUser();
        if (!currentUser) {
            console.error('No current user found');
            window.location.href = '/login';
            return;
        }
        
        // Load all data in parallel (including role lookup)
        const [roleResult, hobbiesResult, eventsJoinedResult, upcomingEventsResult, hostedEventsResult] = await Promise.allSettled([
            apiService.getUserRole(currentUser.id),
            apiService.getUserHobbies(currentUser.id),
            apiService.getEventsJoinedCount(currentUser.id),
            apiService.getUpcomingEvents(currentUser.id),
            apiService.getEventsHostedByUser(currentUser.id)
        ]);

        const userRole = roleResult.status === 'fulfilled' ? roleResult.value : null;
        const createEventBtn = document.querySelector('a[href="/create-event"]');
        const myEventsCard = document.getElementById('myEventsCard');
        if (userRole === 'seeker') {
            if (createEventBtn) createEventBtn.style.display = 'none';
            if (myEventsCard) myEventsCard.parentElement.style.display = 'none';
        }
        
        const userHobbies = hobbiesResult.status === 'fulfilled' ? hobbiesResult.value : [];
        const eventsJoinedCount = eventsJoinedResult.status === 'fulfilled' ? eventsJoinedResult.value : 0;
        const upcomingEvents = upcomingEventsResult.status === 'fulfilled' ? upcomingEventsResult.value : [];
        const hostedEvents = hostedEventsResult.status === 'fulfilled' ? hostedEventsResult.value : [];
        
        // Update stats
        document.getElementById('dashboardHobbiesCount').textContent = userHobbies.length;
        document.getElementById('dashboardEventsJoinedCount').textContent = eventsJoinedCount;
        document.getElementById('dashboardMyEventsCount').textContent = hostedEvents.length;
        document.getElementById('dashboardConnectionsCount').textContent = '0'; // TODO: fetch connections count
        
        // Display upcoming events and hosted events combined
        const combinedEvents = [...upcomingEvents, ...hostedEvents];
        displayUpcomingEvents(combinedEvents);
        
        // Display user hobbies
        displayUserHobbies(userHobbies);
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

/**
 * Display upcoming events with pagination (10 per page)
 */
let allEvents = [];
let currentPageIndex = 0;
const eventsPerPage = 10;
let currentFilter = 'all'; // 'all', 'joined', 'hosting'

function displayUpcomingEvents(events) {
    const container = document.getElementById('upcomingEventsContainer');
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    
    if (!events || events.length === 0) {
        container.innerHTML = '<p class="text-muted">No upcoming events yet. <a href="/events">Browse events</a></p>';
        loadMoreContainer.style.display = 'none';
        return;
    }
    
    // Store all events and reset pagination
    allEvents = events;
    currentPageIndex = 0;
    container.innerHTML = ''; // Clear container
    
    // Load first page
    loadMoreEvents();
}

/**
 * Filter events based on type
 */
function filterEvents(filterType) {
    currentFilter = filterType;
    currentPageIndex = 0;
    
    const container = document.getElementById('upcomingEventsContainer');
    container.innerHTML = '';
    
    // Update active card styling
    const eventsJoinedCard = document.getElementById('eventsJoinedCard');
    const myEventsCard = document.getElementById('myEventsCard');
    
    if (filterType === 'joined') {
        eventsJoinedCard.classList.add('active');
        myEventsCard.classList.remove('active');
    } else if (filterType === 'hosting') {
        myEventsCard.classList.add('active');
        eventsJoinedCard.classList.remove('active');
    } else {
        eventsJoinedCard.classList.remove('active');
        myEventsCard.classList.remove('active');
    }
    
    // Load first page with filter
    loadMoreEvents();
}

/**
 * Get filtered events based on current filter
 */
function getFilteredEvents() {
    if (currentFilter === 'joined') {
        // Show only Attending and Interested events
        return allEvents.filter(event => !event.availableSpots); // joined events don't have availableSpots
    } else if (currentFilter === 'hosting') {
        // Show only Hosting events
        return allEvents.filter(event => event.availableSpots !== undefined); // hosted events have availableSpots
    }
    // Show all if no filter
    return allEvents;
}

/**
 * Load next batch of events (10 at a time)
 */
function loadMoreEvents() {
    const container = document.getElementById('upcomingEventsContainer');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    
    const filteredEvents = getFilteredEvents();
    
    if (currentPageIndex >= filteredEvents.length) {
        loadMoreContainer.style.display = 'none';
        return;
    }
    
    // Get events for current page
    const startIndex = currentPageIndex;
    const endIndex = Math.min(currentPageIndex + eventsPerPage, filteredEvents.length);
    const pageEvents = filteredEvents.slice(startIndex, endIndex);
    
    if (pageEvents.length === 0) {
        if (currentPageIndex === 0) {
            container.innerHTML = '<p class="text-muted">No events matching your filter.</p>';
        }
        loadMoreContainer.style.display = 'none';
        return;
    }
    
    // Add events to container
    const eventHTML = pageEvents.map(event => {
        // Determine if this is a hosted event (has availableSpots) or joined event (has status)
        const isHosted = event.availableSpots !== undefined;
        const badgeClass = isHosted ? 'bg-primary' : (event.status === 'pending' ? 'bg-warning text-dark' : 'bg-success');
        const badgeText = isHosted ? 'Hosting' : (event.status === 'pending' ? 'Interested' : 'Attending');
        
        return `
        <div class="event-card">
            <h6 class="fw-bold">
                <a href="/events/${event.id}" class="text-decoration-none text-dark">
                    ${event.title}
                </a>
            </h6>
            <div class="event-meta">
                <span>
                    <i class="bi bi-calendar"></i>
                    <small>${event.date} at ${event.time}</small>
                </span>
                <span>
                    <i class="bi bi-geo-alt"></i>
                    <small>${event.location}</small>
                </span>
            </div>
            <div class="d-flex align-items-center justify-content-between">
                <span class="badge ${badgeClass}">
                    ${badgeText}
                </span>
                <a href="/events/${event.id}" class="btn btn-sm btn-outline-primary">
                    <i class="bi bi-arrow-right"></i>
                </a>
            </div>
        </div>
        `;
    }).join('');
    
    container.innerHTML += eventHTML;
    
    // Update page index
    currentPageIndex = endIndex;
    
    // Show/hide load more button
    if (currentPageIndex < filteredEvents.length) {
        loadMoreContainer.style.display = 'block';
    } else {
        loadMoreContainer.style.display = 'none';
    }
    
    // Setup load more button listener (only once)
    if (!loadMoreBtn.hasListener) {
        loadMoreBtn.addEventListener('click', loadMoreEvents);
        loadMoreBtn.hasListener = true;
    }
}

/**
 * Display user hobbies
 */
function displayUserHobbies(hobbies) {
    const container = document.getElementById('dashboardHobbiesContainer');
    
    if (!hobbies || hobbies.length === 0) {
        container.innerHTML = '<p class="text-muted">No hobbies yet. <a href="/profile">Add hobbies</a></p>';
        return;
    }
    
    const colors = ['primary', 'success', 'warning', 'info', 'danger', 'secondary'];
    container.innerHTML = hobbies.map((hobby, index) => `
        <span class="badge bg-${colors[index % colors.length]}">${hobby.name}</span>
    `).join('');
}

/**
 * Initialize filter listeners for stat cards
 */
function initializeFilters() {
    const eventsJoinedCard = document.getElementById('eventsJoinedCard');
    const myEventsCard = document.getElementById('myEventsCard');
    
    if (eventsJoinedCard) {
        eventsJoinedCard.addEventListener('click', () => filterEvents('joined'));
    }
    
    if (myEventsCard) {
        myEventsCard.addEventListener('click', () => filterEvents('hosting'));
    }
}
