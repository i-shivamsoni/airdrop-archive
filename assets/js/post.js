// Error handling wrapper
function handleError(error, context) {
  console.error(`Error in ${context}:`, error);
  const errorBoundary = document.getElementById('content-error');
  if (errorBoundary) {
    errorBoundary.style.display = 'block';
  }
}

// Generate Table of Contents
function generateTOC() {
  try {
    const content = document.getElementById('post-content');
    const toc = document.getElementById('post-toc');
    const sidebar = document.getElementById('post-sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (!content || !toc) return;
    const headings = content.querySelectorAll('h2, h3');
    if (headings.length < 2) return;
    
    sidebar.style.display = '';
    headings.forEach(function(heading, i) {
      if (!heading.id) {
        heading.id = 'section-' + i;
      }
      const li = document.createElement('li');
      li.style.marginLeft = heading.tagName === 'H3' ? '1.25em' : '0';
      const a = document.createElement('a');
      a.href = '#' + heading.id;
      a.textContent = heading.textContent;
      
      a.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          document.querySelectorAll('.post-content h2, .post-content h3').forEach(h => {
            h.classList.remove('highlighted');
          });
          
          targetElement.scrollIntoView({ behavior: 'smooth' });
          targetElement.classList.add('highlighted');
          history.pushState(null, null, '#' + targetId);
          
          if (window.innerWidth <= 1000) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            toggleBtn.classList.remove('active');
          }
        }
      });
      
      li.appendChild(a);
      toc.appendChild(li);
    });

    // Sidebar toggle functionality
    if (toggleBtn && overlay) {
      toggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        this.classList.toggle('active');
      });

      overlay.addEventListener('click', function() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        toggleBtn.classList.remove('active');
      });

      window.addEventListener('resize', function() {
        if (window.innerWidth > 1000) {
          sidebar.classList.remove('active');
          overlay.classList.remove('active');
          toggleBtn.classList.remove('active');
        }
      });
    }
  } catch (error) {
    handleError(error, 'generateTOC');
  }
}

// Track active section
function trackActiveSection() {
  try {
    const headings = document.querySelectorAll('.post-content h2, .post-content h3');
    let currentSection = '';
    
    function updateActiveSection() {
      headings.forEach(heading => {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 100) {
          currentSection = heading.id;
        }
      });
      
      document.querySelectorAll('#post-toc a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + currentSection) {
          link.classList.add('active');
        }
      });
    }
    
    window.addEventListener('scroll', updateActiveSection);
    updateActiveSection(); // Initial check
  } catch (error) {
    handleError(error, 'trackActiveSection');
  }
}

// Enhanced table handling
function enhanceTables() {
  try {
    document.querySelectorAll('.post-content table').forEach(function(table) {
      const wrapper = document.createElement('div');
      wrapper.className = 'table-wrapper';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);

      const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
      
      table.querySelectorAll('tbody tr').forEach(function(row) {
        const cells = row.querySelectorAll('td');
        cells.forEach(function(cell, index) {
          if (headers[index]) {
            cell.setAttribute('data-label', headers[index]);
          }
        });
      });

      if (table.offsetWidth > table.parentElement.offsetWidth) {
        table.classList.add('table-responsive');
      }

      table.querySelectorAll('tbody tr:nth-child(even)').forEach(function(row) {
        row.classList.add('even');
      });

      table.querySelectorAll('tbody tr').forEach(function(row) {
        row.addEventListener('mouseenter', function() {
          this.classList.add('hover');
        });
        row.addEventListener('mouseleave', function() {
          this.classList.remove('hover');
        });
      });
    });
  } catch (error) {
    handleError(error, 'enhanceTables');
  }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  generateTOC();
  trackActiveSection();
  enhanceTables();
  
  // Hide loading indicator
  const loadingIndicator = document.getElementById('content-loading');
  if (loadingIndicator) {
    loadingIndicator.style.display = 'none';
  }
}); 