// Game state management
class GameState {
    constructor() {
        this.currentScreen = 'setup';
        this.difficulty = 'easy';
        this.scoreLimit = 10;
        this.playerScore = 0;
        this.aiScore = 0;
        this.gameStartTime = null;
        this.gamePaused = false;
        this.gameRunning = false;
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
    }

    setScoreLimit(limit) {
        this.scoreLimit = parseInt(limit);
    }

    resetGame() {
        this.playerScore = 0;
        this.aiScore = 0;
        this.gameStartTime = Date.now();
        this.gamePaused = false;
        this.gameRunning = true;
    }

    playerScored() {
        this.playerScore++;
        return this.playerScore >= this.scoreLimit;
    }

    aiScored() {
        this.aiScore++;
        return this.aiScore >= this.scoreLimit;
    }

    togglePause() {
        this.gamePaused = !this.gamePaused;
    }

    endGame() {
        this.gameRunning = false;
        const gameData = {
            difficulty: this.difficulty,
            scoreLimit: this.scoreLimit,
            playerScore: this.playerScore,
            aiScore: this.aiScore,
            playerWon: this.playerScore >= this.scoreLimit,
            duration: Date.now() - this.gameStartTime
        };
        
        // Save to stats
        statsManager.recordGame(gameData);
        
        return gameData;
    }

    getDifficultySettings() {
        const settings = {
            easy: {
                aiSpeed: 2.5,
                aiReactionDelay: 0.3,
                aiPrediction: 0.1,
                ballSpeedMultiplier: 0.8
            },
            medium: {
                aiSpeed: 4,
                aiReactionDelay: 0.15,
                aiPrediction: 0.3,
                ballSpeedMultiplier: 1.0
            },
            hard: {
                aiSpeed: 6,
                aiReactionDelay: 0.05,
                aiPrediction: 0.7,
                ballSpeedMultiplier: 1.3
            }
        };
        
        return settings[this.difficulty];
    }
}

// Global game state instance
const gameState = new GameState();