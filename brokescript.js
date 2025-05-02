function scrollLeft() {
    const container = document.getElementById('scrollContainer');
    container.scrollBy({ left: -200, behavior: 'smooth' });
  }

  function scrollRight() {
    const container = document.getElementById('scrollContainer');
    container.scrollBy({ left: 200, behavior: 'smooth' });
  }