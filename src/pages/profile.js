/**
 * Profile Page JavaScript
 */

import { apiService } from '/src/services/api.js';

// User profile data loaded from database
let userProfile = null;
let allHobbies = []; // All available hobbies
let selectedHobbyIds = []; // Currently selected hobbies by user
let isViewingOtherProfile = false; // Flag to indicate if viewing another user's profile
let viewedUserId = null; // ID of the user being viewed

// Get user ID from URL parameters
function getViewedUserIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('viewUserId');
}

// Clear previous profile data from display
function clearProfileDisplay() {
    document.getElementById('displayName').textContent = '';
    document.getElementById('displayEmail').textContent = '';
    document.getElementById('displayCity').textContent = '';
    document.getElementById('displayBio').textContent = '';
    document.getElementById('hobbiesList').innerHTML = '<span class="text-muted">Loading hobbies...</span>';
    document.getElementById('upcomingEventsList').innerHTML = '<p class="text-muted">Loading events...</p>';
    document.getElementById('eventsJoinedCount').textContent = '0';
    document.getElementById('hobbiesCount').textContent = '0';
    document.getElementById('connectionsCount').textContent = '0';
    
    // Reset avatar to default
    const avatarDisplay = document.getElementById('avatarDisplay');
    if (avatarDisplay) {
        avatarDisplay.innerHTML = '<i class="bi bi-person-fill"></i>';
        avatarDisplay.style.backgroundImage = '';
        avatarDisplay.style.background = 'linear-gradient(135deg, #667eea 0%, #667eea99 100%)';
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    window.setActiveNav('Profile');
    
    // Check if user is authenticated
    if (!apiService.isAuthenticated()) {
        window.location.href = '/login';
        return;
    }
    
    // Initialize settings modal
    const settingsModalElement = document.getElementById('settingsModal');
    if (settingsModalElement) {
        window.settingsModal = new bootstrap.Modal(settingsModalElement);
    }
    
    // Check if should open settings modal
    const urlParams = new URLSearchParams(window.location.search);
    const shouldOpenSettings = urlParams.get('settings') === 'open';
    
    // Check if viewing another user's profile
    viewedUserId = getViewedUserIdFromURL();
    if (viewedUserId) {
        isViewingOtherProfile = true;
    }
    
    await loadUserProfile();
    setupEventListeners();
    
    // Auto-open settings modal if requested
    if (shouldOpenSettings && window.settingsModal) {
        window.settingsModal.show();
    }
});

/**
 * Load user profile from database
 */
async function loadUserProfile() {
    try {
        // Clear previous profile data from display
        clearProfileDisplay();
        
        let userId;
        
        if (isViewingOtherProfile) {
            // Load profile of viewed user
            userId = viewedUserId;
        } else {
            // Load current user's profile
            const currentUser = apiService.getCurrentUser();
            if (!currentUser) {
                console.error('No current user found');
                window.location.href = '/login';
                return;
            }
            userId = currentUser.id;
        }
        
        // Fetch profile data
        const profileData = await apiService.getProfile(userId);
        
        if (!profileData) {
            console.error('Profile not found');
            showErrorMessage('Profile not found. Please complete your profile setup.');
            return;
        }
        
        // Load secondary profile data without failing the whole page if one request errors.
        const [hobbiesResult, eventsCountResult, allHobbiesResult, upcomingEventsResult] = await Promise.allSettled([
            apiService.getUserHobbies(userId),
            apiService.getEventsJoinedCount(userId),
            apiService.getHobbies(),
            isViewingOtherProfile ? Promise.resolve([]) : apiService.getUpcomingEvents(userId),
        ]);

        const hobbies = hobbiesResult.status === 'fulfilled' ? hobbiesResult.value : [];
        const eventsJoinedCount = eventsCountResult.status === 'fulfilled' ? eventsCountResult.value : 0;
        allHobbies = allHobbiesResult.status === 'fulfilled' ? allHobbiesResult.value : [];
        const upcomingEvents = upcomingEventsResult.status === 'fulfilled' ? upcomingEventsResult.value : [];
        selectedHobbyIds = hobbies.map(h => h.id);
        
        // Construct user profile object
        userProfile = {
            id: userId,
            email: profileData.email || 'Not displayed',
            name: profileData.full_name || 'User',
            city: profileData.city || '',
            bio: profileData.bio || '',
            avatar_url: profileData.avatar_url,
            hobbies: hobbies.map(h => h.name),
            eventsJoined: eventsJoinedCount,
            hobbiesCount: hobbies.length,
            connections: 0 // TODO: fetch from connections
        };
        
        displayProfileInfo(userProfile);
        displayHobbies(userProfile.hobbies);
        displayUpcomingEvents(upcomingEvents);
        updateProfileStats(userProfile);
        
    } catch (error) {
        console.error('Failed to load user profile:', error);
        showErrorMessage('Failed to load profile. Please try again.');
    }
}

/**
 * Display profile information
 */
function displayProfileInfo(profile) {
    document.getElementById('displayName').textContent = profile.name;
    document.getElementById('displayEmail').textContent = profile.email;
    document.getElementById('displayCity').textContent = profile.city || 'Not set';
    document.getElementById('displayBio').textContent = profile.bio || 'No bio yet.';
    
    // Display avatar if available
    const avatarDisplay = document.getElementById('avatarDisplay');
    if (profile.avatar_url) {
        avatarDisplay.innerHTML = ''; // Clear icon
        avatarDisplay.style.background = ''; // Clear gradient background
        avatarDisplay.style.backgroundImage = `url('${profile.avatar_url}')`;
        avatarDisplay.style.backgroundSize = 'cover';
        avatarDisplay.style.backgroundPosition = 'center';
    } else {
        // Use default gradient if no avatar
        avatarDisplay.innerHTML = '<i class="bi bi-person-fill"></i>'; // Show icon
        const colors = ['#667eea', '#764ba2'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        avatarDisplay.style.backgroundImage = '';
        avatarDisplay.style.background = `linear-gradient(135deg, ${randomColor} 0%, ${randomColor}dd 100%)`;
    }
}

/**
 * Display hobbies list
 */
function displayHobbies(hobbies) {
    const hobbiesList = document.getElementById('hobbiesList');
    if (!hobbies || hobbies.length === 0) {
        hobbiesList.innerHTML = '<span class="text-muted cursor-pointer" onclick="showEditHobbiesForm()">No hobbies selected yet. Click to add hobbies.</span>';
        return;
    }

    hobbiesList.innerHTML = hobbies.map(hobby => 
        `<span class="hobby-badge cursor-pointer" onclick="showEditHobbiesForm()" title="Click to edit hobbies">${hobby}</span>`
    ).join('');
}

/**
 * Display upcoming events
 */
function displayUpcomingEvents(events) {
    const eventsList = document.getElementById('upcomingEventsList');
    if (!events || events.length === 0) {
        eventsList.innerHTML = '<p class="text-muted">No upcoming events yet. <a href="/events">Browse events</a></p>';
        return;
    }

    eventsList.innerHTML = events.map(event => `
        <div class="event-card mb-3 p-3 border rounded">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <h5 class="mb-0">
                    <a href="/events/${event.id}" class="text-decoration-none">
                        ${event.title}
                    </a>
                </h5>
                <span class="badge bg-primary">${event.category}</span>
            </div>
            <p class="text-muted small mb-2">${event.description || 'No description'}</p>
            <div class="d-flex justify-content-between text-muted small">
                <span><i class="bi bi-calendar3 me-1"></i>${event.date}</span>
                <span><i class="bi bi-clock me-1"></i>${event.time}</span>
                <span><i class="bi bi-geo-alt me-1"></i>${event.location}</span>
            </div>
        </div>
    `).join('');
}

/**
 * Update profile stats in sidebar
 */
function updateProfileStats(profile) {
    const eventsJoinedEl = document.getElementById('eventsJoinedCount');
    const hobbiesCountEl = document.getElementById('hobbiesCount');
    const connectionsEl = document.getElementById('connectionsCount');

    if (eventsJoinedEl) eventsJoinedEl.textContent = profile.eventsJoined;
    if (hobbiesCountEl) hobbiesCountEl.textContent = profile.hobbiesCount;
    if (connectionsEl) connectionsEl.textContent = profile.connections;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    const editProfileBtn = document.getElementById('editProfileBtn');
    const saveChangesBtn = document.getElementById('saveChangesBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const deleteConfirmInput = document.getElementById('deleteConfirmInput');
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    const saveHobbiesBtn = document.getElementById('saveHobbiesBtn');
    const cancelHobbiesBtn = document.getElementById('cancelHobbiesBtn');
    const connectBtn = document.getElementById('connectBtn');

    // Handle viewing another profile
    if (isViewingOtherProfile) {
        editProfileBtn.style.display = 'none';
        changeAvatarBtn.style.display = 'none';
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) settingsBtn.style.display = 'none';
        const dangerZone = document.querySelector('.danger-zone');
        if (dangerZone) {
            dangerZone.style.display = 'none';
        }
        
        // Show and setup connect button
        if (connectBtn && userProfile) {
            connectBtn.style.display = 'block';
            const connectBtnText = document.getElementById('connectBtnText');
            
            // Check connection status
            checkAndUpdateConnectionButton(connectBtn, connectBtnText);
        }
        return;
    }

    // Edit profile button
    editProfileBtn.addEventListener('click', showEditForm);

    // Save changes button
    saveChangesBtn.addEventListener('click', saveProfileChanges);

    // Cancel button
    cancelEditBtn.addEventListener('click', hideEditForm);

    // Confirm delete account button with validation
    confirmDeleteBtn.addEventListener('click', () => {
        const inputValue = deleteConfirmInput.value.trim();
        if (inputValue === 'DELETE') {
            deleteAccount();
        } else {
            deleteConfirmInput.classList.add('is-invalid');
            showErrorMessage('Please type "DELETE" to confirm');
        }
    });

    // Clear error styling when user types
    deleteConfirmInput.addEventListener('input', () => {
        deleteConfirmInput.classList.remove('is-invalid');
    });

    // Change avatar button
    changeAvatarBtn.addEventListener('click', handleChangeAvatar);

    // Save hobbies button
    saveHobbiesBtn.addEventListener('click', saveHobbiesChanges);

    // Cancel hobbies button
    cancelHobbiesBtn.addEventListener('click', hideEditHobbiesForm);
}

/**
 * Show edit form
 */
function showEditForm() {
    const aboutSection = document.getElementById('aboutSection');
    const hobbiesSection = document.getElementById('hobbiesSection');
    const editFormSection = document.getElementById('editFormSection');
    const editProfileBtn = document.getElementById('editProfileBtn');

    // Populate form with current data
    document.getElementById('inputName').value = userProfile.name;
    document.getElementById('inputCity').value = userProfile.city;
    document.getElementById('inputBio').value = userProfile.bio;

    // Render hobbies checkboxes in the edit form
    renderEditFormHobbiesCheckboxes();

    // Hide sections and show form
    if (aboutSection) aboutSection.style.display = 'none';
    if (hobbiesSection) hobbiesSection.style.display = 'none';
    editFormSection.style.display = 'block';
    editProfileBtn.style.display = 'none';

    // Scroll to form
    editFormSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Hide edit form
 */
function hideEditForm() {
    const aboutSection = document.getElementById('aboutSection');
    const hobbiesSection = document.getElementById('hobbiesSection');
    const editFormSection = document.getElementById('editFormSection');
    const editProfileBtn = document.getElementById('editProfileBtn');

    editFormSection.style.display = 'none';
    if (aboutSection) aboutSection.style.display = 'block';
    if (hobbiesSection) hobbiesSection.style.display = 'block';
    editProfileBtn.style.display = 'block';
}

/**
 * Show edit hobbies form
 */
function showEditHobbiesForm() {
    const hobbiesSection = document.getElementById('hobbiesSection');
    const editHobbiesFormSection = document.getElementById('editHobbiesFormSection');

    // Render hobbies checkboxes
    renderHobbiesCheckboxes();

    // Hide hobbies display and show form
    hobbiesSection.style.display = 'none';
    editHobbiesFormSection.style.display = 'block';

    // Scroll to form
    editHobbiesFormSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Hide edit hobbies form
 */
function hideEditHobbiesForm() {
    const hobbiesSection = document.getElementById('hobbiesSection');
    const editHobbiesFormSection = document.getElementById('editHobbiesFormSection');

    editHobbiesFormSection.style.display = 'none';
    hobbiesSection.style.display = 'block';
}

/**
 * Render hobbies checkboxes for standalone edit form
 */
function renderEditFormHobbiesCheckboxes() {
    const checkboxesContainer = document.getElementById('editHobbiesCheckboxes');
    
    if (!checkboxesContainer) return;
    
    if (!allHobbies || allHobbies.length === 0) {
        checkboxesContainer.innerHTML = '<p class="text-muted">No hobbies available</p>';
        return;
    }

    checkboxesContainer.innerHTML = allHobbies.map(hobby => `
        <div class="form-check mb-3">
            <input 
                class="form-check-input hobby-checkbox" 
                type="checkbox" 
                id="hobby_edit_${hobby.id}" 
                data-hobby-id="${hobby.id}"
                ${selectedHobbyIds.includes(hobby.id) ? 'checked' : ''}
            >
            <label class="form-check-label" for="hobby_edit_${hobby.id}">
                <strong>${hobby.name}</strong>
                ${hobby.description ? `<p class="text-muted small mb-0">${hobby.description}</p>` : ''}
            </label>
        </div>
    `).join('');
}

/**
 * Render hobbies checkboxes
 */
function renderHobbiesCheckboxes() {
    const checkboxesContainer = document.getElementById('hobbiesCheckboxes');
    
    if (!allHobbies || allHobbies.length === 0) {
        checkboxesContainer.innerHTML = '<p class="text-muted">No hobbies available</p>';
        return;
    }

    checkboxesContainer.innerHTML = allHobbies.map(hobby => `
        <div class="form-check mb-3">
            <input 
                class="form-check-input hobby-checkbox" 
                type="checkbox" 
                id="hobby_${hobby.id}" 
                data-hobby-id="${hobby.id}"
                ${selectedHobbyIds.includes(hobby.id) ? 'checked' : ''}
            >
            <label class="form-check-label" for="hobby_${hobby.id}">
                <strong>${hobby.name}</strong>
                ${hobby.description ? `<p class="text-muted small mb-0">${hobby.description}</p>` : ''}
            </label>
        </div>
    `).join('');
}

/**
 * Save hobbies changes
 */
async function saveHobbiesChanges() {
    try {
        // Get checked hobbies
        const checkedBoxes = document.querySelectorAll('.hobby-checkbox:checked');
        const newSelectedHobbyIds = Array.from(checkedBoxes).map(checkbox => checkbox.dataset.hobbyId);

        // Update user hobbies in database
        const result = await apiService.updateUserHobbies(userProfile.id, newSelectedHobbyIds);

        // Update local state
        selectedHobbyIds = newSelectedHobbyIds;
        const updatedHobbies = allHobbies.filter(h => newSelectedHobbyIds.includes(h.id));
        userProfile.hobbies = updatedHobbies.map(h => h.name);
        userProfile.hobbiesCount = updatedHobbies.length;

        // Update display
        displayHobbies(userProfile.hobbies);
        updateProfileStats(userProfile);

        // Show success message
        showSuccessMessage('✅ Hobbies updated successfully!');

        // Hide form
        hideEditHobbiesForm();
    } catch (error) {
        console.error('Failed to save hobbies:', error);
        console.error('Error message:', error.message);
        showErrorMessage(`Failed to save hobbies: ${error.message}`);
    }
}

/**
 * Save profile changes
 */
async function saveProfileChanges() {
    const newName = document.getElementById('inputName').value.trim();
    const newCity = document.getElementById('inputCity').value.trim();
    const newBio = document.getElementById('inputBio').value.trim();

    // Validation
    if (!newName) {
        alert('❌ Please enter your name');
        return;
    }

    try {
        // Prepare update data for profile
        const updateData = {
            full_name: newName,
            city: newCity || null,
            bio: newBio || null
        };
        
        // Save profile to database
        await apiService.updateProfile(userProfile.id, updateData);
        
        // Get selected hobbies from form
        const checkedBoxes = document.querySelectorAll('#editHobbiesCheckboxes .hobby-checkbox:checked');
        const newSelectedHobbyIds = Array.from(checkedBoxes).map(checkbox => checkbox.dataset.hobbyId);
        
        // Update hobbies if they changed
        await apiService.updateUserHobbies(userProfile.id, newSelectedHobbyIds);
        
        // Update local profile object
        userProfile.name = newName;
        userProfile.city = newCity;
        userProfile.bio = newBio;
        selectedHobbyIds = newSelectedHobbyIds;
        const updatedHobbies = allHobbies.filter(h => newSelectedHobbyIds.includes(h.id));
        userProfile.hobbies = updatedHobbies.map(h => h.name);
        userProfile.hobbiesCount = updatedHobbies.length;

        // Update display
        displayProfileInfo(userProfile);
        displayHobbies(userProfile.hobbies);
        updateProfileStats(userProfile);

        // Show success message
        showSuccessMessage('✅ Profile updated successfully!');

        // Hide form
        hideEditForm();
    } catch (error) {
        console.error('Failed to save profile changes:', error.message);
        showErrorMessage(`Failed to save changes: ${error.message}`);
    }
}

/**
 * Check and update connection button based on connection status
 */
async function checkAndUpdateConnectionButton(connectBtn, connectBtnText) {
    try {
        const currentUser = apiService.getCurrentUser();
        if (!currentUser || !viewedUserId) {
            return;
        }

        // Check connection status between current user and viewed user
        const connectionStatus = await apiService.getConnectionStatus(currentUser.id, viewedUserId);
        
        if (!connectionStatus) {
            // No connection exists, show "Connect with" button
            connectBtnText.textContent = `Connect with ${userProfile.full_name || 'user'}`;
            connectBtn.classList.remove('btn-secondary');
            connectBtn.classList.add('btn-success');
            connectBtn.disabled = false;
            connectBtn.addEventListener('click', handleConnectRequest);
        } else if (connectionStatus.status === 'pending') {
            // Connection is pending
            connectBtnText.textContent = 'Pending';
            connectBtn.classList.remove('btn-success');
            connectBtn.classList.add('btn-secondary');
            connectBtn.disabled = true;
        } else if (connectionStatus.status === 'accepted') {
            // Connection is accepted
            connectBtnText.textContent = 'Connected';
            connectBtn.classList.remove('btn-success');
            connectBtn.classList.add('btn-secondary');
            connectBtn.disabled = true;
        } else {
            // Other status (rejected, blocked, etc.)
            connectBtn.style.display = 'none';
        }
    } catch (error) {
        console.error('Failed to check connection status:', error);
        // Show connect button by default if check fails
        connectBtnText.textContent = `Connect with ${userProfile.full_name || 'user'}`;
        connectBtn.classList.remove('btn-secondary');
        connectBtn.classList.add('btn-success');
        connectBtn.disabled = false;
        connectBtn.addEventListener('click', handleConnectRequest);
    }
}

/**
 * Handle connect request button click
 */
async function handleConnectRequest() {
    try {
        const connectBtn = document.getElementById('connectBtn');
        if (!connectBtn || !viewedUserId) {
            showErrorMessage('Invalid connection request');
            return;
        }

        // Disable button during request
        connectBtn.disabled = true;
        const buttonText = document.getElementById('connectBtnText');
        const originalText = buttonText.textContent;
        buttonText.textContent = 'Sending...';

        // Send connection request
        const connection = await apiService.sendConnectionRequest(viewedUserId);
        
        console.log('Connection request created:', connection);
        showSuccessMessage(`Connection request sent to ${userProfile.full_name}!`);
        
        // Update button to show pending status
        connectBtn.disabled = true;
        connectBtn.classList.remove('btn-success');
        connectBtn.classList.add('btn-secondary');
        buttonText.textContent = 'Pending';
    } catch (error) {
        console.error('Failed to send connection request:', error);
        
        // Handle specific error cases
        if (error.message.includes('Cannot send connection request to yourself')) {
            showErrorMessage('You cannot connect with yourself');
        } else if (error.message.includes('Connection already exists')) {
            showErrorMessage('A connection already exists with this user');
        } else if (error.message.includes('duplicate')) {
            showErrorMessage('Connection request already exists');
        } else {
            showErrorMessage(`Failed to send connection request: ${error.message}`);
        }
        
        // Re-enable button
        const connectBtn = document.getElementById('connectBtn');
        if (connectBtn) {
            connectBtn.disabled = false;
            const buttonText = document.getElementById('connectBtnText');
            if (buttonText) {
                buttonText.textContent = `Connect with ${userProfile.full_name || 'user'}`;
            }
        }
    }
}

/**
 * Delete account
 */
async function deleteAccount() {
    try {
        // Close the modal
        const deleteConfirmModal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
        if (deleteConfirmModal) {
            deleteConfirmModal.hide();
        }

        // Show loading state
        showSuccessMessage('Deleting account...');
        
        // In a real application, we would call the backend to delete the user
        // For now, just log out and redirect
        apiService.logout();
        
        setTimeout(() => {
            window.location.href = '/';
        }, 1500);
    } catch (error) {
        console.error('Failed to delete account:', error);
        showErrorMessage('Failed to delete account. Please try again or contact support.');
    }
}

/**
 * Handle change avatar - upload file to Supabase Storage
 */
function handleChangeAvatar() {
    const currentUser = apiService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
        showErrorMessage('User not authenticated');
        return;
    }
    
    // Create temporary file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/jpeg,image/png,image/gif,image/webp';
    
    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }
        
        // Show loading state
        const changeAvatarBtn = document.getElementById('changeAvatarBtn');
        const originalText = changeAvatarBtn.textContent;
        changeAvatarBtn.disabled = true;
        changeAvatarBtn.textContent = 'Uploading...';
        
        try {
            // Upload avatar
            const uploadResult = await apiService.uploadProfileAvatar(currentUser.id, file);
            
            // Display uploaded avatar
            const avatarDisplay = document.getElementById('avatarDisplay');
            avatarDisplay.innerHTML = ''; // Clear icon
            avatarDisplay.style.background = ''; // Clear gradient background
            avatarDisplay.style.backgroundImage = `url('${uploadResult.url}')`;
            avatarDisplay.style.backgroundSize = 'cover';
            avatarDisplay.style.backgroundPosition = 'center';
            
            showSuccessMessage('✅ Avatar uploaded successfully!');
        } catch (error) {
            console.error('Avatar upload failed:', error.message);
            showErrorMessage(`Failed to upload avatar: ${error.message}`);
        } finally {
            changeAvatarBtn.disabled = false;
            changeAvatarBtn.textContent = originalText;
        }
    });
    
    // Trigger file selection
    fileInput.click();
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
