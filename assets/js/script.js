// Error handling for Ethereum provider injection
window.addEventListener('error', function(event) {
    // Check if the error is related to Ethereum provider injection
    if (event && event.message && (
        event.message.includes('Cannot redefine property: ethereum') || 
        event.message.includes('Cannot set property ethereum')
    )) {
        // Prevent the error from being logged to console
        event.preventDefault();
        return true;
    }
}, true);

// Data handling for Jekyll
function getProjects() {
    // Jekyll will inject this data
    const allPosts = window.siteData.posts || [];
    
    // Filter only projects
    const projects = allPosts.filter(post => post.pagetype === "project");
    
    return projects;
}

function parseFrontMatter(content) {
    const frontMatterRegex = /^---\n([\s\S]*?)\n---/;
    const match = content.match(frontMatterRegex);
    if (!match) return null;

    const frontMatter = match[1];
    const metadata = {};
    
    frontMatter.split('\n').forEach(line => {
        const [key, ...values] = line.split(':');
        if (key && values.length) {
            const value = values.join(':').trim();
            try {
                metadata[key.trim()] = JSON.parse(value);
            } catch {
                metadata[key.trim()] = value.replace(/^["']|["']$/g, '');
            }
        }
    });

    return metadata;
}

// Global variables
let currentFilteredProjects = [];
let projects = [];

function updateProjectCards(projects, page = 1) {
    // Store the filtered projects globally
    currentFilteredProjects = projects;
    
    const grid = document.querySelector('.grid');
    const projectCount = document.querySelector('.project-count');
    const itemsPerPage = 12;
    
    // Ensure we have valid projects array
    if (!Array.isArray(projects)) {
        projects = [];
    }
    
    // Calculate total pages, ensuring at least 1 page
    const totalPages = Math.max(1, Math.ceil(projects.length / itemsPerPage));
    
    // Ensure page number is valid
    page = Math.min(Math.max(1, page), totalPages);
    
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, projects.length);
    const paginatedProjects = projects.slice(startIndex, endIndex);
    
    grid.innerHTML = '';
    
    if (projects.length === 0) {
        document.querySelector('.empty-state').style.display = 'block';
        projectCount.textContent = '(0)';
        return;
    }

    document.querySelector('.empty-state').style.display = 'none';
    projectCount.textContent = `(${projects.length})`;

    paginatedProjects.forEach(project => {
        const card = createProjectCard(project);
        grid.appendChild(card);
    });

    // Update pagination
    updatePagination(totalPages, page);
}

function updatePagination(totalPages, currentPage) {
    const pagination = document.querySelector('.pagination');
    pagination.innerHTML = '';

    // Don't show pagination if there's only one page
    if (totalPages <= 1) {
        return;
    }

    // Previous button
    const prevButton = document.createElement('button');
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            updateProjectCards(currentFilteredProjects, currentPage - 1);
        }
    });
    pagination.appendChild(prevButton);

    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
        const firstPage = document.createElement('button');
        firstPage.textContent = '1';
        firstPage.addEventListener('click', () => {
            updateProjectCards(currentFilteredProjects, 1);
        });
        pagination.appendChild(firstPage);

        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            pagination.appendChild(ellipsis);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        pageButton.addEventListener('click', () => {
            updateProjectCards(currentFilteredProjects, i);
        });
        pagination.appendChild(pageButton);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            pagination.appendChild(ellipsis);
        }
        const lastPage = document.createElement('button');
        lastPage.textContent = totalPages;
        lastPage.addEventListener('click', () => {
            updateProjectCards(currentFilteredProjects, totalPages);
        });
        pagination.appendChild(lastPage);
    }

    // Add page input field
    const pageInputContainer = document.createElement('div');
    pageInputContainer.className = 'page-input-container';
    
    const pageInput = document.createElement('input');
    pageInput.type = 'number';
    pageInput.min = '1';
    pageInput.max = totalPages;
    pageInput.value = currentPage;
    pageInput.className = 'page-input';
    pageInput.placeholder = 'Page';
    
    const goButton = document.createElement('button');
    goButton.textContent = 'Go';
    goButton.className = 'go-button';
    
    const handlePageJump = () => {
        const pageNum = parseInt(pageInput.value);
        if (pageNum >= 1 && pageNum <= totalPages) {
            updateProjectCards(currentFilteredProjects, pageNum);
        } else {
            pageInput.value = currentPage;
        }
    };
    
    pageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handlePageJump();
        }
    });
    
    goButton.addEventListener('click', handlePageJump);
    
    pageInputContainer.appendChild(pageInput);
    pageInputContainer.appendChild(goButton);
    pagination.appendChild(pageInputContainer);

    // Next button
    const nextButton = document.createElement('button');
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            updateProjectCards(currentFilteredProjects, currentPage + 1);
        }
    });
    pagination.appendChild(nextButton);
}

// Helper function to get currently filtered projects
function getFilteredProjects() {
    const projects = getProjects();
    const filters = getActiveFilters();
    return filterProjects(projects, filters);
}

// Helper function to get active filters
function getActiveFilters() {
    const filters = {
        timeframe: [],
        categories: [],
        status: [],
        ecosystem: [],
        rewardedActivity: [],
        blockchain_stack: [],
        blockchain_type: []
    };

    // Get timeframe filters
    document.querySelectorAll('.filter-options input[type="checkbox"]:checked').forEach(checkbox => {
        if (checkbox.dataset.year) {
            filters.timeframe.push(checkbox.dataset.year);
        }
    });

    // Get categories filters
    filters.categories = getCategoryFilters();

    // Get status filters
    filters.status = getStatusFilters();

    // Get ecosystem filters - exclude the "more" item
    document.querySelectorAll('.ecosystem-item.active:not(.more-item)').forEach(item => {
        const ecosystem = item.querySelector('span').textContent;
        if (ecosystem.toLowerCase() !== 'more') {
            filters.ecosystem.push(ecosystem);
        }
    });

    // Get rewarded activity filters
    filters.rewardedActivity = getRewardedActivityFilters();

    // Get blockchain stack filters
    document.querySelectorAll('.stack-layer[data-selected="true"]').forEach(layer => {
        filters.blockchain_stack.push(layer.dataset.layer);
    });

    // Get blockchain type filters
    document.querySelectorAll('.type-filter input[type="checkbox"]:checked').forEach(checkbox => {
        filters.blockchain_type.push(checkbox.nextElementSibling.nextElementSibling.textContent);
    });

    return filters;
}

function formatDate(dateString) {
    // Handle different date formats
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        // If date is invalid, return the original string
        return dateString;
    }
    // Format as YYYY-MM-DD
    return date.toISOString().split('T')[0];
}

function createProjectCard(project) {
    // Wrap the card in a clickable <a> tag using the post.url property
    const link = document.createElement('a');
    link.href = project.url;
    link.className = 'project-card-link';
    link.style.textDecoration = 'none';
    link.style.color = 'inherit';

    // Truncate description to 3 lines
    const description = project.description || 'No description available';
    const truncatedDescription = description.length > 150 ? description.substring(0, 150) + '...' : description;

    // Get ecosystem and function tags
    const ecosystemTags = project.ecosystem ? project.ecosystem
        .filter(e => e.toLowerCase() !== 'not-known')
        .slice(0, 1)
        .map(e => ({
            type: 'ecosystem',
            value: e
        })) : [];
    
    const functionTags = project.function ? project.function.slice(0, 2).map(f => ({
        type: 'function',
        value: f
    })) : [];

    // Combine tags and limit to fit in one line
    const allTags = [...ecosystemTags, ...functionTags];

    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
        <div class="card-header">
            <div class="header-left">
                <h3>${project.title}</h3>
                <div class="card-date">${formatHumanReadableDate(project.date)}</div>
            </div>
            <div class="status ${project.status[0].toLowerCase()}">${project.status[0]}</div>
        </div>
        <div class="card-body">
            <p>${truncatedDescription}</p>
        </div>
        <div class="card-tags">
            ${allTags.map(tag => `
                <span class="tag ${tag.type}">
                    ${tag.type === 'ecosystem' ? 
                        `<img src="${window.siteBaseUrl || ''}/assets/images/ecosystem_icons/${tag.value.toLowerCase()}.svg" alt="${tag.value}" onerror="this.src='${window.siteBaseUrl || ''}/assets/images/ecosystem_icons/not-known.svg'">` 
                        : ''}
                    ${tag.value}
                </span>
            `).join('')}
        </div>
    `;
    link.appendChild(card);
    return link;
}

// Add a new function to format dates in a human-readable way
function formatHumanReadableDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return dateString;
    }
    
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
}

function updateTimelineCounts(projects) {
    const yearCounts = {};
    
    // Initialize counts for all years
    const years = ['before2020', '2020', '2021', '2022', '2023', '2024', '2025'];
    years.forEach(year => {
        yearCounts[year] = 0;
    });

    // Count projects for each year
    projects.forEach(project => {
        if (project.date) {
            const projectYear = new Date(project.date).getFullYear();
            if (projectYear < 2020) {
                yearCounts['before2020']++;
            } else {
                const yearStr = projectYear.toString();
                if (yearCounts.hasOwnProperty(yearStr)) {
                    yearCounts[yearStr]++;
                }
            }
        }
    });

    // Update the counts in the UI
    document.querySelectorAll('.filter-options input[type="checkbox"][data-year]').forEach(checkbox => {
        const year = checkbox.dataset.year;
        const count = yearCounts[year] || 0;
        const countElement = checkbox.parentElement.querySelector('.count');
        if (countElement) {
            countElement.textContent = count;
        }
    });
}

function updateFunctionCounts(projects) {
    const functionCounts = {};
    projects.forEach(project => {
        if (project.function && Array.isArray(project.function)) {
            project.function.forEach(f => {
                functionCounts[f] = (functionCounts[f] || 0) + 1;
            });
        }
    });

    const functionItems = document.querySelectorAll('.function-item');
    if (functionItems.length > 0) {
        functionItems.forEach(item => {
            const span = item.querySelector('span');
            if (span) {
                const functionName = span.textContent;
                const count = functionCounts[functionName] || 0;
                item.dataset.count = count;
            }
        });
    }
}

// Filter functions
function filterProjects(projects, filters) {
    return projects.filter(project => {
        // Timeframe filter
        if (filters.timeframe && filters.timeframe.length > 0) {
            if (!project.timeframe || !Array.isArray(project.timeframe) || project.timeframe.length === 0) {
                return false;
            }
            const projectYear = new Date(project.date).getFullYear();
            const isBefore2020 = projectYear < 2020;
            const is2020 = projectYear === 2020;
            
            if (!filters.timeframe.some(year => {
                if (year === 'before2020') return isBefore2020;
                if (year === '2020') return is2020;
                return projectYear === parseInt(year);
            })) {
                return false;
            }
        }

        // Categories filter
        if (filters.categories && filters.categories.length > 0) {
            if (!project.category || !Array.isArray(project.category)) {
                return false;
            }
            
            const projectCategories = project.category.map(c => c.toLowerCase());
            const hasMatchingCategory = filters.categories.some(cat => 
                projectCategories.includes(cat.toLowerCase())
            );
            
            if (!hasMatchingCategory) {
                return false;
            }
        }

        // Status filter
        if (filters.status && filters.status.length > 0) {
            if (!project.status || !Array.isArray(project.status) || project.status.length === 0) {
                return false;
            }
            const hasMatchingStatus = project.status.some(s => {
                const projectStatusLower = s.toLowerCase();
                return filters.status.some(filterStatus => 
                    filterStatus.toLowerCase() === projectStatusLower
                );
            });
            if (!hasMatchingStatus) {
                return false;
            }
        }

        // Ecosystem filter
        if (filters.ecosystem && filters.ecosystem.length > 0) {
            // Filter out the "more" option from ecosystem filters
            const validEcosystemFilters = filters.ecosystem.filter(eco => eco.toLowerCase() !== 'more');
            
            // If no valid filters after removing "more", return true
            if (validEcosystemFilters.length === 0) {
                return true;
            }

            // If project has no ecosystem or is explicitly "not-known"
            if (!project.ecosystem || 
                !Array.isArray(project.ecosystem) || 
                project.ecosystem.length === 0 ||
                (project.ecosystem.length === 1 && project.ecosystem[0].toLowerCase() === 'not-known')) {
                // Check if "not-known" is in the selected filters
                const hasNotKnown = validEcosystemFilters.some(eco => 
                    eco.toLowerCase() === 'not-known' || eco.toLowerCase() === 'not known'
                );
                return hasNotKnown;
            }

            // For projects with actual ecosystem values
            const projectEcosystems = project.ecosystem.map(e => e.toLowerCase());
            return validEcosystemFilters.some(e => projectEcosystems.includes(e.toLowerCase()));
        }

        // Rewarded Activity filter
        if (filters.rewardedActivity && filters.rewardedActivity.length > 0) {
            if (!project.rewardedActivity || !Array.isArray(project.rewardedActivity) || project.rewardedActivity.length === 0) {
                return false;
            }
            const projectActivities = project.rewardedActivity.map(activity => activity.toLowerCase());
            if (!filters.rewardedActivity.some(activity => projectActivities.includes(activity.toLowerCase()))) {
                return false;
            }
        }

        // Blockchain stack filter
        if (filters.blockchain_stack && filters.blockchain_stack.length > 0) {
            if (!project.blockchain_stack || !Array.isArray(project.blockchain_stack) || project.blockchain_stack.length === 0) {
                return false;
            }
            if (!project.blockchain_stack.some(s => filters.blockchain_stack.includes(s))) {
                return false;
            }
        }

        // Blockchain type filter
        if (filters.blockchain_type && filters.blockchain_type.length > 0) {
            if (!project.blockchain_type || !Array.isArray(project.blockchain_type) || project.blockchain_type.length === 0) {
                return false;
            }
            if (!project.blockchain_type.some(t => filters.blockchain_type.includes(t))) {
                return false;
            }
        }

        return true;
    });
}

// Blockchain Stack Selection
function initBlockchainStack() {
    const stackLayers = document.querySelectorAll('.stack-layer');
    let selectedLayers = new Set();

    // Handle individual layer clicks
    stackLayers.forEach(layer => {
        const layerBox = layer.querySelector('.layer-box');
        layerBox.addEventListener('click', () => {
            const layerType = layer.dataset.layer;
            if (selectedLayers.has(layerType)) {
                selectedLayers.delete(layerType);
                layer.dataset.selected = 'false';
            } else {
                selectedLayers.add(layerType);
                layer.dataset.selected = 'true';
            }
            updateStackSelection();
        });
    });
}

// Helper functions for getting filter states
function getTimeframeFilters() {
    return Array.from(document.querySelectorAll('.filter-options input[type="checkbox"][data-year]:checked'))
        .map(cb => cb.dataset.year);
}

function getFunctionFilters() {
    return Array.from(document.querySelectorAll('.function-item.active'))
        .map(item => item.querySelector('span').textContent);
}

function getStatusFilters() {
    return Array.from(document.querySelectorAll('.status-toggles input[type="checkbox"]:checked'))
        .map(cb => cb.nextElementSibling.nextElementSibling.textContent.toLowerCase());
}

function getEcosystemFilters() {
    return Array.from(document.querySelectorAll('.ecosystem-item.active'))
        .map(item => item.dataset.ecosystem);
}

function getDistributionFilters() {
    return Array.from(document.querySelectorAll('.distribution-filters input[type="checkbox"]:checked'))
        .map(cb => cb.nextElementSibling.nextElementSibling.textContent);
}

function getBlockchainStackFilters() {
    return Array.from(document.querySelectorAll('.stack-layer[data-selected="true"]'))
        .map(layer => layer.dataset.layer);
}

function getBlockchainTypeFilters() {
    return Array.from(document.querySelectorAll('.type-filter input[type="checkbox"]:checked'))
        .map(cb => cb.nextElementSibling.nextElementSibling.textContent);
}

// Helper functions for restoring filter states
function restoreTimeframeFilters(timeframes) {
    timeframes.forEach(year => {
        const checkbox = document.querySelector(`.filter-options input[type="checkbox"][data-year="${year}"]`);
        if (checkbox) checkbox.checked = true;
    });
}

function restoreFunctionFilters(functions) {
    functions.forEach(func => {
        const item = Array.from(document.querySelectorAll('.function-item')).find(item => 
            item.querySelector('span').textContent === func
        );
        if (item) item.classList.add('active');
    });
}

function restoreStatusFilters(statuses) {
    const statusCheckboxes = document.querySelectorAll('.status-toggles input[type="checkbox"]');
    statusCheckboxes.forEach(checkbox => {
        const status = checkbox.nextElementSibling.nextElementSibling.textContent.toLowerCase();
        checkbox.checked = statuses.includes(status);
    });
}

function restoreEcosystemFilters(ecosystems) {
    ecosystems.forEach(eco => {
        const item = Array.from(document.querySelectorAll('.ecosystem-item')).find(item => 
            item.dataset.ecosystem === eco
        );
        if (item) item.classList.add('active');
    });
}

function restoreDistributionFilters(distributions) {
    distributions.forEach(dist => {
        const checkbox = Array.from(document.querySelectorAll('.distribution-filters input[type="checkbox"]')).find(cb => 
            cb.nextElementSibling.nextElementSibling.textContent === dist
        );
        if (checkbox) checkbox.checked = true;
    });
}

function restoreBlockchainStackFilters(stacks) {
    stacks.forEach(stack => {
        const layer = document.querySelector(`.stack-layer[data-layer="${stack}"]`);
        if (layer) layer.dataset.selected = 'true';
    });
}

function restoreBlockchainTypeFilters(types) {
    types.forEach(type => {
        const checkbox = Array.from(document.querySelectorAll('.type-filter input[type="checkbox"]')).find(cb => 
            cb.nextElementSibling.nextElementSibling.textContent === type
        );
        if (checkbox) checkbox.checked = true;
    });
}

// Validation function
function validateFilterState(state) {
    const requiredKeys = ['timeframe', 'categories', 'status', 'ecosystem', 'rewardedActivity', 'blockchain_stack', 'blockchain_type'];
    return requiredKeys.every(key => Array.isArray(state[key]));
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Improved save function
function saveFilterStates() {
    const filterStates = {
        timeframe: getTimeframeFilters(),
        categories: getFunctionFilters(),
        status: getStatusFilters(),
        ecosystem: getEcosystemFilters(),
        rewardedActivity: getDistributionFilters(),
        blockchain_stack: getBlockchainStackFilters(),
        blockchain_type: getBlockchainTypeFilters()
    };
    
    console.log('Saving filter states:', filterStates);
    
    try {
        if (validateFilterState(filterStates)) {
            localStorage.setItem('filterStates', JSON.stringify(filterStates));
            console.log('Filter states saved successfully');
        } else {
            console.warn('Invalid filter state detected, not saving');
        }
    } catch (error) {
        console.error('Error saving filter states:', error);
    }
}

// Improved restore function
function restoreFilterStates() {
    try {
        const savedStates = localStorage.getItem('filterStates');
        console.log('Retrieved saved states:', savedStates);
        
        if (!savedStates) {
            console.log('No saved states found');
            return;
        }

        const filterStates = JSON.parse(savedStates);
        console.log('Parsed filter states:', filterStates);
        
        if (validateFilterState(filterStates)) {
            console.log('Restoring timeframe filters:', filterStates.timeframe);
            restoreTimeframeFilters(filterStates.timeframe);
            
            console.log('Restoring function filters:', filterStates.categories);
            restoreFunctionFilters(filterStates.categories);
            
            console.log('Restoring status filters:', filterStates.status);
            restoreStatusFilters(filterStates.status);
            
            console.log('Restoring ecosystem filters:', filterStates.ecosystem);
            restoreEcosystemFilters(filterStates.ecosystem);
            
            console.log('Restoring distribution filters:', filterStates.rewardedActivity);
            restoreDistributionFilters(filterStates.rewardedActivity);
            
            console.log('Restoring blockchain stack filters:', filterStates.blockchain_stack);
            restoreBlockchainStackFilters(filterStates.blockchain_stack);
            
            console.log('Restoring blockchain type filters:', filterStates.blockchain_type);
            restoreBlockchainTypeFilters(filterStates.blockchain_type);
            
            console.log('All filters restored successfully');
        } else {
            console.warn('Invalid saved filter state detected, resetting filters');
            handleFilterStateError();
        }
    } catch (error) {
        console.error('Error restoring filter states:', error);
        handleFilterStateError();
    }
}

// Error handling function
function handleFilterStateError() {
    localStorage.removeItem('filterStates');
    resetAllFilters();
    showNotification('Filter states were reset due to an error');
}

// Notification function
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Create debounced save function
const debouncedSaveFilterStates = debounce(saveFilterStates, 300);
            
// Add filter change listeners
function addFilterChangeListeners() {
    console.log('Adding filter change listeners');
    
    // Timeframe filters
    document.querySelectorAll('.filter-options input[type="checkbox"][data-year]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            console.log('Timeframe filter changed:', checkbox.dataset.year, checkbox.checked);
            debouncedSaveFilterStates();
            updateFilters();
        });
    });

    // Function filters
    document.querySelectorAll('.function-item').forEach(item => {
        item.addEventListener('click', () => {
            console.log('Function filter clicked:', item.querySelector('span').textContent);
            debouncedSaveFilterStates();
            updateFilters();
        });
    });

    // Status filters
    document.querySelectorAll('.status-toggles input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            console.log('Status filter changed:', checkbox.nextElementSibling.nextElementSibling.textContent, checkbox.checked);
            debouncedSaveFilterStates();
            updateFilters();
        });
    });

    // Ecosystem filters
    document.querySelectorAll('.ecosystem-item').forEach(item => {
        item.addEventListener('click', () => {
            console.log('Ecosystem filter clicked:', item.querySelector('span').textContent);
            debouncedSaveFilterStates();
            updateFilters();
        });
    });

    // Distribution filters
    document.querySelectorAll('.distribution-filters input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            console.log('Distribution filter changed:', checkbox.nextElementSibling.nextElementSibling.textContent, checkbox.checked);
            debouncedSaveFilterStates();
            updateFilters();
        });
    });

    // Blockchain stack filters
    document.querySelectorAll('.stack-layer').forEach(layer => {
        layer.addEventListener('click', () => {
            console.log('Blockchain stack filter clicked:', layer.dataset.layer);
            debouncedSaveFilterStates();
            updateStackSelection();
        });
    });

    // Blockchain type filters
    document.querySelectorAll('.type-filter input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            console.log('Blockchain type filter changed:', checkbox.nextElementSibling.nextElementSibling.textContent, checkbox.checked);
            debouncedSaveFilterStates();
            updateFilters();
        });
    });
}

// Update all filter event listeners to use the new pagination and save states
function updateFilters() {
    const filters = getActiveFilters();
    const filteredProjects = filterProjects(projects, filters);
    currentFilteredProjects = filteredProjects;
    updateProjectCards(filteredProjects, 1);
    updateActiveFilters(filters);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing...');
    
    try {
        projects = getProjects();
        console.log('Initial projects:', projects);
        
        // Initialize with all projects first
        currentFilteredProjects = projects;
        updateProjectCards(projects, 1);
        updateTimelineCounts(projects);
        updateFunctionCounts(projects);
        initBlockchainStack();
        
        // Add filter change listeners
        addFilterChangeListeners();
        
        // Initialize status filters
        const statusCheckboxes = document.querySelectorAll('.status-toggles input[type="checkbox"]');
        if (statusCheckboxes.length > 0) {
            statusCheckboxes.forEach(checkbox => {
                checkbox.checked = true;
            });
        }

        // Initialize category groups
        console.log('Initializing category groups...');
        initCategoryGroups();
        
        // Initialize rewarded activity groups
        console.log('Initializing rewarded activity groups...');
        initRewardedActivityGroups();
        
        // Add rewarded activity change listeners
        addRewardedActivityChangeListeners();

        // Restore saved filter states if they exist
        const savedStates = localStorage.getItem('filterStates');
        if (savedStates) {
            try {
                const filterStates = JSON.parse(savedStates);
                if (validateFilterState(filterStates)) {
                    restoreFilterStates();
                    const filters = getActiveFilters();
                    const filteredProjects = filterProjects(projects, filters);
                    currentFilteredProjects = filteredProjects;
                    updateProjectCards(filteredProjects, 1);
                    updateActiveFilters(filters);
                } else {
                    handleFilterStateError();
                }
            } catch (error) {
                console.error('Error restoring filter states:', error);
                handleFilterStateError();
            }
        }

        // Initialize other UI elements only if they exist
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const nav = document.querySelector('nav');
        if (mobileMenuToggle && nav) {
            mobileMenuToggle.addEventListener('click', () => {
                nav.classList.toggle('active');
                mobileMenuToggle.classList.toggle('active');
            });
        }

        const backToTopBtn = document.getElementById('back-to-top');
        if (backToTopBtn) {
            window.addEventListener('scroll', () => {
                if (window.pageYOffset > 300) {
                    backToTopBtn.classList.add('visible');
                } else {
                    backToTopBtn.classList.remove('visible');
                }
            });

            backToTopBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }

        const contactForm = document.querySelector('.contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                // ... rest of the form handling code ...
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

        // Initialize ecosystem filters
        console.log('Initializing ecosystem filters...');
        initEcosystemFilters();

    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

function updateActiveFilters(filters) {
    const activeFilters = document.querySelector('.active-filters');
    const filterTags = activeFilters.querySelector('.filter-tags');
    filterTags.innerHTML = '<button class="clear-all">Clear All</button>';

    // Add clear all functionality
    const clearAllButton = filterTags.querySelector('.clear-all');
    clearAllButton.addEventListener('click', () => {
        // Clear timeframe filters
        document.querySelectorAll('.filter-options input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Clear category filters
        document.querySelectorAll('.category-item input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Clear status filters
        document.querySelectorAll('.status-toggles input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Clear ecosystem filters
        document.querySelectorAll('.ecosystem-item').forEach(item => {
            item.classList.remove('active');
        });

        // Clear rewarded activity filters
        document.querySelectorAll('.activity-item input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Clear blockchain stack filters
        document.querySelectorAll('.stack-layer').forEach(layer => {
            layer.dataset.selected = 'false';
        });

        // Clear blockchain type filters
        document.querySelectorAll('.type-filter input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Reset all status checkboxes to checked
        document.querySelectorAll('.status-toggles input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = true;
        });

        // Clear saved filter states
        localStorage.removeItem('filterStates');

        // Update the UI
        const emptyFilters = {
            timeframe: [],
            categories: [],
            status: [],
            ecosystem: [],
            rewardedActivity: [],
            blockchain_stack: [],
            blockchain_type: []
        };
        updateFilters();
        updateActiveFilters(emptyFilters);
    });

    // Add timeframe filters
    if (filters.timeframe && filters.timeframe.length > 0) {
        filters.timeframe.forEach(year => {
            const tag = document.createElement('div');
            tag.className = 'filter-tag';
            tag.innerHTML = `
                <span>Timeframe: ${year === 'before2020' ? 'Before 2020' : year}</span>
                <button><i class="fas fa-times"></i></button>
            `;
            filterTags.appendChild(tag);
        });
    }

    // Add categories filters
    if (filters.categories && filters.categories.length > 0) {
        filters.categories.forEach(cat => {
            const tag = document.createElement('div');
            tag.className = 'filter-tag';
            tag.innerHTML = `
                <span>Categories: ${cat}</span>
                <button><i class="fas fa-times"></i></button>
            `;
            filterTags.appendChild(tag);
        });
    }

    // Add status filters
    if (filters.status && filters.status.length > 0) {
        filters.status.forEach(status => {
            const tag = document.createElement('div');
            tag.className = 'filter-tag';
            tag.innerHTML = `
                <span>Status: ${status.charAt(0).toUpperCase() + status.slice(1)}</span>
                <button><i class="fas fa-times"></i></button>
            `;
            filterTags.appendChild(tag);
        });
    }

    // Add ecosystem filters
    if (filters.ecosystem && filters.ecosystem.length > 0) {
        filters.ecosystem.forEach(eco => {
            const tag = document.createElement('div');
            tag.className = 'filter-tag';
            tag.innerHTML = `
                <span>Ecosystem: ${eco}</span>
                <button><i class="fas fa-times"></i></button>
            `;
            filterTags.appendChild(tag);
        });
    }

    // Add distribution filters
    if (filters.rewardedActivity && filters.rewardedActivity.length > 0) {
        filters.rewardedActivity.forEach(dist => {
            const tag = document.createElement('div');
            tag.className = 'filter-tag';
            tag.innerHTML = `
                <span>Rewarded Activity: ${dist}</span>
                <button><i class="fas fa-times"></i></button>
            `;
            filterTags.appendChild(tag);
        });
    }

    // Add blockchain stack filters
    if (filters.blockchain_stack && filters.blockchain_stack.length > 0) {
        filters.blockchain_stack.forEach(stack => {
            const tag = document.createElement('div');
            tag.className = 'filter-tag';
            tag.innerHTML = `
                <span>Stack: ${stack}</span>
                <button><i class="fas fa-times"></i></button>
            `;
            filterTags.appendChild(tag);
        });
    }

    // Add blockchain type filters
    if (filters.blockchain_type && filters.blockchain_type.length > 0) {
        filters.blockchain_type.forEach(type => {
            const tag = document.createElement('div');
            tag.className = 'filter-tag';
            tag.innerHTML = `
                <span>Type: ${type}</span>
                <button><i class="fas fa-times"></i></button>
            `;
            filterTags.appendChild(tag);
        });
    }

    // Add event listeners to remove buttons
    filterTags.querySelectorAll('.filter-tag button').forEach(button => {
        button.addEventListener('click', function() {
            const tag = this.parentElement;
            const filterType = tag.querySelector('span').textContent.split(':')[0].trim().toLowerCase();
            const filterValue = tag.querySelector('span').textContent.split(':')[1].trim();
            
            // Remove the filter
            switch(filterType) {
                case 'timeframe':
                    const yearCheckbox = document.querySelector(`.filter-options input[type="checkbox"][data-year="${filterValue === 'Before 2020' ? 'before2020' : filterValue}"]`);
                    if (yearCheckbox) yearCheckbox.checked = false;
                    break;
                case 'categories':
                    const catItem = Array.from(document.querySelectorAll('.function-item')).find(item => 
                        item.querySelector('span').textContent === filterValue
                    );
                    if (catItem) catItem.classList.remove('active');
                    break;
                case 'status':
                    const statusCheckbox = Array.from(document.querySelectorAll('.status-toggles input[type="checkbox"]')).find(cb => 
                        cb.nextElementSibling.nextElementSibling.textContent.toLowerCase() === filterValue.toLowerCase()
                    );
                    if (statusCheckbox) statusCheckbox.checked = false;
                    break;
                case 'ecosystem':
                    const ecoItem = Array.from(document.querySelectorAll('.ecosystem-item')).find(item => 
                        item.querySelector('span').textContent === filterValue
                    );
                    if (ecoItem) ecoItem.classList.remove('active');
                    break;
                case 'rewarded activity':
                    const distCheckbox = Array.from(document.querySelectorAll('.distribution-filters input[type="checkbox"]')).find(cb => 
                        cb.nextElementSibling.nextElementSibling.textContent === filterValue
                    );
                    if (distCheckbox) distCheckbox.checked = false;
                    break;
                case 'stack':
                    const stackLayer = document.querySelector(`.stack-layer[data-layer="${filterValue}"]`);
                    if (stackLayer) stackLayer.dataset.selected = 'false';
                    break;
                case 'type':
                    const typeCheckbox = Array.from(document.querySelectorAll('.type-filter input[type="checkbox"]')).find(cb => 
                        cb.nextElementSibling.nextElementSibling.textContent === filterValue
                    );
                    if (typeCheckbox) typeCheckbox.checked = false;
                    break;
            }
            
            tag.remove();
            updateFilters();
        });
    });
}

// Add the updateStackSelection function
function updateStackSelection() {
    const selectedLayers = Array.from(document.querySelectorAll('.stack-layer[data-selected="true"]'))
        .map(layer => layer.dataset.layer);
    
    const filters = getActiveFilters();
    filters.blockchain_stack = selectedLayers;
    
    const filteredProjects = filterProjects(getProjects(), filters);
    currentFilteredProjects = filteredProjects;
    updateProjectCards(filteredProjects, 1);
    updateActiveFilters(filters);
}

// Get categories filters
function getCategoryFilters() {
    const categoryFilters = [];
    document.querySelectorAll('.category-item input[type="checkbox"]:checked').forEach(checkbox => {
        categoryFilters.push(checkbox.dataset.category);
    });
    console.log('Active category filters:', categoryFilters);
    return categoryFilters;
}

// Add category checkbox event listeners
function addCategoryChangeListeners() {
    document.querySelectorAll('.category-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            console.log('Category filter changed:', checkbox.dataset.category, checkbox.checked);
            debouncedSaveFilterStates();
            updateFilters();
        });
    });
}

// Get rewarded activity filters
function getRewardedActivityFilters() {
    return Array.from(document.querySelectorAll('.activity-item input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.dataset.activity);
}

// Add rewarded activity change listeners
function addRewardedActivityChangeListeners() {
    document.querySelectorAll('.activity-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            console.log('Rewarded activity filter changed:', checkbox.dataset.activity, checkbox.checked);
            debouncedSaveFilterStates();
            updateFilters();
        });
    });
}

// Initialize rewarded activity groups
function initRewardedActivityGroups() {
    console.log('Starting rewarded activity groups initialization');
    
    // Define the activity groups and their options
    const activityGroups = {
        'on-chain-participation': ['retroactive', 'holder', 'nft', 'staking', 'fork', 'node'],
        'test-and-build-participation': ['testnet', 'form', 'dev-work'],
        'community-and-loyalty': ['loyalty', 'free', 'discord-role', 'quest'],
        'influence-and-content': ['content', 'kaito-yapping'],
        'alpha-community-participation': ['binance-alpha', 'mexc-alpha', 'bybit-alpha', 'okx-alpha']
    };

    // Add CSS styles
    const style = document.createElement('style');
    style.textContent = `
        .activity-groups {
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 5px;
        }
        .activity-group {
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
            transition: all 0.3s ease;
        }
        .activity-group:hover {
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
            transform: translateY(-1px);
        }
        .activity-header {
            width: 100%;
            padding: 14px 18px;
            background: linear-gradient(to right, #f8f9fa, #ffffff);
            border: none;
            text-align: left;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 600;
            color: #2c3e50;
            transition: all 0.2s ease;
            position: relative;
            overflow: hidden;
        }
        .activity-header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(to right, #3498db, #2980b9);
            transform: scaleX(0);
            transition: transform 0.3s ease;
        }
        .activity-header:hover {
            background: linear-gradient(to right, #f1f3f5, #ffffff);
        }
        .activity-header:hover::after {
            transform: scaleX(1);
        }
        .activity-header.active {
            background: linear-gradient(to right, #e9ecef, #ffffff);
        }
        .activity-header.active::after {
            transform: scaleX(1);
        }
        .activity-header i {
            transition: transform 0.3s ease;
            color: #3498db;
        }
        .activity-header.active i {
            transform: rotate(180deg);
        }
        .activity-items {
            padding: 0;
            max-height: 0;
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background: white;
            opacity: 0;
        }
        .activity-items.active {
            padding: 12px 18px;
            max-height: 500px;
            opacity: 1;
        }
        .activity-item {
            display: flex;
            align-items: center;
            padding: 10px 0;
            cursor: pointer;
            transition: all 0.2s ease;
            border-radius: 6px;
            margin: 2px 0;
        }
        .activity-item:hover {
            background: rgba(52, 152, 219, 0.05);
        }
        .activity-item input[type="checkbox"] {
            margin-right: 12px;
            opacity: 0;
            position: absolute;
        }
        .activity-item span:not(.checkmark) {
            font-size: 14px;
            color: #34495e;
            transition: color 0.2s ease;
        }
        .activity-item:hover span:not(.checkmark) {
            color: #3498db;
        }
        .checkmark {
            position: relative;
            display: inline-block;
            width: 20px;
            height: 20px;
            margin-right: 10px;
            border: 2px solid #bdc3c7;
            border-radius: 4px;
            transition: all 0.2s ease;
        }
        .activity-item:hover .checkmark {
            border-color: #3498db;
        }
        .activity-item input[type="checkbox"]:checked + .checkmark {
            background: #3498db;
            border-color: #3498db;
        }
        .activity-item input[type="checkbox"]:checked + .checkmark:after {
            content: '';
            position: absolute;
            left: 6px;
            top: 2px;
            width: 5px;
            height: 10px;
            border: solid white;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
            animation: checkmark 0.2s ease-in-out;
        }
        @keyframes checkmark {
            0% {
                opacity: 0;
                transform: rotate(45deg) scale(0.8);
            }
            100% {
                opacity: 1;
                transform: rotate(45deg) scale(1);
            }
        }
        .activity-item input[type="checkbox"]:checked ~ span:not(.checkmark) {
            color: #3498db;
            font-weight: 500;
        }
    `;
    document.head.appendChild(style);

    // Process each activity group
    Object.entries(activityGroups).forEach(([group, options]) => {
        const header = document.querySelector(`.activity-header[data-group="${group}"]`);
        const itemsContainer = document.getElementById(`${group}-items`);
        
        if (!header || !itemsContainer) {
            console.error(`Missing elements for group: ${group}`);
            return;
        }

        // Clear existing items
        itemsContainer.innerHTML = '';

        // Create activity items
        options.forEach(option => {
            const item = document.createElement('label');
            item.className = 'activity-item';
            item.innerHTML = `
                <input type="checkbox" data-activity="${option}">
                <span class="checkmark"></span>
                <span>${option.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
            `;
            itemsContainer.appendChild(item);
        });

        // Add click handler to header
        header.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Toggle current group
            this.classList.toggle('active');
            itemsContainer.classList.toggle('active');
            
            // Update icon
            const icon = this.querySelector('i');
            if (this.classList.contains('active')) {
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            } else {
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            }
        });
    });
}

function initCategoryGroups() {
    console.log('Starting category groups initialization');
    
    // Define the category groups and their options
    const categoryGroups = {
        'core': ['defi', 'nft', 'gaming', 'social'],
        'infrastructure': ['scaling', 'infrastructure', 'utilities'],
        'technology': ['ai', 'privacy', 'data'],
        'assets': ['stablecoin', 'rwa', 'meme', 'other']
    };

    // Add CSS styles
    const style = document.createElement('style');
    style.textContent = `
        .categories-container {
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 5px;
        }
        .category-group {
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
            transition: all 0.3s ease;
        }
        .category-group:hover {
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
            transform: translateY(-1px);
        }
        .category-header {
            width: 100%;
            padding: 14px 18px;
            background: linear-gradient(to right, #f8f9fa, #ffffff);
            border: none;
            text-align: left;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 600;
            color: #2c3e50;
            transition: all 0.2s ease;
            position: relative;
            overflow: hidden;
        }
        .category-header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(to right, #3498db, #2980b9);
            transform: scaleX(0);
            transition: transform 0.3s ease;
        }
        .category-header:hover {
            background: linear-gradient(to right, #f1f3f5, #ffffff);
        }
        .category-header:hover::after {
            transform: scaleX(1);
        }
        .category-header.active {
            background: linear-gradient(to right, #e9ecef, #ffffff);
        }
        .category-header.active::after {
            transform: scaleX(1);
        }
        .category-header i {
            transition: transform 0.3s ease;
            color: #3498db;
        }
        .category-header.active i {
            transform: rotate(180deg);
        }
        .category-items {
            padding: 0;
            max-height: 0;
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background: white;
            opacity: 0;
        }
        .category-items.active {
            padding: 12px 18px;
            max-height: 500px;
            opacity: 1;
        }
        .category-item {
            display: flex;
            align-items: center;
            padding: 10px 0;
            cursor: pointer;
            transition: all 0.2s ease;
            border-radius: 6px;
            margin: 2px 0;
        }
        .category-item:hover {
            background: rgba(52, 152, 219, 0.05);
        }
        .category-item input[type="checkbox"] {
            margin-right: 12px;
            opacity: 0;
            position: absolute;
        }
        .category-item span:not(.checkmark) {
            font-size: 14px;
            color: #34495e;
            transition: color 0.2s ease;
        }
        .category-item:hover span:not(.checkmark) {
            color: #3498db;
        }
        .checkmark {
            position: relative;
            display: inline-block;
            width: 20px;
            height: 20px;
            margin-right: 10px;
            border: 2px solid #bdc3c7;
            border-radius: 4px;
            transition: all 0.2s ease;
        }
        .category-item:hover .checkmark {
            border-color: #3498db;
        }
        .category-item input[type="checkbox"]:checked + .checkmark {
            background: #3498db;
            border-color: #3498db;
        }
        .category-item input[type="checkbox"]:checked + .checkmark:after {
            content: '';
            position: absolute;
            left: 6px;
            top: 2px;
            width: 5px;
            height: 10px;
            border: solid white;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
            animation: checkmark 0.2s ease-in-out;
        }
        @keyframes checkmark {
            0% {
                opacity: 0;
                transform: rotate(45deg) scale(0.8);
            }
            100% {
                opacity: 1;
                transform: rotate(45deg) scale(1);
            }
        }
        .category-item input[type="checkbox"]:checked ~ span:not(.checkmark) {
            color: #3498db;
            font-weight: 500;
        }
    `;
    document.head.appendChild(style);

    // Process each category group
    Object.entries(categoryGroups).forEach(([group, options]) => {
        const header = document.querySelector(`.category-header[data-group="${group}"]`);
        const itemsContainer = document.getElementById(`${group}-items`);
        
        if (!header || !itemsContainer) {
            console.error(`Missing elements for group: ${group}`);
            return;
        }

        // Clear existing items
        itemsContainer.innerHTML = '';

        // Create category items
        options.forEach(option => {
            const item = document.createElement('label');
            item.className = 'category-item';
            item.innerHTML = `
                <input type="checkbox" data-category="${option}">
                <span class="checkmark"></span>
                <span>${option.charAt(0).toUpperCase() + option.slice(1)}</span>
            `;
            itemsContainer.appendChild(item);

            // Add change event listener to the checkbox
            const checkbox = item.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', function() {
                console.log('Category filter changed:', this.dataset.category, this.checked);
                debouncedSaveFilterStates();
                updateFilters();
            });
        });

        // Add click handler to header
        header.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Toggle current group
            this.classList.toggle('active');
            itemsContainer.classList.toggle('active');
            
            // Update icon
            const icon = this.querySelector('i');
            if (this.classList.contains('active')) {
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            } else {
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            }
        });
    });

    // Add category change listeners
    addCategoryChangeListeners();
}

function initEcosystemFilters() {
    console.log('Initializing ecosystem filters');
    
    // Define main and more ecosystems with their icon mappings
    const mainEcosystems = [
        { id: 'ethereum', icon: 'ethereum.svg' },
        { id: 'solana', icon: 'solana.svg' },
        { id: 'optimism', icon: 'optimism.svg' },
        { id: 'cosmos', icon: 'cosmos.svg' },
        { id: 'sui', icon: 'sui.svg' },
        { id: 'hyperEVM', icon: 'hyperevm.svg' },
        { id: 'ton', icon: 'ton.svg' },
        { id: 'base', icon: 'base.svg' }
    ];

    const moreEcosystems = [
        { id: 'osmosis', icon: 'osmosis.svg' },
        { id: 'aptos', icon: 'aptos.svg' },
        { id: 'zksync', icon: 'zksync.svg' },
        { id: 'kava', icon: 'kava.svg' },
        { id: 'stellar', icon: 'stellar.svg' },
        { id: 'berachain', icon: 'berachain.svg' },
        { id: 'bnb', icon: 'bnb.svg' },
        { id: 'not-known', icon: 'not-known.svg' }
    ];

    // Get the ecosystem container
    const ecosystemContainer = document.querySelector('.ecosystem-grid');
    if (!ecosystemContainer) {
        console.error('Ecosystem container not found');
        return;
    }

    // Clear existing content
    ecosystemContainer.innerHTML = '';

    // Create main ecosystem items
    mainEcosystems.forEach(eco => {
        const item = createEcosystemItem(eco.id, eco.icon);
        ecosystemContainer.appendChild(item);
    });

    // Create more section
    const moreItem = document.createElement('div');
    moreItem.className = 'ecosystem-item more-item';
    const baseUrl = window.siteBaseUrl || '';
    moreItem.innerHTML = `
        <img src="${baseUrl}/assets/images/ecosystem_icons/more.svg" alt="More">
        <span>More</span>
    `;
    ecosystemContainer.appendChild(moreItem);

    // Create more content container (initially hidden)
    const moreContent = document.createElement('div');
    moreContent.className = 'more-ecosystems';
    moreContent.style.display = 'none';
    moreEcosystems.forEach(eco => {
        const item = createEcosystemItem(eco.id, eco.icon);
        moreContent.appendChild(item);
    });
    ecosystemContainer.parentElement.appendChild(moreContent);

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .ecosystem-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: var(--spacing-sm);
            margin: 0;
        }
        .ecosystem-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: var(--spacing-sm);
            border-radius: var(--radius-md);
            cursor: pointer;
            transition: all var(--transition-fast);
            width: 100%;
        }
        .ecosystem-item:hover {
            background: var(--light-dark);
        }
        .ecosystem-item.active {
            background: var(--light-dark);
        }
        .ecosystem-item img {
            width: 28px;
            height: 28px;
            margin-bottom: var(--spacing-xs);
        }
        .ecosystem-item span {
            font-size: 0.75rem;
            text-align: center;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
        }
        .more-ecosystems {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: var(--spacing-sm);
            margin-top: var(--spacing-sm);
            padding-top: var(--spacing-sm);
            border-top: 1px solid var(--light-dark);
        }
    `;
    document.head.appendChild(style);

    // Add click handler for more section
    moreItem.addEventListener('click', function() {
        const isVisible = moreContent.style.display !== 'none';
        moreContent.style.display = isVisible ? 'none' : 'grid';
        this.classList.toggle('active');
    });
}

function createEcosystemItem(ecosystem, iconName) {
    const item = document.createElement('div');
    item.className = 'ecosystem-item';
    item.dataset.ecosystem = ecosystem;
    
    const baseUrl = window.siteBaseUrl || '';
    const iconPath = `${baseUrl}/assets/images/ecosystem_icons/${iconName}`;
    const displayName = ecosystem === 'not-known' 
        ? 'Not Known'
        : ecosystem
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    
    item.innerHTML = `
        <img src="${iconPath}" alt="${displayName}" onerror="this.src='${baseUrl}/assets/images/ecosystem_icons/not-known.svg'">
        <span>${displayName}</span>
    `;
    
    // Only add click handler if it's not the "more" item
    if (ecosystem !== 'more') {
        item.addEventListener('click', function() {
            this.classList.toggle('active');
            debouncedSaveFilterStates();
            updateFilters();
        });
    }
    
    return item;
}
