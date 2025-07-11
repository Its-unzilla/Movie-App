
// Movie App - Full Working JS

// TMDB Movie API
const API_KEY = "api_key=ec332d19e6fed067df0160ce34067cc4";
const BASE_URL = "https://api.themoviedb.org/3";
const API_URL = `${BASE_URL}/discover/movie?sort_by=popularity.desc&${API_KEY}`;
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";
const SEARCH_URL = `${BASE_URL}/search/movie?${API_KEY}`;

// Genre definitions
const genres = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 10770, name: "TV Movie" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" }
];

// DOM elements
const main = document.getElementById("main");
const form = document.getElementById("form");
const search = document.getElementById("search");
const tagsEl = document.getElementById("tags");
const prev = document.getElementById("prev");
const next = document.getElementById("next");
const current = document.getElementById("current");
const overlayContent = document.getElementById("overlay-content");
const loader = document.querySelector(".loader");
const toggleThemeBtn = document.getElementById("toggle-theme");

let selectedGenre = [];
let currentPage = 1;
let nextPage = 2;
let prevPage = 0;
let lastUrl = "";
let totalPages = 100;

// Initial load
window.addEventListener("load", () => {
  loader.style.display = "none";
  setGenre();
  getMovies(API_URL);
});

// ================================
// Genre tag rendering
// ================================
function setGenre() {
  tagsEl.innerHTML = "";
  genres.forEach((genre) => {
    const tag = document.createElement("div");
    tag.classList.add("tag");
    tag.id = genre.id;
    tag.innerText = genre.name;
    tag.addEventListener("click", () => {
      if (selectedGenre.includes(genre.id)) {
        selectedGenre = selectedGenre.filter((id) => id !== genre.id);
      } else {
        selectedGenre.push(genre.id);
      }
      getMovies(API_URL + "&with_genres=" + encodeURIComponent(selectedGenre.join(",")));
      highlightSelection();
    });
    tagsEl.append(tag);
  });
}

function highlightSelection() {
  const tags = document.querySelectorAll(".tag");
  tags.forEach((tag) => tag.classList.remove("highlight"));
  clearBtn();

  if (selectedGenre.length !== 0) {
    selectedGenre.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.classList.add("highlight");
    });
  }
}

function clearBtn() {
  let clearBtn = document.getElementById("clear");
  if (clearBtn) {
    clearBtn.classList.add("highlight");
  } else {
    let clear = document.createElement("div");
    clear.classList.add("tag", "highlight");
    clear.id = "clear";
    clear.innerText = "Clear x";
    clear.addEventListener("click", () => {
      selectedGenre = [];
      setGenre();
      getMovies(API_URL);
    });
    tagsEl.append(clear);
  }
}

// ================================
// Get movies from API
// ================================
function getMovies(url) {
  lastUrl = url;
  loader.style.display = "block";
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      loader.style.display = "none";
      if (data.results && data.results.length > 0) {
        showMovies(data.results);
        currentPage = data.page;
        nextPage = currentPage + 1;
        prevPage = currentPage - 1;
        totalPages = data.total_pages;
        current.innerText = currentPage;

        // Pagination states
        if (currentPage <= 1) {
          prev.classList.add("disabled");
          next.classList.remove("disabled");
        } else if (currentPage >= totalPages) {
          prev.classList.remove("disabled");
          next.classList.add("disabled");
        } else {
          prev.classList.remove("disabled");
          next.classList.remove("disabled");
        }
      } else {
        main.innerHTML = `<h1 class="no-results">No Results Found</h1>`;
      }
    })
    .catch((error) => {
      loader.style.display = "none";
      console.error("Error fetching movies:", error);
      main.innerHTML = `<h1 class="no-results">An error occurred while fetching movies.</h1>`;
    });
}

// ================================
// Render movies into grid
// ================================
function showMovies(data) {
  main.innerHTML = "";
  data.forEach((movie) => {
    const { title, poster_path, vote_average, overview, id } = movie;

    const movieEl = document.createElement("div");
    movieEl.classList.add("movie");

    movieEl.innerHTML = `
      <img src="${
        poster_path
          ? IMAGE_URL + poster_path
          : "https://via.placeholder.com/300x450?text=No+Image"
      }" alt="${title}">

      <div class="movie-info">
        <h3>${title}</h3>
        <span class="${getColor(vote_average)}">${vote_average}</span>
      </div>

      <div class="overview">
        <h3>Overview</h3>
        <p>${overview || "No description available."}</p>
        <button class="know-more" id="${id}">Know More</button>
      </div>
    `;

    main.appendChild(movieEl);

    // Know More button listener
    document.getElementById(id)?.addEventListener("click", () => {
      openNav(movie);
    });
  });
}

// ================================
// Rating color
// ================================
function getColor(vote) {
  if (vote >= 8) return "green";
  else if (vote >= 5) return "orange";
  else return "red";
}

// ================================
// Overlay video functionality
// ================================
function openNav(movie) {
  const id = movie.id;
  fetch(`${BASE_URL}/movie/${id}/videos?${API_KEY}`)
    .then((res) => res.json())
    .then((videoData) => {
      if (videoData && videoData.results.length > 0) {
        document.getElementById("myNav").style.height = "100%";

        let embed = [];
        let dots = [];

        videoData.results.forEach((video, idx) => {
          let { name, key, site } = video;
          if (site === "YouTube") {
            embed.push(`
              <iframe width="560" height="315" src="https://www.youtube.com/embed/${key}"
              title="${name}" class="embed hide" frameborder="0"
              allow="accelerometer; autoplay; clipboard-write;
              encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            `);

            dots.push(`<span class="dot">${idx + 1}</span>`);
          }
        });

        overlayContent.innerHTML = `
          <h1>${movie.title || movie.original_title}</h1>
          ${embed.join("")}
          <div class="dots">${dots.join("")}</div>
        `;

        activeSlide = 0;
        showVideos();
      } else {
        overlayContent.innerHTML = `<h1 class="no-results">No trailer available.</h1>`;
        document.getElementById("myNav").style.height = "100%";
      }
    })
    .catch((error) => {
      console.error("Error fetching video data:", error);
      overlayContent.innerHTML = `<h1 class="no-results">An error occurred loading video content.</h1>`;
      document.getElementById("myNav").style.height = "100%";
    });
}

function closeNav() {
  document.getElementById("myNav").style.height = "0%";
}

let activeSlide = 0;
let totalVideos = 0;

function showVideos() {
  let embeds = document.querySelectorAll(".embed");
  let dots = document.querySelectorAll(".dot");

  totalVideos = embeds.length;
  embeds.forEach((embed, idx) => {
    if (activeSlide === idx) {
      embed.classList.add("show");
      embed.classList.remove("hide");
    } else {
      embed.classList.add("hide");
      embed.classList.remove("show");
    }
  });

  dots.forEach((dot, idx) => {
    if (activeSlide === idx) {
      dot.classList.add("active");
    } else {
      dot.classList.remove("active");
    }
  });
}

document.getElementById("left-arrow")?.addEventListener("click", () => {
  if (activeSlide > 0) {
    activeSlide--;
  } else {
    activeSlide = totalVideos - 1;
  }
  showVideos();
});

document.getElementById("right-arrow")?.addEventListener("click", () => {
  if (activeSlide < totalVideos - 1) {
    activeSlide++;
  } else {
    activeSlide = 0;
  }
  showVideos();
});

// ================================
// Pagination
// ================================
prev.addEventListener("click", () => {
  if (prevPage > 0) {
    pageCall(prevPage);
  }
});

next.addEventListener("click", () => {
  if (nextPage <= totalPages) {
    pageCall(nextPage);
  }
});

function pageCall(page) {
  let urlSplit = lastUrl.split("?");
  let queryParams = urlSplit[1].split("&");
  let key = queryParams[queryParams.length - 1].split("=");

  if (key[0] !== "page") {
    let url = lastUrl + "&page=" + page;
    getMovies(url);
  } else {
    key[1] = page.toString();
    queryParams[queryParams.length - 1] = key.join("=");
    let url = urlSplit[0] + "?" + queryParams.join("&");
    getMovies(url);
  }
}

// ================================
// Search
// ================================
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const searchTerm = search.value.trim();
  selectedGenre = [];
  setGenre();

  if (searchTerm) {
    getMovies(SEARCH_URL + "&query=" + encodeURIComponent(searchTerm));
  } else {
    getMovies(API_URL);
  }
});

// ================================
// Dark/Light mode toggle
// ================================
toggleThemeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");
});
