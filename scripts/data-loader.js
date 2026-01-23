/* =============================================
   DATA-LOADER.JS - Load content from resume.json
   Vegas Theme Edition
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
    // SKILLS - THE WINNING HAND
    // =============================================

    function populateSkills(skills) {
        const productContainer = document.getElementById('product-skills');
        const technicalContainer = document.getElementById('technical-skills');

        if (productContainer && skills.product) {
            productContainer.innerHTML = skills.product
                .map(skill => createSkillChip(skill))
                .join('');
        }

        if (technicalContainer && skills.technical) {
            technicalContainer.innerHTML = skills.technical
                .map(skill => createSkillChip(skill))
                .join('');
        }
    }

    function createSkillChip(skillName) {
        return `<div class="skill-chip" role="listitem">${escapeHtml(skillName)}</div>`;
    }

    // =============================================
    // EXPERIENCE - CAREER JACKPOT
    // =============================================

    function populateExperience(experience) {
        const timeline = document.getElementById('career-timeline');
        if (!timeline || !experience) return;

        timeline.innerHTML = experience
            .map(job => createCareerCard(job))
            .join('');
    }

    function createCareerCard(job) {
        const subtitle = job.subtitle ? `, ${escapeHtml(job.subtitle)}` : '';
        const highlights = job.highlights
            .map(h => `<li>${escapeHtml(h)}</li>`)
            .join('');

        return `
            <article class="career-card" tabindex="0" role="button" aria-expanded="false">
                <div class="career-header">
                    <span class="career-year">${escapeHtml(job.dates.split(' - ')[0])}</span>
                    <h3 class="career-title">${escapeHtml(job.title)}${subtitle}</h3>
                    <span class="career-company">${escapeHtml(job.company)}</span>
                    <span class="career-dates">${escapeHtml(job.dates)}</span>
                </div>
                <div class="career-details">
                    <ul>${highlights}</ul>
                </div>
                <p class="expand-hint">Click to expand</p>
            </article>
        `;
    }

    // =============================================
    // ACHIEVEMENTS - HALL OF FAME
    // =============================================

    function populateAchievements(achievements) {
        const board = document.getElementById('achievements-board');
        if (!board || !achievements) return;

        board.innerHTML = achievements
            .map((achievement, index) => createAchievementEntry(achievement, index + 1))
            .join('');
    }

    function createAchievementEntry(achievement, rank) {
        return `
            <div class="achievement-entry" role="listitem">
                <span class="achievement-rank">${rank}.</span>
                <span class="achievement-value">${escapeHtml(achievement.value)}</span>
                <span class="achievement-label">${escapeHtml(achievement.label)}</span>
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
