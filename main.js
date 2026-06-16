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
        ctx.fillrect(thix.x, this.y, this.width, this.height);
    }

    update() {
        this.x += this.vx;
        if (this.x <= 0 || this.x + this.width >= canvas.width) {
            this.vx *= -1;
        }
    }
}

const canvas = document.getElementById("MoviePoster");
const ctx = canvas.getContext("2d");

const shape = [
    new Rectangle(50, 50, 100, 80, "orange"),
    new Rectangle(200, 120, 120, 60, "purple"),
];

function render() {
    ctx.clearReact(0, 0, canvas.width, canvas.height); 

    shapes.forEach(shape => {
        shape.update();
        shape.draw(ctx);
    });
    requestAnimationFrame(render);
}
render();