import populateConfigurator from './populateConfigurator.js';
import renderCanvasPreview from './renderCanvasPreview.js';

const listContainer = document.getElementById('movies-grid');
const editorContainer = document.getElementById('editor');

export default function openEditor(movie, posterPath) {
  if (!listContainer || !editorContainer) return;

  listContainer.style.display = 'none';
  editorContainer.classList.remove('hidden');
  editorContainer.setAttribute('aria-hidden', 'false');

  populateConfigurator(movie, posterPath);
  renderCanvasPreview(movie, posterPath);
}