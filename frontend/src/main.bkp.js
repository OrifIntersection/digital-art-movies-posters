import './style.css'
(function() {
    let requete;
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

    update() {
        this.x += this.vx;
        if (this.x <= 0 || this.x + this.width >= canvas.width) {
            this.vx *= -1;
        }
    }
}

const shapes = [
    new Rectangle(50, 50, 100, 80, "orange"),
    new Rectangle(200, 120, 120, 60, "purple"),
];
  const canvas = document.getElementById('MoviePoster');
  const ctx = canvas.getContext('2d');
 
  // resize the canvas to fill browser window dynamically
  window.addEventListener('resize', resizeCanvas, false);
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    /**
     * Your drawings need to be inside this function otherwise they will be reset when 
     * you resize the browser window and the canvas goes will be cleared.
     */
    cancelAnimationFrame(requete)
    render();

  }
  resizeCanvas();
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); 

    shapes.forEach(shape => {
        shape.update();
        shape.draw(ctx);
    });
    requete = requestAnimationFrame(render);
}
})();