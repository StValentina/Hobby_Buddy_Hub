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
}

export const apiService = new APIService();
