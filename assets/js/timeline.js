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

document.addEventListener('DOMContentLoaded', function() {
    // Year tab switching
    const yearTabs = document.querySelectorAll('.year-tab');
    const yearTimelines = document.querySelectorAll('.year-timeline');
    const yearActivityData = document.querySelectorAll('.year-activity-data');

    yearTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const selectedYear = tab.getAttribute('data-year');
            
            // Update year tabs
            yearTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update timeline views
            yearTimelines.forEach(yt => {
                if (yt.getAttribute('data-year') === selectedYear) {
                    yt.style.display = '';
                } else {
                    yt.style.display = 'none';
                }
            });

            // Update rewarded activity data
            yearActivityData.forEach(data => {
                if (data.getAttribute('data-year') === selectedYear) {
                    data.style.display = '';
                } else {
                    data.style.display = 'none';
                }
            });
        });
    });

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
});
