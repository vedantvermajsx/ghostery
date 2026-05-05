document.addEventListener("contextmenu", (event) => event.preventDefault());

const apiKey = import.meta.env.VITE_API_KEY;

const last30=`https://rawg.io/discover/last-30-days=${apiKey}`
const baseUrl = `https://api.rawg.io/api/games?key=${apiKey}`;
const genresUrl = `https://api.rawg.io/api/genres?key=${apiKey}`;

const time = 30 * 24 * 60 * 60 * 1000;
const PastDate = new Date(Date.now() - time);

const Today = new Date();
const formattedPastDate = PastDate.toISOString().split("T")[0];
const formattedDate = Today.toISOString().split("T")[0];
const todaysUrl = `${baseUrl}&page_size=6&dates=${formattedPastDate},${formattedDate}`;

const gamesPerPage = 20;

let currentPage = 1;
let isLoading = false;
let lastGenreIndex = -1;

const searchButton = document.getElementById("searchbtn");
const searchInput = document.querySelector(".local_header_textbox");

if (searchButton) {
  searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (query) {
      searchGames(query);
    }
  });
}

function searchGames(query) {
  const searchUrl = `${baseUrl}&search=${encodeURIComponent(
    query
  )}&search_precise=false`;
  fetch(searchUrl)
    .then((response) => response.json())
    .then((data) => {
      gamesWrapper.innerHTML = ""; 
      populateGames(data.results);
    })
    .catch((error) => console.error("Error fetching search results:", error));
}

function searchStores(query) {
  const searchUrl = `https://api.rawg.io/api/${query}/stores?key=${apiKey}`;
  fetch(searchUrl)
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => console.error("Error fetching store results:", error));
  }

const swiperContainer = document.querySelector(
  ".local-slider-container .swiper-wrapper"
);
const gamesWrapper = document.querySelector(
  ".local-list-container .games-container"
);
const sidebarGenres = document.querySelectorAll(".local-sidebar ul li");
const navItems = document.querySelectorAll(".header .second li");

function initializeSwiper() {
  new Swiper(".swiper-container", {
    loop: true,
    autoplay: {
      delay: 5000,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    pagination: {
      el: ".swiper-pagination",
      dynamicBullets: true,
    },
  });
}

function fetchSliderGames() {
  fetch(todaysUrl)
    .then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then((data) => populateSwiper(data.results))
    .catch((error) => console.error("Error fetching slider data:", error));
}

export async function getGameDetails(id) {  
const gameByIdUrl = `https://api.rawg.io/api/games/${id}?key=${apiKey}`;

console.log(gameByIdUrl);


  return fetch(gameByIdUrl) 
    .then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      const result=response.json();
      return result;
    })
    .catch((error) => {
      console.error("Error fetching game details:", error);
      return null;
    });
}

export async function getGameScreenshots(id) {
  const screenshotsUrl = `https://api.rawg.io/api/games/${id}/screenshots?key=${apiKey}`;
  return fetch(screenshotsUrl)
    .then(response => response.json())
    .then(data => data.results || [])
    .catch(error => {
      console.error("Error fetching screenshots:", error);
      return [];
    });
}





function populateSwiper(slides) {
  slides.forEach((slide) => {
    const div = document.createElement("div");
    div.classList.add("swiper-slide");
    div.style.backgroundImage = `url(${slide.background_image})`;
    div.style.backgroundPosition = "center";
    div.style.backgroundSize = "cover";
    swiperContainer.appendChild(div);
  });
  initializeSwiper();
}

function fetchInitialGames() {
  fetch(baseUrl)
    .then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then((data) => populateGames(data.results))
    .catch((error) => console.error("Error fetching initial games:", error));
}

function populateGames(games) {
  if (currentPage === 1) gamesWrapper.innerHTML = ""; 

  games.forEach((game) => {

    const gameCard = document.createElement("div");
    gameCard.addEventListener("click", () => {
      window.location.href = `./details.html?id=${game.id}`;
    });
    gameCard.className = "game";

    const gameInfo = document.createElement("div");
    gameInfo.className = "gameinfo";

    const nameSpan = document.createElement("span");
    nameSpan.className = "gamename";
    nameSpan.textContent = game.name;

    const ratingSpan = document.createElement("span");
    ratingSpan.innerHTML = `Rating: ${(game.rating || 0).toFixed(
      1
    )} <img src="./assests/star.svg"  alt="Star" class="star-icon">`;

    const genreSpan = document.createElement("span");
    genreSpan.textContent = `Genre: ${game.genres
      .map((g) => g.name)
      .join(", ")}`;

    gameInfo.append(nameSpan, ratingSpan, genreSpan);

    const backgroundImg = document.createElement("div");
    backgroundImg.className = "background-image";
    backgroundImg.dataset.src = game.background_image;

    const placeholder = document.createElement("div");
    placeholder.className = "loading-spinner";
    backgroundImg.appendChild(placeholder);

    gameCard.append(backgroundImg, gameInfo);
    
    let hoverTimeout;
    let screenshotInterval;

    const canHover = window.matchMedia("(hover: hover)").matches;

    if (canHover) {
      gameCard.addEventListener("mouseenter", () => {
        hoverTimeout = setTimeout(() => {
          const screenshotsUrl = `https://api.rawg.io/api/games/${game.id}/screenshots?key=${apiKey}`;
          fetch(screenshotsUrl)
            .then(res => res.json())
            .then(data => {
              if (data.results && data.results.length > 0) {
                const screens = data.results.map(s => s.image);
                if (screens.length > 0 && !gameCard.querySelector('.screenshot-preview')) {
                  const imgPreview = document.createElement('img');
                  imgPreview.className = 'screenshot-preview';
                  imgPreview.src = screens[0];
                  gameCard.insertBefore(imgPreview, gameInfo);
                  
                  let currentIndex = 0;
                  if (screens.length > 1) {
                    screenshotInterval = setInterval(() => {
                      currentIndex = (currentIndex + 1) % screens.length;
                      imgPreview.src = screens[currentIndex];
                    }, 1500); 
                  }
                }
              }
            })
            .catch(err => console.error("Error fetching screenshots", err));
        }, 400); 
      });

      gameCard.addEventListener("mouseleave", () => {
        clearTimeout(hoverTimeout);
        clearInterval(screenshotInterval);
        const preview = gameCard.querySelector('.screenshot-preview');
        if (preview) {
          preview.remove();
        }
      });
    }

    gamesWrapper.appendChild(gameCard);
  });

  lazyLoadImages();
}

function lazyLoadImages() {
  const lazyBackgroundImages = document.querySelectorAll(".background-image");
  const imageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const div = entry.target;
          div.style.backgroundImage = `url(${div.dataset.src})`;
          div.classList.add("loaded");
          observer.unobserve(div);
        }
      });
    },
    {
      rootMargin: "0px",
      threshold: 0.1,
    }
  );
  lazyBackgroundImages.forEach((img) => imageObserver.observe(img));
}

function fetchGamesByGenre(genre) {
  if (isLoading) return;
  isLoading = true;

  const genreUrl = `${baseUrl}&page_size=${gamesPerPage}&page=${currentPage}&genres=${genre}`;
  fetch(genreUrl)
    .then((response) => response.json())
    .then((data) => {
      populateGames(data.results);
      currentPage++;
      isLoading = false;
    })
    .catch((error) => {
      console.error("Error fetching games by genre:", error);
      isLoading = false;
    });
}

function fetchPast30DaysGames() {
  const past30DaysUrl = `${baseUrl}&page_size=${gamesPerPage}&dates=${formattedPastDate},${formattedDate}`;
  fetch(past30DaysUrl)
    .then((response) => response.json())
    .then((data) => populateGames(data.results))
    .catch((error) =>
      console.error("Error fetching past 30 days games:", error)
    );
}

function initializeSidebar() {
  sidebarGenres.forEach((side, index) => {
    side.addEventListener("click", () => {
      if (lastGenreIndex !== -1)
        sidebarGenres[lastGenreIndex].classList.remove("genre-active");
      side.classList.add("genre-active");
      lastGenreIndex = index;
      currentPage = 1;
      fetchGamesByGenre(side.textContent.trim().toLowerCase());
    });
  });

  sidebarGenres[0]?.click();
}

function initializeNavbar() {
  navItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      navItems[lastNavIndex].classList.remove("active");
      item.classList.add("active");
      lastNavIndex = index;
    });
  });

  navItems[0]?.classList.add("active");
}

function handleInfiniteScroll() {
  const scrollPosition = window.scrollY + window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  if (scrollPosition >= documentHeight - 100 && !isLoading) {
    const activeGenre = document.querySelector(
      ".local-sidebar ul li.genre-active"
    );
    if (activeGenre) {
      fetchGamesByGenre(activeGenre.textContent.trim().toLowerCase());
    }
  }
}

function initializeApp() {
  initializeNavbar();
  initializeSidebar();
  fetchSliderGames();
  fetchInitialGames();
  fetchPast30DaysGames();
  window.addEventListener("scroll", handleInfiniteScroll);
}

if (document.querySelector(".header")) {
  initializeApp();
}
