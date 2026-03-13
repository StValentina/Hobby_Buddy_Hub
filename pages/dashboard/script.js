/**
 * Dashboard Page JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // Set active navigation link
    setActiveNav('Dashboard');
    
    console.log('Dashboard page loaded');
    
    // Initialize statistics animations
    animateStatistics();
});

/**
 * Animate statistics on page load
 */
function animateStatistics() {
    const statCards = document.querySelectorAll('.card');
    statCards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('fade-in');
        }, index * 100);
    });
}
