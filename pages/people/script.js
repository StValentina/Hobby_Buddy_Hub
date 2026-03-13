/**
 * People Page JavaScript
 */

// Sample people data
const peopleData = [
    {
        id: 1,
        name: 'Maria Garcia',
        city: 'Sofia',
        bio: 'Adventure seeker and outdoor enthusiast. Love hiking and exploring new trails.',
        hobbies: ['Hiking', 'Photography', 'Traveling'],
        role: 'seeker',
        avatar: 'MG'
    },
    {
        id: 2,
        name: 'Alex Petrov',
        city: 'Burgas',
        bio: 'Professional photographer and art lover. Always looking for new perspectives.',
        hobbies: ['Photography', 'Painting', 'Traveling'],
        role: 'host',
        avatar: 'AP'
    },
    {
        id: 3,
        name: 'Sofia Ivanova',
        city: 'Varna',
        bio: 'Passionate about cooking and sharing recipes. Food is life!',
        hobbies: ['Cooking', 'Literature', 'Dancing'],
        role: 'host',
        avatar: 'SI'
    },
    {
        id: 4,
        name: 'James Wilson',
        city: 'Sofia',
        bio: 'Chess enthusiast and strategy game lover. Always up for a challenge.',
        hobbies: ['Chess', 'Literature', 'Painting'],
        role: 'seeker',
        avatar: 'JW'
    },
    {
        id: 5,
        name: 'Elena Volkov',
        city: 'Plovdiv',
        bio: 'Dancer and movement enthusiast. Believe in the power of dance therapy.',
        hobbies: ['Dancing', 'Traveling', 'Photography'],
        role: 'host',
        avatar: 'EV'
    },
    {
        id: 6,
        name: 'David Martinez',
        city: 'Sofia',
        bio: 'Fitness enthusiast and hiking lover. Connect with nature every weekend.',
        hobbies: ['Hiking', 'Dancing', 'Chess'],
        role: 'seeker',
        avatar: 'DM'
    },
    {
        id: 7,
        name: 'Anna Sokolova',
        city: 'Ruse',
        bio: 'Artist and creative mind. Love painting and meeting like-minded creatives.',
        hobbies: ['Painting', 'Photography', 'Literature'],
        role: 'host',
        avatar: 'AS'
    },
    {
        id: 8,
        name: 'Tom Brown',
        city: 'Sofia',
        bio: 'Book lover and literature enthusiast. Always reading something interesting.',
        hobbies: ['Literature', 'Chess', 'Cooking'],
        role: 'seeker',
        avatar: 'TB'
    },
    {
        id: 9,
        name: 'Isabella Romano',
        city: 'Burgas',
        bio: 'Culinary expert and food blogger. Exploring flavors from around the world.',
        hobbies: ['Cooking', 'Traveling', 'Photography'],
        role: 'host',
        avatar: 'IR'
    },
    {
        id: 10,
        name: 'Michael Chen',
        city: 'Varna',
        bio: 'Photographer and visual storyteller. Capturing moments and memories.',
        hobbies: ['Photography', 'Hiking', 'Traveling'],
        role: 'seeker',
        avatar: 'MC'
    },
    {
        id: 11,
        name: 'Rachel Green',
        city: 'Sofia',
        bio: 'Yoga instructor and wellness coach. Promoting healthy living through movement.',
        hobbies: ['Dancing', 'Painting', 'Literature'],
        role: 'host',
        avatar: 'RG'
    },
    {
        id: 12,
        name: 'Carlos Rodriguez',
        city: 'Plovdiv',
        bio: 'Music enthusiast and dancer. Love sharing Latin dance culture.',
        hobbies: ['Dancing', 'Photography', 'Cooking'],
        role: 'host',
        avatar: 'CR'
    },
    {
        id: 13,
        name: 'Sophia Anderson',
        city: 'Sofia',
        bio: 'Fitness coach and healthy lifestyle advocate. Helping others achieve their goals.',
        hobbies: ['Hiking', 'Dancing', 'Cooking'],
        role: 'host',
        avatar: 'SA'
    },
    {
        id: 14,
        name: 'Lucas Silva',
        city: 'Burgas',
        bio: 'Aviation enthusiast and travel blogger. Exploring the world one flight at a time.',
        hobbies: ['Traveling', 'Photography', 'Literature'],
        role: 'seeker',
        avatar: 'LS'
    },
    {
        id: 15,
        name: 'Emma Thompson',
        city: 'Varna',
        bio: 'Creative writer and book club organizer. Passionate about storytelling.',
        hobbies: ['Literature', 'Painting', 'Traveling'],
        role: 'host',
        avatar: 'ET'
    }
];

// Current filters
let currentFilters = {
    name: '',
    hobby: '',
    city: '',
    role: ''
};

// Pagination settings
const itemsPerPage = 12;
let currentPage = 1;
let filteredPeople = [];

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    setActiveNav('Find People');
    filteredPeople = peopleData;
    renderPeople(filteredPeople);
    setupEventListeners();
});

/**
 * Setup filter event listeners
 */
function setupEventListeners() {
    const searchName = document.getElementById('searchName');
    const filterHobby = document.getElementById('filterHobby');
    const filterCity = document.getElementById('filterCity');
    const filterRole = document.getElementById('filterRole');
    const resetBtn = document.getElementById('resetFiltersBtn');

    searchName.addEventListener('input', (e) => {
        currentFilters.name = e.target.value.toLowerCase();
        applyFilters();
    });

    filterHobby.addEventListener('change', (e) => {
        currentFilters.hobby = e.target.value.toLowerCase();
        applyFilters();
    });

    filterCity.addEventListener('change', (e) => {
        currentFilters.city = e.target.value.toLowerCase();
        applyFilters();
    });

    filterRole.addEventListener('change', (e) => {
        currentFilters.role = e.target.value.toLowerCase();
        applyFilters();
    });

    resetBtn.addEventListener('click', resetFilters);
}

/**
 * Apply filters to people data
 */
function applyFilters() {
    const filtered = peopleData.filter(person => {
        const nameMatch = person.name.toLowerCase().includes(currentFilters.name);
        const hobbyMatch = !currentFilters.hobby || person.hobbies.some(h => h.toLowerCase().includes(currentFilters.hobby));
        const cityMatch = !currentFilters.city || person.city.toLowerCase() === currentFilters.city;
        const roleMatch = !currentFilters.role || person.role === currentFilters.role;

        return nameMatch && hobbyMatch && cityMatch && roleMatch;
    });

    filteredPeople = filtered;
    currentPage = 1;
    renderPeople(filtered);
}

/**
 * Reset all filters
 */
function resetFilters() {
    currentFilters = {
        name: '',
        hobby: '',
        city: '',
        role: ''
    };

    document.getElementById('searchName').value = '';
    document.getElementById('filterHobby').value = '';
    document.getElementById('filterCity').value = '';
    document.getElementById('filterRole').value = '';

    filteredPeople = peopleData;
    currentPage = 1;
    renderPeople(peopleData);
}

/**
 * Render people cards
 */
function renderPeople(people) {
    const container = document.getElementById('peopleGrid');

    if (people.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="no-results">
                    <i class="bi bi-search"></i>
                    <h3>No people found</h3>
                    <p class="text-muted">Try adjusting your filters to find more people</p>
                </div>
            </div>
        `;
        renderPaginationControls(0);
        return;
    }

    // Calculate pagination
    const totalPages = Math.ceil(people.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedPeople = people.slice(startIndex, endIndex);

    container.innerHTML = paginatedPeople.map(person => {
        const sharedHobby = person.hobbies[0]; // Show first hobby as shared interest
        const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'];
        const colorIndex = person.id % colors.length;
        const gradient = `linear-gradient(135deg, ${colors[colorIndex]} 0%, ${colors[(colorIndex + 1) % colors.length]} 100%)`;

        return `
            <div class="col-lg-4 col-md-6">
                <div class="person-card">
                    <div class="person-card-avatar" style="background: ${gradient};">
                        <span class="person-avatar-icon"><i class="bi bi-person-fill"></i></span>
                        <span class="role-badge">${person.role === 'host' ? '🎯 Host' : '🔍 Seeker'}</span>
                    </div>
                    <div class="person-card-body">
                        <h5 class="person-name">${person.name}</h5>
                        <div class="person-location">
                            <i class="bi bi-geo-alt"></i>
                            <span>${person.city}</span>
                        </div>
                        <div class="shared-interest">
                            <i class="bi bi-star-fill me-1"></i>${sharedHobby}
                        </div>
                        <p class="person-bio">${person.bio}</p>
                        <div class="person-hobbies">
                            ${person.hobbies.map(hobby => `<span class="hobby-tag">${hobby}</span>`).join('')}
                        </div>
                    </div>
                    <div class="person-card-footer">
                        <a href="/pages/profile/index.html" class="btn btn-view-profile">
                            <i class="bi bi-eye me-2"></i>View Profile
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Render pagination only if there are more than itemsPerPage items
    if (people.length > itemsPerPage) {
        renderPaginationControls(totalPages);
    } else {
        renderPaginationControls(0);
    }
}

/**
 * Render pagination controls
 */
function renderPaginationControls(totalPages) {
    const paginationContainer = document.getElementById('paginationControls');
    
    if (totalPages === 0) {
        paginationContainer.innerHTML = '';
        return;
    }

    let html = '';

    // Previous button
    html += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="goToPage(${currentPage - 1}); return false;">
                <i class="bi bi-chevron-left me-1"></i>Previous
            </a>
        </li>
    `;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            html += `<li class="page-item active"><span class="page-link">${i}</span></li>`;
        } else {
            html += `<li class="page-item"><a class="page-link" href="#" onclick="goToPage(${i}); return false;">${i}</a></li>`;
        }
    }

    // Next button
    html += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="goToPage(${currentPage + 1}); return false;">
                Next<i class="bi bi-chevron-right ms-1"></i>
            </a>
        </li>
    `;

    paginationContainer.innerHTML = html;
}

/**
 * Go to specific page
 */
function goToPage(pageNumber) {
    currentPage = pageNumber;
    renderPeople(filteredPeople);
    
    // Scroll to top of people grid
    document.getElementById('peopleGrid').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
