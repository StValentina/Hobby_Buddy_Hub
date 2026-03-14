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
            await renderEventDetails(event);
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
async function renderEventDetails(event) {
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
    const availableSpots = event.maxParticipants > 0 ? event.maxParticipants - event.currentParticipants : 0;
    document.getElementById('eventSpots').textContent = `${availableSpots} of ${event.maxParticipants} spots available`;
    document.getElementById('eventParticipantsCount').textContent = `${event.currentParticipants} participants`;

    // Participants List - Include host first, then other participants
    const participantsList = document.getElementById('participantsList');
    let allParticipants = [];
    
    // Add host first if not in participants list
    if (event.host && !event.participants.includes(event.host)) {
        allParticipants.push({ name: event.host, role: 'Host' });
    }
    
    // Add other participants
    if (event.participants && event.participants.length > 0) {
        event.participants.forEach(name => {
            if (name !== event.host) {
                allParticipants.push({ name: name, role: 'Participant' });
            }
        });
    }
    
    if (allParticipants.length === 0) {
        participantsList.innerHTML = '<p class="text-muted">No participants yet</p>';
    } else {
        participantsList.innerHTML = allParticipants.map((participant) => {
            const initials = participant.name.split(' ').map(n => n[0]).join('');
            return `
                <div class="participant-card">
                    <div class="participant-avatar">${initials}</div>
                    <p class="participant-name">${participant.name}</p>
                    <p class="participant-role">${participant.role}</p>
                </div>
            `;
        }).join('');
    }

    // Summary Card
    document.getElementById('summaryCategory').textContent = event.category;
    
    // Load and display tags
    try {
        const eventTags = await apiService.getEventTags(event.id);
        const tagsContainer = document.getElementById('summaryTags');
        
        if (eventTags && eventTags.length > 0) {
            tagsContainer.innerHTML = eventTags.map(tag => 
                `<span class="badge bg-info me-2">${tag.name}</span>`
            ).join('');
        } else {
            tagsContainer.innerHTML = '<span class="text-muted">No tags</span>';
        }
    } catch (error) {
        console.warn('Failed to load event tags:', error);
        document.getElementById('summaryTags').innerHTML = '<span class="text-muted">No tags</span>';
    }

    // Button handlers
    setupButtonHandlers(event);
}

// Setup button handlers
function setupButtonHandlers(event) {
    const joinBtn = document.getElementById('joinBtn');
    const interestedBtn = document.getElementById('interestedBtn');

    joinBtn.addEventListener('click', async () => {
        if (!apiService.isAuthenticated()) {
            window.location.href = '/pages/auth/login.html';
            return;
        }

        const currentUser = apiService.getCurrentUser();
        if (!currentUser?.id) {
            window.location.href = '/pages/auth/login.html';
            return;
        }

        try {
            const joinResult = await apiService.joinEvent(currentUser.id, event.id);
            if (joinResult.alreadyJoined) {
                alert(`ℹ️ You are already joined to "${event.title}".`);
                return;
            }
            alert(`✅ Great! You've joined "${event.title}". See you there!`);
            // Redirect to events page after showing success message
            setTimeout(() => {
                window.location.href = '/pages/events.html';
            }, 1000);
        } catch (error) {
            console.error('Failed to join event:', error);
            alert(`❌ Failed to join event: ${error.message || 'Unknown error'}`);
        }
    });

    interestedBtn.addEventListener('click', async () => {
        if (!apiService.isAuthenticated()) {
            window.location.href = '/pages/auth/login.html';
            return;
        }

        const currentUser = apiService.getCurrentUser();
        if (!currentUser?.id) {
            window.location.href = '/pages/auth/login.html';
            return;
        }

        try {
            const result = await apiService.markEventInterested(currentUser.id, event.id);
            if (result.alreadyJoined) {
                alert(`ℹ️ You are already attending "${event.title}".`);
                return;
            }
            if (result.alreadyInterested) {
                alert(`ℹ️ You have already marked "${event.title}" as interested.`);
                return;
            }

            alert(`❤️ You've marked "${event.title}" as interested.`);
        } catch (error) {
            console.error('Failed to mark event as interested:', error);
            alert(`❌ Failed to mark interested: ${error.message || 'Unknown error'}`);
        }
    });
}
