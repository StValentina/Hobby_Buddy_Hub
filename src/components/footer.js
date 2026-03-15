/**
 * Footer component - Responsive footer
 */

export class Footer {
  constructor() {
    this.container = document.getElementById('footer-container');
  }

  render() {
    this.container.innerHTML = `
      <footer class="bg-dark text-light border-top">
        <div class="container text-center py-5">
          <p class="small mb-0">
            &copy; 2026 Hobby Buddy Hub. All rights reserved.
          </p>
        </div>
      </footer>
    `;
  }

  teardown() {
    this.container.innerHTML = '';
  }
}
