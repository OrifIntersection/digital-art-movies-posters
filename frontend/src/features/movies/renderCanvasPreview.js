const canvas = document.getElementById('poster-canvas');
const ctx = canvas?.getContext?.('2d');
let animationId = null;
export default function renderCanvasPreview(movie, posterPath) {
  if (!canvas || !ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  cancelAnimationFrame(animationId);

  const poster = new Image();

  poster.onload = () => {

    canvas.width = poster.width;
    canvas.height = poster.height;

    const shapes = [
      new Rectangle(40, 40, 120, 80, movie.primaryColor),
      new Rectangle(180, 160, 140, 60, movie.secondaryColor),
      new Rectangle(120, 300, 90, 90, movie.accentColor)
    ];

    function render() {

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Poster
      ctx.drawImage(
        poster,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // Optional dark overlay
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Animated rectangles
      shapes.forEach(shape => {
        shape.update(canvas);
        shape.draw(ctx);
      });

      animationId = requestAnimationFrame(render);
    }

    render();
    
    window.addEventListener("resize", () => {
      if (canvas.width && canvas.height) {
        renderMovies();
      }
    });
  };

  poster.src = posterPath;
}
class Rectangle {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.vx = 1;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update(canvas) {
    this.x += this.vx;

    if (this.x <= 0 || this.x + this.width >= canvas.width) {
      this.vx *= -1;
    }
  }
}