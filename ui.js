// UI management
class UIManager {
    constructor() {
        this.currentScreen = 'setup';
        this.setupEventListeners();
        this.showScreen('setup'); // Ensure we start on setup screen
        // Initial debug snapshot
        try {
            if (window.PongDebug && PongDebug.enabled) {
                PongDebug.log('UIManager initialized');
                PongDebug.dumpScreens();
                PongDebug.dumpCanvas();
            }
        } catch (_) {}
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
            if (e.code === 'Space' && this.currentScreen === 'game') {
                e.preventDefault();
                this.pauseGame();
            }
            if (e.code === 'Escape') {
                if (this.currentScreen === 'game') {
                    this.pauseGame();
                } else if (this.currentScreen === 'pause') {
                    this.resumeGame();
                }
            }
        });
    }

    showScreen(screenName) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // Show the requested screen
        const targetScreen = document.getElementById(screenName + 'Screen');
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            this.currentScreen = screenName;
            gameState.currentScreen = screenName;
            try {
                if (window.PongDebug && PongDebug.enabled) {
                    PongDebug.log('showScreen ->', screenName);
                    PongDebug.dumpScreens();
                }
            } catch (_) {}
        }
    }

    startGame() {
        gameState.resetGame();
        this.updateGameUI();
        this.showScreen('game');
        if (window.game) {
            window.game.start();
        }
        try { if (window.PongDebug && PongDebug.enabled) PongDebug.log('startGame'); } catch (_) {}
    }

    pauseGame() {
        gameState.togglePause();
        if (gameState.gamePaused) {
            this.showScreen('pause');
        }
        try { if (window.PongDebug && PongDebug.enabled) PongDebug.log('pauseGame ->', gameState.gamePaused); } catch (_) {}
    }

    resumeGame() {
        gameState.togglePause();
        this.showScreen('game');
        try { if (window.PongDebug && PongDebug.enabled) PongDebug.log('resumeGame'); } catch (_) {}
    }

    quitGame() {
        gameState.gameRunning = false;
        gameState.gamePaused = false;
        this.showScreen('setup');
        try { if (window.PongDebug && PongDebug.enabled) PongDebug.log('quitGame'); } catch (_) {}
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
        try { if (window.PongDebug && PongDebug.enabled) PongDebug.log('showGameOver', { playerWon, p: gameState.playerScore, a: gameState.aiScore }); } catch (_) {}
    }

    showStats() {
        const statsContent = document.getElementById('statsContent');
        statsContent.innerHTML = statsManager.getStatsHTML();
        this.showScreen('stats');
        try { if (window.PongDebug && PongDebug.enabled) PongDebug.log('showStats'); } catch (_) {}
    }

    showSetupScreen() {
        gameState.gameRunning = false;
        gameState.gamePaused = false;
        this.showScreen('setup');
        try { if (window.PongDebug && PongDebug.enabled) PongDebug.log('showSetupScreen'); } catch (_) {}
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
        try { if (window.PongDebug && PongDebug.enabled) PongDebug.log('updateScore', { p: gameState.playerScore, a: gameState.aiScore }); } catch (_) {}
    }
}

// Initialize UI manager when DOM loads
let uiManager;
document.addEventListener('DOMContentLoaded', () => {
    uiManager = new UIManager();
});