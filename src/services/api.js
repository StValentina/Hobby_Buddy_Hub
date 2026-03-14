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
    return localStorage.getItem('auth_token');
  }

  /**
   * Set authentication token
   */
  setAuthToken(token) {
    localStorage.setItem('auth_token', token);
    this.authToken = token;
  }

  /**
   * Clear authentication token
   */
  clearAuthToken() {
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
}

export const apiService = new APIService();
