/**
 * Hobbies Page JavaScript
 */

import { apiService } from '/src/services/api.js';

// Hobbies data (will be loaded from database)
let hobbiesData = [];
let listenersAttached = false;

/**
 * Generate icon for hobby based on name
 */
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

/**
 * Load hobbies from database
 */
async function loadHobbies() {
    try {
        await fetchHobbiesFromDatabase();
    } catch (error) {
        console.error('Failed to load hobbies:', error);

        const grid = document.getElementById('hobbiesGrid');
        if (grid) {
            grid.innerHTML = `
                <div class="col-12">
                    <div class="no-results">
                        <i class="bi bi-exclamation-triangle"></i>
                        <h3>Unable to load hobbies</h3>
                        <p class="text-muted">Please try again in a moment.</p>
                    </div>
                </div>
            `;
        }
    }
}

/**
 * Fetch hobbies from database
 */
async function fetchHobbiesFromDatabase() {
    try {
        const hobbies = await apiService.getHobbies();
        
        // Add generated icons to hobbies
        hobbiesData = hobbies.map(hobby => ({
            ...hobby,
            tags: Array.isArray(hobby.tags) ? hobby.tags : [],
            icon: generateHobbyIcon(hobby.name)
        }));

        renderHobbies(hobbiesData);
    } catch (error) {
        console.error('Failed to fetch hobbies from database:', error);
        throw error;
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    window.setActiveNav('Hobbies');
    attachEventListeners();
    loadHobbies();
});

/**
 * Render hobby cards
 */
function renderHobbies(hobbies) {
    const grid = document.getElementById('hobbiesGrid');
    
    if (hobbies.length === 0) {
        grid.innerHTML = `
            <div class="col-12">
                <div class="no-results">
                    <i class="bi bi-search"></i>
                    <h3>No hobbies found</h3>
                    <p class="text-muted">Try adjusting your search or filter criteria</p>
                </div>
            </div>
        `;
        return;
    }

    grid.innerHTML = hobbies.map(hobby => {
        // Determine image display
        const imageContent = hobby.image_url 
            ? `<img src="${hobby.image_url}" alt="${hobby.name}" loading="lazy" decoding="async" style="width: 100%; height: 100%; object-fit: cover;">`
            : `<div style="display: flex; align-items: center; justify-content: center; height: 100%;">${hobby.icon}</div>`;

        return `
        <div class="col-lg-3 col-md-6">
            <a href="/pages/hobby-details.html?id=${hobby.id}" class="hobby-card-link">
                <div class="hobby-card">
                    <div class="hobby-card-image">
                        ${imageContent}
                    </div>
                    <div class="hobby-card-body">
                        <h5 class="hobby-card-title">${hobby.name}</h5>
                        <p class="hobby-card-description">${hobby.description}</p>
                        <div class="hobby-card-tags">
                            ${(hobby.tags || []).map(tag => `<span class="hobby-tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                    <div class="hobby-card-footer">
                        <button type="button" class="btn btn-primary btn-sm">
                            <i class="bi bi-arrow-right me-2"></i>View Details
                        </button>
                    </div>
                </div>
            </a>
        </div>
    `;
    }).join('');
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
    if (listenersAttached) {
        return;
    }

    const searchInput = document.getElementById('searchInput');
    const categorySelect = document.getElementById('categorySelect');

    if (!searchInput) {
        console.warn('Search input element not found');
        return;
    }
    if (!categorySelect) {
        console.warn('Category select element not found');
        return;
    }

    // Use debounce for search to avoid filtering on every keystroke
    const debouncedFilter = debounce(filterHobbies, 300);
    
    searchInput.addEventListener('input', () => {
        debouncedFilter();
    });

    categorySelect.addEventListener('change', () => {
        filterHobbies();
    });

    listenersAttached = true;
}

/**
 * Filter hobbies based on search and tags
 */
function filterHobbies() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const selectedTag = document.getElementById('categorySelect').value;

    const filtered = hobbiesData.filter(hobby => {
        const tags = Array.isArray(hobby.tags) ? hobby.tags : [];
        const matchesSearch = hobby.name.toLowerCase().includes(searchTerm) ||
                            hobby.description.toLowerCase().includes(searchTerm) ||
                            tags.some(tag => tag.toLowerCase().includes(searchTerm));
        
        const matchesTag = !selectedTag || tags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase());

        return matchesSearch && matchesTag;
    });

    renderHobbies(filtered);
}

/**
 * Join hobby handler
 */
function joinHobby(hobbyName) {
    alert(`You joined the "${hobbyName}" hobby group!`);
    console.log(`User joined: ${hobbyName}`);
    // TODO: Implement actual join functionality with Supabase
}
