/**
 * Hobbies Page JavaScript
 */

// Sample hobby data
const hobbiesData = [
    {
        id: 1,
        name: 'Hiking',
        description: 'Explore nature trails and mountains with fellow hiking enthusiasts.',
        category: 'outdoor',
        icon: '🥾',
        tags: ['outdoor', 'nature', 'fitness', 'adventure']
    },
    {
        id: 2,
        name: 'Photography',
        description: 'Capture moments and learn photography techniques from professionals.',
        category: 'creative',
        icon: '📸',
        tags: ['creative', 'art', 'visual', 'technology']
    },
    {
        id: 3,
        name: 'Chess',
        description: 'Master the game of chess and compete with players of all levels.',
        category: 'intellectual',
        icon: '♟️',
        tags: ['strategy', 'intellectual', 'competitive', 'games']
    },
    {
        id: 4,
        name: 'Cooking',
        description: 'Learn culinary skills and share delicious recipes with food lovers.',
        category: 'creative',
        icon: '🍳',
        tags: ['culinary', 'creative', 'social', 'food']
    },
    {
        id: 5,
        name: 'Painting',
        description: 'Express yourself through art and paint with like-minded artists.',
        category: 'creative',
        icon: '🎨',
        tags: ['art', 'creative', 'visual', 'therapeutic']
    },
    {
        id: 6,
        name: 'Dancing',
        description: 'Dance to your favorite music and join dance communities.',
        category: 'sports',
        icon: '💃',
        tags: ['dance', 'fitness', 'social', 'music']
    },
    {
        id: 7,
        name: 'Reading',
        description: 'Read, discuss, and analyze books with passionate readers.',
        category: 'intellectual',
        icon: '📚',
        tags: ['reading', 'intellectual', 'discussion', 'culture']
    },
    {
        id: 8,
        name: 'Traveling',
        description: 'Discover new places and travel with adventurous explorers.',
        category: 'outdoor',
        icon: '✈️',
        tags: ['adventure', 'outdoor', 'social', 'exploration']
    }
];

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    setActiveNav('Hobbies');
    renderHobbies(hobbiesData);
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
 * Attach event listeners for search and filter
 */
function attachEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const categorySelect = document.getElementById('categorySelect');

    searchInput.addEventListener('input', () => {
        filterHobbies();
    });

    categorySelect.addEventListener('change', () => {
        filterHobbies();
    });
}

/**
 * Filter hobbies based on search and category
 */
function filterHobbies() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const selectedCategory = document.getElementById('categorySelect').value;

    const filtered = hobbiesData.filter(hobby => {
        const matchesSearch = hobby.name.toLowerCase().includes(searchTerm) ||
                            hobby.description.toLowerCase().includes(searchTerm) ||
                            hobby.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        
        const matchesCategory = !selectedCategory || hobby.category === selectedCategory;

        return matchesSearch && matchesCategory;
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
