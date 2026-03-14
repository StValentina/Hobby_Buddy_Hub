/**
 * Hobbies Page JavaScript
 */

import { apiService } from '/src/services/api.js';
import { Header } from '../../src/components/header.js';

// Hobbies data (will be loaded from database)
let hobbiesData = [];

// Fallback static data (for testing when database is unavailable)
const fallbackHobbiesData = [
    {
        id: 1,
        name: 'Hiking',
        description: 'Explore nature trails and mountains with fellow hiking enthusiasts.',
        icon: '🥾',
        tags: ['outdoor', 'nature', 'fitness', 'adventure']
    },
    {
        id: 2,
        name: 'Photography',
        description: 'Capture moments and learn photography techniques from professionals.',
        icon: '📸',
        tags: ['creative', 'art', 'visual', 'technology']
    },
    {
        id: 3,
        name: 'Chess',
        description: 'Master the game of chess and compete with players of all levels.',
        icon: '♟️',
        tags: ['strategy', 'intellectual', 'competitive', 'games']
    },
    {
        id: 4,
        name: 'Cooking',
        description: 'Learn culinary skills and share delicious recipes with food lovers.',
        icon: '🍳',
        tags: ['culinary', 'creative', 'social', 'food']
    }
];

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
        console.log('Loading hobbies...');
        
        // Check localStorage cache first
        const cachedHobbies = localStorage.getItem('hobbies_cache');
        if (cachedHobbies) {
            console.log('Using cached hobbies...');
            const parsed = JSON.parse(cachedHobbies);
            hobbiesData = parsed.map(hobby => ({
                ...hobby,
                icon: generateHobbyIcon(hobby.name)
            }));
            renderHobbies(hobbiesData);
            attachEventListeners();
            
            // Update cache in background
            fetchAndCacheHobbies();
            return;
        }
        
        // Fetch from database
        await fetchAndCacheHobbies();
    } catch (error) {
        console.error('Failed to load hobbies:', error);
        // Fallback to static data
        console.log('Using fallback hobbies data...');
        hobbiesData = fallbackHobbiesData;
        renderHobbies(hobbiesData);
        attachEventListeners();
    }
}

/**
 * Fetch hobbies from database and cache them
 */
async function fetchAndCacheHobbies() {
    try {
        console.log('Fetching hobbies from Supabase...');
        const hobbies = await apiService.getHobbies();
        console.log('Hobbies loaded successfully:', hobbies);
        
        // Add generated icons to hobbies
        hobbiesData = hobbies.map(hobby => ({
            ...hobby,
            icon: generateHobbyIcon(hobby.name)
        }));
        
        // Cache in localStorage (with error handling)
        try {
            localStorage.setItem('hobbies_cache', JSON.stringify(hobbies));
        } catch (e) {
            console.warn('Failed to cache hobbies:', e);
        }
        
        console.log('Rendering hobbies...');
        renderHobbies(hobbiesData);
        
        console.log('Attaching event listeners...');
        attachEventListeners();
        
        console.log('Hobbies page loaded successfully!');
    } catch (error) {
        console.error('Failed to fetch hobbies from database:', error);
        throw error;
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Initialize header with authentication support
    const header = new Header();
    header.render();
    
    setActiveNav('Hobbies');
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

    grid.innerHTML = hobbies.map(hobby => `
        <div class="col-lg-3 col-md-6">
            <a href="/pages/hobby-details/index.html?id=${hobby.id}" class="hobby-card-link">
                <div class="hobby-card">
                    <div class="hobby-card-image">
                        ${hobby.icon}
                    </div>
                    <div class="hobby-card-body">
                        <h5 class="hobby-card-title">${hobby.name}</h5>
                        <p class="hobby-card-description">${hobby.description}</p>
                        <div class="hobby-card-tags">
                            ${hobby.tags.map(tag => `<span class="hobby-tag">${tag}</span>`).join('')}
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
    `).join('');
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

    if (!searchInput) {
        console.warn('Search input element not found');
        return;
    }
    if (!categorySelect) {
        console.warn('Category select element not found');
        return;
    }

    console.log('Attaching event listeners...');
    
    // Use debounce for search to avoid filtering on every keystroke
    const debouncedFilter = debounce(filterHobbies, 300);
    
    searchInput.addEventListener('input', () => {
        debouncedFilter();
    });

    categorySelect.addEventListener('change', () => {
        filterHobbies();
    });
}

/**
 * Filter hobbies based on search and tags
 */
function filterHobbies() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const selectedTag = document.getElementById('categorySelect').value;

    const filtered = hobbiesData.filter(hobby => {
        const matchesSearch = hobby.name.toLowerCase().includes(searchTerm) ||
                            hobby.description.toLowerCase().includes(searchTerm) ||
                            hobby.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        
        const matchesTag = !selectedTag || hobby.tags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase());

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

/**
 * Clear hobbies cache (for debugging/testing)
 */
function clearHobbiesCache() {
    localStorage.removeItem('hobbies_cache');
    console.log('Hobbies cache cleared');
    location.reload();
}
