// Theme toggle functionality in the header
document.addEventListener('DOMContentLoaded', function () {
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
    }

    // Theme toggle click handler
    themeToggle.addEventListener('click', function () {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeToggle.querySelector('i').classList.replace(
            isDark ? 'fa-moon' : 'fa-sun',
            isDark ? 'fa-sun' : 'fa-moon'
        );
    });
});
// Search functionality in the header
const searchInput = document.querySelector('.search-bar input');
const searchButton = document.querySelector('.search-bar button');

searchButton.addEventListener('click', function () {
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
        // Implement search functionality
        console.log('Searching for:', searchTerm);
    }
});

searchInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            // Implement search functionality
            console.log('Searching for:', searchTerm);
        }
    }
});
// Mobile menu functionality
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const nav = document.querySelector('nav');
if (mobileMenuToggle && nav) {
    mobileMenuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
    });
}
// Initialize smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});
// Error handling for Ethereum provider injection
window.addEventListener('error', function (event) {
    if (event && event.message && (
        event.message.includes('Cannot redefine property: ethereum') ||
        event.message.includes('Cannot set property ethereum')
    )) {
        event.preventDefault();
        return true;
    }
}, true);