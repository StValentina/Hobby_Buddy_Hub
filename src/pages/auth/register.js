import { apiService } from '/src/services/api.js';

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    window.setActiveNav('Register');
    checkExistingSession();
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
        console.log('Auth token after registration:', localStorage.getItem('auth_token') ? 'TOKEN STORED' : 'NO TOKEN');
        
        // Ensure we have a usable token. If signup did not return a session, try logging in.
        let token = localStorage.getItem('auth_token');
        if (!token) {
            try {
                console.log('No token after signup; attempting to login to obtain token...');
                await apiService.login(email, password);
                token = localStorage.getItem('auth_token');
                console.log('Token after login attempt:', token ? 'FOUND' : 'MISSING');
            } catch (loginErr) {
                console.warn('Auto-login after signup failed:', loginErr);
            }
        }

        if (!token) {
            // Account created but could not sign in automatically.
            showAlert('Account created. Please sign in to continue.', 'success');
            setTimeout(() => {
                window.location.href = '/login';
            }, 1000);
            return;
        }

        // Get userId from token payload and ensure profile exists
        const user = apiService.getCurrentUser();
        if (user && user.id) {
            try {
                await apiService.createUserProfile(user.id, fullName, email);
                console.log('User profile created/verified');
            } catch (profileError) {
                console.warn('Profile creation warning (may already exist):', profileError);
            }
        }

        showAlert('Account created successfully! Redirecting to dashboard...', 'success');
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 800);
        
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
    const token = localStorage.getItem('auth_token');
    
    // Only check if token exists and has valid JWT format (3 parts separated by dots)
    if (token && token.split('.').length === 3) {
        console.log('Found token, validating...');
        apiService.authToken = token;
        
        if (apiService.isAuthenticated()) {
            console.log('Valid token found, user is already authenticated. Redirecting to home...');
            // User is already logged in, redirect to home
            setTimeout(() => {
                window.location.href = '/';
            }, 300);
        } else {
            console.log('Token is invalid, clearing and showing register form');
            // Invalid token - clear it and show register form
            localStorage.removeItem('auth_token');
        }
    } else {
        console.log('No valid token, showing register form');
        // No token - allow user to see register form
    }
}
