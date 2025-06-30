// ==========================================
// GLOBAL VARIABLES AND DATA STORAGE
// ==========================================

// Store the current anime being viewed in the modal
let currentAnime = null;

// Initialize user lists from localStorage or create empty lists
let userLists = {
    watching: JSON.parse(localStorage.getItem('anilist-watching')) || [],
    completed: JSON.parse(localStorage.getItem('anilist-completed')) || [],
    'plan-to-watch': JSON.parse(localStorage.getItem('anilist-plan-to-watch')) || []
};

// API endpoints
const API_BASE_URL = 'https://api.jikan.moe/v4';

// Streaming platforms mapping (for demo purposes)
const streamingPlatforms = {
    'Crunchyroll': 'https://www.crunchyroll.com',
    'Funimation': 'https://www.funimation.com',
    'Netflix': 'https://www.netflix.com',
    'Hulu': 'https://www.hulu.com',
    'Amazon Prime': 'https://www.amazon.com/Prime-Video',
    'HiDive': 'https://www.hidive.com'
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Fetch data from the Jikan API with rate limiting
 * @param {string} endpoint - API endpoint to fetch
 * @returns {Promise} - Promise with the API response
 */
async function fetchFromAPI(endpoint) {
    try {
        // Add a small delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 500));

        const response = await fetch(`${API_BASE_URL}${endpoint}`);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API fetch error:', error);
        showToast('Error fetching data. Please try again.', 'error');
        return null;
    }
}

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, info)
 */
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');

    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast bg-slate-800 border-l-4 p-4 mb-4 shadow-lg rounded-r-lg';

    // Set border color based on type
    if (type === 'success') {
        toast.classList.add('border-green-500');
    } else if (type === 'error') {
        toast.classList.add('border-red-500');
    } else {
        toast.classList.add('border-red-500');
    }

    // Set icon based on type
    let icon;
    if (type === 'success') {
        icon = '<i class="fas fa-check-circle text-green-500 mr-2"></i>';
    } else if (type === 'error') {
        icon = '<i class="fas fa-exclamation-circle text-red-500 mr-2"></i>';
    } else {
        icon = '<i class="fas fa-info-circle text-red-500 mr-2"></i>';
    }

    // Set toast content
    toast.innerHTML = `
            <div class="flex items-center">
                ${icon}
                <span class="text-white">${message}</span>
            </div>
        `;

    // Add toast to container
    toastContainer.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        toast.style.transition = 'all 0.3s ease';

        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    }, 3000);
}

/**
 * Save user lists to localStorage
 */
function saveUserLists() {
    localStorage.setItem('anilist-watching', JSON.stringify(userLists.watching));
    localStorage.setItem('anilist-completed', JSON.stringify(userLists.completed));
    localStorage.setItem('anilist-plan-to-watch', JSON.stringify(userLists['plan-to-watch']));
}

/**
 * Check if an anime is in any user list
 * @param {number} animeId - ID of the anime to check
 * @returns {string|null} - Name of the list or null if not found
 */
function checkAnimeInLists(animeId) {
    if (userLists.watching.some(anime => anime.mal_id === animeId)) {
        return 'watching';
    }
    if (userLists.completed.some(anime => anime.mal_id === animeId)) {
        return 'completed';
    }
    if (userLists['plan-to-watch'].some(anime => anime.mal_id === animeId)) {
        return 'plan-to-watch';
    }
    return null;
}

/**
 * Create an anime card element
 * @param {Object} anime - Anime data object
 * @param {boolean} showListBadge - Whether to show which list the anime is in
 * @returns {HTMLElement} - The anime card element
 */
function createAnimeCard(anime, showListBadge = false) {
    const card = document.createElement('div');
    card.className = 'anime-card bg-slate-800 rounded-lg overflow-hidden shadow-lg cursor-pointer transition-all duration-300';

    // Get image URL or use placeholder
    const imageUrl = anime.images?.jpg?.image_url || 'https://via.placeholder.com/225x318?text=No+Image';

    // Check if anime is in any list
    const listType = showListBadge ? checkAnimeInLists(anime.mal_id) : null;

    // Create badge based on list type
    let listBadge = '';
    if (listType) {
        let badgeColor, badgeIcon, badgeText;

        if (listType === 'watching') {
            badgeColor = 'bg-red-600';
            badgeIcon = 'fa-play-circle';
            badgeText = 'Watching';
        } else if (listType === 'completed') {
            badgeColor = 'bg-green-600';
            badgeIcon = 'fa-check-circle';
            badgeText = 'Completed';
        } else {
            badgeColor = 'bg-blue-600';
            badgeIcon = 'fa-clock';
            badgeText = 'Plan to Watch';
        }

        listBadge = `
                <div class="absolute top-2 right-2 ${badgeColor} text-white text-xs px-2 py-1 rounded-full flex items-center">
                    <i class="fas ${badgeIcon} mr-1"></i>${badgeText}
                </div>
            `;
    }

    // Create score badge if score exists
    let scoreBadge = '';
    if (anime.score) {
        scoreBadge = `
                <div class="absolute bottom-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                    <i class="fas fa-star mr-1"></i>${anime.score}
                </div>
            `;
    }

    card.innerHTML = `
            <div class="relative">
                <img src="${imageUrl}" alt="${anime.title}" class="w-full h-48 object-cover">
                ${listBadge}
                ${scoreBadge}
            </div>
            <div class="p-3">
                <h3 class="text-white font-medium truncate" title="${anime.title}">${anime.title}</h3>
                <div class="flex items-center text-xs text-slate-400 mt-1">
                    <span>${anime.type || 'N/A'}</span>
                    <span class="mx-1">•</span>
                    <span>${anime.episodes ? anime.episodes + ' eps' : 'N/A'}</span>
                </div>
            </div>
        `;

    // Add click event to open modal
    card.addEventListener('click', () => {
        openAnimeDetailsModal(anime.mal_id);
    });

    return card;
}

/**
 * Switch between sections
 * @param {string} sectionId - ID of the section to show
 */
function switchSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('main > section').forEach(section => {
        section.classList.add('hidden');
    });

    // Show the selected section
    document.getElementById(sectionId).classList.remove('hidden');

    // Update navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('text-white');
        link.classList.add('text-slate-300');
    });

    // Highlight the active link
    const activeLink = document.getElementById(sectionId.replace('-section', '-link'));
    if (activeLink) {
        activeLink.classList.remove('text-slate-300');
        activeLink.classList.add('text-white');
    }

    // Also update mobile menu links
    const activeMobileLink = document.getElementById('mobile-' + sectionId.replace('-section', '-link'));
    if (activeMobileLink) {
        activeMobileLink.classList.remove('text-slate-300');
        activeMobileLink.classList.add('text-white');
    }
}

/**
 * Switch between list tabs
 * @param {string} tabId - ID of the tab to show
 */
function switchListTab(tabId) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(tab => {
        tab.classList.remove('border-red-500', 'text-red-500');
        tab.classList.add('border-transparent', 'text-slate-400');
    });

    document.getElementById(tabId).classList.remove('border-transparent', 'text-slate-400');
    document.getElementById(tabId).classList.add('border-red-500', 'text-red-500');

    // Hide all list content
    document.querySelectorAll('.list-content').forEach(content => {
        content.classList.add('hidden');
    });

    // Show selected list content
    const contentId = tabId.replace('-tab', '-content');
    document.getElementById(contentId).classList.remove('hidden');
}

// ==========================================
// API FUNCTIONS
// ==========================================

/**
 * Fetch trending anime
 */
async function fetchTrendingAnime() {
    const data = await fetchFromAPI('/top/anime?filter=airing');

    if (data && data.data) {
        const trendingContainer = document.getElementById('trending-anime-container');
        trendingContainer.innerHTML = '';

        // Display up to 10 trending anime
        data.data.slice(0, 10).forEach(anime => {
            trendingContainer.appendChild(createAnimeCard(anime, true));
        });
    }
}

/**
 * Fetch top rated anime
 */
async function fetchTopRatedAnime() {
    const data = await fetchFromAPI('/top/anime?filter=bypopularity');

    if (data && data.data) {
        const topRatedContainer = document.getElementById('top-rated-anime-container');
        topRatedContainer.innerHTML = '';

        // Display up to 10 top rated anime
        data.data.slice(0, 10).forEach(anime => {
            topRatedContainer.appendChild(createAnimeCard(anime, true));
        });
    }
}

/**
 * Search for anime
 * @param {string} query - Search query
 * @param {string} type - Type of search (anime or manga)
 */
async function searchMedia(query, type) {
    // Show loading indicator
    document.getElementById('search-loading').classList.remove('hidden');
    document.getElementById('search-results-container').classList.remove('hidden');
    document.getElementById('search-results').classList.add('hidden');
    document.getElementById('no-results').classList.add('hidden');

    const data = await fetchFromAPI(`/${type}?q=${encodeURIComponent(query)}&sfw=true`);

    // Hide loading indicator
    document.getElementById('search-loading').classList.add('hidden');

    if (data && data.data && data.data.length > 0) {
        const resultsContainer = document.getElementById('search-results');
        resultsContainer.innerHTML = '';
        resultsContainer.classList.remove('hidden');

        data.data.forEach(item => {
            resultsContainer.appendChild(createAnimeCard(item, true));
        });
    } else {
        // Show no results message
        document.getElementById('no-results').classList.remove('hidden');
    }
}

/**
 * Fetch anime details for the modal
 * @param {number} animeId - ID of the anime to fetch
 */
async function openAnimeDetailsModal(animeId) {
    // Show modal and loading state
    document.getElementById('anime-details-modal').classList.remove('hidden');
    document.getElementById('modal-loading').classList.remove('hidden');
    document.getElementById('anime-details-content').classList.add('hidden');

    // Fetch anime details
    const data = await fetchFromAPI(`/anime/${animeId}/full`);

    if (data && data.data) {
        // Store current anime
        currentAnime = data.data;

        // Update modal content
        updateAnimeDetailsModal(data.data);

        // Hide loading, show content
        document.getElementById('modal-loading').classList.add('hidden');
        document.getElementById('anime-details-content').classList.remove('hidden');
    } else {
        // Handle error
        closeAnimeDetailsModal();
        showToast('Failed to load anime details', 'error');
    }
}

/**
 * Update the anime details modal with data
 * @param {Object} anime - Anime data object
 */
function updateAnimeDetailsModal(anime) {
    // Set title
    document.getElementById('modal-title').textContent = anime.title;
    document.getElementById('modal-anime-title').textContent = anime.title;

    // Set image
    document.getElementById('modal-image').src = anime.images.jpg.large_image_url || anime.images.jpg.image_url;
    document.getElementById('modal-image').alt = anime.title;

    // Set alternative titles
    let altTitles = [];
    if (anime.title_english && anime.title_english !== anime.title) {
        altTitles.push(anime.title_english);
    }
    if (anime.title_japanese) {
        altTitles.push(anime.title_japanese);
    }
    document.getElementById('modal-alternative-titles').textContent = altTitles.length > 0 ? altTitles.join(' • ') : '';

    // Set synopsis
    document.getElementById('modal-synopsis').textContent = anime.synopsis || 'No synopsis available.';

    // Set quick info
    document.getElementById('modal-score').textContent = anime.score || 'N/A';
    document.getElementById('modal-rank').textContent = anime.rank ? `#${anime.rank}` : 'N/A';
    document.getElementById('modal-popularity').textContent = anime.popularity ? `#${anime.popularity}` : 'N/A';
    document.getElementById('modal-episodes').textContent = anime.episodes || 'N/A';
    document.getElementById('modal-status').textContent = anime.status || 'N/A';
    document.getElementById('modal-season').textContent = anime.season && anime.year ? `${anime.season.charAt(0).toUpperCase() + anime.season.slice(1)} ${anime.year}` : 'N/A';

    // Set genres
    const genresContainer = document.getElementById('modal-genres');
    genresContainer.innerHTML = '';

    if (anime.genres && anime.genres.length > 0) {
        anime.genres.forEach(genre => {
            const genreTag = document.createElement('span');
            genreTag.className = 'bg-slate-700 text-slate-200 px-2 py-1 rounded text-sm';
            genreTag.textContent = genre.name;
            genresContainer.appendChild(genreTag);
        });
    } else {
        const noGenres = document.createElement('span');
        noGenres.className = 'text-slate-400';
        noGenres.textContent = 'No genres listed';
        genresContainer.appendChild(noGenres);
    }

    // Set trailer
    const trailerContainer = document.getElementById('modal-trailer');
    if (anime.trailer && anime.trailer.youtube_id) {
        trailerContainer.innerHTML = `
                <a href="https://www.youtube.com/watch?v=${anime.trailer.youtube_id}" target="_blank"
                   class="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors">
                    <i class="fab fa-youtube mr-2"></i> Watch Trailer on YouTube
                </a>
            `;
    } else {
        trailerContainer.innerHTML = '<p class="text-slate-400">No trailer available</p>';
    }

    // Set streaming platforms (demo data)
    const streamingContainer = document.getElementById('streaming-platforms');
    streamingContainer.innerHTML = '';

    // For demo purposes, randomly assign streaming platforms
    const availablePlatforms = Object.keys(streamingPlatforms);
    const randomPlatforms = [];

    // Randomly select 1-3 platforms
    const numPlatforms = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numPlatforms; i++) {
        const randomIndex = Math.floor(Math.random() * availablePlatforms.length);
        const platform = availablePlatforms[randomIndex];

        if (!randomPlatforms.includes(platform)) {
            randomPlatforms.push(platform);
        }
    }

    // Create platform buttons
    randomPlatforms.forEach(platform => {
        const platformBtn = document.createElement('a');
        platformBtn.href = streamingPlatforms[platform];
        platformBtn.target = '_blank';
        platformBtn.className = 'bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded transition-colors';

        let icon;
        switch (platform) {
            case 'Crunchyroll':
                icon = 'fa-circle';
                break;
            case 'Netflix':
                icon = 'fa-play';
                break;
            case 'Hulu':
                icon = 'fa-tv';
                break;
            case 'Amazon Prime':
                icon = 'fa-amazon';
                break;
            default:
                icon = 'fa-play-circle';
        }

        platformBtn.innerHTML = `<i class="fas ${icon} mr-1"></i> ${platform}`;
        streamingContainer.appendChild(platformBtn);
    });

    // Set additional info
    document.getElementById('modal-type').textContent = anime.type || 'N/A';
    document.getElementById('modal-source').textContent = anime.source || 'N/A';
    document.getElementById('modal-aired').textContent = anime.aired?.string || 'N/A';
    document.getElementById('modal-duration').textContent = anime.duration || 'N/A';
    document.getElementById('modal-rating').textContent = anime.rating || 'N/A';

    // Set studios
    if (anime.studios && anime.studios.length > 0) {
        document.getElementById('modal-studios').textContent = anime.studios.map(studio => studio.name).join(', ');
    } else {
        document.getElementById('modal-studios').textContent = 'N/A';
    }

    // Update list buttons based on where the anime is currently
    const currentList = checkAnimeInLists(anime.mal_id);
    document.querySelectorAll('.add-to-list-btn').forEach(btn => {
        const listType = btn.getAttribute('data-list');

        if (currentList === listType) {
            btn.innerHTML = `<i class="fas fa-check mr-2"></i> In ${listType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
            btn.disabled = true;
            btn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            let icon, text;

            if (listType === 'watching') {
                icon = 'fa-play-circle';
                text = 'Add to Watching';
            } else if (listType === 'completed') {
                icon = 'fa-check-circle';
                text = 'Add to Completed';
            } else {
                icon = 'fa-clock';
                text = 'Add to Plan to Watch';
            }

            btn.innerHTML = `<i class="fas ${icon} mr-2"></i> ${text}`;
            btn.disabled = false;
            btn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    });
}

/**
 * Close the anime details modal
 */
function closeAnimeDetailsModal() {
    document.getElementById('anime-details-modal').classList.add('hidden');
    currentAnime = null;
}

/**
 * Add anime to a user list
 * @param {string} listType - Type of list (watching, completed, plan-to-watch)
 */
function addAnimeToList(listType) {
    if (!currentAnime) return;

    // Check if anime is already in any list
    const currentList = checkAnimeInLists(currentAnime.mal_id);

    // If anime is in a different list, remove it
    if (currentList && currentList !== listType) {
        userLists[currentList] = userLists[currentList].filter(anime => anime.mal_id !== currentAnime.mal_id);
    }

    // If anime is not in the target list, add it
    if (currentList !== listType) {
        // Create simplified anime object to store
        const animeToAdd = {
            mal_id: currentAnime.mal_id,
            title: currentAnime.title,
            images: currentAnime.images,
            type: currentAnime.type,
            episodes: currentAnime.episodes,
            score: currentAnime.score
        };

        userLists[listType].push(animeToAdd);

        // Save to localStorage
        saveUserLists();

        // Show success message
        const listName = listType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        showToast(`Added "${currentAnime.title}" to ${listName}`, 'success');

        // Update modal buttons
        updateAnimeDetailsModal(currentAnime);

        // Refresh lists if on My Lists section
        if (!document.getElementById('my-lists-section').classList.contains('hidden')) {
            renderUserLists();
        }
    }
}

/**
 * Remove anime from a user list
 * @param {number} animeId - ID of the anime to remove
 * @param {string} listType - Type of list (watching, completed, plan-to-watch)
 */
function removeAnimeFromList(animeId, listType) {
    // Find anime in the list
    const animeIndex = userLists[listType].findIndex(anime => anime.mal_id === animeId);

    if (animeIndex !== -1) {
        // Get anime title before removing
        const animeTitle = userLists[listType][animeIndex].title;

        // Remove anime from list
        userLists[listType].splice(animeIndex, 1);

        // Save to localStorage
        saveUserLists();

        // Show success message
        const listName = listType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        showToast(`Removed "${animeTitle}" from ${listName}`, 'success');

        // Refresh lists
        renderUserLists();

        // Update modal if open
        if (currentAnime && currentAnime.mal_id === animeId) {
            updateAnimeDetailsModal(currentAnime);
        }
    }
}

/**
 * Render user lists in the My Lists section
 */
function renderUserLists() {
    // Render Watching list
    const watchingList = document.getElementById('watching-list');
    const watchingEmpty = document.getElementById('watching-empty');

    if (userLists.watching.length > 0) {
        watchingList.innerHTML = '';
        userLists.watching.forEach(anime => {
            const card = createAnimeCard(anime);

            // Add remove button
            const removeBtn = document.createElement('button');
            removeBtn.className = 'absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent opening the modal
                removeAnimeFromList(anime.mal_id, 'watching');
            });

            card.querySelector('.relative').appendChild(removeBtn);
            watchingList.appendChild(card);
        });

        watchingEmpty.classList.add('hidden');
        watchingList.classList.remove('hidden');
    } else {
        watchingEmpty.classList.remove('hidden');
        watchingList.classList.add('hidden');
    }

    // Render Completed list
    const completedList = document.getElementById('completed-list');
    const completedEmpty = document.getElementById('completed-empty');

    if (userLists.completed.length > 0) {
        completedList.innerHTML = '';
        userLists.completed.forEach(anime => {
            const card = createAnimeCard(anime);

            // Add remove button
            const removeBtn = document.createElement('button');
            removeBtn.className = 'absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent opening the modal
                removeAnimeFromList(anime.mal_id, 'completed');
            });

            card.querySelector('.relative').appendChild(removeBtn);
            completedList.appendChild(card);
        });

        completedEmpty.classList.add('hidden');
        completedList.classList.remove('hidden');
    } else {
        completedEmpty.classList.remove('hidden');
        completedList.classList.add('hidden');
    }

    // Render Plan to Watch list
    const planToWatchList = document.getElementById('plan-to-watch-list');
    const planToWatchEmpty = document.getElementById('plan-to-watch-empty');

    if (userLists['plan-to-watch'].length > 0) {
        planToWatchList.innerHTML = '';
        userLists['plan-to-watch'].forEach(anime => {
            const card = createAnimeCard(anime);

            // Add remove button
            const removeBtn = document.createElement('button');
            removeBtn.className = 'absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent opening the modal
                removeAnimeFromList(anime.mal_id, 'plan-to-watch');
            });

            card.querySelector('.relative').appendChild(removeBtn);
            planToWatchList.appendChild(card);
        });

        planToWatchEmpty.classList.add('hidden');
        planToWatchList.classList.remove('hidden');
    } else {
        planToWatchEmpty.classList.remove('hidden');
        planToWatchList.classList.add('hidden');
    }
}

// ==========================================
// EVENT LISTENERS
// ==========================================

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
    // Fetch initial data
    fetchTrendingAnime();
    fetchTopRatedAnime();

    // Render user lists
    renderUserLists();

    // Navigation links
    document.getElementById('home-link').addEventListener('click', (e) => {
        e.preventDefault();
        switchSection('home-section');
    });

    document.getElementById('search-link').addEventListener('click', (e) => {
        e.preventDefault();
        switchSection('search-section');
    });

    document.getElementById('my-lists-link').addEventListener('click', (e) => {
        e.preventDefault();
        switchSection('my-lists-section');
    });

    document.getElementById('about-link').addEventListener('click', (e) => {
        e.preventDefault();
        switchSection('about-section');
    });

    // Mobile navigation links
    document.getElementById('mobile-home-link').addEventListener('click', (e) => {
        e.preventDefault();
        switchSection('home-section');
        document.getElementById('mobile-menu').classList.add('hidden');
    });

    document.getElementById('mobile-search-link').addEventListener('click', (e) => {
        e.preventDefault();
        switchSection('search-section');
        document.getElementById('mobile-menu').classList.add('hidden');
    });

    document.getElementById('mobile-my-lists-link').addEventListener('click', (e) => {
        e.preventDefault();
        switchSection('my-lists-section');
        document.getElementById('mobile-menu').classList.add('hidden');
    });

    document.getElementById('mobile-about-link').addEventListener('click', (e) => {
        e.preventDefault();
        switchSection('about-section');
        document.getElementById('mobile-menu').classList.add('hidden');
    });

    // Mobile menu toggle
    document.getElementById('mobile-menu-button').addEventListener('click', () => {
        const mobileMenu = document.getElementById('mobile-menu');
        mobileMenu.classList.toggle('hidden');
    });

    // Search form
    document.getElementById('search-button').addEventListener('click', () => {
        const query = document.getElementById('search-input').value.trim();
        const type = document.getElementById('search-type').value;

        if (query) {
            searchMedia(query, type);
        } else {
            showToast('Please enter a search term', 'error');
        }
    });

    // Search input - search on Enter key
    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = e.target.value.trim();
            const type = document.getElementById('search-type').value;

            if (query) {
                searchMedia(query, type);
            } else {
                showToast('Please enter a search term', 'error');
            }
        }
    });

    // List tabs
    document.getElementById('watching-tab').addEventListener('click', () => {
        switchListTab('watching-tab');
    });

    document.getElementById('completed-tab').addEventListener('click', () => {
        switchListTab('completed-tab');
    });

    document.getElementById('plan-to-watch-tab').addEventListener('click', () => {
        switchListTab('plan-to-watch-tab');
    });

    // Close modal button
    document.getElementById('close-modal-btn').addEventListener('click', closeAnimeDetailsModal);

    // Close modal when clicking outside
    document.getElementById('anime-details-modal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('anime-details-modal')) {
            closeAnimeDetailsModal();
        }
    });

    // Add to list buttons
    document.querySelectorAll('.add-to-list-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const listType = btn.getAttribute('data-list');
            addAnimeToList(listType);
        });
    });

    // Get Started button
    document.getElementById('get-started-btn').addEventListener('click', () => {
        switchSection('search-section');
    });

    // Learn More button
    document.getElementById('learn-more-btn').addEventListener('click', () => {
        switchSection('about-section');
    });

    // Browse Anime buttons
    document.querySelectorAll('.browse-anime-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchSection('search-section');
        });
    });
});