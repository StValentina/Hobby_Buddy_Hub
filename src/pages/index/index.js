/**
 * Index/Home Page
 */

import { Header } from '../../components/header.js';
import { Footer } from '../../components/footer.js';

export class IndexPage {
  constructor() {
    this.header = new Header();
    this.footer = new Footer();
  }

  async render() {
    // Render header and footer
    this.header.render();
    this.footer.render();

    // Render page content
    const app = document.getElementById('app');
    app.innerHTML = `
      <!-- Hero Section -->
      <section class="hero-section bg-gradient py-5" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <div class="container py-5">
          <div class="row align-items-center min-vh-100">
            <div class="col-lg-6 text-white">
              <h1 class="display-4 fw-bold mb-4">
                <i class="bi bi-star-fill text-warning me-2"></i>Discover Your Next Hobby
              </h1>
              <p class="lead mb-4">
                Connect with passionate people, join hobby events, and explore new activities in your community.
              </p>
              <div class="d-flex gap-3 flex-wrap">
                <a href="/register" class="btn btn-warning btn-lg fw-bold">
                  Get Started <i class="bi bi-arrow-right ms-2"></i>
                </a>
                <a href="/hobbies" class="btn btn-outline-light btn-lg fw-bold">
                  Browse Hobbies <i class="bi bi-search ms-2"></i>
                </a>
              </div>
            </div>
            <div class="col-lg-6 mt-4 mt-lg-0">
              <div class="text-center">
                <i class="bi bi-people-fill text-warning" style="font-size: 200px; opacity: 0.3;"></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="py-5 bg-light">
        <div class="container">
          <h2 class="text-center mb-5 fw-bold">How It Works</h2>
          <div class="row g-4">
            <div class="col-md-4">
              <div class="card h-100 border-0 shadow-sm">
                <div class="card-body text-center">
                  <i class="bi bi-person-plus text-primary" style="font-size: 3rem;"></i>
                  <h5 class="card-title mt-3">Create Profile</h5>
                  <p class="card-text text-muted">
                    Sign up and tell us about your interests and hobbies.
                  </p>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card h-100 border-0 shadow-sm">
                <div class="card-body text-center">
                  <i class="bi bi-search text-success" style="font-size: 3rem;"></i>
                  <h5 class="card-title mt-3">Find Activities</h5>
                  <p class="card-text text-muted">
                    Browse hobby events and activities happening near you.
                  </p>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card h-100 border-0 shadow-sm">
                <div class="card-body text-center">
                  <i class="bi bi-people-fill text-warning" style="font-size: 3rem;"></i>
                  <h5 class="card-title mt-3">Connect & Enjoy</h5>
                  <p class="card-text text-muted">
                    Meet like-minded people and enjoy your hobbies together.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-5 bg-primary text-white text-center">
        <div class="container">
          <h2 class="mb-4 fw-bold">Ready to Connect with Hobby Enthusiasts?</h2>
          <a href="/register" class="btn btn-warning btn-lg fw-bold">
            Join Hobby Buddy Hub Today <i class="bi bi-arrow-right ms-2"></i>
          </a>
        </div>
      </section>
    `;
  }

  async setup() {
    // Setup page-specific functionality if needed
  }

  teardown() {
    // Cleanup if needed
  }
}
