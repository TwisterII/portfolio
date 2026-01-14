/* =============================================
   MAIN.JS - Scroll Triggers & Interactions
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

    // Observer for power-up unlocking
    const powerupObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                unlockPowerup(entry.target);
                powerupObserver.unobserve(entry.target);
            }
        });
    }, { ...observerOptions, threshold: 0.5 });

    // =============================================
    // POWER-UP UNLOCK ANIMATION
    // =============================================

    function unlockPowerup(element) {
        element.classList.add('unlocking');

        // After animation, set to unlocked state
        element.addEventListener('animationend', () => {
            element.classList.remove('unlocking');
            element.classList.add('unlocked');
        }, { once: true });
    }

    // =============================================
    // LEVEL CARD EXPANSION
    // =============================================

    function initLevelCards() {
        const levelCards = document.querySelectorAll('.level-card');

        levelCards.forEach(card => {
            card.addEventListener('click', () => {
                // Close other expanded cards
                levelCards.forEach(otherCard => {
                    if (otherCard !== card && otherCard.classList.contains('expanded')) {
                        otherCard.classList.remove('expanded');
                    }
                });

                // Toggle current card
                card.classList.toggle('expanded');
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
    // COUNTDOWN ANIMATION
    // =============================================

    function initCountdown() {
        const countdownEl = document.querySelector('.countdown');
        if (!countdownEl) return;

        let count = 9;

        const countdownObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startCountdown();
                    countdownObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        countdownObserver.observe(countdownEl);

        function startCountdown() {
            const interval = setInterval(() => {
                count--;
                if (count >= 0) {
                    countdownEl.textContent = count;
                } else {
                    clearInterval(interval);
                    countdownEl.textContent = '!';
                    countdownEl.style.color = 'var(--neon-green)';
                    countdownEl.style.textShadow =
                        'var(--glow-md) var(--neon-green), var(--glow-lg) var(--neon-green)';
                }
            }, 1000);
        }
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

        // Observe level cards
        document.querySelectorAll('.level-card').forEach(el => {
            revealObserver.observe(el);
        });

        // Observe score entries
        document.querySelectorAll('.score-entry').forEach(el => {
            revealObserver.observe(el);
        });

        // Observe power-ups
        document.querySelectorAll('.powerup').forEach(el => {
            powerupObserver.observe(el);
        });
    }

    // =============================================
    // KEYBOARD NAVIGATION
    // =============================================

    function initKeyboardNav() {
        // Make level cards focusable
        document.querySelectorAll('.level-card').forEach(card => {
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-expanded', 'false');
        });

        // Update aria-expanded on toggle
        document.querySelectorAll('.level-card').forEach(card => {
            const observer = new MutationObserver(() => {
                card.setAttribute('aria-expanded',
                    card.classList.contains('expanded') ? 'true' : 'false');
            });
            observer.observe(card, { attributes: true, attributeFilter: ['class'] });
        });
    }

    // =============================================
    // INITIALIZATION
    // =============================================

    function init() {
        // Wait for data to be loaded
        document.addEventListener('dataLoaded', () => {
            initObservers();
            initLevelCards();
            initCountdown();
            initSmoothScroll();
            initKeyboardNav();
        });

        // Fallback if data loading is synchronous or already done
        if (document.readyState === 'complete') {
            setTimeout(() => {
                initObservers();
                initLevelCards();
                initCountdown();
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
