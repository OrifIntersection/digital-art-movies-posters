import { stopActiveAudio } from './musicPlayer.js';

const listContainer = document.getElementById('movies-grid');
const editorContainer = document.getElementById('editor');

export default function closeEditor() {
  if (!listContainer || !editorContainer) return;

  stopActiveAudio();
  editorContainer.classList.add('hidden');
  editorContainer.setAttribute('aria-hidden', 'true');
  listContainer.style.display = '';
}