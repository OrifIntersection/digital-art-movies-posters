const canvas = document.getElementById('poster-canvas');
const ctx = canvas.getContext && canvas.getContext('2d');

export default function renderCanvasPreview(movie, posterPath) {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Code du canvas ici 
    console.log(movie);
    console.log(posterPath);
}