const listContainer = document.getElementById('movies-grid');
const editorContainer = document.getElementById('editor');

export default function closeEditor() {
    editorContainer.classList.add('hidden');
    editorContainer.setAttribute('aria-hidden', 'true');
    listContainer.style.display = '';
}