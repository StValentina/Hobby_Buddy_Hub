import { apiService } from '/src/services/api.js';

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    window.setActiveNav('Login');
    
    // Check if user is already logged in and redirect if they are
    checkExistingSession();
});

const form = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submitBtn');
const spinner = document.getElementById('spinner');
const alertContainer = document.getElementById('alertContainer');

/**
 * Show alert message
 */
function showAlert(message, type = 'error') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
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
    submitBtn.textContent = isLoading ? ' Signing in...' : 'Sign In';
}

/**
 * Validate email format
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate form inputs
 */
function validateForm() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
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
    
    if (password.length < 6) {
        showAlert('Password must be at least 6 characters long');
        passwordInput.focus();
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
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    try {
        setLoading(true);
        
        // Attempt login
        const response = await apiService.login(email, password);
        
        console.log('Login successful:', response);
        
        showAlert('Login successful! Redirecting...', 'success');
        
        // Redirect to home page after 1.5 seconds
        setTimeout(() => {
            window.location.href = '/';
        }, 1500);
        
    } catch (error) {
        console.error('Login failed:', error);
        
        let errorMessage = 'Login failed. Please try again.';
        
        // Check if error message contains specific auth errors
        if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'Invalid email or password';
        } else if (error.message.includes('User not found')) {
            errorMessage = 'No account found with this email address';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showAlert(errorMessage);
    } finally {
        setLoading(false);
    }
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
            console.log('Token is invalid, clearing and showing login form');
            // Invalid token - clear it and show login form
            localStorage.removeItem('auth_token');
        }
    } else {
        console.log('No valid token, showing login form');
        // No token - allow user to see login form
    }
}

// Check existing session on page load
checkExistingSession();
