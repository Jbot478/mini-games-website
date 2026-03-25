// Main Game File - Rua vs Space Cats (WITH LEVEL NAVIGATION)
class RuaVsSpaceCats {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Initialize systems
        this.dialogue = new DialogueSystem(this.canvas, this.ctx);
        this.transition = new TransitionSystem(this.canvas, this.ctx);
        this.cutscene = new CutsceneManager(this.canvas, this.ctx);

        // Game state
        this.currentLevelIndex = 0;
        this.levels = [];
        this.currentLevel = null;
        this.gameState = 'loading';

        // Delta time
        this.lastTime = 0;
        this.deltaTime = 0;

        // Navigation
        this.showNavigation = true;

        this.initLevels();
        this.loadGame();
    }

    resizeCanvas() {
        this.canvas.width = 1200;
        this.canvas.height = 800;
    }

    initLevels() {
        this.levels = [
            { class: Level00_Opening, name: 'Opening' },
            { class: Level01_Space, name: 'Space Flight' },
            { class: Level02_SpaceCombat, name: 'Zero Gravity, Zero Patience' },
            { class: Level03_Jungle, name: 'Crash Landing on Planet Cat' },
            { class: Level04_Village, name: 'The Village Where Nothing Happens' },
            { class: Level05_BeeHouse, name: 'Stoner Cats & The Bee Problem' },
            { class: Level06_Mountain, name: 'The Mountain That Hates You' },
            { class: Level07_Servants, name: 'Servants With Hands' },
            { class: Level08_Office, name: 'The Office of Secrets' },
            { class: Level09_Flight, name: 'Thrown Like Trash' },
            { class: Level10_Ocean, name: 'The Ocean Trial' },
            { class: Level11_Return, name: 'Back To Settle It' },
            { class: Level12_FinalBoss, name: 'Space, But Personal' }
        ];
    }

    loadGame() {
        const savedLevel = saveSystem.getCurrentLevel();
        this.currentLevelIndex = savedLevel;

        console.log(`🎮 Loading from Level ${this.currentLevelIndex}`);

        setTimeout(() => {
            document.getElementById('loadingScreen').style.display = 'none';
            this.startLevel(this.currentLevelIndex);
        }, 1000);
    }

    startLevel(levelIndex) {
        if (levelIndex >= this.levels.length) {
            this.gameComplete();
            return;
        }

        console.log(`🎬 Starting Level ${levelIndex}: ${this.levels[levelIndex].name}`);

        const LevelClass = this.levels[levelIndex].class;
        this.currentLevel = new LevelClass(this.canvas, this.ctx);
        this.currentLevel.init(this.dialogue);
        this.currentLevelIndex = levelIndex;
        this.gameState = 'playing';

        if (levelIndex > 0) {
            this.transition.start('fade_black', null, {
                duration: 2000,
                title: this.levels[levelIndex].name.toUpperCase()
            });
        }

        if (!this.isRunning) {
            this.isRunning = true;
            this.gameLoop();
        }
    }

    gameLoop(timestamp = 0) {
        if (!this.isRunning) return;

        this.deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update();
        this.draw();

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    update() {
        if (this.gameState !== 'playing') return;

        const input = inputSystem.getMovement();

        if (this.transition.isActive()) {
            this.transition.update();
            return;
        }

        if (this.cutscene.isActive()) {
            this.cutscene.update(this.deltaTime);
            return;
        }

        if (this.currentLevel) {
            this.currentLevel.update(input, this.deltaTime);

            // Check if Rua died - restart the level
            if (this.currentLevel.isDead && this.currentLevel.isDead()) {
                console.log(`💀 Level ${this.currentLevelIndex} restarting - Rua died!`);
                this.startLevel(this.currentLevelIndex);
            }
            // Check if level is complete - advance to next
            else if (this.currentLevel.isComplete()) {
                this.completeLevel();
            }
        }
    }

    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.currentLevel) {
            this.currentLevel.draw();
        }

        if (this.cutscene.isActive()) {
            this.cutscene.draw();
        }

        if (this.transition.isActive()) {
            this.transition.draw();
        }

        // Draw navigation UI
        if (this.showNavigation && !this.dialogue.isActive && !this.transition.isActive()) {
            this.drawNavigation();
        }

        if (window.DEBUG_MODE) {
            this.drawDebugInfo();
        }
    }

    drawNavigation() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Background panel
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(w - 220, 10, 210, 120);

        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`Level ${this.currentLevelIndex}/${this.levels.length - 1}`, w - 210, 30);
        ctx.font = '12px Arial';
        ctx.fillText(this.levels[this.currentLevelIndex].name.substring(0, 20), w - 210, 50);

        // Previous button
        if (this.currentLevelIndex > 0) {
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(w - 210, 65, 90, 30);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('◄ PREV', w - 165, 85);
        }

        // Next button
        if (this.currentLevelIndex < this.levels.length - 1) {
            ctx.fillStyle = '#2196F3';
            ctx.fillRect(w - 110, 65, 90, 30);
            ctx.fillStyle = 'white';
            ctx.fillText('NEXT ►', w - 65, 85);
        }

        // Reset button
        ctx.fillStyle = '#f44336';
        ctx.fillRect(w - 210, 100, 190, 25);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('RESET SAVE', w - 115, 115);

        ctx.textAlign = 'left';

        // Instructions
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '10px Arial';
        ctx.fillText('Click buttons to navigate', w - 210, h - 10);
    }

    completeLevel() {
        console.log(`✅ Level ${this.currentLevelIndex} complete!`);

        saveSystem.save(this.currentLevelIndex + 1);

        const transitionType = this.getTransitionType(this.currentLevelIndex);

        this.transition.start(transitionType, () => {
            this.startLevel(this.currentLevelIndex + 1);
        }, { duration: 1500 });

        audioSystem.stopMusic(true);
    }

    getTransitionType(levelIndex) {
        switch(levelIndex) {
            case 1:
            case 8:
                return 'white_flash';
            default:
                return 'fade_black';
        }
    }

    gameComplete() {
        console.log('🎉 GAME COMPLETE!');
        this.gameState = 'complete';

        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 48px "Comic Sans MS", cursive';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🎉 CONGRATULATIONS! 🎉', this.canvas.width / 2, this.canvas.height / 2 - 100);

        this.ctx.font = '32px "Comic Sans MS", cursive';
        this.ctx.fillText('Rua has defeated Sprinkles!', this.canvas.width / 2, this.canvas.height / 2);

        this.ctx.font = '24px Arial';
        this.ctx.fillText('Press ENTER to return to main menu', this.canvas.width / 2, this.canvas.height / 2 + 100);

        this.ctx.textAlign = 'left';

        const checkReturn = () => {
            if (inputSystem.keys.enter) {
                this.returnToMenu();
            } else {
                requestAnimationFrame(checkReturn);
            }
        };
        checkReturn();
    }

    returnToMenu() {
        console.log('🏠 Returning to menu');
        window.location.href = '../../index.html';
    }

    // Navigate to previous level
    goToPreviousLevel() {
        if (this.currentLevelIndex > 0) {
            audioSystem.stopMusic();
            this.startLevel(this.currentLevelIndex - 1);
        }
    }

    // Navigate to next level
    goToNextLevel() {
        if (this.currentLevelIndex < this.levels.length - 1) {
            audioSystem.stopMusic();
            this.startLevel(this.currentLevelIndex + 1);
        }
    }

    // Reset save and start from beginning
    resetSave() {
        if (confirm('Reset save data and start from the beginning?')) {
            saveSystem.reset();
            audioSystem.stopMusic();
            this.startLevel(0);
        }
    }

    drawDebugInfo() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 250, 100);

        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '14px monospace';
        this.ctx.fillText(`Level: ${this.currentLevelIndex}/${this.levels.length - 1}`, 20, 30);
        this.ctx.fillText(`FPS: ${Math.round(1000 / this.deltaTime)}`, 20, 50);
        this.ctx.fillText(`State: ${this.gameState}`, 20, 70);

        if (this.currentLevel && this.currentLevel.state) {
            this.ctx.fillText(`Phase: ${this.currentLevel.state}`, 20, 90);
        }
    }

    skipToLevel(levelIndex) {
        if (levelIndex >= 0 && levelIndex < this.levels.length) {
            this.startLevel(levelIndex);
        }
    }

    toggleDebug() {
        window.DEBUG_MODE = !window.DEBUG_MODE;
    }
}

// Wait for DOM to load
window.addEventListener('DOMContentLoaded', () => {
    console.log('🐕 Starting Rua vs Space Cats...');

    window.game = new RuaVsSpaceCats();

    // Click handlers for navigation
    document.getElementById('gameCanvas').addEventListener('click', (e) => {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Scale to canvas coordinates
        const canvasX = (x / rect.width) * 1200;
        const canvasY = (y / rect.height) * 800;

        // Let the active level handle click interactions first (e.g., puzzle cards)
        if (window.game.currentLevel && typeof window.game.currentLevel.handleClick === 'function') {
            const handled = window.game.currentLevel.handleClick(canvasX, canvasY);
            if (handled) {
                return;
            }
        }

        // Check button clicks
        // Previous button: 990-1080, 65-95
        if (canvasX >= 990 && canvasX <= 1080 && canvasY >= 65 && canvasY <= 95) {
            window.game.goToPreviousLevel();
        }

        // Next button: 1090-1180, 65-95
        if (canvasX >= 1090 && canvasX <= 1180 && canvasY >= 65 && canvasY <= 95) {
            window.game.goToNextLevel();
        }

        // Reset button: 990-1180, 100-125
        if (canvasX >= 990 && canvasX <= 1180 && canvasY >= 100 && canvasY <= 125) {
            window.game.resetSave();
        }
    });

    // Debug controls
    window.addEventListener('keydown', (e) => {
        if (e.key === 'D' && e.shiftKey) {
            window.game.toggleDebug();
        }

        if (window.DEBUG_MODE && e.key >= '0' && e.key <= '9') {
            const level = parseInt(e.key);
            if (e.shiftKey) {
                window.game.skipToLevel(level + 10);
            } else {
                window.game.skipToLevel(level);
            }
        }
    });

    console.log('💡 Debug Mode: Press Shift+D to toggle');
    console.log('💡 Navigation: Click buttons in top-right corner');
});
