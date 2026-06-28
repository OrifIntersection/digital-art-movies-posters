import renderCanvasPreview from './renderCanvasPreview.js';
import { initPlayer } from './musicPlayer.js';

const configuratorContainer = document.getElementById('configurator');

export default function populateConfigurator(movie, posterPath) {
  if (!configuratorContainer) return;

  configuratorContainer.innerHTML = `
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

    <div id="spotify-player-container" class="spotify-player-container"></div>
  `;

  const primaryColorInput = document.getElementById('color-primary');
  const secondaryColorInput = document.getElementById('color-secondary');
  const accentColorInput = document.getElementById('color-accent');

  [primaryColorInput, secondaryColorInput, accentColorInput].forEach(input => {
    if (!input) return;
    input.addEventListener('input', () => renderCanvasPreview({ ...movie, primaryColor: primaryColorInput.value, secondaryColor: secondaryColorInput.value, accentColor: accentColorInput.value }, posterPath));
  });

  const playerContainer = document.getElementById('spotify-player-container');
  if (playerContainer) {
    initPlayer(movie, playerContainer);
  }
}
