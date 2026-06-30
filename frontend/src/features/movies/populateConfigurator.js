import renderCanvasPreview from './renderCanvasPreview.js';
import { initPlayer } from './musicPlayer.js';
import { renderConfiguratorMarkup } from '../../components/ConfiguratorView.js';

const configuratorContainer = document.getElementById('configurator');

export default function populateConfigurator(movie, posterPath) {
  if (!configuratorContainer) return;

  configuratorContainer.innerHTML = renderConfiguratorMarkup(movie);

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
