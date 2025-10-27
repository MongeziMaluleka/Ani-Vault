const components = [
  { id: "navbar-container", path: "../src/components/navbar.html" },
  { id: "home-section-container", path: "../src/components/home-section.html" },
  { id: "featured-container", path: "../src/components/featured-section.html" },
  { id: "search-section-container", path: "../src/components/search-section.html" },
  { id: "my-lists-section-container", path: "../src/components/my-lists-section.html" },
  { id: "about-section-container", path: "../src/components/about-section.html" },
  { id: "anime-modal-container", path: "../src/components/anime-details-modal.html" }
];

components.forEach(component => {
  fetch(component.path)
    .then(response => {
      if (!response.ok) throw new Error(`Failed to fetch ${component.path}: ${response.status}`);
      return response.text();
    })
    .then(data => {
      const container = document.getElementById(component.id);
      if (!container) {
        console.warn(`Container #${component.id} not found — skipping injection for ${component.path}`);
        return;
      }
      container.innerHTML = data;
      console.log(`Loaded ${component.path} into #${component.id}`);
    })
    .catch(error => console.error(`Error loading ${component.path}:`, error));
});
