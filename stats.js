// Statistics management
class StatsManager {
    constructor() {
        this.loadStats();
    }

    loadStats() {
        const saved = localStorage.getItem('pongStats');
        this.stats = saved ? JSON.parse(saved) : {
            gamesPlayed: 0,
            gamesWon: 0,
            gamesLost: 0,
            totalPlayTime: 0,
            bestWinStreak: 0,
            currentWinStreak: 0,
            difficultyStats: {
                easy: { played: 0, won: 0 },
                medium: { played: 0, won: 0 },
                hard: { played: 0, won: 0 }
            },
            scoreLimitStats: {
                5: { played: 0, won: 0 },
                10: { played: 0, won: 0 },
                15: { played: 0, won: 0 },
                21: { played: 0, won: 0 }
            }
        };
    }

    saveStats() {
        localStorage.setItem('pongStats', JSON.stringify(this.stats));
    }

    recordGame(gameData) {
        this.stats.gamesPlayed++;
        this.stats.totalPlayTime += gameData.duration;

        // Difficulty stats
        this.stats.difficultyStats[gameData.difficulty].played++;
        
        // Score limit stats
        this.stats.scoreLimitStats[gameData.scoreLimit].played++;

        if (gameData.playerWon) {
            this.stats.gamesWon++;
            this.stats.currentWinStreak++;
            this.stats.bestWinStreak = Math.max(this.stats.bestWinStreak, this.stats.currentWinStreak);
            this.stats.difficultyStats[gameData.difficulty].won++;
            this.stats.scoreLimitStats[gameData.scoreLimit].won++;
        } else {
            this.stats.gamesLost++;
            this.stats.currentWinStreak = 0;
        }

        this.saveStats();
    }

    getWinRate() {
        if (this.stats.gamesPlayed === 0) return 0;
        return Math.round((this.stats.gamesWon / this.stats.gamesPlayed) * 100);
    }

    getAverageGameTime() {
        if (this.stats.gamesPlayed === 0) return 0;
        return Math.round(this.stats.totalPlayTime / this.stats.gamesPlayed / 1000);
    }

    getDifficultyWinRate(difficulty) {
        const diffStats = this.stats.difficultyStats[difficulty];
        if (diffStats.played === 0) return 0;
        return Math.round((diffStats.won / diffStats.played) * 100);
    }

    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    getStatsHTML() {
        return `
            <div><strong>Games Played:</strong> ${this.stats.gamesPlayed}</div>
            <div><strong>Games Won:</strong> ${this.stats.gamesWon}</div>
            <div><strong>Games Lost:</strong> ${this.stats.gamesLost}</div>
            <div><strong>Win Rate:</strong> ${this.getWinRate()}%</div>
            <div><strong>Current Win Streak:</strong> ${this.stats.currentWinStreak}</div>
            <div><strong>Best Win Streak:</strong> ${this.stats.bestWinStreak}</div>
            <div><strong>Total Play Time:</strong> ${this.formatTime(this.stats.totalPlayTime)}</div>
            <div><strong>Average Game Time:</strong> ${this.getAverageGameTime()}s</div>
            <div><strong>Easy Win Rate:</strong> ${this.getDifficultyWinRate('easy')}% (${this.stats.difficultyStats.easy.won}/${this.stats.difficultyStats.easy.played})</div>
            <div><strong>Medium Win Rate:</strong> ${this.getDifficultyWinRate('medium')}% (${this.stats.difficultyStats.medium.won}/${this.stats.difficultyStats.medium.played})</div>
            <div><strong>Hard Win Rate:</strong> ${this.getDifficultyWinRate('hard')}% (${this.stats.difficultyStats.hard.won}/${this.stats.difficultyStats.hard.played})</div>
        `;
    }
}

// Global stats manager instance
const statsManager = new StatsManager();