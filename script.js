document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchForm');
    const resultsSection = document.getElementById('resultsSection');
    const jobsGrid = document.getElementById('jobsGrid');
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const emptyState = document.getElementById('emptyState');
    const resultsCount = document.getElementById('resultsCount');

    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const role = document.getElementById('role').value;
        const experience = document.getElementById('experience').value;
        const location = document.getElementById('location').value;

        // Reset UI states
        jobsGrid.innerHTML = '';
        loadingState.classList.remove('hidden');
        errorState.classList.add('hidden');
        emptyState.classList.add('hidden');
        resultsCount.textContent = 'Searching...';

        try {
            // Step 1: Request new valid job links
            const requestResponse = await fetch('https://redis-jobseeker-backend.onrender.com/api/v1/request-for-link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    role,
                    experience,
                    location,
                    userId: 'frontend-user-' + Date.now()
                })
            });

            if (!requestResponse.ok) {
                throw new Error('Failed to initiate job search');
            }

            // Step 2: Poll for results or wait a bit then fetch
            // For now, we'll wait a few seconds and then fetch what we have
            // In a real app, we might use websockets or polling

            // Wait for 2 seconds to allow some potential DB hits or cache
            await new Promise(resolve => setTimeout(resolve, 2000));

            const searchResponse = await fetch(`https://redis-jobseeker-backend.onrender.com/api/v1/search?role=${encodeURIComponent(role)}&experience=${encodeURIComponent(experience)}`);

            if (!searchResponse.ok) {
                throw new Error('Failed to fetch jobs');
            }

            const data = await searchResponse.json();
            displayJobs(data.jobs);

        } catch (error) {
            console.error(error);
            loadingState.classList.add('hidden');
            errorState.classList.remove('hidden');
            errorState.querySelector('.error-text').textContent = error.message || 'Something went wrong. Please try again.';
            resultsCount.textContent = '0 jobs found';
        }
    });

    function displayJobs(jobs) {
        loadingState.classList.add('hidden');

        if (!jobs || jobs.length === 0) {
            emptyState.classList.remove('hidden');
            resultsCount.textContent = '0 jobs found';
            return;
        }

        resultsCount.textContent = `${jobs.length} jobs found`;

        jobs.forEach(job => {
            const card = createJobCard(job);
            jobsGrid.appendChild(card);
        });
    }

    function createJobCard(job) {
        const div = document.createElement('div');
        div.className = 'job-card';

        // Handle missing data gracefully
        const company = job.company || 'Unknown Company';
        const title = job.title || job.role || 'Job Opportunity';
        // const date = new Date(job.scrapedAt).toLocaleDateString();
        const source = job.source || 'Aggregator';

        div.innerHTML = `
            <div class="job-header">
                <div class="company-name">${escapeHtml(company)}</div>
                <h3 class="job-title">${escapeHtml(title)}</h3>
            </div>
            <div class="job-meta">
                <span class="meta-item">📍 ${escapeHtml(job.location || 'United States')}</span>
                <span class="meta-item">💼 ${escapeHtml(job.experience || 'Not specified')}</span>
                <span class="meta-item">🔗 ${escapeHtml(source)}</span>
            </div>
            <a href="${job.apply_url}" target="_blank" rel="noopener noreferrer" class="apply-btn">
                Apply Now ↗
            </a>
        `;
        return div;
    }

    function escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});
