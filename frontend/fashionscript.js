// Search functionality
function handleSearch() {
  const searchQuery = document.getElementById('searchInput').value.trim().toLowerCase();

  if (!searchQuery) {
    alert('Please enter a search term.');
    return;
  }

  // Example: Redirect to a search results page with the query as a parameter
  window.location.href = `searchresults.html?query=${encodeURIComponent(searchQuery)}`;

  // Alternatively, you can filter content dynamically on the current page
  // filterContent(searchQuery);
}

// Add event listeners for search
document.getElementById('searchInput').addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    handleSearch();
  }
});

document.getElementById('searchButton').addEventListener('click', handleSearch);

// Example function to filter content dynamically (optional)
function filterContent(query) {
  const items = document.querySelectorAll('.brand-circle, .card'); // Adjust selectors as needed
  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    if (text.includes(query)) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}
function scrollSection(id, direction) {
    const container = document.getElementById(id);
    container.scrollBy({ left: direction * 200, behavior: 'smooth' });
  }