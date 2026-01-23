/* =============================================
   MAIN.JS - Scroll Triggers & Interactions
   Vegas Theme Edition
   ============================================= */

(function() {
    'use strict';

    // =============================================
    // INTERSECTION OBSERVER FOR SCROLL ANIMATIONS
    // =============================================

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    // Observer for general reveal animations
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Unobserve after revealing (one-time animation)
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observer for skill chips with staggered reveal
    const chipObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                chipObserver.unobserve(entry.target);
            }
        });
    }, { ...observerOptions, threshold: 0.3 });

    // =============================================
    // CAREER CARD EXPANSION
    // =============================================

    function initCareerCards() {
        const careerCards = document.querySelectorAll('.career-card');

        careerCards.forEach(card => {
            card.addEventListener('click', () => {
                // Close other expanded cards
                careerCards.forEach(otherCard => {
                    if (otherCard !== card && otherCard.classList.contains('expanded')) {
                        otherCard.classList.remove('expanded');
                        otherCard.setAttribute('aria-expanded', 'false');
                    }
                });

                // Toggle current card
                const isExpanded = card.classList.toggle('expanded');
                card.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
            });

            // Keyboard accessibility
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
        });
    }

    // =============================================
    // SMOOTH SCROLL FOR INTERNAL LINKS
    // =============================================

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // =============================================
    // INITIALIZE OBSERVERS
    // =============================================

    function initObservers() {
        // Observe reveal-on-scroll elements
        document.querySelectorAll('.reveal-on-scroll').forEach(el => {
            revealObserver.observe(el);
        });

        // Observe career cards
        document.querySelectorAll('.career-card').forEach(el => {
            revealObserver.observe(el);
        });

        // Observe achievement entries
        document.querySelectorAll('.achievement-entry').forEach(el => {
            revealObserver.observe(el);
        });

        // Observe skill chips with staggered effect
        document.querySelectorAll('.skill-chip').forEach(el => {
            chipObserver.observe(el);
        });
    }

    // =============================================
    // KEYBOARD NAVIGATION
    // =============================================

    function initKeyboardNav() {
        // Make career cards focusable (already set in HTML, but ensure it)
        document.querySelectorAll('.career-card').forEach(card => {
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            if (!card.hasAttribute('aria-expanded')) {
                card.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // =============================================
    // INITIALIZATION
    // =============================================

    function init() {
        // Wait for data to be loaded
        document.addEventListener('dataLoaded', () => {
            initObservers();
            initCareerCards();
            initSmoothScroll();
            initKeyboardNav();
        });

        // Fallback if data loading is synchronous or already done
        if (document.readyState === 'complete') {
            setTimeout(() => {
                initObservers();
                initCareerCards();
                initSmoothScroll();
                initKeyboardNav();
            }, 100);
        }
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
