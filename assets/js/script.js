// Data handling for Jekyll
function getProjects() {
    // Jekyll will inject this data
    const allPosts = window.siteData.posts || [];
    console.log('All posts:', allPosts); // Debug log
    
    // Filter only projects and log the result
    const projects = allPosts.filter(post => {
        console.log('Post:', post); // Debug log for each post
        return post.pagetype === "project";
    });
    console.log('Filtered projects:', projects); // Debug log
    
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

// Store the current filtered projects globally
let currentFilteredProjects = [];

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
        distribution: []
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
    document.querySelectorAll('.status-toggles input[type="checkbox"]:checked').forEach(checkbox => {
        const status = checkbox.nextElementSibling.nextElementSibling.textContent.toLowerCase();
        filters.status.push(status);
    });

    // Get ecosystem filters
    document.querySelectorAll('.ecosystem-item.active').forEach(item => {
        filters.ecosystem.push(item.querySelector('span').textContent);
    });

    // Get distribution filters
    document.querySelectorAll('.filter-options input[type="checkbox"]:checked').forEach(checkbox => {
        const distribution = checkbox.nextElementSibling.nextElementSibling.textContent;
        if (['Retroactive', 'Testnet', 'Holder', 'Free', 'Staking'].includes(distribution)) {
            filters.distribution.push(distribution);
        }
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
            ${project.distribution.map(d => `<span class="tag distribution">${d}</span>`).join('')}
            ${project.blockchain_stack ? project.blockchain_stack.map(s => `<span class="tag blockchain-stack">${s}</span>`).join('') : ''}
            ${project.blockchain_type ? project.blockchain_type.map(t => `<span class="tag blockchain-type">${t}</span>`).join('') : ''}
        </div>
    `;
    
    return card;
}

function updateTimelineCounts(projects) {
    const yearCounts = {};
    projects.forEach(project => {
        const year = project.timeframe[0];
        yearCounts[year] = (yearCounts[year] || 0) + 1;
    });

    document.querySelectorAll('.timeline-item').forEach(item => {
        const year = item.dataset.year;
        const count = yearCounts[year] || 0;
        item.querySelector('.count').textContent = count;
    });
}

function updateFunctionCounts(projects) {
    const functionCounts = {};
    projects.forEach(project => {
        project.function.forEach(f => {
            functionCounts[f] = (functionCounts[f] || 0) + 1;
        });
    });

    document.querySelectorAll('.function-item').forEach(item => {
        const functionName = item.querySelector('span').textContent;
        const count = functionCounts[functionName] || 0;
        item.dataset.count = count;
    });
}

// Filter functions
function filterProjects(projects, filters) {
    return projects.filter(project => {
        // Timeframe filter
        if (filters.timeframe && filters.timeframe.length > 0) {
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
        return Object.entries(filters).every(([key, value]) => {
            if (!value) return true;
            if (Array.isArray(project[key])) {
                return project[key].some(v => value.includes(v));
            }
            return project[key] === value;
        });
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
                    // Select only Layer 2 by default
                    selectedLayers.add('layer-2');
                    document.querySelector('[data-layer="layer-2"]').dataset.selected = 'true';
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
        });
    });

    // Initialize with single layer selection
    document.querySelector('[data-selection="single"]').click();
}

// Helper function to save filter states to localStorage
function saveFilterStates() {
    const filterStates = {
        timeframe: Array.from(document.querySelectorAll('.filter-options input[type="checkbox"][data-year]:checked')).map(cb => cb.dataset.year),
        function: Array.from(document.querySelectorAll('.function-item.active')).map(item => item.querySelector('span').textContent),
        status: Array.from(document.querySelectorAll('.status-toggles input[type="checkbox"]:checked')).map(cb => cb.nextElementSibling.nextElementSibling.textContent.toLowerCase()),
        ecosystem: Array.from(document.querySelectorAll('.ecosystem-item.active')).map(item => item.querySelector('span').textContent),
        distribution: Array.from(document.querySelectorAll('.filter-section:has(h2:contains("Distribution")) input[type="checkbox"]:checked')).map(cb => cb.nextElementSibling.nextElementSibling.textContent),
        blockchain_stack: Array.from(document.querySelectorAll('.stack-layer[data-selected="true"]')).map(layer => layer.dataset.layer),
        blockchain_type: Array.from(document.querySelectorAll('.type-filter input[type="checkbox"]:checked')).map(cb => cb.nextElementSibling.nextElementSibling.textContent)
    };
    localStorage.setItem('filterStates', JSON.stringify(filterStates));
}

// Helper function to restore filter states from localStorage
function restoreFilterStates() {
    const savedStates = localStorage.getItem('filterStates');
    if (!savedStates) return;

    const filterStates = JSON.parse(savedStates);

    // Restore timeframe filters
    filterStates.timeframe.forEach(year => {
        const checkbox = document.querySelector(`.filter-options input[type="checkbox"][data-year="${year}"]`);
        if (checkbox) checkbox.checked = true;
    });

    // Restore function filters
    filterStates.function.forEach(func => {
        const item = Array.from(document.querySelectorAll('.function-item')).find(item => 
            item.querySelector('span').textContent === func
        );
        if (item) item.classList.add('active');
    });

    // Restore status filters
    filterStates.status.forEach(status => {
        const checkbox = Array.from(document.querySelectorAll('.status-toggles input[type="checkbox"]')).find(cb => 
            cb.nextElementSibling.nextElementSibling.textContent.toLowerCase() === status
        );
        if (checkbox) checkbox.checked = true;
    });

    // Restore ecosystem filters
    filterStates.ecosystem.forEach(eco => {
        const item = Array.from(document.querySelectorAll('.ecosystem-item')).find(item => 
            item.querySelector('span').textContent === eco
        );
        if (item) item.classList.add('active');
    });

    // Restore distribution filters
    filterStates.distribution.forEach(dist => {
        const checkbox = Array.from(document.querySelectorAll('.filter-section:has(h2:contains("Distribution")) input[type="checkbox"]')).find(cb => 
            cb.nextElementSibling.nextElementSibling.textContent === dist
        );
        if (checkbox) checkbox.checked = true;
    });

    // Restore blockchain stack filters
    filterStates.blockchain_stack.forEach(layer => {
        const layerElement = document.querySelector(`.stack-layer[data-layer="${layer}"]`);
        if (layerElement) layerElement.dataset.selected = 'true';
    });

    // Restore blockchain type filters
    filterStates.blockchain_type.forEach(type => {
        const checkbox = Array.from(document.querySelectorAll('.type-filter input[type="checkbox"]')).find(cb => 
            cb.nextElementSibling.nextElementSibling.textContent === type
        );
        if (checkbox) checkbox.checked = true;
    });
}

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
    if (filters.distribution && filters.distribution.length > 0) {
        filters.distribution.forEach(dist => {
            const tag = document.createElement('div');
            tag.className = 'filter-tag';
            tag.innerHTML = `
                <span>Distribution: ${dist}</span>
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
                case 'distribution':
                    const distCheckbox = Array.from(document.querySelectorAll('.filter-section:has(h2:contains("Distribution")) input[type="checkbox"]')).find(cb => 
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

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    const projects = getProjects();
    console.log('Initial projects:', projects); // Debug log
    
    // Initialize with all projects first
    currentFilteredProjects = projects;
    updateProjectCards(projects, 1);
    updateTimelineCounts(projects);
    updateFunctionCounts(projects);
    initBlockchainStack();
    
    // Then restore saved filter states if they exist
    const savedStates = localStorage.getItem('filterStates');
    if (savedStates) {
        restoreFilterStates();
        const filters = getActiveFilters();
        const filteredProjects = filterProjects(projects, filters);
        currentFilteredProjects = filteredProjects;
        updateProjectCards(filteredProjects, 1);
        updateActiveFilters(filters);
    }

    // Update all filter event listeners to use the new pagination and save states
    const updateFilters = () => {
        const filters = getActiveFilters();
        const filteredProjects = filterProjects(projects, filters);
        currentFilteredProjects = filteredProjects;
        updateProjectCards(filteredProjects, 1);
        updateActiveFilters(filters);
        saveFilterStates(); // Save filter states after each update
    };

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
    document.querySelectorAll('.filter-section:has(h2:contains("Distribution")) input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateFilters);
    });

    // Search functionality
    const searchInput = document.querySelector('.search-bar input');
    searchInput.addEventListener('input', updateFilters);

    // Clear all filters
    const clearAllBtn = document.querySelector('.clear-all');
    clearAllBtn.addEventListener('click', function() {
        // Clear filter tags
        document.querySelectorAll('.filter-tag').forEach(tag => {
            tag.remove();
        });

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
        document.querySelectorAll('.layer-box').forEach(box => {
            box.classList.remove('active');
        });

        // Reset distribution checkboxes
        document.querySelectorAll('.filter-section:has(h2:contains("Distribution")) input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Reset blockchain type checkboxes
        document.querySelectorAll('.type-filter input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Show all projects
        currentFilteredProjects = projects;
        updateProjectCards(projects, 1);

        // Update active filters section
        const activeFilters = document.querySelector('.active-filters');
        const filterTags = activeFilters.querySelector('.filter-tags');
        filterTags.innerHTML = '<button class="clear-all">Clear All</button>';

        // Clear saved filter states
        localStorage.removeItem('filterStates');
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
