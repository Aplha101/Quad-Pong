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
let touchX = 0, touchY = 0;
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

// Handle both mouse and touch movements
area.addEventListener('mousemove', (e) => {
    let rect = area.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

let touchStartX = 0, touchStartY = 0;

area.addEventListener('touchstart', (e) => {
    let touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchX = touch.clientX;
    touchY = touch.clientY;
}, { passive: true });

area.addEventListener('touchmove', (e) => {
    let touch = e.touches[0];
    let deltaX = touch.clientX - touchStartX;
    let deltaY = touch.clientY - touchStartY;

    touchX += deltaX;
    touchY += deltaY;

    // Constrain bars within screen limits
    touchX = Math.max(0, Math.min(touchX, area.width));
    touchY = Math.max(0, Math.min(touchY, area.height));

    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
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
            if (window.innerWidth <= 768) {
                // Use touch controls on mobile
                bar.update(touchX, touchY);
            } else {
                // Use mouse controls on desktop
                bar.update(mouseX, mouseY);
            }
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
