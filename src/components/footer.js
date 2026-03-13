/**
 * Footer component - Responsive footer
 */

export class Footer {
  constructor() {
    this.container = document.getElementById('footer-container');
  }

  render() {
    this.container.innerHTML = `
      <footer class="bg-dark text-light mt-5 py-5 border-top">
        <div class="container-fluid">
          <div class="row">
            <!-- About Section -->
            <div class="col-lg-3 col-md-6 mb-4 mb-lg-0">
              <h5 class="fw-bold mb-3">
                <i class="bi bi-star-fill text-warning me-2"></i>Hobby Buddy Hub
              </h5>
              <p class="text-muted small">
                Discover hobbies, meet like-minded people, and organize hobby-related activities together.
              </p>
            </div>

            <!-- Quick Links -->
            <div class="col-lg-3 col-md-6 mb-4 mb-lg-0">
              <h6 class="fw-bold mb-3">Quick Links</h6>
              <ul class="list-unstyled small">
                <li><a href="/" class="text-muted text-decoration-none">Home</a></li>
                <li><a href="/hobbies" class="text-muted text-decoration-none">Browse Hobbies</a></li>
                <li><a href="/events" class="text-muted text-decoration-none">Find Events</a></li>
                <li><a href="/people" class="text-muted text-decoration-none">Find People</a></li>
              </ul>
            </div>

            <!-- Resources -->
            <div class="col-lg-3 col-md-6 mb-4 mb-lg-0">
              <h6 class="fw-bold mb-3">Resources</h6>
              <ul class="list-unstyled small">
                <li><a href="/about" class="text-muted text-decoration-none">About Us</a></li>
                <li><a href="/contact" class="text-muted text-decoration-none">Contact</a></li>
                <li><a href="/faq" class="text-muted text-decoration-none">FAQ</a></li>
                <li><a href="/privacy" class="text-muted text-decoration-none">Privacy Policy</a></li>
              </ul>
            </div>

            <!-- Social Links -->
            <div class="col-lg-3 col-md-6 mb-4 mb-lg-0">
              <h6 class="fw-bold mb-3">Follow Us</h6>
              <div class="d-flex gap-3">
                <a href="#" class="text-muted text-decoration-none" title="Facebook">
                  <i class="bi bi-facebook fs-5"></i>
                </a>
                <a href="#" class="text-muted text-decoration-none" title="Twitter">
                  <i class="bi bi-twitter fs-5"></i>
                </a>
                <a href="#" class="text-muted text-decoration-none" title="Instagram">
                  <i class="bi bi-instagram fs-5"></i>
                </a>
                <a href="#" class="text-muted text-decoration-none" title="LinkedIn">
                  <i class="bi bi-linkedin fs-5"></i>
                </a>
              </div>
            </div>
          </div>

          <!-- Divider -->
          <hr class="bg-secondary my-4">

          <!-- Copyright -->
          <div class="row">
            <div class="col-md-6 text-center text-md-start">
              <p class="text-muted small mb-0">
                &copy; 2026 Hobby Buddy Hub. All rights reserved.
              </p>
            </div>
            <div class="col-md-6 text-center text-md-end">
              <p class="text-muted small mb-0">
                <a href="/terms" class="text-muted text-decoration-none">Terms of Service</a>
                <span class="text-muted mx-2">|</span>
                <a href="/privacy" class="text-muted text-decoration-none">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  teardown() {
    this.container.innerHTML = '';
  }
}
