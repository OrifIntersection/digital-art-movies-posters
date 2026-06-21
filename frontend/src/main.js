// Imports
import "./style.css";
import moviesData from '../data/movies.json';

// DOM Elements
const grid = document.getElementById('movies-grid');
const editor = document.getElementById('editor');
const configurator = document.getElementById('configurator');
const backButton = document.getElementById('back-button');
const canvas = document.getElementById('poster-canvas');
const ctx = canvas.getContext && canvas.getContext('2d');

// Movies list rendering
function renderMovies() {
  grid.innerHTML = '';

  moviesData.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'movie-card';

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
            <div class="color-box" style="background-color: ${movie.primaryColor};" title="Primary"></div>
            <span class="color-hex">${movie.primaryColor}</span>
          </div>
          <div class="color-swatch">
            <div class="color-box" style="background-color: ${movie.secondaryColor};" title="Secondary"></div>
            <span class="color-hex">${movie.secondaryColor}</span>
          </div>
          <div class="color-swatch">
            <div class="color-box" style="background-color: ${movie.accentColor};" title="Accent"></div>
            <span class="color-hex">${movie.accentColor}</span>
          </div>
        </div>
      </div>
    `;

    const img = card.querySelector('.poster-img');
    if (img) {
      img.style.cursor = 'pointer';
      img.addEventListener('click', () => openEditor(movie, posterPath));
    }

    grid.appendChild(card);
  });
}

// Editor & canvas rendering
function openEditor(movie, posterPath) {
  // hide grid and show editor
  grid.style.display = 'none';
  editor.classList.remove('hidden');
  editor.setAttribute('aria-hidden', 'false');

  populateConfigurator(movie, posterPath);
  renderCanvasPreview(movie, posterPath);
}

function closeEditor() {
  editor.classList.add('hidden');
  editor.setAttribute('aria-hidden', 'true');
  grid.style.display = '';
}

backButton && backButton.addEventListener('click', closeEditor);

function populateConfigurator(movie, posterPath) {
  configurator.innerHTML = `
    <h3>${movie.title}</h3>
    <div class="config-row"><strong>Année :</strong><span style="margin-left:8px">${movie.releaseYear}</span></div>

    <div>
      <label class="config-row"><span>Primary</span><input class="color-input" id="color-primary" type="color" value="${movie.primaryColor}" title="Primary color"></label>
    </div>
    <div>
      <label class="config-row"><span>Secondary</span><input class="color-input" id="color-secondary" type="color" value="${movie.secondaryColor}" title="Secondary color"></label>
    </div>
    <div>
      <label class="config-row"><span>Accent</span><input class="color-input" id="color-accent" type="color" value="${movie.accentColor}" title="Accent color"></label>
    </div>
  `;

  const primaryColorInput = document.getElementById('color-primary');
  const secondaryColorInput = document.getElementById('color-secondary');
  const accentColorInput = document.getElementById('color-accent');

  [primaryColorInput, secondaryColorInput, accentColorInput].forEach(input => {
    if (!input) return;
    input.addEventListener('input', () => renderCanvasPreview({ ...movie, primaryColor: primaryColorInput.value, secondaryColor: secondaryColorInput.value, accentColor: accentColorInput.value }, posterPath));
  });
}

function renderCanvasPreview(movie, posterPath) {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Code du canvas ici 
}
 
// Launch the app
renderMovies();