let area = document.getElementById('area');
let html = document.getElementById('html');

area.style = "background:#556479;";
area.height = html.getBoundingClientRect().height;
area.width = html.getBoundingClientRect().width;
let ctx = area.getContext('2d');

class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 5;
        this.xsp = 3;
        this.ysp = 3;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = "white";
        ctx.fill();
    }

    update() {
        this.x += this.xsp;
        this.y += this.ysp;
    }

    checkCollision(bars) {
        let bounced = false;

        for (let bar of bars) {
            if (
                this.x + this.radius > bar.x &&
                this.x - this.radius < bar.x + bar.width &&
                this.y + this.radius > bar.y &&
                this.y - this.radius < bar.y + bar.height
            ) {
                if (bar.axis === 'x' && this.ysp > 0 && this.y - this.radius < bar.y) {
                    this.ysp *= -1;
                    this.y = bar.y - this.radius;
                    bounced = true;
                } else if (bar.axis === 'x' && this.ysp < 0 && this.y + this.radius > bar.y + bar.height) {
                    this.ysp *= -1;
                    this.y = bar.y + bar.height + this.radius;
                    bounced = true;
                } else if (bar.axis === 'y' && this.xsp > 0 && this.x - this.radius < bar.x) {
                    this.xsp *= -1;
                    this.x = bar.x - this.radius;
                    bounced = true;
                } else if (bar.axis === 'y' && this.xsp < 0 && this.x + this.radius > bar.x + bar.width) {
                    this.xsp *= -1;
                    this.x = bar.x + bar.width + this.radius;
                    bounced = true;
                }
                if (bounced) {
                    score += 1;
                    break;
                }
            }
        }

        if (!bounced) {
            if (
                this.x - this.radius < 0 ||
                this.x + this.radius > area.width ||
                this.y - this.radius < 0 ||
                this.y + this.radius > area.height
            ) {
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem("highScore", highScore);
                }
                alert("Game Over! Your score: " + score);
                restartGame();  // Restart the game after game over
            }
        }
    }
}

class Bar {
    constructor(x, y, width, height, axis) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.axis = axis;
    }

    draw() {
        ctx.fillStyle = "white";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update(x, y) {
        if (this.axis === 'x') {
            this.x = x - this.width / 2;
        } else if (this.axis === 'y') {
            this.y = y - this.height / 2;
        }
    }
}

let ball1;
let topBar, bottomBar, leftBar, rightBar;
let bars = [];
let mouseX = 0, mouseY = 0;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let gameLoop;

function setupGame() {
    ball1 = new Ball(100, 100);
    topBar = new Bar(0, 0, 100, 10, 'x');
    bottomBar = new Bar(0, area.height - 10, 100, 10, 'x');
    leftBar = new Bar(0, 0, 10, 100, 'y');
    rightBar = new Bar(area.width - 10, 0, 10, 100, 'y');
    bars = [topBar, bottomBar, leftBar, rightBar];
    score = 0;
}

function clear() {
    ctx.clearRect(0, 0, area.width, area.height);
}

function updatePosition(x, y) {
    mouseX = x;
    mouseY = y;
}

area.addEventListener('mousemove', (e) => {
    let rect = area.getBoundingClientRect();
    updatePosition(e.clientX - rect.left, e.clientY - rect.top);
});

area.addEventListener('touchmove', (e) => {
    let rect = area.getBoundingClientRect();
    let touch = e.touches[0];
    updatePosition(touch.clientX - rect.left, touch.clientY - rect.top);
}, { passive: true });

function drawScore() {
    ctx.font = "48px Arial";
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Score: " + score, area.width / 2, area.height / 2 - 20);
    ctx.fillText("High Score: " + highScore, area.width / 2, area.height / 2 + 40);
}

function startGame() {
    gameLoop = setInterval(() => {
        clear();
        ball1.draw();
        ball1.update();
        for (let bar of bars) {
            bar.update(mouseX, mouseY);
            bar.draw();
        }
        ball1.checkCollision(bars);
        drawScore();
    }, 17);
}

function stopGame() {
    clearInterval(gameLoop);
}

function restartGame() {
    stopGame();
    setupGame();
    startGame();
}

setupGame();
startGame();
