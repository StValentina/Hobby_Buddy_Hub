/**
 * Index/Home Page JavaScript
 */

import { Header } from '../../src/components/header.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize header with authentication support
    const header = new Header();
    header.render();
    
    // Set active navigation link
    setActiveNav('Home');
    
    console.log('Index page loaded');
});

