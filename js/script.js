class SnakeGame {
    constructor(canvasId, scoreId) {
        this.canvas = document.getElementById(canvasId);
        this.context = this.canvas.getContext("2d");

        this.scoreElement = document.getElementById(scoreId);
        this.tileCount = 20;
        this.tileSize = this.canvas.width / this.tileCount;

        this.snake = [{ x: 10, y: 10 }];
        this.velocity = { x: 0, y: 0 };
        this.score = 0;

        this.gameOver = false;
        this.bindEvents();
        this.resizeCanvas();
        this.loop = setInterval(this.update.bind(this), 100);
    }

    resizeCanvas() {
        const size = Math.min(window.innerWidth, 600);
        this.canvas.width = size;
        this.canvas.height = size;
        this.tileSize = this.canvas.width / this.tileCount;
    }

    bindEvents() {
        window.addEventListener("keydown", this.handleKey.bind(this));
        window.addEventListener("resize", this.resizeCanvas.bind(this));
    }

    handleKey(e) {
        const { x, y } = this.velocity;
        switch (e.key) {
            case "ArrowUp": if (y === 0) this.velocity = { x: 0, y: -1 }; break;
            case "ArrowDown": if (y === 0) this.velocity = { x: 0, y: 1 }; break;
            case "ArrowLeft": if (x === 0) this.velocity = { x: -1, y: 0 }; break;
            case "ArrowRight": if (x === 0) this.velocity = { x: 1, y: 0 }; break;
        }
    }

    update() {
        if (this.gameOver) return;

        const head = { ...this.snake[0] };
        head.x += this.velocity.x;
        head.y += this.velocity.y;

        if (this.isCollision(head)) {
            this.gameOver = true;
            alert("Game Over!");
            clearInterval(this.loop);
            return;
        }

        this.snake.unshift(head);
        this.snake.pop();

        this.draw();
    }

    isCollision(pos) {
        return (
            pos.x < 0 || pos.x >= this.tileCount ||
            pos.y < 0 || pos.y >= this.tileCount ||
            this.snake.slice(1).some(segment => segment.x === pos.x && segment.y === pos.y)
        );
    }

    draw() {
        this.context.fillStyle = "#000";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.context.fillStyle = "#0f0";
        this.snake.forEach(segment => {
            this.context.fillRect(
                segment.x * this.tileSize,
                segment.y * this.tileSize,
                this.tileSize,
                this.tileSize
            );
        });

        this.scoreElement.textContent = "Punkte: " + this.score;
    }
}

window.onload = () => {
    new SnakeGame("gameCanvas", "score");
};
