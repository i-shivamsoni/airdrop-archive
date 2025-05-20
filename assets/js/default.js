// Theme toggle functionality in the header
document.addEventListener('DOMContentLoaded', function () {
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
    }

    // Theme toggle click handler
    themeToggle.addEventListener('click', function () {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeToggle.querySelector('i').classList.replace(
            isDark ? 'fa-moon' : 'fa-sun',
            isDark ? 'fa-sun' : 'fa-moon'
        );
    });
});

// Mobile menu functionality
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const nav = document.querySelector('nav');
if (mobileMenuToggle && nav) {
    mobileMenuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
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

// Error handling for Ethereum provider injection
window.addEventListener('error', function (event) {
    if (event && event.message && (
        event.message.includes('Cannot redefine property: ethereum') ||
        event.message.includes('Cannot set property ethereum')
    )) {
        event.preventDefault();
        return true;
    }
}, true);

// Data handling for Jekyll
function getProjects() {
    // Jekyll will inject this data
    const allPosts = window.siteData?.posts || [];
    
    // Filter only projects
    const projects = allPosts.filter(post => post.pagetype === "project");
    
    console.log('Retrieved projects:', projects);
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
    
    if (grid) {
        grid.innerHTML = '';
        
        if (projects.length === 0) {
            const emptyState = document.querySelector('.empty-state');
            if (emptyState) {
                emptyState.style.display = 'block';
            }
            if (projectCount) {
                projectCount.textContent = '(0)';
            }
            return;
        }

        const emptyState = document.querySelector('.empty-state');
        if (emptyState) {
            emptyState.style.display = 'none';
        }
        if (projectCount) {
            projectCount.textContent = `(${projects.length})`;
        }

        paginatedProjects.forEach(project => {
            const card = createProjectCard(project);
            grid.appendChild(card);
        });

        // Update pagination
        updatePagination(totalPages, page);
    }
}

function updatePagination(totalPages, currentPage) {
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;
    
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

function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    const title = document.createElement('h3');
    title.textContent = project.title;
    
    const description = document.createElement('p');
    description.textContent = project.description || '';
    
    const date = document.createElement('span');
    date.className = 'date';
    date.textContent = project.date ? new Date(project.date).toLocaleDateString() : '';
    
    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(date);
    
    return card;
}

// Initialize projects when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    projects = getProjects();
    if (projects.length > 0) {
        updateProjectCards(projects);
    }
});