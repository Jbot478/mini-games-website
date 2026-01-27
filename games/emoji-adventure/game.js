/**
 * Emoji Space Adventure Game
 * A quirky emoji-based space adventure game with multiple levels
 */

// Game Configuration
const CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    PLAYER_SIZE: 48,
    PLAYER_SPEED: 8,
    ENEMY_SIZE: 40,
    TOTAL_LEVELS: 5,
    POINTS_PER_SECOND: 10,
    LEVEL_DURATION: 20000, // 20 seconds per level
};

// Store original config for responsive scaling
const ORIGINAL_CONFIG = { ...CONFIG };

// Enemy ID counter for unique IDs
let enemyIdCounter = 0;

// Adjust canvas size for smaller screens
function adjustCanvasSize() {
    const rect = gameCanvas.getBoundingClientRect();
    if (rect.width < ORIGINAL_CONFIG.CANVAS_WIDTH) {
        const scale = rect.width / ORIGINAL_CONFIG.CANVAS_WIDTH;
        CONFIG.CANVAS_WIDTH = rect.width;
        CONFIG.CANVAS_HEIGHT = rect.height;
        CONFIG.PLAYER_SIZE = Math.floor(ORIGINAL_CONFIG.PLAYER_SIZE * scale);
        CONFIG.ENEMY_SIZE = Math.floor(ORIGINAL_CONFIG.ENEMY_SIZE * scale);
        CONFIG.PLAYER_SPEED = Math.max(4, Math.floor(ORIGINAL_CONFIG.PLAYER_SPEED * scale));
    }
}

// Game State
let gameState = {
    currentLevel: 1,
    score: 0,
    lives: 3,
    isPlaying: false,
    playerPosition: { x: 0, y: 0 },
    enemies: [],
    keys: {},
    lastScoreUpdate: Date.now(),
    levelStartTime: Date.now(),
};

// Screen Elements
const screens = {
    intro: document.getElementById('intro-screen'),
    game: document.getElementById('game-screen'),
    win: document.getElementById('win-screen'),
    gameover: document.getElementById('gameover-screen'),
    levelComplete: document.getElementById('level-complete'),
};

// UI Elements
const gameCanvas = document.getElementById('game-canvas');
const levelDisplay = document.getElementById('level-display');
const scoreDisplay = document.getElementById('score-display');
const livesDisplay = document.getElementById('lives-display');
const finalScoreDisplay = document.getElementById('final-score');
const gameoverScoreDisplay = document.getElementById('gameover-score');

// Buttons
const startButton = document.getElementById('start-button');
const playAgainButton = document.getElementById('play-again-button');
const retryButton = document.getElementById('retry-button');

// Player Element
let playerElement = null;

/**
 * Initialize the game
 */
function init() {
    // Add event listeners
    startButton.addEventListener('click', startGame);
    playAgainButton.addEventListener('click', resetAndStart);
    retryButton.addEventListener('click', resetAndStart);
    
    // Keyboard controls
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
}

/**
 * Handle keydown events
 */
function handleKeyDown(e) {
    if (!gameState.isPlaying) return;
    
    // Prevent default arrow key scrolling
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }
    
    gameState.keys[e.key] = true;
}

/**
 * Handle keyup events
 */
function handleKeyUp(e) {
    gameState.keys[e.key] = false;
}

/**
 * Start the game
 */
function startGame() {
    // Adjust canvas size for responsive design
    adjustCanvasSize();
    
    // Hide intro, show game
    screens.intro.classList.add('hidden');
    screens.game.classList.remove('hidden');
    
    // Initialize game state
    gameState.isPlaying = true;
    gameState.levelStartTime = Date.now();
    
    // Create player
    createPlayer();
    
    // Start first level
    startLevel(gameState.currentLevel);
    
    // Start game loop
    requestAnimationFrame(gameLoop);
}

/**
 * Create the player emoji
 */
function createPlayer() {
    if (!playerElement) {
        playerElement = document.createElement('div');
        playerElement.classList.add('player');
        playerElement.textContent = '🧑‍🚀';
        gameCanvas.appendChild(playerElement);
    }
    
    // Set initial position (bottom center)
    gameState.playerPosition = {
        x: (CONFIG.CANVAS_WIDTH - CONFIG.PLAYER_SIZE) / 2,
        y: CONFIG.CANVAS_HEIGHT - CONFIG.PLAYER_SIZE - 20
    };
    
    updatePlayerPosition();
}

/**
 * Update player position on screen
 */
function updatePlayerPosition() {
    if (playerElement) {
        playerElement.style.left = gameState.playerPosition.x + 'px';
        playerElement.style.top = gameState.playerPosition.y + 'px';
    }
}

/**
 * Start a new level
 */
function startLevel(level) {
    gameState.currentLevel = level;
    gameState.levelStartTime = Date.now();
    levelDisplay.textContent = level;
    
    // Clear existing enemies
    clearEnemies();
    
    // Spawn enemies based on level (more enemies = harder)
    const enemyCount = 3 + level * 2;
    spawnEnemies(enemyCount);
}

/**
 * Spawn enemies
 */
function spawnEnemies(count) {
    const enemyEmojis = ['🐛', '👾', '👽', '🦠', '☄️'];
    
    for (let i = 0; i < count; i++) {
        const enemy = {
            id: ++enemyIdCounter,
            x: Math.random() * (CONFIG.CANVAS_WIDTH - CONFIG.ENEMY_SIZE),
            y: Math.random() * (CONFIG.CANVAS_HEIGHT * 0.6), // Keep in upper area
            velocityX: (Math.random() - 0.5) * (2 + gameState.currentLevel * 0.5),
            velocityY: (Math.random() - 0.5) * (2 + gameState.currentLevel * 0.5),
            emoji: enemyEmojis[Math.floor(Math.random() * enemyEmojis.length)],
            element: null
        };
        
        // Create enemy element
        enemy.element = document.createElement('div');
        enemy.element.classList.add('enemy');
        enemy.element.textContent = enemy.emoji;
        enemy.element.style.left = enemy.x + 'px';
        enemy.element.style.top = enemy.y + 'px';
        
        gameCanvas.appendChild(enemy.element);
        gameState.enemies.push(enemy);
    }
}

/**
 * Clear all enemies
 */
function clearEnemies() {
    gameState.enemies.forEach(enemy => {
        if (enemy.element && enemy.element.parentNode === gameCanvas) {
            gameCanvas.removeChild(enemy.element);
        }
    });
    gameState.enemies = [];
}

/**
 * Main game loop
 */
function gameLoop() {
    if (!gameState.isPlaying) return;
    
    // Update player movement
    updatePlayer();
    
    // Update enemies
    updateEnemies();
    
    // Update score
    updateScore();
    
    // Check for level completion
    checkLevelComplete();
    
    // Check collisions
    checkCollisions();
    
    // Continue loop
    requestAnimationFrame(gameLoop);
}

/**
 * Update player based on keyboard input
 */
function updatePlayer() {
    const pos = gameState.playerPosition;
    
    // Move up
    if (gameState.keys['ArrowUp']) {
        pos.y = Math.max(0, pos.y - CONFIG.PLAYER_SPEED);
    }
    
    // Move down
    if (gameState.keys['ArrowDown']) {
        pos.y = Math.min(CONFIG.CANVAS_HEIGHT - CONFIG.PLAYER_SIZE, pos.y + CONFIG.PLAYER_SPEED);
    }
    
    // Move left
    if (gameState.keys['ArrowLeft']) {
        pos.x = Math.max(0, pos.x - CONFIG.PLAYER_SPEED);
    }
    
    // Move right
    if (gameState.keys['ArrowRight']) {
        pos.x = Math.min(CONFIG.CANVAS_WIDTH - CONFIG.PLAYER_SIZE, pos.x + CONFIG.PLAYER_SPEED);
    }
    
    updatePlayerPosition();
}

/**
 * Update enemy positions
 */
function updateEnemies() {
    gameState.enemies.forEach(enemy => {
        // Update position
        enemy.x += enemy.velocityX;
        enemy.y += enemy.velocityY;
        
        // Bounce off walls
        if (enemy.x <= 0 || enemy.x >= CONFIG.CANVAS_WIDTH - CONFIG.ENEMY_SIZE) {
            enemy.velocityX *= -1;
            enemy.x = Math.max(0, Math.min(CONFIG.CANVAS_WIDTH - CONFIG.ENEMY_SIZE, enemy.x));
        }
        
        if (enemy.y <= 0 || enemy.y >= CONFIG.CANVAS_HEIGHT - CONFIG.ENEMY_SIZE) {
            enemy.velocityY *= -1;
            enemy.y = Math.max(0, Math.min(CONFIG.CANVAS_HEIGHT - CONFIG.ENEMY_SIZE, enemy.y));
        }
        
        // Update element position
        if (enemy.element) {
            enemy.element.style.left = enemy.x + 'px';
            enemy.element.style.top = enemy.y + 'px';
        }
    });
}

/**
 * Update score (increases over time)
 */
function updateScore() {
    const now = Date.now();
    const elapsed = now - gameState.lastScoreUpdate;
    
    if (elapsed >= 1000) { // Update every second
        gameState.score += CONFIG.POINTS_PER_SECOND;
        gameState.lastScoreUpdate = now;
        scoreDisplay.textContent = gameState.score;
    }
}

/**
 * Check if level is complete
 */
function checkLevelComplete() {
    const elapsed = Date.now() - gameState.levelStartTime;
    
    if (elapsed >= CONFIG.LEVEL_DURATION) {
        // Level complete!
        if (gameState.currentLevel >= CONFIG.TOTAL_LEVELS) {
            // Game won!
            winGame();
        } else {
            // Next level
            showLevelComplete();
        }
    }
}

/**
 * Show level complete message and advance to next level
 */
function showLevelComplete() {
    gameState.isPlaying = false;
    screens.levelComplete.classList.remove('hidden');
    
    // Bonus points for completing level
    gameState.score += 100 * gameState.currentLevel;
    scoreDisplay.textContent = gameState.score;
    
    setTimeout(() => {
        screens.levelComplete.classList.add('hidden');
        gameState.isPlaying = true;
        startLevel(gameState.currentLevel + 1);
        requestAnimationFrame(gameLoop);
    }, 2000);
}

/**
 * Check for collisions between player and enemies
 */
function checkCollisions() {
    const player = {
        x: gameState.playerPosition.x,
        y: gameState.playerPosition.y,
        width: CONFIG.PLAYER_SIZE,
        height: CONFIG.PLAYER_SIZE
    };
    
    gameState.enemies.forEach(enemy => {
        const enemyBox = {
            x: enemy.x,
            y: enemy.y,
            width: CONFIG.ENEMY_SIZE,
            height: CONFIG.ENEMY_SIZE
        };
        
        if (isColliding(player, enemyBox)) {
            handleCollision();
        }
    });
}

/**
 * Check if two boxes are colliding
 */
function isColliding(box1, box2) {
    return box1.x < box2.x + box2.width &&
           box1.x + box1.width > box2.x &&
           box1.y < box2.y + box2.height &&
           box1.y + box1.height > box2.y;
}

/**
 * Handle collision with enemy
 */
function handleCollision() {
    gameState.lives--;
    updateLivesDisplay();
    
    // Flash effect
    if (playerElement) {
        playerElement.style.opacity = '0.3';
        setTimeout(() => {
            if (playerElement) {
                playerElement.style.opacity = '1';
            }
        }, 500);
    }
    
    // Check for game over
    if (gameState.lives <= 0) {
        gameOver();
    } else {
        // Reset player position
        gameState.playerPosition = {
            x: (CONFIG.CANVAS_WIDTH - CONFIG.PLAYER_SIZE) / 2,
            y: CONFIG.CANVAS_HEIGHT - CONFIG.PLAYER_SIZE - 20
        };
        updatePlayerPosition();
    }
}

/**
 * Update lives display
 */
function updateLivesDisplay() {
    const hearts = '❤️'.repeat(Math.max(0, gameState.lives));
    livesDisplay.textContent = hearts || '';
}

/**
 * Win the game
 */
function winGame() {
    gameState.isPlaying = false;
    finalScoreDisplay.textContent = gameState.score;
    
    screens.game.classList.add('hidden');
    screens.win.classList.remove('hidden');
}

/**
 * Game over
 */
function gameOver() {
    gameState.isPlaying = false;
    gameoverScoreDisplay.textContent = gameState.score;
    
    screens.game.classList.add('hidden');
    screens.gameover.classList.remove('hidden');
}

/**
 * Reset game and start over
 */
function resetAndStart() {
    // Reset game state
    gameState = {
        currentLevel: 1,
        score: 0,
        lives: 3,
        isPlaying: false,
        playerPosition: { x: 0, y: 0 },
        enemies: [],
        keys: {},
        lastScoreUpdate: Date.now(),
        levelStartTime: Date.now(),
    };
    
    // Clear enemies
    clearEnemies();
    
    // Reset displays
    scoreDisplay.textContent = '0';
    levelDisplay.textContent = '1';
    updateLivesDisplay();
    
    // Hide all screens except intro
    screens.win.classList.add('hidden');
    screens.gameover.classList.add('hidden');
    screens.levelComplete.classList.add('hidden');
    screens.intro.classList.remove('hidden');
    screens.game.classList.add('hidden');
}

// Initialize the game when page loads
init();
