// Initialize search index
let searchIndex;
let searchData;
let isInitialized = false;
let searchStartTime;
let currentView = 'grid';

// Load search data and initialize index
async function initializeSearch() {
    if (isInitialized) return;
    
    try {
        showLoading();
        console.log('Fetching search data...');
        const response = await fetch('/assets/search.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        
        // Clean the text before parsing
        const cleanedText = text
            .replace(/^\s*---[\s\S]*?---\s*/, '') // Remove front matter
            .replace(/\n\s*\n/g, '\n') // Remove multiple newlines
            .replace(/,\s*]/g, ']') // Remove trailing commas
            .replace(/,\s*}/g, '}') // Remove trailing commas in objects
            .trim();
            
        console.log('Cleaned search data:', cleanedText);
        
        try {
            searchData = JSON.parse(cleanedText);
            console.log('Successfully parsed search data:', searchData);
            
            // Validate the data structure
            if (!searchData.projects || !searchData.learn) {
                throw new Error('Invalid search data structure: missing projects or learn arrays');
            }
            
            if (!Array.isArray(searchData.projects) || !Array.isArray(searchData.learn)) {
                throw new Error('Invalid search data structure: projects and learn must be arrays');
            }
        } catch (parseError) {
            console.error('Error parsing search.json:', parseError);
            console.error('Invalid JSON content:', cleanedText);
            throw parseError;
        }
        
        // Create search index
        searchIndex = lunr(function() {
            // Configure fields with case-insensitive search
            this.field('title', { boost: 10 });
            this.field('description', { boost: 5 });
            this.field('content');
            this.field('tags', { boost: 3 });
            
            this.ref('url');
            
            // Add all documents to the index
            Object.keys(searchData).forEach(type => {
                if (Array.isArray(searchData[type])) {
                    searchData[type].forEach(doc => {
                        if (doc && doc.title && doc.url) {
                            // Pre-process the content to improve searchability
                            const processedDoc = {
                                ...doc,
                                type: type,
                                // Add lowercase versions of fields for better matching
                                title_lower: doc.title.toLowerCase(),
                                description_lower: doc.description ? doc.description.toLowerCase() : '',
                                content_lower: doc.content ? doc.content.toLowerCase() : '',
                                tags_lower: doc.tags ? doc.tags.map(tag => tag.toLowerCase()) : []
                            };
                            this.add(processedDoc);
                        }
                    });
                }
            });
        });
        
        isInitialized = true;
        console.log('Search index initialized successfully');
        
        // Update filter counts
        updateFilterCounts();
        
        // If there's a query in the URL, perform the search
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q');
        if (query) {
            performSearch(query);
        }
        
        hideLoading();
    } catch (error) {
        console.error('Error initializing search:', error);
        const container = document.getElementById('search-results-container');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <h3>Error initializing search</h3>
                    <p>Please try again later or contact support if the problem persists.</p>
                    <p class="error-details">${error.message}</p>
                </div>
            `;
        }
        hideLoading();
    }
}

// Update filter counts
function updateFilterCounts() {
    const projectsCount = document.getElementById('projects-count');
    const learnCount = document.getElementById('learn-count');
    
    if (projectsCount && searchData.projects) {
        projectsCount.textContent = searchData.projects.length;
    }
    
    if (learnCount && searchData.learn) {
        learnCount.textContent = searchData.learn.length;
    }
}

// Show loading state
function showLoading() {
    const loading = document.getElementById('search-loading');
    if (loading) {
        loading.classList.remove('hidden');
    }
}

// Hide loading state
function hideLoading() {
    const loading = document.getElementById('search-loading');
    if (loading) {
        loading.classList.add('hidden');
    }
}

// Perform search
async function performSearch(query) {
    if (!isInitialized) {
        console.log('Search index not initialized, initializing now...');
        await initializeSearch();
    }
    
    if (!searchIndex) {
        console.error('Search index not available');
        return;
    }
    
    showLoading();
    searchStartTime = performance.now();
    console.log('Performing search for:', query);
    
    const searchTypes = Array.from(document.querySelectorAll('input[name="search-type"]:checked'))
        .map(input => input.value);
    
    try {
        // Split query into words and search for each
        const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
        console.log('Search terms:', searchTerms);
        
        let results = [];
        searchTerms.forEach(term => {
            // Try different search strategies
            const searchStrategies = [
                term,                    // Exact match
                term + '*',             // Prefix match
                '*' + term + '*',       // Contains match
                term.toLowerCase(),     // Lowercase match
                term.toLowerCase() + '*' // Lowercase prefix match
            ];
            
            console.log(`Searching with strategies:`, searchStrategies);
            
            searchStrategies.forEach(strategy => {
                const termResults = searchIndex.search(strategy);
                console.log(`Results for strategy "${strategy}":`, termResults);
                results = results.concat(termResults);
            });
        });
        
        // Remove duplicates and sort by score
        results = results.filter((result, index, self) =>
            index === self.findIndex((r) => r.ref === result.ref)
        ).sort((a, b) => b.score - a.score);
        
        // Filter results by selected types
        let filteredResults = results.filter(result => 
            searchTypes.includes(result.ref.split('/')[1])
        );
        
        // Apply sorting
        const sortBy = document.getElementById('sort-by').value;
        if (sortBy !== 'relevance') {
            filteredResults = sortResults(filteredResults, sortBy);
        }
        
        console.log('Final filtered results:', filteredResults);
        displayResults(filteredResults);
        
        // Update search stats
        updateSearchStats(filteredResults.length);
    } catch (error) {
        console.error('Search error:', error);
        const container = document.getElementById('search-results-container');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <h3>Search Error</h3>
                    <p>An error occurred while performing the search.</p>
                    <p class="error-details">${error.message}</p>
                </div>
            `;
        }
    } finally {
        hideLoading();
    }
}

// Sort results
function sortResults(results, sortBy) {
    return results.sort((a, b) => {
        const docA = findDocument(a.ref);
        const docB = findDocument(b.ref);
        
        if (!docA || !docB) return 0;
        
        const dateA = new Date(docA.date);
        const dateB = new Date(docB.date);
        
        if (sortBy === 'date-desc') {
            return dateB - dateA;
        } else if (sortBy === 'date-asc') {
            return dateA - dateB;
        }
        
        return 0;
    });
}

// Update search stats
function updateSearchStats(resultCount) {
    const resultsCount = document.getElementById('results-count');
    const searchTime = document.getElementById('search-time');
    
    if (resultsCount) {
        resultsCount.textContent = resultCount;
    }
    
    if (searchTime && searchStartTime) {
        const time = ((performance.now() - searchStartTime) / 1000).toFixed(2);
        searchTime.textContent = `(${time}s)`;
    }
}

// Display search results
function displayResults(results) {
    const container = document.getElementById('search-results-container');
    const noResults = document.getElementById('no-results');
    
    if (results.length === 0) {
        container.innerHTML = '';
        noResults.classList.remove('hidden');
        return;
    }
    
    noResults.classList.add('hidden');
    
    // Update container class based on current view
    container.className = currentView === 'grid' ? 'results-grid' : 'results-list';
    
    const resultsHTML = results.map(result => {
        const doc = findDocument(result.ref);
        if (!doc) return '';
        // Use type to determine content type and icon
        const resultType = doc.type === 'project' ? 'Project' : 'Guide';
        const resultIcon = doc.type === 'project' ? 'fa-rocket' : 'fa-book';
        return `
            <div class="search-result" tabindex="0" role="button" data-url="${result.ref}">
                <div class="result-header">
                    <div class="result-type-icon">
                        <i class="fas ${resultIcon}"></i>
                    </div>
                    <div class="result-title">
                        <h3><a href="${result.ref}">${doc.title}</a></h3>
                        <div class="search-result-meta">
                            <span class="result-type">${resultType}</span>
                            <span class="result-date">${formatDate(doc.date)}</span>
                        </div>
                    </div>
                </div>
                <p class="search-result-excerpt">${doc.description || ''}</p>
                ${doc.tags ? `
                    <div class="search-result-tags">
                        ${doc.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    container.innerHTML = resultsHTML;

    // Make entire card clickable
    document.querySelectorAll('.search-result').forEach(card => {
        card.addEventListener('click', function(e) {
            // Prevent double navigation if clicking the title link
            if (e.target.tagName.toLowerCase() === 'a') return;
            const url = card.getAttribute('data-url');
            if (url) window.location.href = url;
        });
        card.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                const url = card.getAttribute('data-url');
                if (url) window.location.href = url;
            }
        });
        card.style.cursor = 'pointer';
    });
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Find document by URL
function findDocument(url) {
    for (const type in searchData) {
        const doc = searchData[type].find(d => d.url === url);
        if (doc) return doc;
    }
    return null;
}

// Handle search input
function handleSearch() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.trim();
    if (query) {
        window.location.href = `/search/?q=${encodeURIComponent(query)}`;
    }
}

// Toggle view mode
function toggleView(view) {
    currentView = view;
    const container = document.getElementById('search-results-container');
    const buttons = document.querySelectorAll('.view-button');
    
    // Update button states
    buttons.forEach(button => {
        button.classList.toggle('active', button.dataset.view === view);
    });
    
    // Update container class
    container.className = view === 'grid' ? 'results-grid' : 'results-list';
    
    // Re-display results if there are any
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    if (query) {
        performSearch(query);
    }
}

// Initialize search on search page
if (window.location.pathname === '/search/') {
    // Initialize search immediately
    initializeSearch();
    
    // Get search query from URL
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    
    if (query) {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = query;
        }
    }
    
    // Handle search bar on search page
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    
    if (searchButton) {
        searchButton.addEventListener('click', () => handleSearch());
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
    
    // Handle filter changes
    document.querySelectorAll('input[name="search-type"]').forEach(input => {
        input.addEventListener('change', () => {
            if (query) {
                performSearch(query);
            }
        });
    });
    
    // Handle sort changes
    const sortSelect = document.getElementById('sort-by');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            if (query) {
                performSearch(query);
            }
        });
    }
    
    // Handle view toggle
    document.querySelectorAll('.view-button').forEach(button => {
        button.addEventListener('click', () => {
            toggleView(button.dataset.view);
        });
    });
} 