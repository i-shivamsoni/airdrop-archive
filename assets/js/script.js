// Error handling for Ethereum provider injection
window.addEventListener('error', function(event) {
    // Check if the error is related to Ethereum provider injection
    if (event.message.includes('Cannot redefine property: ethereum') || 
        event.message.includes('Cannot set property ethereum')) {
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
        function: [],
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

    // Get function filters
    document.querySelectorAll('.function-item.active').forEach(item => {
        filters.function.push(item.querySelector('span').textContent);
    });

    // Get status filters
    filters.status = getStatusFilters();

    // Get ecosystem filters
    document.querySelectorAll('.ecosystem-item.active').forEach(item => {
        filters.ecosystem.push(item.querySelector('span').textContent);
    });

    // Get rewarded activity filters
    document.querySelectorAll('.distribution-filters input[type="checkbox"]:checked').forEach(checkbox => {
        const activity = checkbox.nextElementSibling.nextElementSibling.textContent;
        if (['Retroactive', 'Testnet', 'Holder', 'Free', 'Staking'].includes(activity)) {
            filters.rewardedActivity.push(activity);
        }
    });

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
    const card = document.createElement('div');
    card.className = 'project-card';
    
    card.innerHTML = `
        <div class="card-header">
            <h3>${project.title}</h3>
            <div class="status ${project.status[0].toLowerCase()}">${project.status[0]}</div>
        </div>
        <div class="card-body">
            <p>${project.description || 'No description available'}</p>
        </div>
        <div class="card-meta">
            <div class="date">${formatDate(project.date)}</div>
        </div>
        <div class="card-tags">
            ${project.function.map(f => `<span class="tag function">${f}</span>`).join('')}
            ${project.rewardedActivity.map(d => `<span class="tag distribution">${d}</span>`).join('')}
            ${project.blockchain_stack ? project.blockchain_stack.map(s => `<span class="tag blockchain-stack">${s}</span>`).join('') : ''}
            ${project.blockchain_type ? project.blockchain_type.map(t => `<span class="tag blockchain-type">${t}</span>`).join('') : ''}
        </div>
    `;
    
    return card;
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

        // Function filter
        if (filters.function && filters.function.length > 0) {
            if (!project.function || !Array.isArray(project.function) || project.function.length === 0) {
                return false;
            }
            if (!project.function.some(f => filters.function.includes(f))) {
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
            if (!project.ecosystem || !Array.isArray(project.ecosystem) || project.ecosystem.length === 0) {
                return false;
            }
            if (!project.ecosystem.some(e => filters.ecosystem.includes(e))) {
                return false;
            }
        }

        // Rewarded Activity filter
        if (filters.rewardedActivity && filters.rewardedActivity.length > 0) {
            if (!project.rewardedActivity || !Array.isArray(project.rewardedActivity) || project.rewardedActivity.length === 0) {
                return false;
            }
            if (!project.rewardedActivity.some(d => filters.rewardedActivity.includes(d))) {
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
    const stackBtns = document.querySelectorAll('.stack-btn');
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

    // Handle selection mode buttons
    stackBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const selection = btn.dataset.selection;
            stackBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Clear previous selections
            selectedLayers.clear();
            stackLayers.forEach(layer => layer.dataset.selected = 'false');

            // Apply new selection
            switch (selection) {
                case 'single':
                    // Don't select any layer by default
                    break;
                case 'double':
                    // Select Layer 1 and Layer 2
                    selectedLayers.add('layer-1');
                    selectedLayers.add('layer-2');
                    document.querySelector('[data-layer="layer-1"]').dataset.selected = 'true';
                    document.querySelector('[data-layer="layer-2"]').dataset.selected = 'true';
                    break;
                case 'all':
                    // Select all layers
                    stackLayers.forEach(layer => {
                        selectedLayers.add(layer.dataset.layer);
                        layer.dataset.selected = 'true';
                    });
                    break;
            }
            updateStackSelection();
        });
    });

    // Initialize with single layer selection but no default selection
    document.querySelector('[data-selection="single"]').click();
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
        .map(item => item.querySelector('span').textContent);
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
            item.querySelector('span').textContent === eco
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
    const requiredKeys = ['timeframe', 'function', 'status', 'ecosystem', 'rewardedActivity', 'blockchain_stack', 'blockchain_type'];
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
        function: getFunctionFilters(),
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
            
            console.log('Restoring function filters:', filterStates.function);
            restoreFunctionFilters(filterStates.function);
            
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
    statusCheckboxes.forEach(checkbox => {
        checkbox.checked = true;
    });
    
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
            handleFilterStateError();
        }
    } else {
        // Apply initial filters with all statuses checked
        const filters = getActiveFilters();
        const filteredProjects = filterProjects(projects, filters);
        currentFilteredProjects = filteredProjects;
        updateProjectCards(filteredProjects, 1);
        updateActiveFilters(filters);
    }

    // Timeline navigation
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach(item => {
        item.addEventListener('click', function() {
            timelineItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            updateFilters();
        });
    });

    // Function navigation
    const functionItems = document.querySelectorAll('.function-item');
    functionItems.forEach(item => {
        item.addEventListener('click', function() {
            functionItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            updateFilters();
        });
    });

    // Status toggle event listeners
    document.querySelectorAll('.status-toggles input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateFilters);
    });

    // Distribution checkbox event listeners
    document.querySelectorAll('.distribution-filters input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateFilters);
    });

    // Search functionality
    const searchInput = document.querySelector('.search-bar input');
    searchInput.addEventListener('input', updateFilters);

    // Clear all filters
    const clearAllBtn = document.querySelector('.clear-all');
    clearAllBtn.addEventListener('click', function() {
        // Reset all filter states
        const filters = {
            timeframe: [],
            function: [],
            status: [],
            ecosystem: [],
            rewardedActivity: [],
            blockchain_stack: [],
            blockchain_type: []
        };

        // Clear filter tags
        const filterTags = document.querySelector('.filter-tags');
        filterTags.innerHTML = '<button class="clear-all">Clear All</button>';

        // Reset all checkboxes in timeframe filter
        document.querySelectorAll('.filter-options input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Reset function items
        document.querySelectorAll('.function-item').forEach(item => {
            item.classList.remove('active');
        });

        // Reset ecosystem items
        document.querySelectorAll('.ecosystem-item').forEach(item => {
            item.classList.remove('active');
        });

        // Reset timeline items
        document.querySelectorAll('.timeline-item').forEach(item => {
            item.classList.remove('active');
        });

        // Reset status toggles
        document.querySelectorAll('.status-toggles input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Reset search input
        document.querySelector('.search-bar input').value = '';

        // Reset blockchain stack
        document.querySelectorAll('.stack-layer').forEach(layer => {
            layer.dataset.selected = 'false';
        });

        // Reset distribution checkboxes
        document.querySelectorAll('.distribution-filters input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Reset blockchain type checkboxes
        document.querySelectorAll('.type-filter input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Clear saved filter states
        localStorage.removeItem('filterStates');

        // Reset current filtered projects to all projects
        currentFilteredProjects = projects;

        // Force update the project cards with all projects
        updateProjectCards(projects, 1);

        // Update active filters with empty state
        updateActiveFilters(filters);

        // Show notification
        showNotification('All filters have been cleared');

        // Force a complete filter update
        const filteredProjects = filterProjects(projects, filters);
        currentFilteredProjects = filteredProjects;
        updateProjectCards(filteredProjects, 1);
    });

    // Ecosystem navigation
    const ecosystemItems = document.querySelectorAll('.ecosystem-item');
    ecosystemItems.forEach(item => {
        item.addEventListener('click', function() {
            ecosystemItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Filter tags
    const filterTags = document.querySelectorAll('.filter-tag button');
    filterTags.forEach(tag => {
        tag.addEventListener('click', function() {
            this.parentElement.remove();
        });
    });

    // Advanced filters toggle
    const collapsibleHeaders = document.querySelectorAll('.collapsible');
    collapsibleHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const toggleBtn = this.querySelector('.toggle-btn i');
            
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
                toggleBtn.classList.remove('fa-chevron-up');
                toggleBtn.classList.add('fa-chevron-down');
            } else {
                content.style.maxHeight = content.scrollHeight + 'px';
                toggleBtn.classList.remove('fa-chevron-down');
                toggleBtn.classList.add('fa-chevron-up');
            }
        });
    });

    // Theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        const icon = this.querySelector('i');
        if (icon.classList.contains('fa-moon')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    });

    // Stack layer selection
    const stackLayers = document.querySelectorAll('.layer-box');
    stackLayers.forEach(layer => {
        layer.addEventListener('click', function() {
            stackLayers.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Pagination
    const paginationBtns = document.querySelectorAll('.pagination button');
    paginationBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            paginationBtns.forEach(b => b.classList.remove('active'));
            if (!this.classList.contains('next')) {
                this.classList.add('active');
            }
        });
    });

    // Mobile Filter Toggle
    const mobileFilterToggle = document.querySelector('.mobile-filter-toggle');
    const leftSidebar = document.querySelector('.left-sidebar');
    const rightSidebar = document.querySelector('.right-sidebar');
    let activeSidebar = null;

    mobileFilterToggle.addEventListener('click', () => {
        if (activeSidebar) {
            activeSidebar.classList.remove('active');
            activeSidebar = null;
        } else {
            leftSidebar.classList.add('active');
            activeSidebar = leftSidebar;
        }
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (activeSidebar && !e.target.closest('.sidebar') && !e.target.closest('.mobile-filter-toggle')) {
            activeSidebar.classList.remove('active');
            activeSidebar = null;
        }
    });

    // Toggle between left and right sidebar on mobile
    document.querySelectorAll('.filter-section').forEach(section => {
        section.addEventListener('click', (e) => {
            if (window.innerWidth <= 992) {
                const sidebar = e.target.closest('.sidebar');
                if (sidebar && sidebar !== activeSidebar) {
                    if (activeSidebar) {
                        activeSidebar.classList.remove('active');
                    }
                    sidebar.classList.add('active');
                    activeSidebar = sidebar;
                }
            }
        });
    });
});

function updateActiveFilters(filters) {
    const activeFilters = document.querySelector('.active-filters');
    const filterTags = activeFilters.querySelector('.filter-tags');
    filterTags.innerHTML = '<button class="clear-all">Clear All</button>';

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

    // Add function filters
    if (filters.function && filters.function.length > 0) {
        filters.function.forEach(func => {
            const tag = document.createElement('div');
            tag.className = 'filter-tag';
            tag.innerHTML = `
                <span>Function: ${func}</span>
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
                case 'function':
                    const funcItem = Array.from(document.querySelectorAll('.function-item')).find(item => 
                        item.querySelector('span').textContent === filterValue
                    );
                    if (funcItem) funcItem.classList.remove('active');
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
