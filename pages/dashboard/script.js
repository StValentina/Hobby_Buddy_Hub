/**
 * Dashboard Page JavaScript
 */

import { Header } from '../../src/components/header.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize header with authentication support
    const header = new Header();
    header.render();
    
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
