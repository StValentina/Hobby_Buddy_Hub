/**
 * Events Page JavaScript
 */

import { apiService } from '/src/services/api.js';

// Events data (will be loaded from database)
let eventsData = [];

/**
 * Generate icon for event based on hobby name
 */
function generateEventIcon(category) {
    const iconMap = {
        'hiking': '🥾', 'photography': '📸', 'chess': '♟️', 'cooking': '🍳',
        'painting': '🎨', 'dancing': '💃', 'literature & reading': '📚', 'travel & exploration': '✈️',
        'yoga & meditation': '🧘', 'cycling': '🚴', 'rock climbing': '🧗', 'music & instruments': '🎵'
    };
    
    const lowerCategory = category.toLowerCase();
    return iconMap[lowerCategory] || '📅';
}

/**
 * Load events from database
 */
async function loadEvents() {
    try {
        console.log('Loading events...');
        
        // Check localStorage cache first
        const cachedEvents = localStorage.getItem('events_cache');
        if (cachedEvents) {
            console.log('Using cached events...');
            const parsed = JSON.parse(cachedEvents);
            eventsData = parsed.map(event => ({
                ...event,
                icon: generateEventIcon(event.category)
            }));
            renderEvents(eventsData);
            attachEventListeners();
            
            // Update cache in background
            fetchAndCacheEvents();
            return;
        }
        
        // Fetch from database
        await fetchAndCacheEvents();
    } catch (error) {
        console.error('Failed to load events:', error);
        // Fallback to static data
        console.log('Using fallback events data...');
        eventsData = [];
        renderEvents(eventsData);
        attachEventListeners();
    }
}

/**
 * Fetch events from database and cache them
 */
async function fetchAndCacheEvents() {
    try {
        console.log('Fetching events from Supabase...');
        const events = await apiService.getEvents();
        console.log('Events loaded successfully:', events);
        
        // Add generated icons to events
        eventsData = events.map(event => ({
            ...event,
            icon: generateEventIcon(event.category)
        }));
        
        // Cache in localStorage
        try {
            localStorage.setItem('events_cache', JSON.stringify(events));
        } catch (e) {
            console.warn('Failed to cache events:', e);
        }
        
        console.log('Rendering events...');
        renderEvents(eventsData);
        
        console.log('Attaching event listeners...');
        attachEventListeners();
        
        console.log('Events page loaded successfully!');
    } catch (error) {
        console.error('Failed to fetch events from database:', error);
        throw error;
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    window.setActiveNav('Events');
    loadEvents();
});

/**
 * Render event cards
 */
function renderEvents(events) {
    const container = document.getElementById('eventsContainer');
    
    if (events.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="text-center py-5">
                    <i class="bi bi-calendar-x" style="font-size: 3rem; color: #dee2e6;"></i>
                    <h3 class="mt-3 text-muted">No events found</h3>
                    <p class="text-muted">Check back later for more events</p>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = events.map(event => `
        <div class="col-lg-4 col-md-6">
            <a href="/pages/event-details.html?id=${event.id}" class="event-card-link">
                <div class="event-card">
                    <div class="event-card-header">
                        <span class="event-badge">${event.category}</span>
                        <h5 class="event-title">${event.title}</h5>
                    </div>
                    <div class="event-card-body">
                        <div class="event-detail">
                            <i class="bi bi-geo-alt"></i>
                            <p class="event-detail-text">${event.location}</p>
                        </div>
                        <div class="event-detail">
                            <i class="bi bi-calendar-event"></i>
                            <p class="event-detail-text">${event.date} at ${event.time}</p>
                        </div>
                        <div class="event-detail">
                            <i class="bi bi-people"></i>
                            <p class="event-detail-text event-capacity">
                                <span>${event.availableSpots} of ${event.maxParticipants} spots available</span>
                            </p>
                        </div>
                    </div>
                    <div class="event-card-footer">
                        <button class="btn btn-primary">
                            <i class="bi bi-plus-circle me-2"></i>View Details
                        </button>
                    </div>
                </div>
            </a>
        </div>
    `).join('');
}

/**
 * Join event handler
 */
function joinEvent(eventTitle) {
    alert(`You joined: "${eventTitle}"`);
    console.log(`User joined event: ${eventTitle}`);
    // TODO: Implement actual join functionality with Supabase
}
/**
 * Debounce function to throttle filter execution
 */
function debounce(func, delay = 300) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Attach event listeners for search and filter
 */
function attachEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const categorySelect = document.getElementById('categorySelect');

    if (searchInput) {
        const debouncedFilter = debounce(filterEvents, 300);
        searchInput.addEventListener('input', () => {
            debouncedFilter();
        });
    }

    if (categorySelect) {
        categorySelect.addEventListener('change', () => {
            filterEvents();
        });
    }
}

/**
 * Filter events based on search and category
 */
function filterEvents() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const selectedCategory = document.getElementById('categorySelect')?.value || '';

    const filtered = eventsData.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm) ||
                            event.location.toLowerCase().includes(searchTerm) ||
                            event.category.toLowerCase().includes(searchTerm);
        
        const matchesCategory = !selectedCategory || event.category.toLowerCase() === selectedCategory.toLowerCase();

        return matchesSearch && matchesCategory;
    });

    renderEvents(filtered);
}

/**
 * Clear events cache (for debugging/testing)
 */
function clearEventsCache() {
    localStorage.removeItem('events_cache');
    console.log('Events cache cleared');
    location.reload();
}