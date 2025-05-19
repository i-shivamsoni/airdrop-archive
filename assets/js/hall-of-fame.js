// JavaScript for Hall of Fame Page Demo
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Chart.js charts
    initializeCharts();
    
    // Sorting functionality
    const sortButtons = document.querySelectorAll('.sort-btn');
    sortButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all sort buttons
            sortButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const sortType = this.dataset.sort;
            console.log(`Sorting by: ${sortType}`);
            
            // In a real implementation, this would sort the data
            // For demo purposes, we'll just show a visual feedback
            animateSortingEffect(sortType);
        });
    });
    
    // View switching functionality
    const viewButtons = document.querySelectorAll('.view-btn');
    const rankingSections = document.querySelectorAll('.ranking-section');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all view buttons
            viewButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const viewType = this.dataset.view;
            console.log(`Switching to ${viewType} view`);
            
            // Hide all ranking sections
            rankingSections.forEach(section => {
                section.classList.add('hidden');
            });
            
            // Show the selected view
            document.querySelector(`.${viewType}-view`).classList.remove('hidden');
            
            // Trigger animations for the newly visible elements
            const animatedElements = document.querySelectorAll(`.${viewType}-view .airdrop-card, .${viewType}-view .airdrop-list-item`);
            animatedElements.forEach((element, index) => {
                element.style.animationName = 'none';
                setTimeout(() => {
                    element.style.animationName = 'fadeIn';
                    element.style.animationDelay = `${0.1 * index}s`;
                }, 10);
            });
        });
    });
    
    // Pagination functionality
    const paginationButtons = document.querySelectorAll('.pagination-btn');
    paginationButtons.forEach(button => {
        if (!button.classList.contains('next')) {
            button.addEventListener('click', function() {
                const paginationContainer = this.closest('.table-pagination, .card-pagination, .list-pagination');
                const buttons = paginationContainer.querySelectorAll('.pagination-btn');
                
                buttons.forEach(btn => {
                    if (!btn.classList.contains('next')) {
                        btn.classList.remove('active');
                    }
                });
                
                this.classList.add('active');
                
                // In a real implementation, this would load the corresponding page
                console.log(`Loading page: ${this.textContent}`);
            });
        } else {
            button.addEventListener('click', function() {
                const paginationContainer = this.closest('.table-pagination, .card-pagination, .list-pagination');
                const activeButton = paginationContainer.querySelector('.pagination-btn.active');
                const nextButton = activeButton.nextElementSibling;
                
                if (nextButton && !nextButton.classList.contains('next')) {
                    activeButton.classList.remove('active');
                    nextButton.classList.add('active');
                    console.log(`Loading page: ${nextButton.textContent}`);
                }
            });
        }
    });
    
    // Details button functionality
    const detailsButtons = document.querySelectorAll('.details-btn');
    detailsButtons.forEach(button => {
        button.addEventListener('click', function() {
            const projectName = this.closest('.airdrop-card, .airdrop-list-item').querySelector('h3, h4').textContent;
            alert(`Viewing details for ${projectName}. In a real implementation, this would open a detailed page or modal.`);
        });
    });
    
    // Form submission
    const nominationForm = document.querySelector('.nomination-form');
    if (nominationForm) {
        nominationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const projectName = document.getElementById('project-name').value;
            const airdropYear = document.getElementById('airdrop-year').value;
            const totalValue = document.getElementById('total-value').value;
            const recipients = document.getElementById('recipients').value;
            const significance = document.getElementById('significance').value;
            const email = document.getElementById('email').value;
            
            // Validate form
            if (!projectName || !airdropYear || !totalValue || !recipients || !significance) {
                alert('Please fill in all required fields.');
                return;
            }
            
            // In a real implementation, this would submit the form data
            console.log('Form submitted:', {
                projectName,
                airdropYear,
                totalValue,
                recipients,
                significance,
                email
            });
            
            // Show success message
            alert(`Thank you for nominating ${projectName}! Your submission has been received.`);
            
            // Reset form
            this.reset();
        });
    }
    
    // Theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
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
            
            // Update charts for dark mode
            updateChartsForTheme();
        });
    }
    
    // Table row hover effects
    const tableRows = document.querySelectorAll('.ranking-table tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('mouseenter', function() {
            const rankBadge = this.querySelector('.rank-badge');
            rankBadge.style.transform = 'scale(1.2)';
            rankBadge.style.boxShadow = '0 0 10px rgba(99, 102, 241, 0.5)';
        });
        
        row.addEventListener('mouseleave', function() {
            const rankBadge = this.querySelector('.rank-badge');
            rankBadge.style.transform = '';
            rankBadge.style.boxShadow = '';
        });
    });
    
    // Search functionality
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = this.value.trim().toLowerCase();
                if (searchTerm) {
                    console.log(`Searching for: ${searchTerm}`);
                    
                    // Simulate search results
                    const tableRows = document.querySelectorAll('.ranking-table tbody tr');
                    let matchFound = false;
                    
                    tableRows.forEach(row => {
                        const projectName = row.querySelector('.project-info h4').textContent.toLowerCase();
                        if (projectName.includes(searchTerm)) {
                            row.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
                            row.style.boxShadow = '0 0 0 2px var(--primary)';
                            matchFound = true;
                        } else {
                            row.style.opacity = '0.5';
                        }
                    });
                    
                    if (!matchFound) {
                        alert(`No projects found matching "${searchTerm}"`);
                        // Reset styles
                        tableRows.forEach(row => {
                            row.style.backgroundColor = '';
                            row.style.boxShadow = '';
                            row.style.opacity = '';
                        });
                    }
                }
            }
        });
    }
    
    // Injected by Jekyll
    const airdrops = window.airdrops || [];
    renderTableView(airdrops);
    renderCardView(airdrops);
    renderListView(airdrops);
});

// Initialize Chart.js charts
function initializeCharts() {
    // Value Distribution Chart
    const valueChartCtx = document.getElementById('valueChart');
    if (valueChartCtx && window.airdrops) {
        // Sort by value descending, take top 5
        const sortedByValue = [...window.airdrops].sort((a, b) => (b.value || 0) - (a.value || 0)).slice(0, 5);
        const labels = sortedByValue.map(a => a.project);
        const data = sortedByValue.map(a => a.value ? Math.round(a.value / 1e6) : 0); // millions
        const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b'];
        new Chart(valueChartCtx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 0,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                return `$${value}M`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Recipients Comparison Chart
    const recipientsChartCtx = document.getElementById('recipientsChart');
    if (recipientsChartCtx && window.airdrops) {
        // Sort by recipients descending, take all
        const sortedByRecipients = [...window.airdrops].sort((a, b) => {
            // Try to parse numbers from recipients string
            const parse = s => parseInt((s||'').replace(/[^\d]/g, '')) || 0;
            return parse(b.recipients) - parse(a.recipients);
        });
        const labels = sortedByRecipients.map(a => a.project);
        const data = sortedByRecipients.map(a => {
            const n = (a.recipients||'').replace(/[^\d]/g, '');
            return n.length > 0 ? parseInt(n) : 0;
        });
        new Chart(recipientsChartCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Recipients',
                    data: data,
                    backgroundColor: '#6366f1',
                    borderRadius: 6,
                    maxBarThickness: 20
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                return value >= 1000000 ? `${(value/1000000).toFixed(2)}M recipients` : value >= 1000 ? `${(value/1000).toFixed(1)}K recipients` : `${value} recipients`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value >= 1000000 ? `${(value/1000000).toFixed(2)}M` : value >= 1000 ? `${(value/1000).toFixed(1)}K` : value;
                            }
                        }
                    },
                    x: {
                        ticks: { display: false }
                    }
                }
            }
        });
    }
}

// Update charts for dark/light theme
function updateChartsForTheme() {
    // In a real implementation, this would update chart colors based on theme
    console.log('Updating charts for theme change');
}

// Animate sorting effect
function animateSortingEffect(sortType) {
    const tableRows = document.querySelectorAll('.ranking-table tbody tr');
    const tableBody = document.querySelector('.ranking-table tbody');
    
    // Add transition effect to rows
    tableRows.forEach(row => {
        row.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
        row.style.opacity = '0.5';
        row.style.transform = 'translateY(10px)';
    });
    
    // Simulate reordering based on sort type
    setTimeout(() => {
        if (sortType === 'value') {
            // Sort by value (Arbitrum first)
            tableBody.insertBefore(tableRows[4], tableBody.firstChild);
            tableBody.insertBefore(tableRows[0], tableBody.firstChild);
        } else if (sortType === 'recipients') {
            // Sort by recipients (Arbitrum first)
            tableBody.insertBefore(tableRows[4], tableBody.firstChild);
        } else if (sortType === 'year') {
            // Sort by year (newest first)
            tableBody.insertBefore(tableRows[4], tableBody.firstChild);
            tableBody.insertBefore(tableRows[3], tableBody.firstChild);
        } else {
            // Default sorting (significance)
            // Reset to original order
            tableBody.insertBefore(tableRows[0], tableBody.firstChild);
        }
        
        // Reset styles with staggered delay
        tableRows.forEach((row, index) => {
            setTimeout(() => {
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, 100 * index);
        });
    }, 500);
    
    // Update card and list views to match
    const viewType = document.querySelector('.view-btn.active').dataset.view;
    if (viewType !== 'table') {
        const viewContainer = document.querySelector(`.${viewType}-view`);
        const items = viewContainer.querySelectorAll('.airdrop-card, .airdrop-list-item');
        
        items.forEach(item => {
            item.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
            item.style.opacity = '0.5';
        });
        
        setTimeout(() => {
            const container = viewType === 'card' ? document.querySelector('.card-grid') : document.querySelector('.list-container');
            
            if (sortType === 'value') {
                // Sort by value (Arbitrum first)
                container.insertBefore(items[4], container.firstChild);
                container.insertBefore(items[0], container.firstChild);
            } else if (sortType === 'recipients') {
                // Sort by recipients (Arbitrum first)
                container.insertBefore(items[4], container.firstChild);
            } else if (sortType === 'year') {
                // Sort by year (newest first)
                container.insertBefore(items[4], container.firstChild);
                container.insertBefore(items[3], container.firstChild);
            } else {
                // Default sorting (significance)
                // Reset to original order
                container.insertBefore(items[0], container.firstChild);
            }
            
            // Reset styles with staggered delay
            items.forEach((item, index) => {
                setTimeout(() => {
                    item.style.opacity = '1';
                }, 100 * index);
            });
        }, 500);
    }
}

const PAGE_SIZE = 10;
let currentPage = 1;

function renderPagination(totalItems, containerSelector, onPageChange) {
    const totalPages = Math.ceil(totalItems / PAGE_SIZE);
    const container = document.querySelector(containerSelector);
    if (!container) return;
    container.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = 'pagination-btn' + (i === currentPage ? ' active' : '');
        btn.textContent = i;
        btn.addEventListener('click', function() {
            currentPage = i;
            onPageChange();
        });
        container.appendChild(btn);
    }
    // Next button
    if (totalPages > 1) {
        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn next';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.addEventListener('click', function() {
            if (currentPage < totalPages) {
                currentPage++;
                onPageChange();
            }
        });
        container.appendChild(nextBtn);
    }
}

function renderTableView(airdrops) {
    const tbody = document.querySelector('.ranking-table tbody');
    tbody.innerHTML = '';
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageAirdrops = airdrops.slice(start, start + PAGE_SIZE);
    pageAirdrops.forEach(airdrop => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="rank-col"><div class="rank-badge">${airdrop.rank}</div></td>
            <td class="project-col">
                <div class="project-info">
                    <!-- <img src="project-icons/${slugify(airdrop.project)}.svg" alt="${airdrop.project}" class="project-icon"> -->
                    <div>
                        <h4>${airdrop.project}</h4>
                    </div>
                </div>
            </td>
            <td class="value-col">
                <div class="value-display">
                    <span class="value-amount">${airdrop.value_display}</span>
                </div>
            </td>
            <td class="recipients-col">
                <div class="recipients-display">
                    <span>${airdrop.recipients}</span>
                </div>
            </td>
            <td class="year-col">${airdrop.year}</td>
            <td class="significance-col">${airdrop.significance}</td>
        `;
        tbody.appendChild(tr);
    });
    renderPagination(airdrops.length, '.table-pagination', () => renderTableView(airdrops));
}

function renderCardView(airdrops) {
    const grid = document.querySelector('.card-grid');
    grid.innerHTML = '';
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageAirdrops = airdrops.slice(start, start + PAGE_SIZE);
    pageAirdrops.forEach(airdrop => {
        const card = document.createElement('div');
        card.className = 'airdrop-card';
        card.innerHTML = `
            <div class="card-header">
                <div class="rank-badge">${airdrop.rank}</div>
                <div class="project-info">
                    <!-- <img src="project-icons/${slugify(airdrop.project)}.svg" alt="${airdrop.project}" class="project-icon"> -->
                    <h3>${airdrop.project}</h3>
                </div>
                <div class="year-badge">${airdrop.year}</div>
            </div>
            <div class="card-body">
                <div class="stat-row">
                    <div class="stat-label">Total Value:</div>
                    <div class="stat-value">${airdrop.value_display}</div>
                </div>
                <div class="stat-row">
                    <div class="stat-label">Recipients:</div>
                    <div class="stat-value">${airdrop.recipients}</div>
                </div>
                <div class="significance">
                    <p>${airdrop.significance}</p>
                </div>
                <div class="tags">
                    <!-- tags -->
                </div>
            </div>
            <div class="card-footer">
                <button class="details-btn">View Details</button>
            </div>
        `;
        grid.appendChild(card);
    });
    renderPagination(airdrops.length, '.card-pagination', () => renderCardView(airdrops));
}

function renderListView(airdrops) {
    const list = document.querySelector('.list-container');
    list.innerHTML = '';
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageAirdrops = airdrops.slice(start, start + PAGE_SIZE);
    pageAirdrops.forEach(airdrop => {
        const item = document.createElement('div');
        item.className = 'airdrop-list-item';
        item.innerHTML = `
            <div class="list-rank">
                <div class="rank-badge">${airdrop.rank}</div>
            </div>
            <div class="list-content">
                <div class="list-header">
                    <div class="project-info">
                        <!-- <img src="project-icons/${slugify(airdrop.project)}.svg" alt="${airdrop.project}" class="project-icon"> -->
                        <h3>${airdrop.project}</h3>
                    </div>
                    <div class="list-meta">
                        <span class="year-badge">${airdrop.year}</span>
                        <span class="value-badge">${airdrop.value_display}</span>
                        <span class="recipients-badge">${airdrop.recipients}</span>
                    </div>
                </div>
                <div class="list-body">
                    <p>${airdrop.significance}</p>
                </div>
                <div class="list-footer">
                    <div class="tags">
                        <!-- tags -->
                    </div>
                    <button class="details-btn">View Details</button>
                </div>
            </div>
        `;
        list.appendChild(item);
    });
    renderPagination(airdrops.length, '.list-pagination', () => renderListView(airdrops));
}

function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
