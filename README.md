# AnimeList

AnimeList is a web application for discovering and exploring anime from MyAnimeList. It provides search, filtering, pagination, watch-order utilities, and screenshot functionality through a simple, interactive interface.

## Features

* **Top Anime** — Displays a list of top-rated anime when the application loads.
* **Anime Search** — Search for anime by title.
* **SFW / NSFW Toggle** — Switch between SFW and NSFW content.
* **Advanced Filtering** — Filter anime by:

  * Type
  * Status
  * Score range
  * Rating
  * Release date
  * Genres
* **Pagination** — Navigate through results using previous, next, first, last, or direct page selection.
* **Anime Details** — Displays the poster, title, genres, episodes, duration, release date, status, score, and number of users who rated the anime.
* **Watch Order** — View related anime in release-date order or open the corresponding watch order on Chiaki.
* **Screenshot** — Save an anime card as a PNG image using the anime title as the filename.
* **Responsive Interaction** — Includes loading states, error handling, smooth navigation, and automatic retry when the connection is restored.

## API

AnimeList uses the **Tenrai API**, a Jikan-compatible API that provides anime data from MyAnimeList.

**Base URL:**

```text
https://api.tenrai.org/v1
```

The application uses the API for:

* Top anime
* Anime search and filtering
* Anime genres
* Anime details
* Anime relationships

The `sfw` parameter is used to switch between SFW and NSFW results.

## Technologies

* HTML5
* CSS3
* JavaScript
* Fetch API
* Tenrai API
* html2canvas
* Session Storage
* Intersection Observer API

## Data Source

Anime information is provided through the Tenrai API and originates from MyAnimeList.
