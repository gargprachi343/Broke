function scrollSection(id, direction) {
    const container = document.getElementById(id);
    container.scrollBy({ left: direction * 200, behavior: 'smooth' });
  }