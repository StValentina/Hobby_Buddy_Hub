/**
 * API service for Supabase integration
 */

import ENV from '../config.js';

class APIService {
  constructor() {
    this.baseURL = ENV.SUPABASE_URL;
    this.apiKey = ENV.SUPABASE_KEY;
    this.authToken = this.getAuthToken();
  }

  /**
   * Get stored authentication token
   */
  getAuthToken() {
    const token = localStorage.getItem('auth_token');
    console.log('getAuthToken() called - returning:', token ? 'TOKEN EXISTS' : 'NO TOKEN');
    return token;
  }

  /**
   * Set authentication token
   */
  setAuthToken(token) {
    console.log('setAuthToken() - storing token:', token ? 'YES' : 'NO');
    localStorage.setItem('auth_token', token);
    this.authToken = token;
  }

  /**
   * Clear authentication token
   */
  clearAuthToken() {
    console.log('clearAuthToken() - removing token');
    localStorage.removeItem('auth_token');
    this.authToken = null;
  }

  /**
   * Get default headers
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'apikey': this.apiKey,
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Make an API request
   */
  async request(path, options = {}) {
    const url = `${this.baseURL}/rest/v1${path}`;
    const mergedHeaders = {
      ...this.getHeaders(),
      ...(options.headers || {}),
    };
    const config = {
      ...options,
      headers: mergedHeaders,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorMessage = `API error: ${response.status} ${response.statusText}`;
        try {
          const errorBody = await response.json();
          errorMessage = errorBody.msg || errorBody.message || errorBody.error_description || errorMessage;
        } catch {
          // Keep fallback status text when response body is not JSON.
        }
        throw new Error(errorMessage);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        console.log('API request returned 204 No Content');
        return null;
      }

      // Handle empty response for DELETE/PATCH operations
      if (response.status === 200 || response.status === 201) {
        const contentType = response.headers.get('content-type') || '';
        const contentLength = response.headers.get('content-length') || '';
        
        // If content-type includes JSON, parse it
        if (contentType.includes('application/json')) {
          const text = await response.text();
          if (!text || text.trim() === '') {
            console.log('API request returned empty body');
            return null;
          }
          return JSON.parse(text);
        }

        // Otherwise return text
        const text = await response.text();
        return text || null;
      }

      return null;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * GET request
   */
  get(path, options = {}) {
    return this.request(path, { method: 'GET', ...options });
  }

  /**
   * POST request
   */
  post(path, data, options = {}) {
    return this.request(path, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  /**
   * PATCH request
   */
  patch(path, data, options = {}) {
    return this.request(path, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    });
  }

  /**
   * DELETE request
   */
  delete(path, options = {}) {
    return this.request(path, { method: 'DELETE', ...options });
  }

  /**
   * Get all hobbies with their tags
   */
  async getHobbies() {
    try {
      console.log('Fetching hobbies from Supabase...');
      
      // Fetch all hobbies and all hobby-tag relationships in parallel
      const [hobbiesResponse, allHobbyTags] = await Promise.all([
        this.get('/hobbies?select=id,name,description,image_url'),
        this.get('/hobby_tags?select=hobby_id,tags(id,name)')
      ]);
      
      console.log('Hobbies fetched:', hobbiesResponse);
      console.log('Hobby tags fetched:', allHobbyTags);
      
      if (!hobbiesResponse || hobbiesResponse.length === 0) {
        console.warn('No hobbies found in database');
        return [];
      }
      
      // Group tags by hobby_id
      const tagsByHobbyId = {};
      allHobbyTags.forEach(ht => {
        if (!tagsByHobbyId[ht.hobby_id]) {
          tagsByHobbyId[ht.hobby_id] = [];
        }
        if (ht.tags?.name) {
          tagsByHobbyId[ht.hobby_id].push(ht.tags.name);
        }
      });
      
      // Add tags to hobbies
      const hobbiesWithTags = hobbiesResponse.map(hobby => ({
        ...hobby,
        tags: tagsByHobbyId[hobby.id] || []
      }));
      
      return hobbiesWithTags;
    } catch (error) {
      console.error('Failed to fetch hobbies:', error);
      throw error;
    }
  }

  /**
   * Get a single hobby by ID with related data
   */
  async getHobbyById(hobbyId) {
    try {
      console.log(`Fetching hobby ${hobbyId} from Supabase...`);
      
      // Fetch hobby and related data in parallel
      const [hobbies, hobbyTags, hobbyEvents, hobbyUsers] = await Promise.all([
        this.get(`/hobbies?id=eq.${hobbyId}&select=id,name,description,image_url`),
        this.get(`/hobby_tags?hobby_id=eq.${hobbyId}&select=tags(id,name)`),
        this.get(`/events?hobby_id=eq.${hobbyId}&select=id,title,event_date,location_id,locations(address,city)`),
        this.get(`/user_hobbies?hobby_id=eq.${hobbyId}&select=profiles(id,full_name,city)`)
      ]);
      
      if (!hobbies || hobbies.length === 0) {
        console.warn(`Hobby ${hobbyId} not found`);
        return null;
      }
      
      const hobbyData = hobbies[0];
      console.log('Hobby found:', hobbyData);
      
      // Process tags
      const tags = hobbyTags.map(ht => ht.tags?.name || '').filter(t => t);
      console.log('Tags fetched:', tags);
      
      // Process events
      const events = hobbyEvents.map(e => ({
        id: e.id,
        title: e.title,
        date: new Date(e.event_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        location: e.locations ? `${e.locations.city}` : 'TBD'
      }));
      console.log('Events fetched:', events);
      
      // Process people
      const people = hobbyUsers.map(uh => ({
        name: uh.profiles?.full_name || 'Unknown',
        city: uh.profiles?.city || 'Unknown'
      })).slice(0, 5);
      console.log('People fetched:', people);
      
      return {
        ...hobbyData,
        tags: tags,
        events: events,
        people: people,
        relatedHobbies: []
      };
    } catch (error) {
      console.error(`Failed to fetch hobby ${hobbyId}:`, error);
      throw error;
    }
  }

  /**
   * Get all events with related hobby and location information
   */
  async getEvents() {
    try {
      console.log('Fetching events from Supabase...');
      
      // Fetch events with hobby and location details
      const events = await this.get('/events?select=id,title,description,event_date,hobbies(name),locations(city,address)');
      console.log('Events fetched:', events);
      
      if (!events || events.length === 0) {
        console.warn('No events found in database');
        return [];
      }
      
      // Format events for display
      const formattedEvents = events.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        category: event.hobbies?.name || 'Unknown',
        location: event.locations?.city || 'TBD',
        date: new Date(event.event_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        time: new Date(event.event_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        participants: 0
      }));
      
      return formattedEvents;
    } catch (error) {
      console.error('Failed to fetch events:', error);
      throw error;
    }
  }

  /**
   * User Authentication Methods
   */

  /**
   * Register a new user
   */
  async register(email, password, fullName = '') {
    try {
      console.log('Registering user:', email);
      
      const response = await fetch(`${this.baseURL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
        },
        body: JSON.stringify({
          email: email,
          password: password,
          data: {
            full_name: fullName || email.split('@')[0],
          },
        }),
      });

      console.log('Registration response status:', response.status);
      console.log('Registration response OK:', response.ok);

      if (!response.ok) {
        const error = await response.json();
        console.error('Registration error response:', error);
        throw new Error(error.msg || error.message || error.error_description || `Registration failed (${response.status})`);
      }

      const data = await response.json();
      console.log('User registered successfully:', data);
      
      // Store auth token
      if (data.session?.access_token) {
        this.setAuthToken(data.session.access_token);
      }
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(email, password) {
    try {
      console.log('Logging in user:', email);
      
      const response = await fetch(`${this.baseURL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.msg || error.error_description || error.message || 'Login failed');
      }

      const data = await response.json();
      console.log('User logged in successfully');
      
      // Store auth token
      if (data.access_token) {
        this.setAuthToken(data.access_token);
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  logout() {
    console.log('Logging out user...');
    this.clearAuthToken();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    if (!this.authToken) {
      console.log('isAuthenticated() - NO TOKEN');
      return false;
    }
    
    // Check if token has valid JWT format (3 parts separated by dots)
    const isValidJWT = this.authToken.split('.').length === 3;
    console.log('isAuthenticated() - TOKEN EXISTS, valid JWT:', isValidJWT);
    
    if (!isValidJWT) {
      console.warn('isAuthenticated() - INVALID TOKEN FORMAT, clearing...');
      this.clearAuthToken();
      return false;
    }
    
    return true;
  }

  /**
   * Get current user from token (basic info)
   */
  getCurrentUser() {
    if (!this.authToken) {
      return null;
    }
    
    try {
      // Decode JWT token manually (basic parsing without verification)
      const parts = this.authToken.split('.');
      if (parts.length !== 3) {
        return null;
      }
      
      const decoded = JSON.parse(atob(parts[1]));
      return {
        id: decoded.sub,
        email: decoded.email,
      };
    } catch (error) {
      console.error('Failed to parse auth token:', error);
      return null;
    }
  }

  /**
   * Get user profile information
   */
  async getProfile(userId) {
    try {
      console.log(`Fetching profile for user ${userId}...`);
      
      const profiles = await this.get(`/profiles?id=eq.${encodeURIComponent(userId)}&select=*`);
      
      if (!profiles || profiles.length === 0) {
        console.warn(`Profile not found for user ${userId}`);
        return null;
      }
      
      const profile = profiles[0];
      console.log('Profile fetched:', profile);
      
      return profile;
    } catch (error) {
      console.error(`Failed to fetch profile for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Update user profile information
   */
  async updateProfile(userId, updateData) {
    try {
      console.log(`Updating profile for user ${userId}...`);
      console.log('Update data to send:', updateData);
      console.log('Auth token in updateProfile:', this.authToken ? 'YES' : 'NO');
      
      // Prepare update data with timestamp
      const data = {
        updated_at: new Date().toISOString(),
        ...updateData
      };
      
      console.log('Full data with timestamp:', data);
      
      // Construct the URL
      const url = `/profiles?id=eq.${userId}`;
      console.log('API endpoint:', url);
      
      // Supabase REST API requires Prefer header for returning full record
      const result = await this.patch(
        url,
        data,
        { 
          headers: {
            'Prefer': 'return=representation'
          }
        }
      );
      
      console.log('Profile updated response:', result);
      
      if (!result || (Array.isArray(result) && result.length === 0)) {
        console.warn('Unexpected response format - might be successful anyway if no body returned');
        return { success: true };
      }
      
      return Array.isArray(result) ? result[0] : result;
    } catch (error) {
      console.error(`Failed to update profile for user ${userId}:`, error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        originalError: error
      });
      throw error;
    }
  }

  /**
   * Get user hobbies
   */
  async getUserHobbies(userId) {
    try {
      console.log(`Fetching hobbies for user ${userId}...`);
      
      const userHobbies = await this.get(
        `/user_hobbies?profile_id=eq.${encodeURIComponent(userId)}&select=hobbies(id,name,description)`
      );
      
      if (!userHobbies || userHobbies.length === 0) {
        console.warn(`No hobbies found for user ${userId}`);
        return [];
      }
      
      console.log('User hobbies fetched:', userHobbies);
      
      return userHobbies
        .map(uh => uh.hobbies)
        .filter(Boolean)
        .map(hobby => ({
          id: hobby.id,
          name: hobby.name,
          description: hobby.description
        }));
    } catch (error) {
      console.error(`Failed to fetch hobbies for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get count of events user has joined
   */
  async getEventsJoinedCount(userId) {
    try {
      console.log(`Fetching events joined count for user ${userId}...`);
      
      const participatedEvents = await this.get(
        `/event_participants?profile_id=eq.${encodeURIComponent(userId)}&select=id`
      );
      
      const count = Array.isArray(participatedEvents) ? participatedEvents.length : 0;
      console.log('Events joined count:', count);
      
      return count;
    } catch (error) {
      console.error(`Failed to fetch events joined count for user ${userId}:`, error);
      return 0;
    }
  }

  /**
   * Add hobby to user's profile
   */
  async addUserHobby(userId, hobbyId) {
    try {
      console.log(`Adding hobby ${hobbyId} for user ${userId}...`);
      
      const result = await this.post('/user_hobbies', {
        profile_id: userId,
        hobby_id: hobbyId
      });
      
      console.log('Hobby added:', result);
      return result;
    } catch (error) {
      // Ignore duplicate key errors (user already has this hobby)
      if (error.message.includes('duplicate') || error.message.includes('UNIQUE')) {
        console.warn(`Hobby ${hobbyId} already added for user ${userId}`);
        return null;
      }
      console.error(`Failed to add hobby ${hobbyId} for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Remove hobby from user's profile
   */
  async removeUserHobby(userId, hobbyId) {
    try {
      console.log(`Removing hobby ${hobbyId} for user ${userId}...`);
      
      const result = await this.delete(
        `/user_hobbies?profile_id=eq.${encodeURIComponent(userId)}&hobby_id=eq.${encodeURIComponent(hobbyId)}`
      );
      
      console.log('Hobby removed:', result);
      return result;
    } catch (error) {
      console.error(`Failed to remove hobby ${hobbyId} for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Remove all hobbies for user and add new ones
   */
  async updateUserHobbies(userId, selectedHobbyIds) {
    try {
      console.log(`Updating hobbies for user ${userId}:`, selectedHobbyIds);
      console.log('Auth token exists:', !!this.authToken);
      
      // Remove all existing hobbies
      console.log('Deleting existing user hobbies...');
      const deleteResponse = await this.delete(`/user_hobbies?profile_id=eq.${encodeURIComponent(userId)}`);
      console.log('Delete hobbies response:', deleteResponse);
      
      // Add selected hobbies
      const addPromises = selectedHobbyIds.map(hobbyId => {
        console.log(`Adding hobby ${hobbyId} for user ${userId}`);
        return this.post('/user_hobbies', {
          profile_id: userId,
          hobby_id: hobbyId
        }).catch(err => {
          console.warn(`Failed to add hobby ${hobbyId}:`, err);
          return null;
        });
      });
      
      const results = await Promise.all(addPromises);
      console.log('Add hobbies results:', results);
      console.log('User hobbies updated successfully');
      
      return true;
    } catch (error) {
      console.error(`Failed to update hobbies for user ${userId}:`, error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        originalError: error
      });
      throw error;
    }
  }

  /**
   * Upload profile avatar to Supabase Storage
   */
  async uploadProfileAvatar(userId, file) {
    try {
      console.log(`Uploading avatar for user ${userId}...`);
      console.log('File:', file.name, file.size, file.type);

      if (!file) {
        throw new Error('No file provided');
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File size exceeds 5MB limit');
      }

      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('file', file);

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${userId}-${timestamp}-${file.name}`;
      const path = `avatars/${userId}/${filename}`;

      // Upload to Supabase Storage
      const url = `${this.baseURL}/storage/v1/object/${path}`;
      const headers = {
        'apikey': this.apiKey,
      };

      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      console.log('Uploading to:', url);

      const uploadResponse = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      if (!uploadResponse.ok) {
        let errorMessage = `Upload error: ${uploadResponse.status} ${uploadResponse.statusText}`;
        try {
          const errorBody = await uploadResponse.json();
          errorMessage = errorBody.message || errorBody.error || errorMessage;
        } catch {
          // Keep fallback status text
        }
        throw new Error(errorMessage);
      }

      const uploadResult = await uploadResponse.json();
      console.log('Upload result:', uploadResult);

      // Get public URL for the uploaded file
      const publicUrl = await this.getProfileAvatarUrl(userId, filename);
      console.log('Avatar public URL:', publicUrl);

      // Update profile with avatar URL
      await this.updateProfile(userId, { avatar_url: publicUrl });

      return {
        success: true,
        filename: filename,
        path: path,
        url: publicUrl
      };
    } catch (error) {
      console.error(`Failed to upload avatar for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get public URL for profile avatar
   */
  getProfileAvatarUrl(userId, filename) {
    try {
      console.log(`Generating public URL for avatar: ${userId}/${filename}`);
      
      // Supabase Storage public URL format
      const publicUrl = `${this.baseURL}/storage/v1/object/public/avatars/${userId}/${filename}`;
      console.log('Generated URL:', publicUrl);
      
      return publicUrl;
    } catch (error) {
      console.error('Failed to generate avatar URL:', error);
      throw error;
    }
  }

  /**
   * Delete profile avatar from storage
   */
  async deleteProfileAvatar(userId, filename) {
    try {
      console.log(`Deleting avatar for user ${userId}: ${filename}`);

      const path = `avatars/${userId}/${filename}`;
      const url = `${this.baseURL}/storage/v1/object/${path}`;
      
      const headers = {
        'apikey': this.apiKey,
      };

      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      const deleteResponse = await fetch(url, {
        method: 'DELETE',
        headers: headers,
      });

      if (!deleteResponse.ok) {
        let errorMessage = `Delete error: ${deleteResponse.status} ${deleteResponse.statusText}`;
        try {
          const errorBody = await deleteResponse.json();
          errorMessage = errorBody.message || errorBody.error || errorMessage;
        } catch {
          // Keep fallback status text
        }
        throw new Error(errorMessage);
      }

      console.log('Avatar deleted successfully');
      return { success: true };
    } catch (error) {
      console.error(`Failed to delete avatar for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get upcoming events that user has joined
   */
  async getUpcomingEvents(userId) {
    try {
      console.log(`Fetching upcoming events for user ${userId}...`);
      
      // Get events user has joined, ordered by date
      const upcomingEvents = await this.get(
        `/event_participants?profile_id=eq.${encodeURIComponent(userId)}&select=events(id,title,description,event_date,hobbies(name),locations(city,address))&order=events.event_date.asc`
      );
      
      if (!upcomingEvents || upcomingEvents.length === 0) {
        console.warn(`No events found for user ${userId}`);
        return [];
      }
      
      console.log('User events fetched:', upcomingEvents);
      
      // Filter and format events
      const now = new Date();
      const formattedEvents = upcomingEvents
        .map(item => {
          if (!item.events) return null;
          return {
            id: item.events.id,
            title: item.events.title,
            description: item.events.description,
            category: item.events.hobbies?.name || 'Unknown',
            location: item.events.locations?.city || 'TBD',
            date: new Date(item.events.event_date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            }),
            time: new Date(item.events.event_date).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            eventDate: new Date(item.events.event_date)
          };
        })
        .filter(event => event && event.eventDate > now) // Only future events
        .sort((a, b) => a.eventDate - b.eventDate) // Sort by date
        .slice(0, 5) // Limit to 5 upcoming events
        .map(({ eventDate, ...event }) => event); // Remove helper eventDate field
      
      return formattedEvents;
    } catch (error) {
      console.error(`Failed to fetch upcoming events for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Get all profiles (users) with their hobbies
   */
  async getAllProfiles() {
    try {
      console.log('Fetching all user profiles...');
      
      const profiles = await this.get(
        `/profiles?select=id,full_name,city,bio,avatar_url,user_hobbies(hobbies(id,name))`
      );
      
      if (!profiles || profiles.length === 0) {
        console.warn('No profiles found');
        return [];
      }
      
      console.log('Profiles fetched:', profiles);
      
      // Format profiles with hobbies
      const formattedProfiles = profiles.map((profile, index) => ({
        id: profile.id,
        name: profile.full_name || 'User',
        city: profile.city || 'Unknown',
        bio: profile.bio || 'No bio yet',
        avatar_url: profile.avatar_url,
        hobbies: profile.user_hobbies ? profile.user_hobbies.map(uh => uh.hobbies?.name).filter(Boolean) : [],
        role: index % 2 === 0 ? 'host' : 'seeker' // Alternate roles for demo
      }));
      
      return formattedProfiles;
    } catch (error) {
      console.error('Failed to fetch profiles:', error);
      return [];
    }
  }

  /**
   * Get event by ID with full details
   */
  async getEventById(eventId) {
    try {
      console.log(`Fetching event ${eventId}...`);
      
      const events = await this.get(
        `/events?id=eq.${encodeURIComponent(eventId)}&select=id,title,description,event_date,hobbies(id,name),locations(id,city,address),profiles(id,full_name),event_participants(profile_id,profiles(full_name))`
      );
      
      if (!events || events.length === 0) {
        console.warn(`Event ${eventId} not found`);
        return null;
      }
      
      const event = events[0];
      console.log('Event fetched:', event);
      
      const eventDate = new Date(event.event_date);
      const maxParticipants = 20; // Default value
      const currentParticipants = event.event_participants ? event.event_participants.length : 0;
      
      return {
        id: event.id,
        title: event.title,
        description: event.description,
        category: event.hobbies?.name || 'Unknown',
        location: event.locations?.city || 'TBD',
        date: eventDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        time: eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        host: event.profiles?.full_name || 'Unknown',
        maxParticipants: maxParticipants,
        currentParticipants: currentParticipants,
        difficulty: 'Beginner',
        price: 'Free',
        participants: event.event_participants ? event.event_participants.map(ep => ep.profiles?.full_name || 'Unknown') : []
      };
    } catch (error) {
      console.error(`Failed to fetch event ${eventId}:`, error);
      return null;
    }
  }
}

export const apiService = new APIService();
