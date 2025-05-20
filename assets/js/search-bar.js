// Search bar functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');

    console.log('Search elements found:', { searchInput, searchButton });

    function handleSearch() {
        const query = searchInput.value.trim();
        console.log('Search initiated with query:', query);
        
        if (query) {
            const searchUrl = `/search/?q=${encodeURIComponent(query)}`;
            console.log('Redirecting to:', searchUrl);
            window.location.href = searchUrl;
        } else {
            console.log('Empty search query, no action taken');
        }
    }

    if (searchButton && searchInput) {
        console.log('Adding search event listeners');
        searchButton.addEventListener('click', () => {
            console.log('Search button clicked');
            handleSearch();
        });
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                console.log('Enter key pressed in search input');
                handleSearch();
            }
        });
    } else {
        console.warn('Search elements not found:', { searchInput, searchButton });
    }
}); 