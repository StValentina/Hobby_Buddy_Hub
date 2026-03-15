# Authentication Implementation Guide

## Overview
This document provides comprehensive information about the authentication system implemented in Hobby Buddy Hub.

The platform uses **Supabase Auth** for user authentication and **Row Level Security (RLS)** for authorization.

## Features Implemented

### 1. **Authentication Pages**
- **Login Page** ([pages/auth/login.html](pages/auth/login.html))
  - Email input field
  - Password input field
  - Client-side form validation
  - Error handling with user-friendly messages
  - Redirect to home on successful login
  - Link to registration page

- **Register Page** ([pages/auth/register.html](pages/auth/register.html))
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
  - Automatic profile creation after successful registration

### 2. **API Service Authentication Methods**
Located in [src/services/api.js](src/services/api.js):

```javascript
// User registration (creates auth user and profile)
await apiService.register(email, password, fullName);

// User login
await apiService.login(email, password);

// User logout
apiService.logout();

// Check if user is authenticated
const isAuth = apiService.isAuthenticated();

// Get current user data
const user = apiService.getCurrentUser();

// Create user profile (called after registration)
await apiService.createUserProfile(userId, fullName, email);

// Get user role
const role = await apiService.getUserRole(userId);

// Get user profile
const profile = await apiService.getProfile(userId);
```

### 3. **Header Component**
Located in [src/components/header.js](src/components/header.js):

**For Authenticated Users**: Displays user name in dropdown menu with options:
  - Profile
  - Dashboard
  - My Connections (for seekers)
  - Connection Requests (for seekers)
  - Admin Panel (for admins only)
  - Settings
  - Logout

**For Unauthenticated Users**: Displays:
  - Login link
  - Sign Up button

**Features**:
- Async profile loading to show user's full name
- Admin role detection for conditional navigation
- Connection request badge for seekers
- Role-based navigation display

### 4. **Global Navigation**
All pages include responsive navigation with:
- Home
- Hobbies
- Events
- Find People
- My Connections (authenticated users)
- Authentication links (Login/Sign Up) or Account menu (if logged in)

## How Authentication Works

### Registration Flow
1. User clicks "Sign Up" in header or navigates to `/register`
2. User fills in email and password fields
3. Client validates password meets all requirements
4. Form is submitted to `apiService.register(email, password, fullName)`
5. API calls Supabase Auth `/auth/v1/signup` endpoint with user data
6. JWT token is returned and stored in localStorage under key `'auth_token'`
7. User profile is automatically created in the `profiles` table with:
   - User ID (from auth.users)
   - Full name (from registration form)
   - Default role `'seeker'` assigned
8. User is redirected to home page (authenticated)

### Login Flow
1. User clicks "Login" and navigates to `/login`
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

### Token Validation
- Tokens are validated on each page load
- Token format is checked (must be valid JWT with 3 parts separated by dots)
- Token payload is checked for validity
- Token expiration is verified
- Expired or invalid tokens are automatically cleared

## Token Storage and Management

- **Storage Location**: `localStorage` under key `'auth_token'`
- **Token Type**: JWT (JSON Web Token) provided by Supabase Auth
- **Token Expiration**: Configured by Supabase (typically 1 hour)
- **Automatic Validation**: On page load and before API requests
- **Automatic Cleanup**: Invalid or expired tokens are cleared automatically

## Getting User Information

### From JWT Token (Client-side)
```javascript
import { apiService } from '/src/services/api.js';

// Check if user is logged in
if (apiService.isAuthenticated()) {
    // Get user data from token (basic info: id and email)
    const user = apiService.getCurrentUser();
    console.log(user.email); // user's email
    console.log(user.id);    // user's UUID
}
```

### From Database (Async)
```javascript
import { apiService } from '/src/services/api.js';

// Get user's full profile from database
const userId = apiService.getCurrentUser().id;
const profile = await apiService.getProfile(userId);
console.log(profile.full_name);
console.log(profile.avatar_url);
console.log(profile.bio);
console.log(profile.city);

// Get user's role
const role = await apiService.getUserRole(userId);
console.log(role); // 'seeker', 'host', or 'admin'
```

## Role-Based Access Control

### User Roles
- **seeker** – User who joins activities (default role for new users)
- **host** – User who organizes and manages events
- **admin** – Platform administrator

### How Roles Work
1. Default role `'seeker'` is assigned automatically during registration
2. Roles are stored in the `user_roles` table in the database
3. Roles are checked using RLS policies on the server
4. Admin status is loaded in the header component for conditional navigation
5. Role-based access is enforced via Row Level Security (RLS) policies

### Examples of Role-Based Access
- Only **hosts** can create and edit events they own
- Only **admins** can manage hobbies and platform content
- **Seekers** can join events created by others
- Event participants are recorded in the `event_participants` table

## Session Persistence

- Users remain logged in across page reloads as long as the JWT token is valid and present in localStorage
- Token is automatically included in all API requests via the `Authorization` header
- Token is automatically refreshed on page loads via the `getHeaders()` method
- If token expires or becomes invalid, the user will need to log in again
- The header component automatically re-renders after authentication state changes

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
1. Navigate to `http://localhost:5173/register`
2. Enter email: `test@example.com`
3. Enter password: `TestPassword123`
4. Confirm password: `TestPassword123`
5. Click "Create Account"
6. Should redirect to home page with user logged in
7. Header should show user name instead of Login/Sign Up buttons

### Test Login
1. Navigate to `http://localhost:5173/login`
2. Enter email: `test@example.com`
3. Enter password: `TestPassword123`
4. Click "Sign In"
5. Should redirect to home page
6. Header should show user information

### Test Logout
1. Click on user name in header dropdown
2. Click "Logout"
3. Should redirect to login page
4. Header should now show "Login" and "Sign Up" buttons

### Test Session Persistence
1. Log in with user credentials
2. Refresh the page (F5)
3. User should still be logged in
4. Check browser DevTools → Application → localStorage → `auth_token` to verify token is present

### Test Admin Role (if available)
1. Log in with an admin account
2. Check header for "Admin Panel" link
3. Admin-only navigation should be visible

### Test Role-Based Navigation
1. Log in as a seeker
2. Header should show "My Connections" and "Connection Requests"
3. Admin link should NOT be visible
4. Log out and verify header returns to non-authenticated state

## Integration with Other Pages

All pages in the application include authentication support:

### Core Pages
- [pages/home.html](pages/home.html) – Home page with hero section
- [pages/hobbies.html](pages/hobbies.html) – Browse hobbies catalog
- [pages/hobby-details.html](pages/hobby-details.html) – View hobby details
- [pages/events.html](pages/events.html) – Browse upcoming events
- [pages/event-details.html](pages/event-details.html) – View event details and join
- [pages/create-event.html](pages/create-event.html) – Create new event (for hosts)

### User Pages
- [pages/profile.html](pages/profile.html) – User profile with settings
- [pages/dashboard.html](pages/dashboard.html) – User dashboard with summary
- [pages/my-connections.html](pages/my-connections.html) – User's connections/friends
- [pages/people.html](pages/people.html) – Browse other users

### Admin Pages
- [pages/admin.html](pages/admin.html) – Admin panel

### Authentication Pages
- [pages/auth/login.html](pages/auth/login.html) – Login page
- [pages/auth/register.html](pages/auth/register.html) – Registration page

### Integration Pattern
Each page:
1. Imports the Header component: `import { Header } from '/src/components/header.js'`
2. Initializes header on page load: `const header = new Header(); header.render();`
3. Uses module scripts: `<script type="module">`
4. Has access to `apiService` for making authenticated API calls
5. Can check authentication status: `apiService.isAuthenticated()`

## Enhanced Features

### Role-Based Authorization
The application implements role-based access control with three roles:

1. **Seeker** – Default role for new users
   - Can browse hobbies and events
   - Can join events
   - Can manage their profile
   - Can connect with other users

2. **Host** – User who organizes events
   - Can create and manage their own events
   - Can edit event details
   - Can delete their events
   - Can view event participants
   - Can also participate as a seeker

3. **Admin** – Platform administrator
   - Can view admin panel
   - Can manage hobbies, tags, and locations
   - Has full access to platform data
   - Can moderate users and content

### Protected Routes
The following routes check for authentication:
- `/profile` – Requires authentication to view/edit profile
- `/dashboard` – Requires authentication to view personal dashboard
- `/create-event` – Requires authentication and host role to create events
- `/my-connections` – Requires authentication to view user's connections
- `/admin` – Requires authentication and admin role

### Row Level Security (RLS)
Database-level security policies ensure:
- Users can only edit their own profiles
- Hosts can only edit events they created
- Only admins can modify hobbies and tags
- Participants can see event details
- Sensitive data is protected at the database level

## Troubleshooting

### User Not Logged In After Registration
**Problem**: User completes registration but header still shows Login/Sign Up
**Solution**:
- Check browser console for JavaScript errors
- Verify localStorage contains `auth_token` 
- Check that profile was created in Supabase database
- Verify Supabase RLS policies are not blocking profile creation

### Token Not Being Sent with API Requests
**Problem**: API returns 401 Unauthorized even when user is logged in
**Solution**:
- Verify `auth_token` exists in localStorage
- Check that `Authorization: Bearer <token>` header is being set
- Verify token format is valid (3 parts separated by dots)
- Check browser DevTools Network tab to see actual headers

### Header Not Updating After Login
**Problem**: Header still shows Login button after successful authentication
**Solution**:
- Check that `<div id="header-container"></div>` exists in HTML
- Verify Header script is imported correctly
- Ensure `header.render()` is called after DOM is loaded
- Check browser console for module loading errors
- Refresh the page if needed

### RLS Policy Errors
**Problem**: Getting "permission denied" errors when trying to access data
**Solution**:
- Check RLS policies in Supabase Console
- Verify user has the correct role assigned
- Ensure JWT token is valid and not expired
- Check that the user_id in the token matches the profiles table
- Review Row Level Security policies in migrations 004_rls_policies.sql

### User Profile Not Loading in Header
**Problem**: Header shows email instead of full name
**Solution**:
- Check that user profile exists in `profiles` table
- Verify profile has `full_name` field populated
- Check browser DevTools Console for profile loading errors
- Ensure `getProfile()` method is being called
- Check Supabase logs for RLS policy violations

### Login/Register Page Not Loading
**Problem**: Pages show blank or error
**Solution**:
- Verify HTML file exists at correct path
- Check browser console for JavaScript errors
- Verify Supabase configuration in [src/config.js](src/config.js)
- Test network connectivity to Supabase
- Check that event listeners are properly attached to form elements

### Password Validation Not Working
**Problem**: Invalid passwords are accepted or valid passwords rejected
**Solution**:
- Review password requirements in [src/pages/auth/register.js](src/pages/auth/register.js#L50)
- Check regex patterns are correct
- Test in different browsers
- Verify JavaScript is enabled
- Check console for validation function errors

### Supabase Auth Errors
Common error responses:
- **400 Bad Request** – Invalid email/password format or malformed request
- **422 Unprocessable Entity** – Email already registered
- **500 Internal Server Error** – Supabase service issue
- **Connection Timeout** – Network issue or CORS problem

### Debugging Tips
1. Open browser DevTools (F12)
2. Check Console tab for JavaScript errors
3. Check Network tab to see actual API requests and responses
4. Check Application → Storage → localStorage for `auth_token`
5. Log JWT token in browser console and decode it at https://jwt.io
6. Check Supabase logs in project dashboard for server-side errors

## File Structure

### Authentication Pages
```
pages/auth/
├── login.html               # Login page template
├── login.js                 # Login page logic and form handling
├── register.html            # Registration page template
└── register.js              # Registration page logic and validation
```

### Components
```
src/components/
├── header.js                # Header component with auth support
├── footer.js                # Footer component
└── loader.js                # Loading spinner component

pages/components/
├── header.html              # Header template (loaded by JS)
└── footer.html              # Footer template (loaded by JS)
```

### Services
```
src/services/
└── api.js                   # APIService class with auth methods
```

### Utilities
```
src/utils/
└── router.js                # Application router for navigation
```

### Styles
```
src/styles/
├── main.css                 # Global styles
├── components.css           # Component styles
└── pages/
    ├── auth/
    │   ├── login.css        # Login page styles
    │   └── register.css     # Registration page styles
    └── ... (other page styles)

public/css/
└── global.css               # Additional global styles
```

### Configuration
```
src/
├── config.js                # Supabase configuration
├── main.js                  # Application entry point
├── app.js                   # App initialization
└── ...
```

## Supabase Auth API Endpoints

These endpoints are called by the `APIService` class for authentication:

### Registration
- **Endpoint**: `POST /auth/v1/signup`
- **Parameters**: `{ email, password, data: { full_name } }`
- **Returns**: User object with JWT access_token
- **Side Effect**: Automatically triggers trigger function to create user profile

### Login
- **Endpoint**: `POST /auth/v1/token?grant_type=password`
- **Parameters**: `{ email, password }`
- **Returns**: Access token and user session data
- **Headers Required**: `Content-Type: application/json`, `x-api-key`

### User Information
- **Getting User**: Data is extracted from JWT token payload
- **Logout**: Only requires clearing localStorage (no API call)

## Database Tables for Authentication

### profiles
Stores user profile information
- `id` – UUID (references auth.users.id)
- `full_name` – User's display name
- `email` – User's email (from registration)
- `avatar_url` – Profile picture URL
- `bio` – User biography
- `city` – User's city
- `created_at` – Account creation timestamp
- `updated_at` – Last profile update timestamp

### user_roles
Stores user roles for authorization
- `id` – UUID, primary key
- `user_id` – References profiles.id
- `role` – Enum: 'seeker', 'host', 'admin'
- `created_at` – Role assignment timestamp

## Security Considerations

✓ **HTTPS Required** – Passwords are sent over HTTPS to Supabase  
✓ **JWT Tokens** – Used for stateless authentication  
✓ **LocalStorage** – Tokens stored client-side (accessible to JavaScript)  
✓ **Token Validation** – Tokens validated for format, payload, and expiration  
✓ **Automatic Cleanup** – Invalid tokens are automatically cleared  
✓ **RLS Policies** – Server-side Row Level Security policies protect data  
✓ **Role-Based Access** – Database-level access control via roles  

### Recommendations for Production
- Consider implementing refresh token rotation
- Implement rate limiting on login endpoints
- Monitor failed login attempts
- Consider adding email verification for registration
- Use HTTPS in production (enforced by Supabase)
- Regularly review RLS policies for security gaps
- Implement password reset functionality
- Consider adding two-factor authentication
- Monitor Supabase audit logs for suspicious activity

## Common Authentication Patterns

### Pattern 1: Check Authentication Before Rendering
```javascript
import { Header } from '/src/components/header.js';
import { apiService } from '/src/services/api.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Always render header first
  const header = new Header();
  header.render();
  
  // Then check if user is authenticated for protected content
  if (!apiService.isAuthenticated()) {
    // Optionally redirect to login or show message
    console.warn('User not authenticated');
  }
});
```

### Pattern 2: Make Authenticated API Calls
```javascript
import { apiService } from '/src/services/api.js';

// Check authentication
if (apiService.isAuthenticated()) {
  const user = apiService.getCurrentUser();
  try {
    // API call automatically includes JWT token
    const profile = await apiService.getProfile(user.id);
    console.log('User profile:', profile);
  } catch (error) {
    console.error('Failed to load profile:', error);
  }
}
```

### Pattern 3: Conditional UI Based on Role
```javascript
import { apiService } from '/src/services/api.js';

async function renderPageContent() {
  const user = apiService.getCurrentUser();
  if (!user) return;
  
  const role = await apiService.getUserRole(user.id);
  
  if (role === 'admin') {
    // Show admin controls
  } else if (role === 'host') {
    // Show host controls
  } else {
    // Show seeker interface
  }
}
```

### Pattern 4: Handle Form Submission with Auth
```javascript
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    const result = await apiService.login(email, password);
    // Token is automatically stored
    // Redirect to home or dashboard
    window.location.href = '/';
  } catch (error) {
    console.error('Login failed:', error);
    // Display error to user
  }
});
```

## References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [JWT (JSON Web Tokens)](https://jwt.io/)
- [OWASP Authentication Best Practices](https://owasp.org/www-community/authentication)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [MDN Web Docs: localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Project Database Schema](DB_SCHEMA.md)
- [Project Context](PROJECT_CONTEXT.md)
