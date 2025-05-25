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

// Global variables
let projects = [];

// Timeline rendering and year/month navigation logic will go here (to be added in next step)

// Timeline Interactivity

// Function to update year overview
function updateYearOverview(year) {
    const yearPosts = projects.filter(post => {
        const postYear = new Date(post.date).getFullYear();
        return postYear === parseInt(year);
    });

    // Update project count
    const yearCount = document.querySelector('.year-count');
    const currentYearSpan = document.querySelector('.current-year');
    if (yearCount) yearCount.textContent = yearPosts.length;
    if (currentYearSpan) currentYearSpan.textContent = year;

    // Get monthly stats
    const monthlyStats = {};
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    yearPosts.forEach(post => {
        const month = new Date(post.date).getMonth();
        const monthName = monthNames[month];
        monthlyStats[monthName] = (monthlyStats[monthName] || 0) + 1;
    });

    // Sort months in reverse chronological order
    const sortedMonths = monthNames.reverse().filter(month => monthlyStats[month] > 0);

    // Update chart
    const statChart = document.querySelector('.stat-chart');
    if (statChart) {
        statChart.innerHTML = sortedMonths.map(month => {
            const count = monthlyStats[month];
            const percentage = (count / yearPosts.length) * 100;
            return `
                <div class="chart-bar">
                    <div class="bar-label">${month}</div>
                    <div class="bar-container">
                        <div class="bar-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="bar-value">${count}</div>
                </div>
            `;
        }).join('');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Add loading state
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.classList.add('loading');
    }

    // Year tab switching
    const yearTabs = document.querySelectorAll('.year-tab');
    const yearTimelines = document.querySelectorAll('.year-timeline');
    const yearActivityData = document.querySelectorAll('.year-activity-data');
    const yearStatsContent = document.querySelectorAll('.year-stats-content');

    function switchYear(selectedYear) {
        // Update year tabs
        yearTabs.forEach(t => {
            if (t.getAttribute('data-year') === selectedYear) {
                t.classList.add('active');
            } else {
                t.classList.remove('active');
            }
        });
        
        // Update timeline views
        yearTimelines.forEach(yt => {
            yt.style.display = yt.getAttribute('data-year') === selectedYear ? '' : 'none';
        });

        // Update rewarded activity data
        yearActivityData.forEach(data => {
            data.style.display = data.getAttribute('data-year') === selectedYear ? '' : 'none';
        });

        // Update year overview content
        yearStatsContent.forEach(content => {
            content.style.display = content.getAttribute('data-year') === selectedYear ? '' : 'none';
        });
    }

    yearTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const selectedYear = tab.getAttribute('data-year');
            switchYear(selectedYear);
        });
    });

    // Initialize with the first year
    const firstYear = yearTabs[0]?.getAttribute('data-year');
    if (firstYear) {
        switchYear(firstYear);
    }

    // Expand/collapse months
    function toggleMonthSection(btn, expandText, collapseText) {
        const monthSection = btn.closest('.month-section');
        if (!monthSection) return;
        const entries = monthSection.querySelector('.timeline-entries');
        const isCollapsed = monthSection.classList.toggle('collapsed');
        if (entries) {
            entries.style.display = isCollapsed ? 'none' : '';
            // Debug log
            console.log('Toggled month:', monthSection, 'Collapsed:', isCollapsed, 'Entries:', entries);
        }
        // Update button text/icon
        const span = btn.querySelector('span');
        const icon = btn.querySelector('i');
        if (span && icon) {
            if (isCollapsed) {
                span.textContent = expandText;
                icon.className = 'fas fa-chevron-down';
            } else {
                span.textContent = collapseText;
                icon.className = 'fas fa-chevron-up';
            }
        }
    }
    document.querySelectorAll('.expand-month').forEach(btn => {
        btn.addEventListener('click', function() {
            toggleMonthSection(btn, 'Expand', 'Collapse');
        });
    });
    document.querySelectorAll('.load-more').forEach(btn => {
        btn.addEventListener('click', function() {
            toggleMonthSection(btn, 'Load More', 'Show Less');
        });
    });

    // Ensure initial state: hide .timeline-entries for collapsed months
    document.querySelectorAll('.month-section.collapsed .timeline-entries').forEach(entries => {
        entries.style.display = 'none';
    });

    // View switching (timeline/grid/list)
    document.querySelectorAll('.view-options').forEach(viewOptions => {
        const parent = viewOptions.closest('.year-timeline');
        if (!parent) return;
        const timelineView = parent.querySelector('.timeline-view');
        viewOptions.querySelectorAll('.view-option').forEach(btn => {
            btn.addEventListener('click', function() {
                viewOptions.querySelectorAll('.view-option').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                // Only timeline view is implemented; grid/list can be added as needed
            });
        });
    });

    // Rewarded Activity Category Expansion
    document.querySelectorAll('.category-header').forEach(header => {
        header.addEventListener('click', function() {
            const category = this.closest('.rewarded-activity-category');
            const subcategories = category.querySelector('.subcategories');
            const expandButton = this.querySelector('.expand-category');
            
            // Toggle subcategories visibility
            if (subcategories.style.display === 'none') {
                subcategories.style.display = 'block';
                expandButton.classList.add('expanded');
            } else {
                subcategories.style.display = 'none';
                expandButton.classList.remove('expanded');
            }
        });
    });

    // Handle month bar clicks in the sidebar
    const chartBars = document.querySelectorAll('.chart-bar');
    chartBars.forEach(bar => {
        bar.addEventListener('click', function() {
            const month = this.dataset.month;
            const year = this.dataset.year;
            const targetId = `month-${month.toLowerCase()}-${year}`;
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                // First ensure the correct year is active
                const yearTab = document.querySelector(`.year-tab[data-year="${year}"]`);
                if (yearTab && !yearTab.classList.contains('active')) {
                    yearTab.click();
                }

                // Collapse all other month sections
                const allMonthSections = document.querySelectorAll('.month-section');
                allMonthSections.forEach(section => {
                    if (section.id !== targetId && !section.classList.contains('collapsed')) {
                        const expandButton = section.querySelector('.expand-month, .load-more');
                        if (expandButton) {
                            const span = expandButton.querySelector('span');
                            const icon = expandButton.querySelector('i');
                            if (span) span.textContent = 'Expand';
                            if (icon) icon.className = 'fas fa-chevron-down';
                            section.classList.add('collapsed');
                            const entries = section.querySelector('.timeline-entries');
                            if (entries) entries.style.display = 'none';
                        }
                    }
                });

                // Then scroll to the month section
                setTimeout(() => {
                    // Expand the target month section if it's collapsed
                    if (targetSection.classList.contains('collapsed')) {
                        const expandButton = targetSection.querySelector('.expand-month, .load-more');
                        if (expandButton) {
                            const span = expandButton.querySelector('span');
                            const icon = expandButton.querySelector('i');
                            if (span) span.textContent = 'Collapse';
                            if (icon) icon.className = 'fas fa-chevron-up';
                            targetSection.classList.remove('collapsed');
                            const entries = targetSection.querySelector('.timeline-entries');
                            if (entries) entries.style.display = '';
                        }
                    }

                    // Scroll to the section with smooth animation
                    targetSection.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });

                    // Add a highlight effect
                    targetSection.classList.add('highlight');
                    setTimeout(() => {
                        targetSection.classList.remove('highlight');
                    }, 2000);
                }, 100);
            }
        });
    });
});

// Scroll to Top functionality
const scrollToTopBtn = document.querySelector('.scroll-to-top');

if (scrollToTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}
