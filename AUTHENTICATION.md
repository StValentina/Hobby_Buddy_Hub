# Authentication Implementation Guide

## Overview
This document provides comprehensive information about the authentication system implemented in Hobby Buddy Hub.

## Features Implemented

### 1. **Authentication Pages**
- **Login Page** (`pages/auth/login.html`)
  - Email input field
  - Password input field
  - Client-side form validation
  - Error handling with user-friendly messages
  - Redirect to home on successful login
  - Link to registration page

- **Register Page** (`pages/auth/register.html`)
  - Email input field
  - Password input field (with strength requirements display)
  - Confirm password field
  - Real-time password requirements feedback:
    - At least 8 characters
    - At least 1 uppercase letter
    - At least 1 lowercase letter
    - At least 1 number
  - Client-side form validation
  - Error handling
  - Link to login page

### 2. **API Service Authentication Methods**
Located in `src/services/api.js`:

```javascript
// User registration
await apiService.register(email, password);

// User login
await apiService.login(email, password);

// User logout
apiService.logout();

// Check if user is authenticated
const isAuth = apiService.isAuthenticated();

// Get current user data
const user = apiService.getCurrentUser();
```

### 3. **Header Component Updates**
Located in `src/components/header.js`:

- **For Authenticated Users**: Displays user email in dropdown menu with options:
  - Profile
  - Dashboard
  - Settings
  - Logout

- **For Unauthenticated Users**: Displays:
  - Login link
  - Sign Up button

### 4. **Global Navigation**
All pages now include navigation to:
- Home
- Hobbies
- Events
- Find People
- Authentication links (Login/Sign Up) or Account menu (if logged in)

## How Authentication Works

### Registration Flow
1. User clicks "Sign Up" in header or navigates to `/pages/auth/register.html`
2. User fills in email and password fields
3. Client validates password meets all requirements
4. Form is submitted to `apiService.register(email, password)`
5. API calls Supabase Auth `/auth/v1/signup` endpoint
6. JWT token is returned and stored in localStorage under 'auth_token'
7. User is redirected to home page

### Login Flow
1. User clicks "Login" and navigates to `/pages/auth/login.html`
2. User enters email and password
3. Form is submitted to `apiService.login(email, password)`
4. API calls Supabase Auth `/auth/v1/token?grant_type=password` endpoint
5. JWT token is returned and stored in localStorage
6. User is redirected to home page

### Logout Flow
1. User clicks "Logout" in header dropdown menu
2. `headerLogout()` function is called
3. `apiService.logout()` clears the auth token from localStorage
4. User is redirected to login page

## Token Storage

- **Storage Location**: `localStorage` under key `'auth_token'`
- **Token Type**: JWT (JSON Web Token)
- **Expiration**: Depends on Supabase configuration (typically 1 hour)

## Getting User Information

```javascript
import { apiService } from '/src/services/api.js';

// Check if user is logged in
if (apiService.isAuthenticated()) {
    // Get user data from token
    const user = apiService.getCurrentUser();
    console.log(user.email); // user's email
    console.log(user.id);    // user's UUID
}
```

## Session Persistence

- Users remain logged in across page reloads as long as the JWT token is in localStorage
- Token is automatically included in subsequent API requests
- If token expires, user will need to log in again

## Password Requirements

Passwords must contain:
- ✓ Minimum 8 characters
- ✓ At least 1 uppercase letter (A-Z)
- ✓ At least 1 lowercase letter (a-z)
- ✓ At least 1 number (0-9)

Example valid passwords:
- `Password123`
- `MyHobby2024`
- `Hobby@123`

## Error Handling

### Common Login Errors
- "Email address is required" - Email field is empty
- "Please enter a valid email address" - Invalid email format
- "Password is required" - Password field is empty
- "Password must be at least 6 characters long" - Password too short
- "Invalid email or password" - User not found or password incorrect

### Common Registration Errors
- "Email address is required" - Email field is empty
- "This email address is already registered. Please sign in instead." - Email already in use
- "Password must contain uppercase, lowercase, and numbers" - Password doesn't meet requirements
- "Passwords do not match" - Confirm password doesn't match password field

## Testing the Authentication System

### Test Registration
1. Navigate to `http://localhost:5173/pages/auth/register.html`
2. Enter email: `test@example.com`
3. Enter password: `TestPassword123`
4. Confirm password: `TestPassword123`
5. Click "Create Account"
6. Should redirect to home page with user logged in

### Test Login
1. Navigate to `http://localhost:5173/pages/auth/login.html`
2. Enter email: `test@example.com`
3. Enter password: `TestPassword123`
4. Click "Sign In"
5. Should redirect to home page

### Test Logout
1. Click on user email in header dropdown
2. Click "Logout"
3. Should redirect to login page
4. Header should now show "Login" and "Sign Up" buttons

### Test Session Persistence
1. Log in with user credentials
2. Refresh the page (F5)
3. User should still be logged in
4. Check browser console or localStorage to verify token is present

## Integration with Other Pages

All pages have been updated to:
1. Initialize the Header component with authentication support
2. Call `header.render()` on page load
3. Use ES6 module imports (`<script type="module">`)

Pages updated:
- `pages/index/script.js` - Home page
- `pages/hobbies/script.js` - Hobbies listing
- `pages/events/script.js` - Events listing
- `pages/hobby-details/script.js` - Hobby details
- `pages/event-details/script.js` - Event details
- `pages/dashboard/script.js` - User dashboard
- `pages/profile/script.js` - User profile
- `pages/people/script.js` - People directory

## Future Enhancements

### Protected Routes
Routes that should require authentication:
- `/pages/profile/index.html` - User profile
- `/pages/dashboard/index.html` - User dashboard
- `POST /events` - Creating events
- `POST /events/{id}/join` - Joining events

### User Profile Integration
Once profiles are integrated with the database, the header should display:
- User's profile picture
- User's actual name (from profile)
- Profile link pointing to their own profile page

### Role-Based Access Control
Implement different navigation/permissions based on user role:
- **seeker** - Can join events, browse hobbies
- **host** - Can create and manage events
- **admin** - Can manage platform content

## Troubleshooting

### User stays logged in when they shouldn't
- Check localStorage in browser DevTools
- Clear localStorage and reload page
- Verify JWT token is being cleared on logout

### Token not being sent with API requests
- Verify `Authorization: Bearer <token>` header is set
- Check that `setAuthToken()` is being called during login
- Verify auth token is in localStorage

### Login/Register page not loading Header
- Verify `<header id="header-container"></header>` exists in HTML
- Check that script.js file has Header import
- Check browser console for module loading errors
- Verify `header.render()` is called in DOMContentLoaded handler

### Supabase Auth Errors
- 400 Bad Request: Invalid email/password format or user doesn't exist
- 422 Unprocessable Entity: User already registered with this email
- Network error: Check Supabase connection and API key

## File Structure

```
pages/auth/
├── login.html              # Login page template
├── login.js                # Login page logic
├── register.html           # Register page template
└── register.js             # Register page logic

src/
├── services/
│   └── api.js             # Auth methods added here
└── components/
    └── header.js          # Updated with auth support
```

## API Endpoints Used

- `POST /auth/v1/signup` - Register new user
- `POST /auth/v1/token?grant_type=password` - Login user
- Authorization tokens stored locally, no explicit logout endpoint

## Security Considerations

✓ Passwords are sent over HTTPS to Supabase
✓ JWT tokens are stored in localStorage (accessible to JavaScript)
✓ Consider implementing refresh token rotation for enhanced security
✓ Implement HTTPS for production deployment
✓ Consider adding rate limiting for login attempts in the future

## References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [JWT (JSON Web Tokens)](https://jwt.io/)
- [OWASP Authentication Best Practices](https://owasp.org/www-community/authentication)
