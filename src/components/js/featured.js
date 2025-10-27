// Wait for DOM and for the featured container to be injected
document.addEventListener('DOMContentLoaded', () => {
  const waitForFeatured = setInterval(async () => {
    const featuredRoot = document.querySelector('#featured-container #featured') || document.getElementById('featured');
    if (!featuredRoot) return;
    clearInterval(waitForFeatured);

    // Use fetchFromAPI if available, otherwise fetch top anime directly
    let data = null;
    try {
      if (typeof fetchFromAPI === 'function') {
        data = await fetchFromAPI('/top/anime?filter=airing');
      } else {
        const resp = await fetch('https://api.jikan.moe/v4/top/anime?filter=airing');
        data = await resp.json();
      }
    } catch (err) {
      console.error('Featured fetch error', err);
      featuredRoot.innerHTML = '<div class="p-6 text-slate-400">Failed to load featured anime</div>';
      return;
    }

    const list = data && data.data ? data.data : [];
    if (!list.length) {
      featuredRoot.innerHTML = '<div class="p-6 text-slate-400">No featured anime available</div>';
      return;
    }

    // Pick a random anime from the list
    const anime = list[Math.floor(Math.random() * list.length)];

    // Build featured banner
    const imageUrl = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '';
    const title = anime.title || 'Featured Anime';
    const synopsis = anime.synopsis ? (anime.synopsis.length > 260 ? anime.synopsis.slice(0, 257) + '...' : anime.synopsis) : '';

    featuredRoot.innerHTML = `
      <div class="relative h-full">
        <div class="absolute inset-0 bg-black/40"></div>
        <div class="bg-cover bg-center h-full" style="background-image: url('${imageUrl}'); filter: brightness(0.55);"></div>
        <div class="absolute inset-0 flex ">
          <div class="container mx-auto px-4 mt-12 flex items-center h-full gap-6">
            <div class="max-w-2xl text-white">
              <h2 class="text-3xl md:text-4xl font-bold ">${escapeHtml(title)}</h2>
              <p class="text-sm md:text-base text-slate-200 mb-4">${escapeHtml(synopsis)}</p>
              <div class="flex gap-3  ">
                <button id="featured-watch-btn" class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded">Play</button>
                <button id="featured-browse-btn" class="bg-slate-800 border border-slate-600 text-white font-medium py-2 px-4 rounded">More info</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Wire buttons
    const detailsBtn = document.getElementById('featured-watch-btn');
    if (detailsBtn) {
      detailsBtn.addEventListener('click', () => {
        if (typeof openAnimeDetailsModal === 'function') {
          openAnimeDetailsModal(anime.mal_id);
        } else {
          // fallback: navigate to search
          const results = document.getElementById('search-results');
          if (results) {
            results.innerHTML = '';
            results.appendChild(document.createElement('div'));
          }
        }
      });
    }

    const browseBtn = document.getElementById('featured-browse-btn');
    if (browseBtn) {
      browseBtn.addEventListener('click', () => {
        if (typeof switchSection === 'function') switchSection('search-section');
      });
    }

    // small helper to avoid XSS when injecting text
    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

  }, 150);
});
