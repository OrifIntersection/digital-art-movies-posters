export function createMovieCard(movie, posterPath) {
  const card = document.createElement('div');
  card.className = 'movie-card';

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

  return card;
}

export default createMovieCard;
