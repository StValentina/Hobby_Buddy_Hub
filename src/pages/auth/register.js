import { apiService } from '/src/services/api.js';

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    window.setActiveNav('Register');
});

const form = document.getElementById('registerForm');
const fullNameInput = document.getElementById('fullName');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const submitBtn = document.getElementById('submitBtn');
const spinner = document.getElementById('spinner');
const alertContainer = document.getElementById('alertContainer');
const passwordReqs = document.getElementById('passwordReqs');

/**
 * Show alert message
 */
function showAlert(message, type = 'error') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        <strong>${type === 'error' ? 'Error:' : 'Success:'}</strong> ${message}
        ${type === 'error' ? '<br><small>Check the browser console (F12) for more details</small>' : ''}
    `;
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alertDiv);
    
    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
        setTimeout(() => {
            alertDiv.style.display = 'none';
        }, 3000);
    }
}

/**
 * Clear alert message
 */
function clearAlert() {
    alertContainer.innerHTML = '';
}

/**
 * Set loading state
 */
function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    spinner.style.display = isLoading ? 'inline-block' : 'none';
    submitBtn.textContent = isLoading ? ' Creating Account...' : 'Create Account';
}

/**
 * Validate email format
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Check password requirements
 */
function checkPasswordRequirements(password) {
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
    };
    
    return requirements;
}

/**
 * Update password requirements display
 */
function updatePasswordReqs(password) {
    if (!password) {
        passwordReqs.classList.remove('show');
        return;
    }
    
    passwordReqs.classList.add('show');
    const reqs = checkPasswordRequirements(password);
    
    updateRequirement('req-length', reqs.length);
    updateRequirement('req-uppercase', reqs.uppercase);
    updateRequirement('req-lowercase', reqs.lowercase);
    updateRequirement('req-number', reqs.number);
}

/**
 * Update a single requirement display
 */
function updateRequirement(id, met) {
    const elem = document.getElementById(id);
    const circle = elem.querySelector('span');
    
    if (met) {
        circle.className = 'requirement-met';
        circle.textContent = '✓';
    } else {
        circle.className = 'requirement-unmet';
        circle.textContent = '●';
    }
}

/**
 * Validate all password requirements are met
 */
function validatePasswordRequirements(password) {
    const reqs = checkPasswordRequirements(password);
    return reqs.length && reqs.uppercase && reqs.lowercase && reqs.number;
}

/**
 * Validate form inputs
 */
function validateForm() {
    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();
    
    if (!fullName) {
        showAlert('Full name is required');
        fullNameInput.focus();
        return false;
    }

    if (fullName.length < 2) {
        showAlert('Full name must be at least 2 characters long');
        fullNameInput.focus();
        return false;
    }
    
    if (!email) {
        showAlert('Email address is required');
        emailInput.focus();
        return false;
    }
    
    if (!validateEmail(email)) {
        showAlert('Please enter a valid email address');
        emailInput.focus();
        return false;
    }
    
    if (!password) {
        showAlert('Password is required');
        passwordInput.focus();
        return false;
    }
    
    if (password.length < 8) {
        showAlert('Password must be at least 8 characters long');
        passwordInput.focus();
        return false;
    }
    
    if (!validatePasswordRequirements(password)) {
        showAlert('Password must contain uppercase, lowercase, and numbers');
        passwordInput.focus();
        return false;
    }
    
    if (!confirmPassword) {
        showAlert('Please confirm your password');
        confirmPasswordInput.focus();
        return false;
    }
    
    if (password !== confirmPassword) {
        showAlert('Passwords do not match');
        confirmPasswordInput.focus();
        return false;
    }
    
    return true;
}

/**
 * Handle form submission
 */
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    clearAlert();
    
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    try {
        setLoading(true);
        
        // Attempt registration with full_name metadata
        const response = await apiService.register(email, password, fullName);
        
        console.log('Registration successful:', response);
        
        showAlert('Account created successfully! Redirecting...', 'success');
        
        // Redirect to home page after 1.5 seconds
        setTimeout(() => {
            window.location.href = '/';
        }, 1500);
        
    } catch (error) {
        console.error('Registration failed:', error);
        console.error('Error details:', error.message);
        
        let errorMessage = 'Registration failed. Please try again.';
        
        // Handle specific HTTP error codes
        if (error.message.includes('429')) {
            errorMessage = 'Too many registration attempts. Please wait a few minutes before trying again.';
        } else if (error.message.includes('already registered') || error.message.includes('already exists')) {
            errorMessage = 'This email address is already registered. Please sign in instead.';
        } else if (error.message.includes('weak password')) {
            errorMessage = 'Your password is too weak. Please use a stronger password.';
        } else if (error.message.includes('validation')) {
            errorMessage = 'Please check your email and password.';
        } else if (error.message.includes('User already exists')) {
            errorMessage = 'This email is already registered. Please log in instead.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        console.error('Error shown to user:', errorMessage);
        showAlert(errorMessage);
    } finally {
        setLoading(false);
    }
});

/**
 * Update password requirements on input
 */
passwordInput.addEventListener('input', (e) => {
    updatePasswordReqs(e.target.value);
});

/**
 * Check if user is already logged in
 */
function checkExistingSession() {
    if (apiService.isAuthenticated()) {
        // Redirect to home if already logged in
        window.location.href = '/';
    }
}

// Check existing session on page load
checkExistingSession();
