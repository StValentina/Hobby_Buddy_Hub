/**
 * Hobby Details Page JavaScript
 */

import { apiService } from '/src/services/api.js';

// Hobbies database with detailed information
const hobbiesDatabase = [
    {
        id: 1,
        name: 'Hiking',
        icon: '🥾',
        description: 'Hiking is the perfect way to connect with nature and get some exercise. Whether you\'re a beginner exploring local trails or an experienced mountaineer tackling challenging peaks, hiking offers physical activity, fresh air, and stunning views. Join our hiking community to discover new trails, meet fellow adventurers, and share your experiences on the mountain.',
        tags: ['outdoor', 'nature', 'fitness', 'adventure'],
        difficulty: 'Beginner to Expert',
        timeCommitment: '2-8 hours per event',
        cost: 'Free to Low Cost',
        popularity: 5,
        interestedCount: 156,
        activeEventsCount: 12,
        events: [
            { id: 1, title: 'Sunday Hiking – Vitosha', date: 'Mar 15, 2026', location: 'Vitosha, Sofia' },
            { id: 3, title: 'Morning Jogging', date: 'Mar 17, 2026', location: 'City Park, Sofia' },
        ],
        people: [
            { name: 'Maria Garcia', city: 'Sofia' },
            { name: 'David Martinez', city: 'Sofia' },
            { name: 'Michael Chen', city: 'Varna' },
            { name: 'James Wilson', city: 'Sofia' },
            { name: 'Anna Sokolova', city: 'Ruse' },
        ],
        relatedHobbies: ['Traveling', 'Photography', 'Painting']
    },
    {
        id: 2,
        name: 'Photography',
        icon: '📸',
        description: 'Capture the world through your lens! Photography is an art form that combines technical skill with creative vision. From landscape and portrait photography to street and macro photography, there\'s always something new to learn. Join our photography community to share tips, get feedback on your work, and participate in photo walks and exhibitions.',
        tags: ['creative', 'art', 'visual', 'technology'],
        difficulty: 'Beginner to Advanced',
        timeCommitment: '1-4 hours per event',
        cost: 'Variable (depends on equipment)',
        popularity: 4,
        interestedCount: 128,
        activeEventsCount: 8,
        events: [
            { id: 4, title: 'Photography Walk', date: 'Mar 18, 2026', location: 'Old Town, Sofia' },
        ],
        people: [
            { name: 'Alex Petrov', city: 'Burgas' },
            { name: 'Isabella Romano', city: 'Burgas' },
            { name: 'Elena Volkov', city: 'Plovdiv' },
            { name: 'Michael Chen', city: 'Varna' },
        ],
        relatedHobbies: ['Traveling', 'Hiking', 'Painting']
    },
    {
        id: 3,
        name: 'Chess',
        icon: '♟️',
        description: 'The game of kings! Chess is a timeless game of strategy and intellect. Whether you\'re learning the basics or mastering advanced tactics, chess offers endless opportunities for improvement and competition. Join our chess club to participate in tournaments, analyze games with fellow enthusiasts, and improve your rating.',
        tags: ['strategy', 'intellectual', 'competitive', 'games'],
        difficulty: 'Beginner to Expert',
        timeCommitment: '1-3 hours per event',
        cost: 'Free to Low Cost',
        popularity: 4,
        interestedCount: 94,
        activeEventsCount: 6,
        events: [],
        people: [
            { name: 'James Wilson', city: 'Sofia' },
            { name: 'Tom Brown', city: 'Sofia' },
            { name: 'David Martinez', city: 'Sofia' },
        ],
        relatedHobbies: ['Literature', 'Painting']
    },
    {
        id: 4,
        name: 'Cooking',
        icon: '🍳',
        description: 'Cooking is both an art and a science. Learn culinary techniques, explore new cuisines, and create delicious meals for yourself and others. From basic cooking skills to advanced techniques, our cooking community is here to help you grow as a chef. Share recipes, attend cooking classes, and make new friends who love food as much as you do.',
        tags: ['culinary', 'creative', 'social', 'food'],
        difficulty: 'Beginner to Advanced',
        timeCommitment: '2-4 hours per event',
        cost: 'Low Cost (ingredients)',
        popularity: 5,
        interestedCount: 142,
        activeEventsCount: 10,
        events: [
            { id: 5, title: 'Cooking Class - Italian Pasta', date: 'Mar 20, 2026', location: 'Kitchen Studio, Sofia' },
        ],
        people: [
            { name: 'Sofia Ivanova', city: 'Varna' },
            { name: 'Isabella Romano', city: 'Burgas' },
            { name: 'Tom Brown', city: 'Sofia' },
            { name: 'Carlos Rodriguez', city: 'Plovdiv' },
        ],
        relatedHobbies: ['Literature', 'Dancing']
    },
    {
        id: 5,
        name: 'Painting',
        icon: '🎨',
        description: 'Express yourself through art! Painting allows you to communicate emotions, ideas, and perspectives in a visual form. Whether you prefer watercolor, acrylic, oil, or digital painting, our art community welcomes all styles and skill levels. Attend workshops, share your creations, and grow alongside other artists in our supportive community.',
        tags: ['art', 'creative', 'visual', 'therapeutic'],
        difficulty: 'Beginner to Advanced',
        timeCommitment: '2-5 hours per session',
        cost: 'Low Cost (supplies)',
        popularity: 4,
        interestedCount: 118,
        activeEventsCount: 7,
        events: [
            { id: 6, title: 'Painting Workshop', date: 'Mar 22, 2026', location: 'Art Studio, Sofia' },
        ],
        people: [
            { name: 'Anna Sokolova', city: 'Ruse' },
            { name: 'Rachel Green', city: 'Sofia' },
            { name: 'James Wilson', city: 'Sofia' },
        ],
        relatedHobbies: ['Photography', 'Literature', 'Dancing']
    },
    {
        id: 6,
        name: 'Dancing',
        icon: '💃',
        description: 'Move to the rhythm! Dancing is a joyful way to express yourself, stay fit, and connect with others. From salsa and hip-hop to contemporary and ballroom, there\'s a dance style for everyone. Join our dance community to take classes, attend social dances, and make friends who share your passion for movement.',
        tags: ['movement', 'fitness', 'social', 'creative'],
        difficulty: 'Beginner to Advanced',
        timeCommitment: '1-2 hours per class',
        cost: 'Low to Moderate Cost',
        popularity: 4,
        interestedCount: 124,
        activeEventsCount: 9,
        events: [
            { id: 8, title: 'Dancing Lessons - Salsa', date: 'Mar 25, 2026', location: 'Dance Studio, Sofia' },
        ],
        people: [
            { name: 'Sofia Ivanova', city: 'Varna' },
            { name: 'Elena Volkov', city: 'Plovdiv' },
            { name: 'Carlos Rodriguez', city: 'Plovdiv' },
            { name: 'Rachel Green', city: 'Sofia' },
        ],
        relatedHobbies: ['Cooking', 'Painting', 'Traveling']
    },
    {
        id: 7,
        name: 'Literature',
        icon: '📚',
        description: 'Books are windows to other worlds! Join our book club to discuss literature, discover new authors, and engage in meaningful conversations about the books we love. Whether you\'re into classic literature, contemporary fiction, fantasy, mystery, or self-help, our community has something for every reader. Share your thoughts, get recommendations, and make friends with fellow book lovers.',
        tags: ['reading', 'intellectual', 'discussion', 'culture'],
        difficulty: 'Beginner',
        timeCommitment: '1-2 hours per event',
        cost: 'Free (library) to Low Cost (books)',
        popularity: 3,
        interestedCount: 87,
        activeEventsCount: 5,
        events: [
            { id: 7, title: 'Book Club Discussion', date: 'Mar 23, 2026', location: 'Library, Sofia' },
        ],
        people: [
            { name: 'Tom Brown', city: 'Sofia' },
            { name: 'Anna Sokolova', city: 'Ruse' },
            { name: 'Rachel Green', city: 'Sofia' },
        ],
        relatedHobbies: ['Chess', 'Painting']
    },
    {
        id: 8,
        name: 'Traveling',
        icon: '✈️',
        description: 'Explore the world and discover new cultures! Traveling expands your horizons, creates unforgettable memories, and connects you with people from different backgrounds. Whether you\'re planning solo trips, group adventures, or cultural exchanges, our travel community is here to help. Share experiences, get travel tips, find travel buddies, and inspire others with your stories.',
        tags: ['adventure', 'outdoor', 'social', 'exploration'],
        difficulty: 'Variable',
        timeCommitment: 'Days to Weeks',
        cost: 'Moderate to High Cost',
        popularity: 5,
        interestedCount: 167,
        activeEventsCount: 11,
        events: [],
        people: [
            { name: 'Maria Garcia', city: 'Sofia' },
            { name: 'Elena Volkov', city: 'Plovdiv' },
            { name: 'Isabella Romano', city: 'Burgas' },
            { name: 'Michael Chen', city: 'Varna' },
            { name: 'Alex Petrov', city: 'Burgas' },
        ],
        relatedHobbies: ['Photography', 'Hiking', 'Cooking']
    }
];

// Get hobby ID from URL
function getHobbyIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    const queryId = params.get('id');
    if (queryId) return queryId;

    const pathMatch = window.location.pathname.match(/^\/hobbies\/([^/]+)$/);
    return pathMatch ? decodeURIComponent(pathMatch[1]) : null;
}

// Show error message based on authentication status
function getErrorMessage(itemType = 'Hobby') {
    const isAuthenticated = apiService.isAuthenticated();
    
    if (!isAuthenticated) {
        return `
            <div class="container text-center py-5">
                <h2>You Are Not Registered</h2>
                <p>Please register or log in to access ${itemType.toLowerCase()}s.</p>
                <a href="/register" class="btn btn-primary me-2">Register</a>
                <a href="/login" class="btn btn-outline-primary">Log In</a>
            </div>
        `;
    } else {
        return `
            <div class="container text-center py-5">
                <h2>${itemType} Not Found</h2>
                <p>Sorry, we couldn't find the ${itemType.toLowerCase()} you're looking for.</p>
                <a href="/hobbies" class="btn btn-primary">Back to ${itemType}s</a>
            </div>
        `;
    }
}

// Generate icon for hobby based on name
function generateHobbyIcon(name) {
    const iconMap = {
        'hiking': '🥾', 'photography': '📸', 'chess': '♟️', 'cooking': '🍳',
        'painting': '🎨', 'dancing': '💃', 'literature': '📚', 'traveling': '✈️',
        'gardening': '🌱', 'fitness': '🏃', 'music': '🎵', 'board games': '🎲',
        'yoga': '🧘', 'cycling': '🚴', 'rock climbing': '🧗'
    };
    
    const lowerName = name.toLowerCase();
    return iconMap[lowerName] || '⭐';
}

// Render hobby details
function renderHobbyDetails(hobby) {
    if (!hobby) {
        document.querySelector('main').innerHTML = getErrorMessage('Hobby');
        return;
    }

    // Hero section
    document.getElementById('hobbyHero').style.background = `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`;
    
    // Display hobby image if available, or icon as fallback
    const hobbyIconElement = document.getElementById('hobbyIcon');
    if (hobby.image_url) {
        hobbyIconElement.innerHTML = `<img src="${hobby.image_url}" alt="${hobby.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    } else {
        const icon = hobby.icon || generateHobbyIcon(hobby.name);
        hobbyIconElement.textContent = icon;
    }
    
    document.getElementById('hobbyTitle').textContent = hobby.name;

    // Description
    document.getElementById('hobbyDescription').textContent = hobby.description;

    // Tags
    const tagsList = document.getElementById('tagsList');
    tagsList.innerHTML = hobby.tags.map(tag => 
        `<span class="hobby-tag">${tag.charAt(0).toUpperCase() + tag.slice(1)}</span>`
    ).join('');

    // Stats (with defaults if not provided)
    const interestedCount = document.getElementById('interestedCount');
    if (interestedCount) {
        interestedCount.textContent = (hobby.people ? hobby.people.length : 0) + ' people';
    }
    
    const activeEventsCount = document.getElementById('activeEventsCount');
    if (activeEventsCount) {
        activeEventsCount.textContent = (hobby.events ? hobby.events.length : 0) + ' events';
    }

    // Events
    const eventsList = document.getElementById('eventsList');
    if (hobby.events.length > 0) {
        eventsList.innerHTML = hobby.events.map(event => `
            <div class="event-list-item">
                <div class="event-info">
                    <h4>${event.title}</h4>
                    <p><i class="bi bi-calendar-event"></i>${event.date}</p>
                    <p><i class="bi bi-geo-alt"></i>${event.location}</p>
                </div>
                <a href="/events/${event.id}" class="btn btn-sm btn-primary">
                    View Event <i class="bi bi-arrow-right ms-1"></i>
                </a>
            </div>
        `).join('');
    } else {
        eventsList.innerHTML = '<p class="text-muted">No upcoming events for this hobby yet. Be the first to create one!</p>';
    }

    // People
    const peopleList = document.getElementById('peopleList');
    if (hobby.people && hobby.people.length > 0) {
        peopleList.innerHTML = hobby.people.map(person => `
            <div class="person-item">
                <div class="person-avatar">${person.name.split(' ').map(n => n[0]).join('')}</div>
                <p class="person-name">${person.name}</p>
                <p class="person-city">${person.city}</p>
            </div>
        `).join('');
    } else {
        peopleList.innerHTML = '<p class="text-muted">No people interested yet. Be the first to join!</p>';
    }

    // Related hobbies
    const relatedHobbies = document.getElementById('relatedHobbies');
    if (hobby.relatedHobbies && hobby.relatedHobbies.length > 0) {
        relatedHobbies.innerHTML = hobby.relatedHobbies.map(hobbyName => `
            <a href="#" class="related-hobby-link">
                <i class="bi bi-arrow-right"></i>${hobbyName}
            </a>
        `).join('');
    } else {
        relatedHobbies.innerHTML = '<p class="text-muted">No related hobbies at the moment.</p>';
    }

    // Join button
    setupJoinButton(hobby);
}

/**
 * Setup join hobby button
 */
function setupJoinButton(hobby) {
    const joinBtn = document.getElementById('joinHobbyBtn');
    if (!joinBtn) return;
    
    joinBtn.addEventListener('click', async () => {
        if (!apiService.isAuthenticated()) {
            window.location.href = '/login';
            return;
        }

        const currentUser = apiService.getCurrentUser();
        if (!currentUser?.id) {
            window.location.href = '/login';
            return;
        }

        try {
            const joinResult = await apiService.joinHobby(currentUser.id, hobby.id);
            if (joinResult.alreadyJoined) {
                alert(`ℹ️ You are already part of the ${hobby.name} hobby community.`);
                return;
            }
            alert(`✅ Great! You've joined the ${hobby.name} hobby community!`);
        } catch (error) {
            console.error('Failed to join hobby:', error);
            alert(`❌ Failed to join hobby: ${error.message || 'Unknown error'}`);
        }
    });
}

/**
 * Load hobby details from database
 */
async function loadHobbyDetails() {
    try {
        window.setActiveNav('Hobbies');
        
        const hobbyId = getHobbyIdFromURL();
        if (!hobbyId) {
            console.warn('No hobby ID provided in URL');
            renderHobbyDetails(null);
            return;
        }
        
        console.log('Loading hobby details for ID:', hobbyId);
        const hobby = await apiService.getHobbyById(hobbyId);
        
        if (hobby) {
            console.log('Hobby loaded:', hobby);
            renderHobbyDetails(hobby);
        } else {
            console.warn('Hobby not found');
            renderHobbyDetails(null);
        }
    } catch (error) {
        console.error('Failed to load hobby details:', error);
        renderHobbyDetails(null);
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadHobbyDetails();
});
