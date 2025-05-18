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

document.addEventListener('DOMContentLoaded', function() {
  // Year tab switching logic
  document.querySelectorAll('.year-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      // Remove active from all tabs
      document.querySelectorAll('.year-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      // Hide all year timelines
      document.querySelectorAll('.year-timeline').forEach(yt => yt.style.display = 'none');
      // Show the selected year
      const year = this.getAttribute('data-year');
      const timeline = document.querySelector('.year-timeline[data-year="' + year + '"]');
      if (timeline) timeline.style.display = '';
    });
  });
});
