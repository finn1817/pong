class PongGame {
    constructor() {
        this.canvas = document.getElementById('pongCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.WIDTH = this.canvas.width;
        this.HEIGHT = this.canvas.height;
        this._lastDebugTick = 0;

        // Paddle settings
        this.PADDLE_WIDTH = 12;
        this.PADDLE_HEIGHT = 80;
        this.PADDLE_MARGIN = 20;

        // Ball settings
        this.BALL_SIZE = 12;

        this.setupGameObjects();
        this.setupControls();
        try { if (window.PongDebug && PongDebug.enabled) { PongDebug.log('PongGame initialized', { width: this.WIDTH, height: this.HEIGHT }); PongDebug.dumpCanvas(); } } catch (_) {}
        this.gameLoop();
    }

    setupGameObjects() {
        this.leftPaddle = {
            x: this.PADDLE_MARGIN,
            y: this.HEIGHT / 2 - this.PADDLE_HEIGHT / 2,
            width: this.PADDLE_WIDTH,
            height: this.PADDLE_HEIGHT
        };

        this.rightPaddle = {
            x: this.WIDTH - this.PADDLE_MARGIN - this.PADDLE_WIDTH,
            y: this.HEIGHT / 2 - this.PADDLE_HEIGHT / 2,
            width: this.PADDLE_WIDTH,
            height: this.PADDLE_HEIGHT
        };

        this.resetBall();
    }

    resetBall() {
        const settings = gameState.getDifficultySettings();
        this.ball = {
            x: this.WIDTH / 2 - this.BALL_SIZE / 2,
            y: this.HEIGHT / 2 - this.BALL_SIZE / 2,
            vx: (Math.random() > 0.5 ? 4 : -4) * settings.ballSpeedMultiplier,
            vy: (Math.random() - 0.5) * 4 * settings.ballSpeedMultiplier,
            size: this.BALL_SIZE
        };
    }

    setupControls() {
        this.canvas.addEventListener('mousemove', (e) => {
            if (!gameState.gameRunning || gameState.gamePaused) return;
            
            const rect = this.canvas.getBoundingClientRect();
            let mouseY = e.clientY - rect.top;
            this.leftPaddle.y = mouseY - this.leftPaddle.height / 2;
            
            // Clamp to canvas bounds
            if (this.leftPaddle.y < 0) this.leftPaddle.y = 0;
            if (this.leftPaddle.y + this.leftPaddle.height > this.HEIGHT) {
                this.leftPaddle.y = this.HEIGHT - this.leftPaddle.height;
            }
        });
    }

    rectIntersect(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    updateAI() {
        const settings = gameState.getDifficultySettings();
        
        // AI prediction and reaction
        let targetY;
        if (Math.random() < settings.aiPrediction) {
            // Predict where ball will be
            let ballSteps = Math.abs((this.rightPaddle.x - this.ball.x) / this.ball.vx);
            let predictedY = this.ball.y + (this.ball.vy * ballSteps);
            targetY = predictedY - this.rightPaddle.height / 2;
        } else {
            // Just follow current ball position
            targetY = this.ball.y + this.ball.size / 2 - this.rightPaddle.height / 2;
        }

        // Add some randomness based on difficulty
        if (gameState.difficulty === 'easy') {
            targetY += (Math.random() - 0.5) * 60;
        } else if (gameState.difficulty === 'medium') {
            targetY += (Math.random() - 0.5) * 30;
        }

        // Move towards target with reaction delay
        const diff = targetY - this.rightPaddle.y;
        if (Math.abs(diff) > settings.aiReactionDelay * 100) {
            if (diff > 0) {
                this.rightPaddle.y += Math.min(settings.aiSpeed, diff);
            } else {
                this.rightPaddle.y += Math.max(-settings.aiSpeed, diff);
            }
        }

        // Clamp AI paddle
        if (this.rightPaddle.y < 0) this.rightPaddle.y = 0;
        if (this.rightPaddle.y + this.rightPaddle.height > this.HEIGHT) {
            this.rightPaddle.y = this.HEIGHT - this.rightPaddle.height;
        }
    }

    update() {
        if (!gameState.gameRunning || gameState.gamePaused) return;

        // Move ball
        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;

        // Wall collision
        if (this.ball.y < 0) {
            this.ball.y = 0;
            this.ball.vy *= -1;
        }
        if (this.ball.y + this.ball.size > this.HEIGHT) {
            this.ball.y = this.HEIGHT - this.ball.size;
            this.ball.vy *= -1;
        }

        // Paddle rectangles for collision
        let leftRect = {
            x: this.leftPaddle.x,
            y: this.leftPaddle.y,
            width: this.leftPaddle.width,
            height: this.leftPaddle.height
        };
        let rightRect = {
            x: this.rightPaddle.x,
            y: this.rightPaddle.y,
            width: this.rightPaddle.width,
            height: this.rightPaddle.height
        };
        let ballRect = {
            x: this.ball.x,
            y: this.ball.y,
            width: this.ball.size,
            height: this.ball.size
        };

        // Left paddle collision
        if (this.rectIntersect(ballRect, leftRect) && this.ball.vx < 0) {
            this.ball.x = this.leftPaddle.x + this.leftPaddle.width;
            this.ball.vx *= -1.05; // Slight speed increase
            this.ball.vy += ((this.ball.y + this.ball.size / 2) - (this.leftPaddle.y + this.leftPaddle.height / 2)) * 0.15;
        }

        // Right paddle collision
        if (this.rectIntersect(ballRect, rightRect) && this.ball.vx > 0) {
            this.ball.x = this.rightPaddle.x - this.ball.size;
            this.ball.vx *= -1.05; // Slight speed increase
            this.ball.vy += ((this.ball.y + this.ball.size / 2) - (this.rightPaddle.y + this.rightPaddle.height / 2)) * 0.15;
        }

        // Update AI
        this.updateAI();

        // Score or reset if ball goes off sides
        if (this.ball.x < -this.ball.size) {
            // AI scored
            if (gameState.aiScored()) {
                uiManager.showGameOver(false);
                gameState.endGame();
            } else {
                uiManager.updateScore();
                this.resetBall();
            }
        } else if (this.ball.x > this.WIDTH + this.ball.size) {
            // Player scored
            if (gameState.playerScored()) {
                uiManager.showGameOver(true);
                gameState.endGame();
            } else {
                uiManager.updateScore();
                this.resetBall();
            }
        }
    }

    draw() {
        // Only draw if canvas is visible in the DOM. Use rect and CSS visibility rather than
        // offsetParent which can be null in some layouts.
        let isVisible = true;
        try {
            const cs = getComputedStyle(this.canvas);
            const rect = this.canvas.getBoundingClientRect();
            isVisible = rect.width > 0 && rect.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden';
        } catch (_) { /* fallback to true */ }

        if (!isVisible && gameState.currentScreen !== 'game') {
            try {
                if (window.PongDebug && PongDebug.enabled) {
                    const now = performance.now();
                    if (now - this._lastDebugTick > 750) {
                        this._lastDebugTick = now;
                        PongDebug.log('draw skipped (canvas not visible)', { screen: gameState.currentScreen, paused: gameState.gamePaused, running: gameState.gameRunning });
                        PongDebug.dumpScreens();
                        PongDebug.dumpCanvas();
                    }
                }
            } catch (_) {}
            return;
        }

        this.ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);

        // Draw midline
        this.ctx.strokeStyle = "#333";
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.WIDTH / 2, 0);
        this.ctx.lineTo(this.WIDTH / 2, this.HEIGHT);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Draw paddles
        this.ctx.fillStyle = "#fff";
        this.ctx.fillRect(this.leftPaddle.x, this.leftPaddle.y, this.leftPaddle.width, this.leftPaddle.height);
        this.ctx.fillRect(this.rightPaddle.x, this.rightPaddle.y, this.rightPaddle.width, this.rightPaddle.height);

        // Draw ball
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x + this.ball.size / 2, this.ball.y + this.ball.size / 2, this.ball.size / 2, 0, Math.PI * 2);
        this.ctx.fillStyle = "#fff";
        this.ctx.fill();

        // Draw pause indicator
        if (gameState.gamePaused) {
            this.ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            this.ctx.font = "48px Courier New";
            this.ctx.textAlign = "center";
            this.ctx.fillText("PAUSED", this.WIDTH / 2, this.HEIGHT / 2);
        }

        // Periodic debug snapshot of dynamic values
        try {
            if (window.PongDebug && PongDebug.enabled) {
                const now = performance.now();
                if (now - this._lastDebugTick > 1000) {
                    this._lastDebugTick = now;
                    PongDebug.log('draw tick', {
                        screen: gameState.currentScreen,
                        paused: gameState.gamePaused,
                        running: gameState.gameRunning,
                        ball: { x: Math.round(this.ball.x), y: Math.round(this.ball.y), vx: +this.ball.vx.toFixed(2), vy: +this.ball.vy.toFixed(2) },
                        lp: { y: Math.round(this.leftPaddle.y) },
                        rp: { y: Math.round(this.rightPaddle.y) }
                    });
                }
            }
        } catch (_) {}
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    start() {
        this.setupGameObjects();
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    window.game = new PongGame();
});