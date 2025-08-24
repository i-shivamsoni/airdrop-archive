/**
 * Contribute Page JavaScript
 * Handles functionality for the contribute page including copy to clipboard, FAQ interactions, and smooth scrolling
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initializeFAQ();
    initializeCopyToClipboard();
    initializeSmoothScrolling();
    initializeAnimations();
    initializeCategoryTabs();
    initializeAllCards();
    initializeFormValidation();
});

// Category Tabs Functionality
function initializeCategoryTabs() {
    const categoryTabs = document.querySelectorAll('.category-tab');
    const optionCards = document.querySelectorAll('.option-card');

    if (categoryTabs.length === 0) {
        console.error('No category tabs found!');
        return;
    }

    if (optionCards.length === 0) {
        console.error('No option cards found!');
        return;
    }

    // Add click handlers to tabs
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const selectedCategory = this.getAttribute('data-category');
            
            // Update active tab
            categoryTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Filter cards
            optionCards.forEach((card, index) => {
                const cardCategory = card.getAttribute('data-category');
                
                if (selectedCategory === 'all' || cardCategory === selectedCategory) {
                    card.style.display = 'block';
                    card.classList.remove('hidden');
                } else {
                    card.style.display = 'none';
                    card.classList.add('hidden');
                }
            });
        });
    });

    // Initialize with "all" category
    const allTab = document.querySelector('.category-tab[data-category="all"]');
    if (allTab) {
        allTab.click();
    } else {
        // Fallback: show all cards
        optionCards.forEach(card => {
            card.style.display = 'block';
            card.classList.remove('hidden');
        });
    }
}

// FAQ Toggle functionality
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        if (question && answer) {
            question.addEventListener('click', () => {
                const isExpanded = question.getAttribute('aria-expanded') === 'true';
                
                // Close other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        const otherQuestion = otherItem.querySelector('.faq-question');
                        const otherAnswer = otherItem.querySelector('.faq-answer');
                        if (otherQuestion && otherAnswer) {
                            otherQuestion.setAttribute('aria-expanded', 'false');
                            otherAnswer.style.display = 'none';
                            otherItem.classList.remove('active');
                        }
                    }
                });

                // Toggle current item
                question.setAttribute('aria-expanded', !isExpanded);
                answer.style.display = isExpanded ? 'none' : 'block';
                item.classList.toggle('active');
            });

            // Keyboard support
            question.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    question.click();
                }
            });
        }
    });
}

// Copy to clipboard functionality
function initializeCopyToClipboard() {
    window.copyToClipboard = function(text, elementId) {
        navigator.clipboard.writeText(text).then(() => {
            const feedback = document.getElementById('copy-feedback-' + elementId.split('-')[1]);
            const button = document.querySelector(`[onclick*="${elementId}"]`);
            const copyText = button?.querySelector('.copy-text');
            
            if (feedback) {
                feedback.textContent = 'Copied!';
                feedback.style.display = 'block';
                setTimeout(() => {
                    feedback.style.display = 'none';
                }, 2000);
            }
            
            if (copyText) {
                copyText.textContent = 'Copied!';
        setTimeout(() => {
                    copyText.textContent = 'Copy';
        }, 2000);
            }
            
            showToast('Address copied to clipboard!', 'success');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            showToast('Failed to copy address', 'error');
        });
    };
}

// Smooth scrolling for anchor links
function initializeSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Scroll animations
function initializeAnimations() {
    const sections = document.querySelectorAll('.about-section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        observer.observe(section);
    });
}

// Card hover animations
function initializeAllCards() {
    initializeOptionCards();
    initializeDonationCards();
    initializeCommunityCards();
}

function initializeOptionCards() {
    const optionCards = document.querySelectorAll('.option-card');
    
    optionCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
}

function initializeDonationCards() {
    const donationCards = document.querySelectorAll('.donation-card');
    
    donationCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
}

function initializeCommunityCards() {
    const communityCards = document.querySelectorAll('.community-card');
    
    communityCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
}

// Toast notification system
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        font-size: 14px;
        font-weight: 500;
    `;
    
    // Add to page
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Form validation (placeholder for future use)
function initializeFormValidation() {
    // This can be expanded for any forms that might be added later
    console.log('Form validation initialized');
} 