/**
 * Event Details Page JavaScript
 */

// Extended events data with detailed information
const eventsDatabase = [
    {
        id: 1,
        title: 'Sunday Hiking – Vitosha',
        category: 'Hiking',
        description: 'Join us for an exciting hiking adventure on Vitosha Mountain! This is a perfect opportunity to explore nature, meet fellow hiking enthusiasts, and enjoy stunning views of Sofia. We\'ll start early in the morning and cover a moderate trail suitable for beginners to intermediate hikers.',
        location: 'Vitosha, Sofia',
        date: 'Mar 15, 2026',
        time: '10:00 AM',
        icon: '🥾',
        host: 'Alex Anderson',
        maxParticipants: 20,
        currentParticipants: 12,
        difficulty: 'Intermediate',
        price: 'Free',
        participants: ['Maria Garcia', 'James Wilson', 'Sofia Petrov', 'John Davis', 'Emma Taylor', 'Michael Brown', 'Lisa Anderson', 'David Miller', 'Anna Volkov', 'Peter Ivanov', 'Emma Sokolov', 'Alex Nicu']
    },
    {
        id: 2,
        title: 'Board Games Night',
        category: 'Games',
        description: 'A fun evening of strategic board games and friendly competition! We\'ll play classics like Catan, Ticket to Ride, and Carcassonne. Whether you\'re a board game veteran or just looking for a fun night out, this event is perfect for you. All skill levels welcome!',
        location: 'Downtown Café, Sofia',
        date: 'Mar 16, 2026',
        time: '6:00 PM',
        icon: '🎲',
        host: 'Sarah Mitchell',
        maxParticipants: 12,
        currentParticipants: 8,
        difficulty: 'Beginner',
        price: '5 BGN',
        participants: ['Tom Harris', 'Jenny Brown', 'Robert Jones', 'Maya Patel', 'Chris Turner', 'Lisa Wong', 'David Sharma', 'Emma Roberts']
    },
    {
        id: 3,
        title: 'Morning Jogging',
        category: 'Fitness',
        description: 'Start your day with an energizing group jogging session! We\'ll run through the scenic paths of City Park at a comfortable pace. Perfect for fitness enthusiasts of all levels. Bring your water bottle and get ready for a healthy morning!',
        location: 'City Park, Sofia',
        date: 'Mar 17, 2026',
        time: '7:00 AM',
        icon: '🏃',
        host: 'Mark Johnson',
        maxParticipants: 25,
        currentParticipants: 15,
        difficulty: 'Beginner',
        price: 'Free',
        participants: ['Lisa Park', 'Kevin Lee', 'Amanda Garcia', 'Daniel Martinez', 'Sophie Chen', 'Nicholas Brown', 'Victoria Anderson', 'Ryan Taylor', 'Megan Davis', 'Tyler Wilson', 'Olivia Miller', 'Brandon Moore', 'Alyssa Thomas', 'Jordan Martin', 'Emily Jackson']
    },
    {
        id: 4,
        title: 'Photography Walk',
        category: 'Photography',
        description: 'Explore the charm of Old Town Sofia through your camera lens! This guided photography walk is perfect for photographers of all levels. We\'ll visit iconic locations and learn composition tips while capturing beautiful moments. Bring your camera or smartphone!',
        location: 'Old Town, Sofia',
        date: 'Mar 18, 2026',
        time: '2:00 PM',
        icon: '📸',
        host: 'Michelle Chen',
        maxParticipants: 15,
        currentParticipants: 10,
        difficulty: 'Beginner',
        price: '10 BGN',
        participants: ['George Patterson', 'Rachel Green', 'Samuel Williams', 'Grace Lee', 'Christopher Davis', 'Natalie Martinez', 'Joshua Anderson', 'Hannah Wilson', 'Andrew Taylor', 'Sophia Johnson']
    },
    {
        id: 5,
        title: 'Cooking Class - Italian Pasta',
        category: 'Cooking',
        description: 'Learn the authentic Italian way to make fresh pasta from scratch! Our experienced chef will guide you through preparing homemade pasta, traditional sauces, and creating a perfect Italian meal. All ingredients and tools provided. Perfect for food lovers and beginners!',
        location: 'Kitchen Studio, Sofia',
        date: 'Mar 20, 2026',
        time: '6:30 PM',
        icon: '🍳',
        host: 'Isabella Romano',
        maxParticipants: 10,
        currentParticipants: 6,
        difficulty: 'Beginner',
        price: '25 BGN',
        participants: ['Marco Rossi', 'Anna Ferrari', 'Diego Russo', 'Giulia Moretti', 'Paolo Bianchi', 'Lucia Rizzo']
    },
    {
        id: 6,
        title: 'Painting Workshop',
        category: 'Art',
        description: 'Unleash your creativity in this fun and relaxing painting workshop! No previous art experience needed. Our artist instructor will help you create a beautiful acrylic painting step by step. All materials provided. Perfect way to relax and express yourself!',
        location: 'Art Studio, Sofia',
        date: 'Mar 22, 2026',
        time: '4:00 PM',
        icon: '🎨',
        host: 'Victoria Laurent',
        maxParticipants: 12,
        currentParticipants: 9,
        difficulty: 'Beginner',
        price: '15 BGN',
        participants: ['Robert Picasso', 'Emma Stone', 'Leon Mueller', 'Sophie Bernard', 'Laurent Dubois', 'Clara Hoffman', 'Marcel Fontaine', 'Isabelle Moreau', 'Catherine Leclerc']
    },
    {
        id: 7,
        title: 'Book Club Discussion',
        category: 'Literature',
        description: 'Join our monthly book club discussion! This month we\'re discussing "The Great Gatsby" by F. Scott Fitzgerald. Share your thoughts, discover new perspectives, and connect with fellow book lovers. All readers welcome, even if you haven\'t finished the book!',
        location: 'Library, Sofia',
        date: 'Mar 23, 2026',
        time: '7:00 PM',
        icon: '📚',
        host: 'Eleanor Davis',
        maxParticipants: 20,
        currentParticipants: 7,
        difficulty: 'Beginner',
        price: 'Free',
        participants: ['Henry Fitzgerald', 'Daisy Miller', 'Nick Carraway', 'Tom Buchanan', 'Myrtle Wilson', 'George Wilson', 'Jordan Baker']
    },
    {
        id: 8,
        title: 'Dancing Lessons - Salsa',
        category: 'Dancing',
        description: 'Learn the vibrant and fun Salsa dance! Our professional salsa instructor will teach you basic steps, rhythm, and partner dancing. Whether you\'re a complete beginner or want to improve your skills, this class is for you. No previous experience required!',
        location: 'Dance Studio, Sofia',
        date: 'Mar 25, 2026',
        time: '8:00 PM',
        icon: '💃',
        host: 'Carlos Rodriguez',
        maxParticipants: 16,
        currentParticipants: 11,
        difficulty: 'Beginner',
        price: '12 BGN',
        participants: ['Maria Salsa', 'Diego Latino', 'Carmen Flores', 'Miguel Ruiz', 'Lucia Santos', 'Ricardo Mendoza', 'Sofia Vargas', 'Juan Hernandez', 'Rosa Martinez', 'Pedro Garcia', 'Isabella Moreno']
    }
];

// Get event ID from URL parameters
function getEventIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Find event by ID
function findEventById(id) {
    return eventsDatabase.find(event => event.id === parseInt(id));
}

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

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    window.setActiveNav('Events');
    
    const eventId = getEventIdFromURL();
    if (eventId) {
        const event = findEventById(eventId);
        renderEventDetails(event);
    } else {
        // Default: show first event
        renderEventDetails(eventsDatabase[0]);
    }
});
