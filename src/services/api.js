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
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
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
  async register(email, password) {
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
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
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
        throw new Error(error.error_description || error.message || 'Login failed');
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
}

export const apiService = new APIService();
