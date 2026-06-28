const canvas = document.getElementById('poster-canvas');
const ctx = canvas?.getContext?.('2d');

export default function renderCanvasPreview(movie, posterPath) {
  if (!canvas || !ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  console.log(movie);
  console.log(posterPath);
}