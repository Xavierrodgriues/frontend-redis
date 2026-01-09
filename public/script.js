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
            // const API_BASE = 'https://redis-jobseeker-backend.onrender.com';
            const API_BASE = 'https://redis-jobseeker-backend.onrender.com';

            const requestResponse = await fetch(`${API_BASE}/api/v1/request-for-link`, {
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

            const searchResponse = await fetch(`${API_BASE}/api/v1/search?role=${encodeURIComponent(role)}&experience=${encodeURIComponent(experience)}`);

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

    // --- Suggestion Logic ---
    const roleInput = document.getElementById('role');

    // Create suggestions container
    const suggestionsBox = document.createElement('div');
    suggestionsBox.className = 'suggestions-box';
    roleInput.parentElement.style.position = 'relative'; // Ensure parent is relative
    roleInput.parentElement.appendChild(suggestionsBox);

    let debounceTimer;
    const suggestionsCache = new Map();
    let currentRequestId = 0;

    roleInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        clearTimeout(debounceTimer);

        if (query.length < 1) {
            suggestionsBox.classList.remove('visible');
            return;
        }

        // Check cache first
        if (suggestionsCache.has(query)) {
            renderSuggestions(suggestionsCache.get(query));
            return;
        }

        // Increment request ID to track latest request
        const requestId = ++currentRequestId;

        // Show loading state immediately
        suggestionsBox.innerHTML = '<div class="suggestion-loading">Loading...</div>';
        suggestionsBox.classList.add('visible');

        const SUPPORTED_ROLES = [
            "Backend Engineer", "Frontend Engineer", "Full Stack Engineer", "Mobile Engineer", "Software Engineer",
            "Platform Engineer", "Systems Engineer", "Embedded Systems Engineer", "UI UX",
            "Cloud Engineer", "Cloud Architect", "DevOps Engineer", "Site Reliability Engineer (SRE)", "Infrastructure Engineer",
            "Cloud Strategy Consultant", "Network Cloud Engineer",
            "Security Engineer", "Cloud Security Engineer", "Application Security Engineer", "Network Security Engineer",
            "Cyber Security Analyst", "GRC / Compliance Engineer", "IT Auditor", "FedRAMP / ATO Engineer", "Technology Risk Manager",
            "Data Engineer", "Data Scientist", "Analytics Engineer", "Business Intelligence Engineer", "Machine Learning Engineer",
            "AI Engineer", "Financial Analyst",
            "QA Engineer", "Automation Test Engineer", "Performance Test Engineer", "Security Test Engineer", "Test Lead / QA Lead",
            "IT Infrastructure Engineer", "IT Operations Engineer", "Linux / Unix Administrator", "Monitoring / SIEM Engineer",
            "Observability Engineer", "Release / Configuration Manager", "Network Engineer",
            "SAP Analyst", "ERP Consultant", "CRM Consultant", "ServiceNow Developer / Admin", "IT Asset / ITOM Engineer",
            "Workday Analyst", "Salesforce Developer",
            "Enterprise Architect", "Solutions Architect", "IT Manager", "CTO / CIO", "Product Manager", "Technical Product Manager",
            "Project Manager", "Program Manager",
            "Blockchain Engineer", "IoT Engineer", "Robotics Engineer", "AR / VR Engineer", "AML KYC", "Business Analyst"
        ];

        debounceTimer = setTimeout(() => {
            const lowerQuery = query.toLowerCase();

            // Filter supported roles
            const matches = SUPPORTED_ROLES.filter(role =>
                role.toLowerCase().includes(lowerQuery)
            );

            // Sort: exact startsWith matches first
            matches.sort((a, b) => {
                const aStarts = a.toLowerCase().startsWith(lowerQuery);
                const bStarts = b.toLowerCase().startsWith(lowerQuery);
                if (aStarts && !bStarts) return -1;
                if (!aStarts && bStarts) return 1;
                return 0;
            });

            const results = matches.slice(0, 10);
            suggestionsCache.set(query, results);
            renderSuggestions(results);
        }, 50); // Fast debounce for local search
    });

    function renderSuggestions(suggestions) {
        suggestionsBox.innerHTML = '';
        if (!suggestions || suggestions.length === 0) {
            suggestionsBox.classList.remove('visible');
            return;
        }

        suggestions.forEach(role => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = role;
            item.addEventListener('click', () => {
                roleInput.value = role;
                suggestionsBox.classList.remove('visible');
            });
            suggestionsBox.appendChild(item);
        });

        suggestionsBox.classList.add('visible');
    }

    // --- Custom Experience Dropdown Logic ---
    const customSelectWrapper = document.querySelector('.custom-select-wrapper');
    const customSelectTrigger = document.querySelector('.custom-select-trigger');
    const customOptions = document.querySelectorAll('.custom-option');
    const hiddenExperienceInput = document.getElementById('experience');
    const selectedValueSpan = customSelectTrigger.querySelector('.selected-value');

    // Toggle dropdown
    customSelectTrigger.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent closing immediately
        customSelectWrapper.classList.toggle('open');
    });

    // Handle option selection
    customOptions.forEach(option => {
        option.addEventListener('click', () => {
            const value = option.getAttribute('data-value');
            const text = option.textContent;

            // Update hidden input
            hiddenExperienceInput.value = value;

            // Update trigger text and style
            selectedValueSpan.textContent = text;
            customSelectTrigger.classList.add('has-value');

            // Handle visual selection state
            customOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');

            // Close dropdown
            customSelectWrapper.classList.remove('open');
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        // Close role suggestions
        if (!roleInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
            suggestionsBox.classList.remove('visible');
        }

        // Close experience dropdown
        if (!customSelectWrapper.contains(e.target)) {
            customSelectWrapper.classList.remove('open');
        }
    });
});
