/**
 * Create Event Page JavaScript
 */

import { apiService } from '/src/services/api.js';

/**
 * Initialize create event page
 */
document.addEventListener('DOMContentLoaded', async () => {
    window.setActiveNav('Events');
    
    // Check if user is authenticated
    if (!apiService.isAuthenticated()) {
        window.location.href = '/login';
        return;
    }
    
    // Load hobbies into category dropdown
    await loadHobbiesDropdown();
    
    // Load tags for event tagging
    await loadTagsCheckboxes();
    
    // Setup form submission
    setupFormListeners();
});

/**
 * Load hobbies into the category dropdown
 */
async function loadHobbiesDropdown() {
    try {
        const hobbies = await apiService.getHobbies();
        const categorySelect = document.getElementById('eventCategory');
        
        if (!hobbies || hobbies.length === 0) {
            categorySelect.innerHTML = '<option value="">No hobbies available</option>';
            return;
        }
        
        const options = hobbies.map(hobby => 
            `<option value="${hobby.id}">${hobby.name}</option>`
        ).join('');
        
        categorySelect.innerHTML = '<option value="">Select a hobby category...</option>' + options;
    } catch (error) {
        console.error('Failed to load hobbies:', error);
        const errorMessage = String(error?.message || '').toLowerCase();
        if (errorMessage.includes('session has expired') || errorMessage.includes('jwt') || errorMessage.includes('auth')) {
            showErrorMessage('Session expired. Redirecting to login...');
            setTimeout(() => {
                window.location.href = '/login';
            }, 1200);
            return;
        }
        showErrorMessage('Failed to load hobbies. Please refresh the page.');
    }
}

/**
 * Load tags as checkboxes
 */
async function loadTagsCheckboxes() {
    try {
        const tags = await apiService.getTags();
        const tagsContainer = document.getElementById('tagsContainer');
        
        if (!tags || tags.length === 0) {
            tagsContainer.innerHTML = '<p class="text-muted w-100">No tags available</p>';
            return;
        }
        
        const checkboxesHTML = tags.map(tag => `
            <div class="form-check">
                <input 
                    class="form-check-input event-tag-checkbox" 
                    type="checkbox" 
                    id="tag_${tag.id}" 
                    value="${tag.id}"
                    data-tag-name="${tag.name}"
                >
                <label class="form-check-label" for="tag_${tag.id}">
                    ${tag.name}
                </label>
            </div>
        `).join('');
        
        tagsContainer.innerHTML = checkboxesHTML;
    } catch (error) {
        console.error('Failed to load tags:', error);
        const tagsContainer = document.getElementById('tagsContainer');
        tagsContainer.innerHTML = '<p class="text-muted w-100">Failed to load tags</p>';
    }
}

/**
 * Setup form event listeners
 */
function setupFormListeners() {
    const form = document.getElementById('createEventForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleFormSubmit();
    });
}

/**
 * Handle form submission
 */
async function handleFormSubmit() {
    try {
        const currentUser = apiService.getCurrentUser();
        if (!currentUser) {
            showErrorMessage('User not authenticated');
            window.location.href = '/login';
            return;
        }
        
        // Validate form
        const title = document.getElementById('eventTitle').value.trim();
        const description = document.getElementById('eventDescription').value.trim();
        const categoryId = document.getElementById('eventCategory').value;
        const date = document.getElementById('eventDate').value;
        const time = document.getElementById('eventTime').value;
        const location = document.getElementById('eventLocation').value.trim();
        const participantLimit = document.getElementById('eventParticipantLimit').value;
        
        if (!title || !description || !categoryId || !date || !time || !location) {
            showErrorMessage('❌ Please fill in all required fields');
            return;
        }
        
        // Show loading state
        const submitBtn = document.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Creating...';
        
        try {
            // Get hobby name from ID
            const hobbies = await apiService.getHobbies();
            const selectedHobby = hobbies.find(h => h.id === categoryId);
            const categoryName = selectedHobby ? selectedHobby.name : 'Event';
            
            // Create event in database
            const eventData = {
                title: title,
                description: description,
                category: categoryName,
                date: date,
                time: time,
                location: location,
                hobby_id: categoryId,
                host_id: currentUser.id,
                max_participants: participantLimit ? parseInt(participantLimit) : null,
                created_at: new Date().toISOString()
            };
            
            // Call API to create event
            const result = await apiService.createEvent(eventData);
            
            // Add event tags if any are selected
            const selectedTagIds = Array.from(
                document.querySelectorAll('.event-tag-checkbox:checked')
            ).map(checkbox => checkbox.value);
            
            if (selectedTagIds.length > 0) {
                try {
                    await apiService.addTagsToEvent(result.id, selectedTagIds);
                } catch (tagError) {
                    console.warn('Failed to add tags to event:', tagError);
                    // Don't fail the entire event creation if tags fail
                }
            }
            
            showSuccessMessage('✅ Event created successfully!');
            
            // Redirect to events page after a short delay
            setTimeout(() => {
                window.location.href = `/events/${result.id}`;
            }, 1500);
            
        } catch (error) {
            console.error('Failed to create event:', error);
            showErrorMessage(`Failed to create event: ${error.message}`);
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    } catch (error) {
        console.error('Error in form submission:', error);
        showErrorMessage('An error occurred. Please try again.');
    }
}

/**
 * Show success message with toast
 */
function showSuccessMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'alert alert-success alert-dismissible fade show';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideIn 0.3s ease;
    `;
    toast.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

/**
 * Show error message with toast
 */
function showErrorMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'alert alert-danger alert-dismissible fade show';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideIn 0.3s ease;
    `;
    toast.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// Add animation style
const style = document.createElement('style');
style.innerHTML = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
