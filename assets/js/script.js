// Data handling for Jekyll
function getProjects() {
    // Jekyll will inject this data
    return window.siteData.posts || [];
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

function updateProjectCards(projects) {
    const grid = document.querySelector('.grid');
    const projectCount = document.querySelector('.project-count');
    grid.innerHTML = '';
    
    if (projects.length === 0) {
        document.querySelector('.empty-state').style.display = 'block';
        projectCount.textContent = '(0)';
        return;
    }

    document.querySelector('.empty-state').style.display = 'none';
    projectCount.textContent = `(${projects.length})`;

    projects.forEach(project => {
        const card = createProjectCard(project);
        grid.appendChild(card);
    });
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
            <div class="date">${project.date}</div>
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

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    const projects = getProjects();
    updateProjectCards(projects);
    updateTimelineCounts(projects);
    updateFunctionCounts(projects);
    initBlockchainStack();

    // Timeline navigation
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach(item => {
        item.addEventListener('click', function() {
            timelineItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            const year = this.dataset.year;
            const filteredProjects = filterProjects(projects, { timeframe: [year] });
            updateProjectCards(filteredProjects);
        });
    });

    // Function navigation
    const functionItems = document.querySelectorAll('.function-item');
    functionItems.forEach(item => {
        item.addEventListener('click', function() {
            functionItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            const functionName = this.querySelector('span').textContent;
            const filteredProjects = filterProjects(projects, { function: [functionName] });
            updateProjectCards(filteredProjects);
        });
    });

    // Search functionality
    const searchInput = document.querySelector('.search-bar input');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const filteredProjects = projects.filter(project => 
            project.title.toLowerCase().includes(searchTerm) ||
            (project.description && project.description.toLowerCase().includes(searchTerm))
        );
        updateProjectCards(filteredProjects);
    });

    // Clear all filters
    const clearAllBtn = document.querySelector('.clear-all');
    clearAllBtn.addEventListener('click', function() {
        document.querySelectorAll('.filter-tag').forEach(tag => {
            tag.remove();
        });
        updateProjectCards(projects);
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
