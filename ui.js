// UI management
class UIManager {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Difficulty selection
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                gameState.setDifficulty(e.target.dataset.difficulty);
            });
        });

        // Score limit selection
        document.getElementById('scoreLimit').addEventListener('change', (e) => {
            gameState.setScoreLimit(e.target.value);
        });

        // Start game
        document.getElementById('startGameBtn').addEventListener('click', () => {
            this.startGame();
        });

        // View stats
        document.getElementById('viewStatsBtn').addEventListener('click', () => {
            this.showStats();
        });

        // Game controls
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.pauseGame();
        });

        document.getElementById('quitBtn').addEventListener('click', () => {
            this.quitGame();
        });

        // Game over screen
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('mainMenuBtn').addEventListener('click', () => {
            this.showSetupScreen();
        });

        // Stats screen
        document.getElementById('backToMenuBtn').addEventListener('click', () => {
            this.showSetupScreen();
        });

        // Pause screen
        document.getElementById('resumeBtn').addEventListener('click', () => {
            this.resumeGame();
        });

        document.getElementById('pauseQuitBtn').addEventListener('click', () => {
            this.showSetupScreen();
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && gameState.currentScreen === 'game') {
                e.preventDefault();
                this.pauseGame();
            }
            if (e.code === 'Escape') {
                if (gameState.currentScreen === 'game') {
                    this.pauseGame();
                } else if (gameState.currentScreen === 'pause') {
                    this.resumeGame();
                }
            }
        });
    }

    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        document.getElementById(screenName + 'Screen').classList.remove('hidden');
        gameState.currentScreen = screenName;
    }

    startGame() {
        gameState.resetGame();
        this.updateGameUI();
        this.showScreen('game');
        if (window.game) {
            window.game.start();
        }
    }

    pauseGame() {
        gameState.togglePause();
        if (gameState.gamePaused) {
            this.showScreen('pause');
        }
    }

    resumeGame() {
        gameState.togglePause();
        this.showScreen('game');
    }

    quitGame() {
        gameState.gameRunning = false;
        this.showScreen('setup');
    }

    showGameOver(playerWon) {
        const title = document.getElementById('gameOverTitle');
        const finalScore = document.getElementById('finalScore');
        
        title.textContent = playerWon ? 'You Won!' : 'You Lost!';
        title.style.color = playerWon ? '#4CAF50' : '#F44336';
        
        finalScore.innerHTML = `
            Final Score: ${gameState.playerScore} - ${gameState.aiScore}<br>
            Difficulty: ${gameState.difficulty.charAt(0).toUpperCase() + gameState.difficulty.slice(1)}<br>
            Score Limit: ${gameState.scoreLimit}
        `;
        
        this.showScreen('gameOver');
    }

    showStats() {
        const statsContent = document.getElementById('statsContent');
        statsContent.innerHTML = statsManager.getStatsHTML();
        this.showScreen('stats');
    }

    showSetupScreen() {
        gameState.gameRunning = false;
        this.showScreen('setup');
    }

    updateGameUI() {
        document.getElementById('playerScore').textContent = gameState.playerScore;
        document.getElementById('aiScore').textContent = gameState.aiScore;
        document.getElementById('difficultyDisplay').textContent = 
            gameState.difficulty.charAt(0).toUpperCase() + gameState.difficulty.slice(1);
        document.getElementById('scoreLimitDisplay').textContent = gameState.scoreLimit;
    }

    updateScore() {
        this.updateGameUI();
    }
}

// Global UI manager instance
const uiManager = new UIManager();