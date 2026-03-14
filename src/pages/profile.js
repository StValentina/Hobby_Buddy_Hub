/**
 * Profile Page JavaScript
 */

// User profile data (placeholder)
const userProfile = {
    name: 'John Anderson',
    email: 'john.anderson@email.com',
    city: 'Sofia, Bulgaria',
    bio: 'Passionate about outdoor activities and photography. Love hiking, exploring new places, and capturing beautiful moments. Always excited to meet fellow adventurers and share experiences!',
    hobbies: ['Hiking', 'Photography', 'Traveling', 'Painting', 'Reading'],
    eventsJoined: 12,
    hobbiesCount: 5,
    connections: 28
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    window.setActiveNav('Profile');
    initializeProfile();
    setupEventListeners();
});

/**
 * Initialize profile display
 */
function initializeProfile() {
    displayProfileInfo(userProfile);
}

/**
 * Display profile information
 */
function displayProfileInfo(profile) {
    document.getElementById('displayName').textContent = profile.name;
    document.getElementById('displayEmail').textContent = profile.email;
    document.getElementById('displayCity').textContent = profile.city;
    document.getElementById('displayBio').textContent = profile.bio;
}

/**
 * Display hobbies list
 */
function displayHobbies(hobbies) {
    const hobbiesList = document.getElementById('hobbiesList');
    hobbiesList.innerHTML = hobbies.map(hobby => 
        `<span class="hobby-badge">${hobby}</span>`
    ).join('');
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
}

/**
 * Show edit form
 */
function showEditForm() {
    const aboutSection = document.querySelector('.section-card:nth-of-type(2)');
    const hobbiesSection = document.querySelector('.section-card:nth-of-type(3)');
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
    const aboutSection = document.querySelector('.section-card:nth-of-type(2)');
    const hobbiesSection = document.querySelector('.section-card:nth-of-type(3)');
    const editFormSection = document.getElementById('editFormSection');
    const editProfileBtn = document.getElementById('editProfileBtn');

    editFormSection.style.display = 'none';
    if (aboutSection) aboutSection.style.display = 'block';
    if (hobbiesSection) hobbiesSection.style.display = 'block';
    editProfileBtn.style.display = 'block';
}

/**
 * Save profile changes
 */
function saveProfileChanges() {
    const newName = document.getElementById('inputName').value.trim();
    const newCity = document.getElementById('inputCity').value.trim();
    const newBio = document.getElementById('inputBio').value.trim();

    // Validation
    if (!newName) {
        alert('❌ Please enter your name');
        return;
    }

    if (!newCity) {
        alert('❌ Please enter your city');
        return;
    }

    if (!newBio) {
        alert('❌ Please enter your bio');
        return;
    }

    // Update user profile
    userProfile.name = newName;
    userProfile.city = newCity;
    userProfile.bio = newBio;

    // Update display
    displayProfileInfo(userProfile);

    // Show success message
    showSuccessMessage('✅ Profile updated successfully!');

    // Hide form
    hideEditForm();
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
function deleteAccount() {
    alert('🗑️ Your account has been deleted.\n\nYou will be redirected to the home page.');
    // In a real application, this would make a DELETE request to the backend
    setTimeout(() => {
        window.location.href = '/';
    }, 500);
}

/**
 * Handle change avatar
 */
function handleChangeAvatar() {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const avatarDisplay = document.getElementById('avatarDisplay');
    avatarDisplay.style.background = `linear-gradient(135deg, ${randomColor} 0%, ${randomColor}dd 100%)`;
    
    alert('✅ Avatar changed! (In a real app, this would upload an image)');
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
