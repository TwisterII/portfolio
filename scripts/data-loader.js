/* =============================================
   DATA-LOADER.JS - Load content from resume.json
   ============================================= */

(function() {
    'use strict';

    // =============================================
    // FETCH AND LOAD DATA
    // =============================================

    async function loadResumeData() {
        try {
            const response = await fetch('data/resume.json');
            if (!response.ok) {
                throw new Error('Failed to load resume data');
            }
            const data = await response.json();
            populatePage(data);

            // Dispatch event to signal data is loaded
            document.dispatchEvent(new CustomEvent('dataLoaded'));
        } catch (error) {
            console.error('Error loading resume data:', error);
            // Page will still work with static content
            document.dispatchEvent(new CustomEvent('dataLoaded'));
        }
    }

    // =============================================
    // POPULATE PAGE SECTIONS
    // =============================================

    function populatePage(data) {
        populateSkills(data.skills);
        populateExperience(data.experience);
        populateAchievements(data.achievements);
    }

    // =============================================
    // SKILLS / POWER-UPS
    // =============================================

    function populateSkills(skills) {
        const productContainer = document.getElementById('product-skills');
        const technicalContainer = document.getElementById('technical-skills');

        if (productContainer && skills.product) {
            productContainer.innerHTML = skills.product
                .map(skill => createPowerup(skill))
                .join('');
        }

        if (technicalContainer && skills.technical) {
            technicalContainer.innerHTML = skills.technical
                .map(skill => createPowerup(skill))
                .join('');
        }
    }

    function createPowerup(skillName) {
        return `<div class="powerup" role="listitem">${escapeHtml(skillName)}</div>`;
    }

    // =============================================
    // EXPERIENCE / LEVELS
    // =============================================

    function populateExperience(experience) {
        const timeline = document.getElementById('career-timeline');
        if (!timeline || !experience) return;

        timeline.innerHTML = experience
            .map(job => createLevelCard(job))
            .join('');
    }

    function createLevelCard(job) {
        const subtitle = job.subtitle ? `, ${escapeHtml(job.subtitle)}` : '';
        const highlights = job.highlights
            .map(h => `<li>${escapeHtml(h)}</li>`)
            .join('');

        return `
            <article class="level-card" tabindex="0" role="button" aria-expanded="false">
                <div class="level-header">
                    <span class="level-number">LVL ${job.level}</span>
                    <h3 class="level-title">${escapeHtml(job.title)}${subtitle}</h3>
                    <span class="level-company">${escapeHtml(job.company)}</span>
                    <span class="level-dates">${escapeHtml(job.dates)}</span>
                </div>
                <div class="level-details">
                    <ul>${highlights}</ul>
                </div>
                <p class="expand-hint">[ CLICK TO EXPAND ]</p>
            </article>
        `;
    }

    // =============================================
    // ACHIEVEMENTS / HIGH SCORES
    // =============================================

    function populateAchievements(achievements) {
        const board = document.getElementById('achievements-board');
        if (!board || !achievements) return;

        board.innerHTML = achievements
            .map((achievement, index) => createScoreEntry(achievement, index + 1))
            .join('');
    }

    function createScoreEntry(achievement, rank) {
        return `
            <div class="score-entry" role="listitem">
                <span class="score-rank">${rank}.</span>
                <span class="score-value">${escapeHtml(achievement.value)}</span>
                <span class="score-label">${escapeHtml(achievement.label)}</span>
            </div>
        `;
    }

    // =============================================
    // UTILITY FUNCTIONS
    // =============================================

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // =============================================
    // INITIALIZATION
    // =============================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadResumeData);
    } else {
        loadResumeData();
    }

})();
