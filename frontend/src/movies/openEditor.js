import populateConfigurator from "./populateConfigurator";
import renderCanvasPreview from "./renderCanvasPreview";

const listContainer = document.getElementById('movies-grid');
const editorContainer = document.getElementById('editor');

export default function openEditor(movie, posterPath) {
    listContainer.style.display = 'none';
    editorContainer.classList.remove('hidden');
    editorContainer.setAttribute('aria-hidden', 'false');

    populateConfigurator(movie, posterPath);
    renderCanvasPreview(movie, posterPath);
}