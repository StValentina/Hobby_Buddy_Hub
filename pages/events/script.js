/**
 * Events Page JavaScript
 */

// Sample events data
const eventsData = [
    {
        id: 1,
        title: 'Sunday Hiking – Vitosha',
        category: 'Hiking',
        location: 'Vitosha, Sofia',
        date: 'Mar 15, 2026',
        time: '10:00 AM',
        participants: 12,
        icon: '🥾'
    },
    {
        id: 2,
        title: 'Board Games Night',
        category: 'Games',
        location: 'Downtown Café, Sofia',
        date: 'Mar 16, 2026',
        time: '6:00 PM',
        participants: 8,
        icon: '🎲'
    },
    {
        id: 3,
        title: 'Morning Jogging',
        category: 'Fitness',
        location: 'City Park, Sofia',
        date: 'Mar 17, 2026',
        time: '7:00 AM',
        participants: 15,
        icon: '🏃'
    },
    {
        id: 4,
        title: 'Photography Walk',
        category: 'Photography',
        location: 'Old Town, Sofia',
        date: 'Mar 18, 2026',
        time: '2:00 PM',
        participants: 10,
        icon: '📸'
    },
    {
        id: 5,
        title: 'Cooking Class - Italian Pasta',
        category: 'Cooking',
        location: 'Kitchen Studio, Sofia',
        date: 'Mar 20, 2026',
        time: '6:30 PM',
        participants: 6,
        icon: '🍳'
    },
    {
        id: 6,
        title: 'Painting Workshop',
        category: 'Art',
        location: 'Art Studio, Sofia',
        date: 'Mar 22, 2026',
        time: '4:00 PM',
        participants: 9,
        icon: '🎨'
    },
    {
        id: 7,
        title: 'Book Club Discussion',
        category: 'Literature',
        location: 'Library, Sofia',
        date: 'Mar 23, 2026',
        time: '7:00 PM',
        participants: 7,
        icon: '📚'
    },
    {
        id: 8,
        title: 'Dancing Lessons - Salsa',
        category: 'Dancing',
        location: 'Dance Studio, Sofia',
        date: 'Mar 25, 2026',
        time: '8:00 PM',
        participants: 11,
        icon: '💃'
    }
];

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    setActiveNav('Events');
    renderEvents(eventsData);
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
                            <span>${event.participants} attending</span>
                        </p>
                    </div>
                </div>
                <div class="event-card-footer">
                    <button class="btn btn-primary" onclick="joinEvent('${event.title}')">
                        <i class="bi bi-plus-circle me-2"></i>Join Event
                    </button>
                </div>
            </div>
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
