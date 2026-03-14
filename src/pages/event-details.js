/**
 * Event Details Page JavaScript
 */

import { apiService } from '/src/services/api.js';

// Get event ID from URL parameters
function getEventIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    window.setActiveNav('Events');
    
    const eventId = getEventIdFromURL();
    if (!eventId) {
        document.querySelector('main').innerHTML = `
            <div class="container text-center py-5">
                <h2>Event Not Found</h2>
                <p>Sorry, we couldn't find the event you're looking for.</p>
                <a href="/pages/events.html" class="btn btn-primary">Back to Events</a>
            </div>
        `;
        return;
    }
    
    try {
        const event = await apiService.getEventById(eventId);
        if (event) {
            renderEventDetails(event);
        } else {
            document.querySelector('main').innerHTML = `
                <div class="container text-center py-5">
                    <h2>Event Not Found</h2>
                    <p>Sorry, we couldn't find the event you're looking for.</p>
                    <a href="/pages/events.html" class="btn btn-primary">Back to Events</a>
                </div>
            `;
        }
    } catch (error) {
        console.error('Failed to load event:', error);
        document.querySelector('main').innerHTML = `
            <div class="container text-center py-5">
                <h2>Error Loading Event</h2>
                <p>Failed to load event details. Please try again.</p>
                <a href="/pages/events.html" class="btn btn-primary">Back to Events</a>
            </div>
        `;
    }
});

// Render event details
function renderEventDetails(event) {
    if (!event) {
        document.querySelector('main').innerHTML = `
            <div class="container text-center py-5">
                <h2>Event Not Found</h2>
                <p>Sorry, we couldn't find the event you're looking for.</p>
                <a href="/pages/events.html" class="btn btn-primary">Back to Events</a>
            </div>
        `;
        return;
    }

    // Hero Section
    document.getElementById('eventHero').style.background = `linear-gradient(135deg, #667eea 0%, #764ba2 100%), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600"><rect fill="%23667eea" width="1200" height="600"/></svg>')`;
    document.getElementById('eventBadge').textContent = event.category;
    document.getElementById('eventTitle').textContent = event.title;

    // Description
    document.getElementById('eventDescription').textContent = event.description;

    // Details
    document.getElementById('eventLocation').textContent = event.location;
    document.getElementById('eventDate').textContent = event.date;
    document.getElementById('eventTime').textContent = event.time;
    document.getElementById('eventHost').textContent = event.host;
    
    // Calculate available spots
    const availableSpots = event.maxParticipants - event.currentParticipants;
    document.getElementById('eventSpots').textContent = `${availableSpots} of ${event.maxParticipants} spots available`;
    document.getElementById('eventParticipantsCount').textContent = `${event.currentParticipants} participants`;

    // Participants List
    const participantsList = document.getElementById('participantsList');
    participantsList.innerHTML = event.participants.map((name, index) => {
        const initials = name.split(' ').map(n => n[0]).join('');
        const role = index === 0 ? 'Host' : 'Participant';
        return `
            <div class="participant-card">
                <div class="participant-avatar">${initials}</div>
                <p class="participant-name">${name}</p>
                <p class="participant-role">${role}</p>
            </div>
        `;
    }).join('');

    // Summary Card
    document.getElementById('summaryCategory').textContent = event.category;
    document.getElementById('summaryDifficulty').textContent = event.difficulty;
    document.getElementById('summaryPrice').textContent = event.price;

    // Button handlers
    setupButtonHandlers(event);
}

// Setup button handlers
function setupButtonHandlers(event) {
    const joinBtn = document.getElementById('joinBtn');
    const interestedBtn = document.getElementById('interestedBtn');

    joinBtn.addEventListener('click', () => {
        alert(`✅ Great! You've joined "${event.title}". See you there!`);
    });

    interestedBtn.addEventListener('click', () => {
        alert(`❤️ You've marked "${event.title}" as interested. We'll notify you when it's coming up!`);
    });
}
