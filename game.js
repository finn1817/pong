const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Paddle settings
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const PADDLE_MARGIN = 20;

// Ball settings
const BALL_SIZE = 12;

// Game objects
let leftPaddle = {
    x: PADDLE_MARGIN,
    y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT
};

let rightPaddle = {
    x: WIDTH - PADDLE_MARGIN - PADDLE_WIDTH,
    y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: 4
};

let ball = {
    x: WIDTH / 2 - BALL_SIZE / 2,
    y: HEIGHT / 2 - BALL_SIZE / 2,
    vx: Math.random() > 0.5 ? 4 : -4,
    vy: (Math.random() - 0.5) * 4,
    size: BALL_SIZE
};

// Mouse control for left paddle
canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    leftPaddle.y = mouseY - leftPaddle.height / 2;
    // Clamp to canvas bounds
    if (leftPaddle.y < 0) leftPaddle.y = 0;
    if (leftPaddle.y + leftPaddle.height > HEIGHT) leftPaddle.y = HEIGHT - leftPaddle.height;
});

// Ball and paddle collision detection
function rectIntersect(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

// Game loop
function update() {
    // Move ball
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Wall collision
    if (ball.y < 0) {
        ball.y = 0;
        ball.vy *= -1;
    }
    if (ball.y + ball.size > HEIGHT) {
        ball.y = HEIGHT - ball.size;
        ball.vy *= -1;
    }

    // Paddle rectangles for collision
    let leftRect = {
        x: leftPaddle.x,
        y: leftPaddle.y,
        width: leftPaddle.width,
        height: leftPaddle.height
    };
    let rightRect = {
        x: rightPaddle.x,
        y: rightPaddle.y,
        width: rightPaddle.width,
        height: rightPaddle.height
    };
    let ballRect = {
        x: ball.x,
        y: ball.y,
        width: ball.size,
        height: ball.size
    };

    // Left paddle collision
    if (rectIntersect(ballRect, leftRect) && ball.vx < 0) {
        ball.x = leftPaddle.x + leftPaddle.width;
        ball.vx *= -1;
        // Add some "spin" based on paddle movement
        ball.vy += ((ball.y + ball.size / 2) - (leftPaddle.y + leftPaddle.height / 2)) * 0.15;
    }

    // Right paddle collision
    if (rectIntersect(ballRect, rightRect) && ball.vx > 0) {
        ball.x = rightPaddle.x - ball.size;
        ball.vx *= -1;
        ball.vy += ((ball.y + ball.size / 2) - (rightPaddle.y + rightPaddle.height / 2)) * 0.15;
    }

    // AI for right paddle: Move towards ball
    let targetY = ball.y + ball.size / 2 - rightPaddle.height / 2;
    if (rightPaddle.y < targetY) {
        rightPaddle.y += rightPaddle.speed;
        if (rightPaddle.y > targetY) rightPaddle.y = targetY;
    } else if (rightPaddle.y > targetY) {
        rightPaddle.y -= rightPaddle.speed;
        if (rightPaddle.y < targetY) rightPaddle.y = targetY;
    }
    // Clamp right paddle
    if (rightPaddle.y < 0) rightPaddle.y = 0;
    if (rightPaddle.y + rightPaddle.height > HEIGHT) rightPaddle.y = HEIGHT - rightPaddle.height;

    // Score or reset if ball goes off sides
    if (ball.x < -ball.size || ball.x > WIDTH + ball.size) {
        // Reset ball
        ball.x = WIDTH / 2 - BALL_SIZE / 2;
        ball.y = HEIGHT / 2 - BALL_SIZE / 2;
        ball.vx = Math.random() > 0.5 ? 4 : -4;
        ball.vy = (Math.random() - 0.5) * 4;
    }
}

// Drawing
function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Draw midline
    ctx.strokeStyle = "#222";
    ctx.beginPath();
    for (let y = 0; y < HEIGHT; y += 20) {
        ctx.moveTo(WIDTH / 2, y);
        ctx.lineTo(WIDTH / 2, y + 10);
    }
    ctx.stroke();

    // Draw paddles
    ctx.fillStyle = "#fff";
    ctx.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
    ctx.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x + ball.size / 2, ball.y + ball.size / 2, ball.size / 2, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
}

// Main loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
