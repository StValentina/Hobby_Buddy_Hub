/**
 * People Page JavaScript
 */

import { apiService } from '/src/services/api.js';

// Get error message for unregistered users
function getErrorMessage(pageType = 'People') {
    return `
        <div class="container text-center py-5">
            <h2>You Are Not Registered</h2>
            <p>Please register or log in to find and connect with people.</p>
            <a href="/pages/auth/register.html" class="btn btn-primary me-2">Register</a>
            <a href="/pages/auth/login.html" class="btn btn-outline-primary">Log In</a>
        </div>
    `;
}

// All people data
let allPeople = [];

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
document.addEventListener('DOMContentLoaded', async () => {
    window.setActiveNav('Find People');

    // People directory is available only to authenticated users.
    if (!apiService.isAuthenticated()) {
        document.querySelector('main').innerHTML = getErrorMessage();
        return;
    }

    await loadPeople();
    setupEventListeners();
});

/**
 * Load people from Supabase
 */
async function loadPeople() {
    try {
        const currentUser = apiService.getCurrentUser();
        const profiles = await apiService.getAllProfiles();
        
        // Filter out the current logged-in user
        allPeople = profiles.filter(profile => profile.id !== currentUser?.id);
        filteredPeople = allPeople;
        renderPeople(filteredPeople);
    } catch (error) {
        console.error('Failed to load people:', error);
        document.getElementById('peopleGrid').innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">Failed to load people. Please try again.</div>
            </div>
        `;
    }
}

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
    const filtered = allPeople.filter(person => {
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

    filteredPeople = allPeople;
    currentPage = 1;
    renderPeople(allPeople);
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

        // Determine avatar display
        const avatarContent = person.avatar_url 
            ? `<img src="${person.avatar_url}" alt="${person.name}" class="person-avatar-image" loading="lazy" decoding="async">`
            : `<span class="person-avatar-icon"><i class="bi bi-person-fill"></i></span>`;
        const avatarStyle = `style="background: ${gradient};"`;

        return `
            <div class="col-lg-4 col-md-6">
                <div class="person-card">
                    <div class="person-card-avatar" ${avatarStyle}>
                        ${avatarContent}
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
                    </div>
                    <div class="person-card-footer">
                        <a href="/pages/profile.html?viewUserId=${person.id}" class="btn btn-view-profile">
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
