// Imports
import "./style.css";
import moviesData from "../data/movies.json";

// DOM Elements
const grid = document.getElementById("movies-grid");
const editor = document.getElementById("editor");
const configurator = document.getElementById("configurator");
const backButton = document.getElementById("back-button");
const canvas = document.getElementById("poster-canvas");
const ctx = canvas.getContext && canvas.getContext("2d");

let animationId = null;

// =========================
// Rectangle class (from second code)
// =========================
class Rectangle {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.vx = 1;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update(canvas) {
    this.x += this.vx;

    if (this.x <= 0 || this.x + this.width >= canvas.width) {
      this.vx *= -1;
    }
  }
}

// =========================
// Movies list
// =========================
function renderMovies() {
  grid.innerHTML = "";

  moviesData.forEach(movie => {
    const card = document.createElement("div");
    card.className = "movie-card";

    const posterPath = `/posters/${movie.id}.jpg`;

    card.innerHTML = `
      <div class="poster-container">
        <img
          src="${posterPath}"
          alt="Affiche du film ${movie.title}"
          class="poster-img"
          loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500'; this.onerror=null;"
        />
      </div>

      <div class="movie-info">
        <div>
          <h2 class="movie-title">${movie.title}</h2>
          <p class="movie-year">${movie.releaseYear}</p>
        </div>

        <div class="color-palette">
          <div class="color-swatch">
            <div class="color-box" style="background:${movie.primaryColor};"></div>
            <span>${movie.primaryColor}</span>
          </div>

          <div class="color-swatch">
            <div class="color-box" style="background:${movie.secondaryColor};"></div>
            <span>${movie.secondaryColor}</span>
          </div>

          <div class="color-swatch">
            <div class="color-box" style="background:${movie.accentColor};"></div>
            <span>${movie.accentColor}</span>
          </div>
        </div>
      </div>
    `;

    card.querySelector(".poster-img").addEventListener("click", () => {
      openEditor(movie, posterPath);
    });

    grid.appendChild(card);
  });
}

// =========================
// Editor
// =========================
function openEditor(movie, posterPath) {
  grid.style.display = "none";
  editor.classList.remove("hidden");
  editor.setAttribute("aria-hidden", "false");

  populateConfigurator(movie, posterPath);
  renderCanvasPreview(movie, posterPath);
}

function closeEditor() {
  editor.classList.add("hidden");
  editor.setAttribute("aria-hidden", "true");
  grid.style.display = "";

  cancelAnimationFrame(animationId);
}

backButton.addEventListener("click", closeEditor);

// =========================
// Configurator
// =========================
function populateConfigurator(movie, posterPath) {
  configurator.innerHTML = `
    <h3>${movie.title}</h3>

    <div class="config-row">
      <strong>Année :</strong>
      <span>${movie.releaseYear}</span>
    </div>

    <label class="config-row">
      <span>Primary</span>
      <input id="color-primary" type="color" value="${movie.primaryColor}">
    </label>

    <label class="config-row">
      <span>Secondary</span>
      <input id="color-secondary" type="color" value="${movie.secondaryColor}">
    </label>

    <label class="config-row">
      <span>Accent</span>
      <input id="color-accent" type="color" value="${movie.accentColor}">
    </label>
  `;

  const primary = document.getElementById("color-primary");
  const secondary = document.getElementById("color-secondary");
  const accent = document.getElementById("color-accent");

  [primary, secondary, accent].forEach(input => {
    input.addEventListener("input", () => {

      renderCanvasPreview(
        {
          ...movie,
          primaryColor: primary.value,
          secondaryColor: secondary.value,
          accentColor: accent.value
        },
        posterPath
      );

    });
  });
}

// =========================
// Canvas Preview
// =========================
function renderCanvasPreview(movie, posterPath) {

  if (!ctx) return;

  cancelAnimationFrame(animationId);

  const poster = new Image();

  poster.onload = () => {

    canvas.width = poster.width;
    canvas.height = poster.height;

    const shapes = [
      new Rectangle(40, 40, 120, 80, movie.primaryColor),
      new Rectangle(180, 160, 140, 60, movie.secondaryColor),
      new Rectangle(120, 300, 90, 90, movie.accentColor)
    ];

    function render() {

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Poster
      ctx.drawImage(
        poster,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // Optional dark overlay
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Animated rectangles
      shapes.forEach(shape => {
        shape.update(canvas);
        shape.draw(ctx);
      });

      animationId = requestAnimationFrame(render);
    }

    render();
  };

  poster.src = posterPath;
}

// =========================
// Resize canvas
// =========================
window.addEventListener("resize", () => {
  if (canvas.width && canvas.height) {
    renderMovies();
  }
});

// =========================
// Start app
// =========================
renderMovies();