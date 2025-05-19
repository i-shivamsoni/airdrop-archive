document.addEventListener('DOMContentLoaded', function() {
    const learnCards = document.getElementById('learn-cards');
    const posts = window.siteData.posts.filter(post => post.pagetype === 'learn');
    const featuredList = document.querySelector('.featured-list');

    // Populate main cards
    posts.forEach(post => {
        // Ensure required fields exist
        const title = post.title || 'Untitled';
        const description = post.description || 'No description available';
        const category = post.category || 'Uncategorized';
        const difficulty = post.difficulty || 'Beginner';
        const readTime = post.readTime || '5 min read';
        const url = post.url || '#';

        const card = document.createElement('div');
        card.className = 'card learn-card';
        card.innerHTML = `
            <div class="card-header">
                <span class="category">${category}</span>
                <span class="difficulty ${difficulty.toLowerCase()}">${difficulty}</span>
            </div>
            <div class="card-content">
                <h3>${title}</h3>
                <p>${description}</p>
            </div>
            <div class="card-footer">
                <span class="read-time"><i class="far fa-clock"></i> ${readTime}</span>
                <a href="${url}" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>
            </div>
        `;
        learnCards.appendChild(card);
    });

    // Populate featured items (top 3 posts)
    posts.slice(0, 3).forEach(post => {
        const title = post.title || 'Untitled';
        const description = post.description || 'No description available';
        
        const item = document.createElement('div');
        item.className = 'featured-item';
        item.innerHTML = `
            <h3>${title}</h3>
            <p>${description}</p>
        `;
        featuredList.appendChild(item);
    });

    // Filter functionality
    const filterCheckboxes = document.querySelectorAll('.filter-options input[type="checkbox"]');
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', filterCards);
    });

    function filterCards() {
        const selectedCategories = Array.from(document.querySelectorAll('[data-category]:checked')).map(cb => cb.dataset.category);
        const selectedDifficulties = Array.from(document.querySelectorAll('[data-difficulty]:checked')).map(cb => cb.dataset.difficulty);

        const cards = document.querySelectorAll('.learn-card');
        cards.forEach(card => {
            const category = card.querySelector('.category').textContent.toLowerCase();
            const difficulty = card.querySelector('.difficulty').textContent.toLowerCase();
            
            const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(category);
            const difficultyMatch = selectedDifficulties.length === 0 || selectedDifficulties.includes(difficulty);

            card.style.display = categoryMatch && difficultyMatch ? 'block' : 'none';
        });
    }
}); 