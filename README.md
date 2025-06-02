🌐 AniList Vault

A fullstack anime and manga tracker that lets users search, view, and manage their watchlists using data from the [Jikan API](https://jikan.moe/). Users can view anime details in a Netflix-style layout, track what they're watching, completed, or plan to watch, and get links to trailers and streaming sites.


Features

 🔍 Search for anime or manga via Jikan API
 📝 Add titles to **Watching**, **Completed**, or **Plan to Watch** lists
 🎮 View anime info: synopsis, episodes, trailer, genres, score
 🎨 Netflix-style layout for better UX
 📎 Persist user lists with SQLite or MySQL (via PHP backend)
 🔗 Streaming site suggestions (e.g., Crunchyroll, Netflix)


🛠️ Tech Stack

| Layer      | Tech Used                         |
| ---------- | --------------------------------- |
| Frontend   | HTML, CSS, JavaScript             |
| Backend    | PHP (or Flask Python alternative) |
| API        | Jikan REST API                    |
| Database   | SQLite or MySQL                   |
| Design     | Figma / Excalidraw                |
| Versioning | Git, GitHub                       |
| Deployment | (Optional) AWS / Netlify / Render |

📂 Folder Structure

```

anime-tracker/
│
├── public/                  # Static assets (CSS, JS, images)
│   ├── css/
│   └── js/
├── templates/               # HTML Pages
│   ├── index.html
│   ├── search.html
│   ├── list.html
│   └── details.html
├── api/                     # PHP scripts or Flask routes
│   ├── search.php
│   ├── save.php
│   └── get-list.php
├── db/
│   └── database.sqlite
├── README.md
└── .gitignore
```


📄 API Usage (Jikan)

```http
GET https://api.jikan.moe/v4/anime?q=attack%20on%20titan
```

Returns JSON:

```json
{
  "data": [
    {
      "title": "Attack on Titan",
      "episodes": 75,
      "score": 8.9,
      "trailer": { "url": "..." },
      "images": { "jpg": { "image_url": "..." } },
      "synopsis": "..."
    }
  ]
}

```

🧢 Future Features

* 👤 User Authentication (login/register)
* 💾 Save favorites to user profiles
* 🏆 Recommendation engine
* 📱 Mobile-friendly responsive layout

✅ How to Run (Local)

```bash
# PHP version
php -S localhost:8000
# Open http://localhost:8000/index.html
```


