/**
 * Profile Page JavaScript
 */

import { apiService } from '/src/services/api.js';

// User profile data loaded from database
let userProfile = null;
let allHobbies = []; // All available hobbies
let selectedHobbyIds = []; // Currently selected hobbies by user

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    window.setActiveNav('Profile');
    
    // Check if user is authenticated
    if (!apiService.isAuthenticated()) {
        window.location.href = '/pages/auth/login.html';
        return;
    }
    
    await loadUserProfile();
    setupEventListeners();
});

/**
 * Load user profile from database
 */
async function loadUserProfile() {
    try {
        const currentUser = apiService.getCurrentUser();
        if (!currentUser) {
            console.error('No current user found');
            window.location.href = '/pages/auth/login.html';
            return;
        }
        
        // Fetch profile data
        const profileData = await apiService.getProfile(currentUser.id);
        
        if (!profileData) {
            console.error('Profile not found');
            showErrorMessage('Profile not found. Please complete your profile setup.');
            return;
        }
        
        // Load secondary profile data without failing the whole page if one request errors.
        const [hobbiesResult, eventsCountResult, allHobbiesResult, upcomingEventsResult] = await Promise.allSettled([
            apiService.getUserHobbies(currentUser.id),
            apiService.getEventsJoinedCount(currentUser.id),
            apiService.getHobbies(),
            apiService.getUpcomingEvents(currentUser.id),
        ]);

        const hobbies = hobbiesResult.status === 'fulfilled' ? hobbiesResult.value : [];
        const eventsJoinedCount = eventsCountResult.status === 'fulfilled' ? eventsCountResult.value : 0;
        allHobbies = allHobbiesResult.status === 'fulfilled' ? allHobbiesResult.value : [];
        const upcomingEvents = upcomingEventsResult.status === 'fulfilled' ? upcomingEventsResult.value : [];
        selectedHobbyIds = hobbies.map(h => h.id);
        
        // Construct user profile object
        userProfile = {
            id: currentUser.id,
            email: profileData.email || currentUser.email,
            name: profileData.full_name || 'User',
            city: profileData.city || '',
            bio: profileData.bio || '',
            avatar_url: profileData.avatar_url,
            hobbies: hobbies.map(h => h.name),
            eventsJoined: eventsJoinedCount,
            hobbiesCount: hobbies.length,
            connections: 0 // TODO: fetch from connections
        };
        
        console.log('User profile loaded:', userProfile);
        console.log('All hobbies available:', allHobbies);
        console.log('Upcoming events:', upcomingEvents);
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
        console.log('Displaying avatar from URL:', profile.avatar_url);
        avatarDisplay.innerHTML = ''; // Clear icon
        avatarDisplay.style.background = ''; // Clear gradient background
        avatarDisplay.style.backgroundImage = `url('${profile.avatar_url}')`;
        avatarDisplay.style.backgroundSize = 'cover';
        avatarDisplay.style.backgroundPosition = 'center';
    } else {
        console.log('No avatar URL, using default gradient');
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
        hobbiesList.innerHTML = '<span class="text-muted">No hobbies selected yet.</span>';
        return;
    }

    hobbiesList.innerHTML = hobbies.map(hobby => 
        `<span class="hobby-badge">${hobby}</span>`
    ).join('');
}

/**
 * Display upcoming events
 */
function displayUpcomingEvents(events) {
    const eventsList = document.getElementById('upcomingEventsList');
    if (!events || events.length === 0) {
        eventsList.innerHTML = '<p class="text-muted">No upcoming events yet. <a href="/pages/events.html">Browse events</a></p>';
        return;
    }

    eventsList.innerHTML = events.map(event => `
        <div class="event-card mb-3 p-3 border rounded">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <h5 class="mb-0">
                    <a href="/pages/event-details.html?id=${event.id}" class="text-decoration-none">
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
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    const editHobbiesBtn = document.getElementById('editHobbiesBtn');
    const saveHobbiesBtn = document.getElementById('saveHobbiesBtn');
    const cancelHobbiesBtn = document.getElementById('cancelHobbiesBtn');

    // Edit profile button
    editProfileBtn.addEventListener('click', showEditForm);

    // Save changes button
    saveChangesBtn.addEventListener('click', saveProfileChanges);

    // Cancel button
    cancelEditBtn.addEventListener('click', hideEditForm);

    // Delete account button
    deleteAccountBtn.addEventListener('click', confirmDeleteAccount);

    // Change avatar button
    changeAvatarBtn.addEventListener('click', handleChangeAvatar);

    // Edit hobbies button
    editHobbiesBtn.addEventListener('click', showEditHobbiesForm);

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

        console.log('Saving hobbies:', newSelectedHobbyIds);
        console.log('User ID:', userProfile.id);

        // Update user hobbies in database
        const result = await apiService.updateUserHobbies(userProfile.id, newSelectedHobbyIds);
        console.log('Update hobbies result:', result);

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
        console.log('Saving profile changes...');
        console.log('User ID:', userProfile.id);
        console.log('Auth token exists:', !!apiService.authToken);
        
        // Prepare update data
        const updateData = {
            full_name: newName,
            city: newCity || null,
            bio: newBio || null
        };
        
        console.log('Update data:', updateData);
        
        // Save to database
        const result = await apiService.updateProfile(userProfile.id, updateData);
        console.log('Update result:', result);
        
        // Update local profile object
        userProfile.name = newName;
        userProfile.city = newCity;
        userProfile.bio = newBio;

        // Update display
        displayProfileInfo(userProfile);

        // Show success message
        showSuccessMessage('✅ Profile updated successfully!');

        // Hide form
        hideEditForm();
    } catch (error) {
        console.error('Failed to save profile changes - Full error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        showErrorMessage(`Failed to save changes: ${error.message}`);
    }
}

/**
 * Confirm and delete account
 */
function confirmDeleteAccount() {
    const confirmed = window.confirm(
        '⚠️ WARNING: This will permanently delete your account and all associated data.\n\n' +
        'This action cannot be undone. Are you sure you want to proceed?\n\n' +
        'Type "DELETE" to confirm.'
    );

    if (confirmed) {
        const userConfirm = prompt('Please type "DELETE" to confirm account deletion:');
        if (userConfirm === 'DELETE') {
            deleteAccount();
        } else {
            alert('❌ Account deletion cancelled.');
        }
    }
}

/**
 * Delete account
 */
async function deleteAccount() {
    try {
        // In a real application, we would call the backend to delete the user
        // For now, just log out and redirect
        apiService.logout();
        
        showSuccessMessage('Account deletion initiated. Redirecting...');
        
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
            console.log('No file selected');
            return;
        }
        
        console.log('File selected:', file.name, file.size, file.type);
        
        // Show loading state
        const changeAvatarBtn = document.getElementById('changeAvatarBtn');
        const originalText = changeAvatarBtn.textContent;
        changeAvatarBtn.disabled = true;
        changeAvatarBtn.textContent = 'Uploading...';
        
        try {
            // Upload avatar
            console.log('Starting avatar upload...');
            const uploadResult = await apiService.uploadProfileAvatar(currentUser.id, file);
            console.log('Upload result:', uploadResult);
            
            // Display uploaded avatar
            const avatarDisplay = document.getElementById('avatarDisplay');
            avatarDisplay.innerHTML = ''; // Clear icon
            avatarDisplay.style.background = ''; // Clear gradient background
            avatarDisplay.style.backgroundImage = `url('${uploadResult.url}')`;
            avatarDisplay.style.backgroundSize = 'cover';
            avatarDisplay.style.backgroundPosition = 'center';
            
            showSuccessMessage('✅ Avatar uploaded successfully!');
            console.log('Avatar displayed:', uploadResult.url);
        } catch (error) {
            console.error('Avatar upload failed:', error);
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
