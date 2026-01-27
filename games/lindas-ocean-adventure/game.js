/**
 * Linda's Ocean Adventure Game
 * A quirky ocean-based adventure game with Linda the fish
 */

// Game Configuration
const CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    PLAYER_SIZE: 48,
    PLAYER_SPEED: 8,
    ENEMY_SIZE: 40,
    PELLET_SIZE: 30,
    TOTAL_LEVELS: 6, // 5 regular levels + 1 boss level
    POINTS_PER_PELLET: 50,
    PELLETS_PER_LEVEL: 8,
    FORWARD_SCROLL_SPEED: 2,
    DANGER_ZONE_BASE: 10, // Base height of danger zone (small at start)
    DANGER_ZONE_INCREASE: 40, // Pixels to increase per level
};

// Game State
let gameState = {
    currentLevel: 1,
    score: 0,
    pelletsCollected: 0,
    lives: 3,
    isPlaying: false,
    isPaused: false,
    playerPosition: { x: 0, y: 0 },
    enemies: [],
    collectibles: [],
    bubbles: [],
    boss: null,
    keys: {},
    lastScoreUpdate: Date.now(),
    levelStartTime: Date.now(),
    scrollOffset: 0,
    dangerZoneHeight: CONFIG.DANGER_ZONE_BASE,
    canShoot: false,
    lastShotTime: 0,
    lastCollisionTime: 0, // Track last collision to prevent multiple hits
};

// Screen Elements
const screens = {
    intro: document.getElementById('intro-screen'),
    game: document.getElementById('game-screen'),
    win: document.getElementById('win-screen'),
    gameover: document.getElementById('gameover-screen'),
    levelComplete: document.getElementById('level-complete'),
    levelFailed: document.getElementById('level-failed'),
    powerUp: document.getElementById('power-up'),
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
const nextLevelButton = document.getElementById('next-level-button');
const retryLevelButton = document.getElementById('retry-level-button');
const quitLevelButton = document.getElementById('quit-level-button');
const startBossButton = document.getElementById('start-boss-button');

// Player Element
let playerElement = null;
let backgroundMusic = null;
let currentMusicOscillators = [];
let musicIntervalId = null;

/**
 * Stop current background music
 */
function stopBackgroundMusic() {
    currentMusicOscillators.forEach(osc => {
        try {
            osc.stop();
        } catch (e) {}
    });
    currentMusicOscillators = [];
    
    // Clear the music interval
    if (musicIntervalId) {
        clearInterval(musicIntervalId);
        musicIntervalId = null;
    }
}

/**
 * Create background music for regular levels (calm and cute)
 */
function createRegularLevelMusic() {
    stopBackgroundMusic();
    
    if (!backgroundMusic) {
        backgroundMusic = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Create a more interesting melody that cycles through different patterns
    const melodies = [
        [262, 330, 392, 330], // C4, E4, G4, E4
        [294, 349, 440, 349], // D4, F4, A4, F4
        [330, 392, 494, 392], // E4, G4, B4, G4
    ];
    let melodyIndex = 0;
    let noteIndex = 0;
    
    // Tempo increases slightly per level (base 300ms, decreases by 30ms per level)
    const tempo = Math.max(150, 300 - (gameState.currentLevel - 1) * 30);
    
    const playNote = () => {
        // Switch melody every 4 notes
        const notes = melodies[melodyIndex % melodies.length];
        if (noteIndex > 0 && noteIndex % 4 === 0) {
            melodyIndex++;
        }
        
        const osc = backgroundMusic.createOscillator();
        const gain = backgroundMusic.createGain();
        
        osc.connect(gain);
        gain.connect(backgroundMusic.destination);
        
        osc.frequency.value = notes[noteIndex % notes.length];
        osc.type = 'sine'; // Sine wave for calm, smooth sound
        
        gain.gain.setValueAtTime(0.15, backgroundMusic.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.05, backgroundMusic.currentTime + (tempo / 1000 * 0.8));
        
        osc.start();
        osc.stop(backgroundMusic.currentTime + (tempo / 1000 * 0.8));
        
        currentMusicOscillators.push(osc);
        noteIndex++;
    };
    
    // Play notes using the calculated tempo
    musicIntervalId = setInterval(playNote, tempo);
}

/**
 * Create background music for boss level (intense)
 */
function createBossMusic() {
    stopBackgroundMusic();
    
    if (!backgroundMusic) {
        backgroundMusic = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Create fast, exciting battle music with multiple layers
    // Layer 1: Fast bass drum pattern
    const playBassDrum = () => {
        const bassOsc = backgroundMusic.createOscillator();
        const bassGain = backgroundMusic.createGain();
        
        bassOsc.connect(bassGain);
        bassGain.connect(backgroundMusic.destination);
        
        bassOsc.frequency.value = 60; // Very low bass
        bassOsc.type = 'sine';
        
        bassGain.gain.setValueAtTime(0.2, backgroundMusic.currentTime);
        bassGain.gain.exponentialRampToValueAtTime(0.03, backgroundMusic.currentTime + 0.15);
        
        bassOsc.start(backgroundMusic.currentTime);
        bassOsc.stop(backgroundMusic.currentTime + 0.15);
        
        currentMusicOscillators.push(bassOsc);
    };
    
    // Layer 2: Mid-range melodic stabs
    const playMidStab = (freq) => {
        const stab = backgroundMusic.createOscillator();
        const stabGain = backgroundMusic.createGain();
        
        stab.connect(stabGain);
        stabGain.connect(backgroundMusic.destination);
        
        stab.frequency.value = freq;
        stab.type = 'square';
        
        stabGain.gain.setValueAtTime(0.15, backgroundMusic.currentTime);
        stabGain.gain.exponentialRampToValueAtTime(0.02, backgroundMusic.currentTime + 0.12);
        
        stab.start(backgroundMusic.currentTime);
        stab.stop(backgroundMusic.currentTime + 0.12);
        
        currentMusicOscillators.push(stab);
    };
    
    // Layer 3: High piercing accent
    const playHighAccent = (freq) => {
        const high = backgroundMusic.createOscillator();
        const highGain = backgroundMusic.createGain();
        
        high.connect(highGain);
        highGain.connect(backgroundMusic.destination);
        
        high.frequency.value = freq;
        high.type = 'triangle';
        
        highGain.gain.setValueAtTime(0.12, backgroundMusic.currentTime);
        highGain.gain.exponentialRampToValueAtTime(0.01, backgroundMusic.currentTime + 0.1);
        
        high.start(backgroundMusic.currentTime);
        high.stop(backgroundMusic.currentTime + 0.1);
        
        currentMusicOscillators.push(high);
    };
    
    // Play pattern with varied melody and accents
    let beatCount = 0;
    musicIntervalId = setInterval(() => {
        playBassDrum(); // Bass drum on every beat
        
        const pattern = beatCount % 8;
        
        if (pattern === 0 || pattern === 4) {
            // Ascending sequence
            setTimeout(() => playMidStab(196), 40);  // G3
            setTimeout(() => playMidStab(262), 75);  // C4
            setTimeout(() => playHighAccent(392), 110); // G4
        } else if (pattern === 1 || pattern === 5) {
            // High descending
            setTimeout(() => playHighAccent(659), 40);  // E5
            setTimeout(() => playHighAccent(523), 75);  // C5
            setTimeout(() => playMidStab(330), 110); // E4
        } else if (pattern === 2 || pattern === 6) {
            // Mid-range stab
            setTimeout(() => playMidStab(349), 50);  // F4
            setTimeout(() => playHighAccent(587), 100); // D5
        } else if (pattern === 3 || pattern === 7) {
            // Complex pattern
            setTimeout(() => playHighAccent(698), 30);  // F5
            setTimeout(() => playMidStab(294), 65);  // D4
            setTimeout(() => playHighAccent(880), 100); // A5
        }
        
        beatCount++;
    }, 150); // Fast tempo for intensity
}

/**
 * Create winning music (happy celebration)
 */
function createWinMusic() {
    stopBackgroundMusic();
    
    if (!backgroundMusic) {
        backgroundMusic = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Victory fanfare
    const notes = [523, 587, 659, 698, 784]; // C5, D5, E5, F5, G5
    
    notes.forEach((freq, i) => {
        const osc = backgroundMusic.createOscillator();
        const gain = backgroundMusic.createGain();
        
        osc.connect(gain);
        gain.connect(backgroundMusic.destination);
        
        osc.frequency.value = freq;
        osc.type = 'square';
        
        const startTime = backgroundMusic.currentTime + (i * 0.2);
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
        
        osc.start(startTime);
        osc.stop(startTime + 0.4);
        
        currentMusicOscillators.push(osc);
    });
}

/**
 * Toggle pause state
 */
function togglePause() {
    gameState.isPaused = !gameState.isPaused;
    
    if (gameState.isPaused) {
        // Show pause overlay
        const pauseOverlay = document.createElement('div');
        pauseOverlay.id = 'pause-overlay';
        pauseOverlay.style.position = 'absolute';
        pauseOverlay.style.top = '0';
        pauseOverlay.style.left = '0';
        pauseOverlay.style.width = '100%';
        pauseOverlay.style.height = '100%';
        pauseOverlay.style.background = 'rgba(0, 0, 0, 0.7)';
        pauseOverlay.style.display = 'flex';
        pauseOverlay.style.justifyContent = 'center';
        pauseOverlay.style.alignItems = 'center';
        pauseOverlay.style.zIndex = '200';
        
        const pauseText = document.createElement('div');
        pauseText.style.fontSize = '3rem';
        pauseText.style.color = 'white';
        pauseText.style.textAlign = 'center';
        pauseText.style.fontWeight = 'bold';
        pauseText.innerHTML = '⏸️ PAUSED<br><span style="font-size: 1.5rem; margin-top: 20px; display: block;">Press ENTER to resume</span>';
        
        pauseOverlay.appendChild(pauseText);
        gameCanvas.appendChild(pauseOverlay);
    } else {
        // Remove pause overlay
        const pauseOverlay = document.getElementById('pause-overlay');
        if (pauseOverlay) {
            gameCanvas.removeChild(pauseOverlay);
        }
        // Resume game loop
        requestAnimationFrame(gameLoop);
    }
}

/**
 * Initialize the game
 */
function init() {
    // Add event listeners
    startButton.addEventListener('click', startGame);
    playAgainButton.addEventListener('click', resetAndStart);
    retryButton.addEventListener('click', resetAndStart);
    nextLevelButton.addEventListener('click', nextLevel);
    retryLevelButton.addEventListener('click', retryCurrentLevel);
    quitLevelButton.addEventListener('click', resetAndStart);
    startBossButton.addEventListener('click', startBossFight);
    
    // Add level skip buttons outside play area
    const createLevelButton = (label, direction) => {
        const btn = document.createElement('button');
        btn.textContent = label;
        btn.style.position = 'fixed';
        btn.style.top = '50%';
        btn.style.transform = 'translateY(-50%)';
        btn.style.zIndex = '300';
        btn.style.padding = '10px 15px';
        btn.style.fontSize = '1.2rem';
        btn.style.background = 'rgba(100, 150, 255, 0.8)';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.borderRadius = '10px';
        btn.style.cursor = 'pointer';
        btn.style.display = 'none';
        btn.style.fontWeight = 'bold';
        
        if (direction === 'next') {
            btn.style.right = '10px';
            btn.addEventListener('click', nextLevel);
        } else {
            btn.style.left = '10px';
            btn.addEventListener('click', () => {
                if (gameState.currentLevel > 1) {
                    gameState.currentLevel -= 2;
                    nextLevel();
                }
            });
        }
        
        document.body.appendChild(btn);
        return btn;
    };
    
    window.nextLevelBtn = createLevelButton('▶ NEXT', 'next');
    window.prevLevelBtn = createLevelButton('◀ PREV', 'prev');
    
    // Allow Enter/Space to continue after level complete or boss win
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            if (!screens.levelComplete.classList.contains('hidden')) {
                e.preventDefault();
                nextLevel();
            } else if (!screens.powerUp.classList.contains('hidden')) {
                e.preventDefault();
                startBossFight();
            } else if (!screens.win.classList.contains('hidden')) {
                e.preventDefault();
                resetAndStart();
            }
        }
    });
    
    // Keyboard controls
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
}

/**
 * Handle keydown events
 */
function handleKeyDown(e) {
    // Handle pause with Enter (only during active gameplay, not during level transitions)
    if (e.key === 'Enter') {
        // If paused, always allow resume
        if (gameState.isPaused) {
            e.preventDefault();
            togglePause();
            return;
        }
        // If playing and not in pause, and no menus are open, allow pause
        if (gameState.isPlaying && 
            screens.levelComplete.classList.contains('hidden') && 
            screens.powerUp.classList.contains('hidden')) {
            e.preventDefault();
            togglePause();
            return;
        }
    }
    
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    // Prevent default arrow key scrolling
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
    
    // Shoot bubble with spacebar
    if (e.key === ' ' && gameState.canShoot) {
        shootBubble();
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
    // Hide intro, show game
    screens.intro.classList.add('hidden');
    screens.game.classList.remove('hidden');
    
    // Initialize game state
    gameState.isPlaying = true;
    gameState.levelStartTime = Date.now();
    
    // Create player
    createPlayer();
    
    // Check for URL parameter to start at specific level (e.g., ?startLevel=6 for boss)
    let levelToStart = 1;
    const urlParams = new URLSearchParams(window.location.search);
    const urlLevel = urlParams.get('startLevel');
    if (urlLevel && parseInt(urlLevel) > 0 && parseInt(urlLevel) <= CONFIG.TOTAL_LEVELS) {
        levelToStart = parseInt(urlLevel);
    }
    
    // Start at specified level
    startLevel(levelToStart);
    
    // Show level skip buttons
    if (window.nextLevelBtn) window.nextLevelBtn.style.display = 'block';
    if (window.prevLevelBtn) window.prevLevelBtn.style.display = 'block';
    
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
        playerElement.textContent = '🐟';
        playerElement.title = 'Linda the Fish';
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
    gameState.pelletsCollected = 0;
    gameState.lives = 3; // Reset lives at start of each level
    gameState.lastCollisionTime = 0; // Reset collision timer
    gameState.levelStartTime = Date.now();
    levelDisplay.textContent = level;
    scoreDisplay.textContent = '0/' + CONFIG.PELLETS_PER_LEVEL;
    updateLivesDisplay();
    
    // Update danger zone height (gets higher each level)
    gameState.dangerZoneHeight = CONFIG.DANGER_ZONE_BASE + (level - 1) * CONFIG.DANGER_ZONE_INCREASE;
    
    // Reset Linda's position to starting point - ABOVE the danger zone
    // On boss level, spawn in bottom left corner to avoid boss collision
    if (level === 6) {
        gameState.playerPosition = {
            x: 50,
            y: CONFIG.CANVAS_HEIGHT - CONFIG.PLAYER_SIZE - gameState.dangerZoneHeight - 30
        };
    } else {
        gameState.playerPosition = {
            x: (CONFIG.CANVAS_WIDTH - CONFIG.PLAYER_SIZE) / 2,
            y: CONFIG.CANVAS_HEIGHT - CONFIG.PLAYER_SIZE - gameState.dangerZoneHeight - 30
        };
    }
    updatePlayerPosition();
    
    // Change background color based on level
    updateLevelBackground(level);
    
    // Update danger zone visual
    updateDangerZone();
    
    // Clear existing enemies and collectibles
    clearEnemies();
    clearCollectibles();
    clearBoss();
    
    if (level === 6) {
        // Boss level!
        spawnBoss();
        // Play boss music
        try {
            createBossMusic();
        } catch (e) {
            console.log('Audio not supported');
        }
    } else {
        // Regular level - spawn enemies based on level (more enemies = harder)
        const enemyCount = 3 + level * 2;
        spawnEnemies(enemyCount);
        
        // Spawn collectibles
        spawnCollectibles(CONFIG.PELLETS_PER_LEVEL);
        
        // Play regular level music
        try {
            createRegularLevelMusic();
        } catch (e) {
            console.log('Audio not supported');
        }
    }
}

/**
 * Update background color for current level
 */
function updateLevelBackground(level) {
    const backgrounds = [
        'linear-gradient(180deg, #0d4f6e 0%, #1976a0 30%, #2596be 70%, #3ab0d4 100%)',
        'linear-gradient(180deg, #0a3d5c 0%, #1566a0 30%, #2080c8 70%, #2fa0e0 100%)',
        'linear-gradient(180deg, #133a52 0%, #1e5f8a 30%, #2875ad 70%, #3895d4 100%)',
        'linear-gradient(180deg, #0e425a 0%, #1a6890 30%, #2685b8 70%, #34a5e0 100%)',
        'linear-gradient(180deg, #0c3850 0%, #185580 30%, #2470a0 70%, #3090c8 100%)',
        'linear-gradient(180deg, #1a1a2e 0%, #16213e 30%, #0f3460 70%, #533483 100%)' // Boss level
    ];
    
    const bgIndex = (level - 1) % backgrounds.length;
    gameCanvas.style.background = backgrounds[bgIndex];
}

/**
 * Create or update danger zone visual
 */
function updateDangerZone() {
    let dangerZone = document.getElementById('danger-zone');
    
    // On boss level, don't show snakes
    if (gameState.currentLevel === 6) {
        if (dangerZone) {
            gameCanvas.removeChild(dangerZone);
        }
        return;
    }
    
    if (!dangerZone) {
        dangerZone = document.createElement('div');
        dangerZone.id = 'danger-zone';
        dangerZone.style.position = 'absolute';
        dangerZone.style.bottom = '0';
        dangerZone.style.left = '0';
        dangerZone.style.width = '100%';
        dangerZone.style.background = 'none'; // No dark gradient background
        dangerZone.style.pointerEvents = 'none';
        dangerZone.style.zIndex = '2';
        dangerZone.style.display = 'flex';
        dangerZone.style.alignItems = 'flex-end';
        dangerZone.style.justifyContent = 'space-around';
        dangerZone.style.fontSize = '2.5rem';
        dangerZone.style.paddingBottom = '5px';
        dangerZone.style.overflow = 'hidden';
        gameCanvas.appendChild(dangerZone);
    }
    
    dangerZone.style.height = gameState.dangerZoneHeight + 'px';
    
    // Move snakes up slightly each level (visual only)
    const snakeOffset = (gameState.currentLevel - 2) * 15;
    dangerZone.style.bottom = snakeOffset + 'px';
    
    // Add sea snakes if not present
    if (dangerZone.children.length === 0) {
        const snakeCount = 15;
        for (let i = 0; i < snakeCount; i++) {
            const snake = document.createElement('span');
            snake.textContent = '🐍';
            snake.style.animation = `snakeWiggle ${1 + Math.random()}s ease-in-out infinite`;
            snake.style.animationDelay = `${Math.random() * 2}s`;
            dangerZone.appendChild(snake);
        }
    }
}

/**
 * Spawn enemies
 */
function spawnEnemies(count) {
    const enemyEmojis = ['🦑', '🦈', '🐙', '🦞', '🐡'];
    
    for (let i = 0; i < count; i++) {
        const enemy = {
            id: Date.now() + i,
            x: Math.random() * (CONFIG.CANVAS_WIDTH - CONFIG.ENEMY_SIZE),
            y: Math.random() * (CONFIG.CANVAS_HEIGHT - CONFIG.ENEMY_SIZE),
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
        if (enemy.element) {
            gameCanvas.removeChild(enemy.element);
        }
    });
    gameState.enemies = [];
}

/**
 * Spawn boss for level 6
 */
function spawnBoss() {
    const boss = {
        x: CONFIG.CANVAS_WIDTH / 2 - 75,
        y: 100,
        width: 150,
        height: 150,
        health: 10,
        maxHealth: 10,
        velocityX: 3,
        velocityY: 2,
        element: null,
        healthBar: null
    };
    
    // Create boss element
    boss.element = document.createElement('div');
    boss.element.classList.add('boss');
    boss.element.textContent = '🦈';
    boss.element.style.position = 'absolute';
    boss.element.style.fontSize = '8rem';
    boss.element.style.left = boss.x + 'px';
    boss.element.style.top = boss.y + 'px';
    boss.element.style.zIndex = '15';
    gameCanvas.appendChild(boss.element);
    
    // Create health bar
    boss.healthBar = document.createElement('div');
    boss.healthBar.style.position = 'absolute';
    boss.healthBar.style.top = '20px';
    boss.healthBar.style.left = '50%';
    boss.healthBar.style.transform = 'translateX(-50%)';
    boss.healthBar.style.width = '300px';
    boss.healthBar.style.height = '30px';
    boss.healthBar.style.background = 'rgba(0, 0, 0, 0.5)';
    boss.healthBar.style.border = '2px solid white';
    boss.healthBar.style.borderRadius = '15px';
    boss.healthBar.style.zIndex = '20';
    boss.healthBar.innerHTML = '<div style="width: 100%; height: 100%; background: linear-gradient(90deg, #ff4444, #ff6666); border-radius: 13px; transition: width 0.3s;"></div>';
    gameCanvas.appendChild(boss.healthBar);
    
    gameState.boss = boss;
}

/**
 * Clear boss
 */
function clearBoss() {
    if (gameState.boss) {
        if (gameState.boss.element) {
            gameCanvas.removeChild(gameState.boss.element);
        }
        if (gameState.boss.healthBar) {
            gameCanvas.removeChild(gameState.boss.healthBar);
        }
        gameState.boss = null;
    }
}

/**
 * Update boss
 */
function updateBoss() {
    if (!gameState.boss) return;
    
    const boss = gameState.boss;
    
    // Move boss
    boss.x += boss.velocityX;
    boss.y += boss.velocityY;
    
    // Bounce off walls
    if (boss.x <= 0 || boss.x >= CONFIG.CANVAS_WIDTH - boss.width) {
        boss.velocityX *= -1;
        boss.x = Math.max(0, Math.min(CONFIG.CANVAS_WIDTH - boss.width, boss.x));
    }
    
    // Bounce off bottom, keeping away from danger zone with extra margin
    const maxY = CONFIG.CANVAS_HEIGHT - boss.height - gameState.dangerZoneHeight - 50;
    if (boss.y <= 0 || boss.y >= maxY) {
        boss.velocityY *= -1;
        boss.y = Math.max(0, Math.min(maxY, boss.y));
    }
    
    // Update position
    boss.element.style.left = boss.x + 'px';
    boss.element.style.top = boss.y + 'px';
    
    // Update health bar
    const healthPercent = (boss.health / boss.maxHealth) * 100;
    boss.healthBar.firstChild.style.width = healthPercent + '%';
    
    // Boss attacks by touching Linda
    const playerBox = {
        x: gameState.playerPosition.x,
        y: gameState.playerPosition.y,
        width: CONFIG.PLAYER_SIZE,
        height: CONFIG.PLAYER_SIZE
    };
    
    const bossBox = {
        x: boss.x,
        y: boss.y,
        width: boss.width,
        height: boss.height
    };
    
    if (isColliding(playerBox, bossBox)) {
        // Boss damages player on contact
        handleCollision();
    }
}

/**
 * Spawn collectibles (fish food pellets)
 */
function spawnCollectibles(count) {
    for (let i = 0; i < count; i++) {
        const collectible = {
            id: Date.now() + i,
            x: Math.random() * (CONFIG.CANVAS_WIDTH - CONFIG.PELLET_SIZE),
            y: Math.random() * (CONFIG.CANVAS_HEIGHT - CONFIG.PELLET_SIZE),
            element: null
        };
        
        // Create collectible element
        collectible.element = document.createElement('div');
        collectible.element.classList.add('collectible');
        collectible.element.textContent = '🟤';
        collectible.element.style.left = collectible.x + 'px';
        collectible.element.style.top = collectible.y + 'px';
        collectible.element.style.fontSize = CONFIG.PELLET_SIZE + 'px';
        collectible.element.style.position = 'absolute';
        
        gameCanvas.appendChild(collectible.element);
        gameState.collectibles.push(collectible);
    }
}

/**
 * Clear all collectibles
 */
function clearCollectibles() {
    gameState.collectibles.forEach(collectible => {
        if (collectible.element) {
            gameCanvas.removeChild(collectible.element);
        }
    });
    gameState.collectibles = [];
}

/**
 * Play collection sound
 */
function playCollectSound() {
    // Create simple beep using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
}

/**
 * Main game loop
 */
function gameLoop() {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    // Update forward scrolling effect
    updateForwardScroll();
    
    // Update player movement
    updatePlayer();
    
    // Update enemies
    updateEnemies();
    
    // Update boss if present
    if (gameState.boss) {
        updateBoss();
    }
    
    // Update bubbles
    if (gameState.canShoot) {
        updateBubbles();
    }
    
    // Update collectibles
    updateCollectibles();
    
    // Check for level completion
    checkLevelComplete();
    
    // Check collisions
    checkCollisions();
    
    // Check collectible pickups
    checkCollectiblePickups();
    
    // Continue loop
    requestAnimationFrame(gameLoop);
}

/**
 * Update forward scrolling effect
 */
function updateForwardScroll() {
    gameState.scrollOffset += CONFIG.FORWARD_SCROLL_SPEED;
    
    // Move collectibles backward to simulate forward movement
    gameState.collectibles.forEach(collectible => {
        collectible.y += CONFIG.FORWARD_SCROLL_SPEED;
        
        // Wrap around when collectible goes off bottom
        if (collectible.y > CONFIG.CANVAS_HEIGHT) {
            collectible.y = -CONFIG.PELLET_SIZE;
            collectible.x = Math.random() * (CONFIG.CANVAS_WIDTH - CONFIG.PELLET_SIZE);
        }
    });
}

/**
 * Update collectibles display
 */
function updateCollectibles() {
    gameState.collectibles.forEach(collectible => {
        if (collectible.element) {
            collectible.element.style.left = collectible.x + 'px';
            collectible.element.style.top = collectible.y + 'px';
        }
    });
}

/**
 * Update player based on keyboard input
 */
function updatePlayer() {
    const pos = gameState.playerPosition;
    
    // Calculate the bottom boundary to avoid danger zone (except on boss level)
    let maxY;
    if (gameState.currentLevel === 6) {
        // Boss level: allow full height movement
        maxY = CONFIG.CANVAS_HEIGHT - CONFIG.PLAYER_SIZE;
    } else {
        // Regular levels: stay above danger zone
        const dangerZoneTop = CONFIG.CANVAS_HEIGHT - gameState.dangerZoneHeight;
        maxY = dangerZoneTop - CONFIG.PLAYER_SIZE - 10; // Stay 10px above danger zone
    }
    
    // Move up
    if (gameState.keys['ArrowUp']) {
        pos.y = Math.max(0, pos.y - CONFIG.PLAYER_SPEED);
    }
    
    // Move down
    if (gameState.keys['ArrowDown']) {
        pos.y = Math.min(maxY, pos.y + CONFIG.PLAYER_SPEED);
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
 * Check for collectible pickups
 */
function checkCollectiblePickups() {
    const player = {
        x: gameState.playerPosition.x,
        y: gameState.playerPosition.y,
        width: CONFIG.PLAYER_SIZE,
        height: CONFIG.PLAYER_SIZE
    };
    
    for (let i = gameState.collectibles.length - 1; i >= 0; i--) {
        const collectible = gameState.collectibles[i];
        const collectibleBox = {
            x: collectible.x,
            y: collectible.y,
            width: CONFIG.PELLET_SIZE,
            height: CONFIG.PELLET_SIZE
        };
        
        if (isColliding(player, collectibleBox)) {
            // Collect the pellet
            gameState.pelletsCollected++;
            gameState.score += CONFIG.POINTS_PER_PELLET;
            scoreDisplay.textContent = gameState.pelletsCollected + '/' + CONFIG.PELLETS_PER_LEVEL;
            
            // Play sound
            playCollectSound();
            
            // Remove collectible
            if (collectible.element) {
                gameCanvas.removeChild(collectible.element);
            }
            gameState.collectibles.splice(i, 1);
            
            // Check if all pellets collected (level complete for regular levels)
            if (gameState.currentLevel < 5 && gameState.collectibles.length === 0) {
                showLevelComplete();
            } else if (gameState.currentLevel === 5 && gameState.collectibles.length === 0) {
                // Show power-up message after level 5
                showPowerUp();
            }
        }
    }
}

/**
 * Check if level is complete
 */
function checkLevelComplete() {
    // For boss level, check if boss is defeated
    if (gameState.currentLevel === 6 && gameState.boss && gameState.boss.health <= 0) {
        winGame();
    }
    
    // Check if player is in danger zone
    checkDangerZone();
}

/**
 * Check if player is in danger zone
 */
function checkDangerZone() {
    // Only apply danger zone collision on levels 2-5, not on level 1 or boss level 6
    if (gameState.currentLevel < 2 || gameState.currentLevel > 5) {
        return;
    }
    
    const playerBottom = gameState.playerPosition.y + CONFIG.PLAYER_SIZE;
    const dangerTop = CONFIG.CANVAS_HEIGHT - gameState.dangerZoneHeight;
    
    if (playerBottom > dangerTop) {
        handleCollision();
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
    scoreDisplay.textContent = gameState.pelletsCollected + '/' + CONFIG.PELLETS_PER_LEVEL;
    
    // Don't auto-advance, wait for player to click Next Level
}

/**
 * Show power-up message after level 5
 */
function showPowerUp() {
    gameState.isPlaying = false;
    screens.powerUp.classList.remove('hidden');
    
    // Bonus points for completing level
    gameState.score += 100 * gameState.currentLevel;
}

/**
 * Start boss fight
 */
function startBossFight() {
    screens.powerUp.classList.add('hidden');
    screens.game.classList.remove('hidden');
    
    // Enable shooting
    gameState.canShoot = true;
    gameState.isPlaying = true;
    
    // Start level 6
    startLevel(6);
    
    // Restart game loop
    requestAnimationFrame(gameLoop);
}

/**
 * Shoot a bubble
 */
function shootBubble() {
    const now = Date.now();
    if (now - gameState.lastShotTime < 300) return; // Rate limit: 0.3s between shots
    
    gameState.lastShotTime = now;
    
    const bubble = {
        x: gameState.playerPosition.x - 15,
        y: gameState.playerPosition.y + 15,
        velocityX: -8,
        velocityY: 0,
        element: null
    };
    
    // Create bubble element
    bubble.element = document.createElement('div');
    bubble.element.textContent = '💧';
    bubble.element.style.position = 'absolute';
    bubble.element.style.fontSize = '1.5rem';
    bubble.element.style.left = bubble.x + 'px';
    bubble.element.style.top = bubble.y + 'px';
    bubble.element.style.zIndex = '8';
    bubble.element.style.transform = 'rotate(90deg)'; // Rotate to point left
    gameCanvas.appendChild(bubble.element);
    
    gameState.bubbles.push(bubble);
    
    // Play shoot sound
    playShootSound();
}

/**
 * Play shoot sound
 */
function playShootSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 600;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
}

/**
 * Update bubbles
 */
function updateBubbles() {
    for (let i = gameState.bubbles.length - 1; i >= 0; i--) {
        const bubble = gameState.bubbles[i];
        
        // Move bubble leftward
        bubble.x += bubble.velocityX;
        bubble.y += bubble.velocityY;
        
        // Update position
        if (bubble.element) {
            bubble.element.style.left = bubble.x + 'px';
            bubble.element.style.top = bubble.y + 'px';
        }
        
        // Remove if off screen
        if (bubble.x < -30) {
            if (bubble.element) {
                gameCanvas.removeChild(bubble.element);
            }
            gameState.bubbles.splice(i, 1);
            continue;
        }
        
        // Check collision with boss
        if (gameState.boss) {
            const bubbleBox = {
                x: bubble.x,
                y: bubble.y,
                width: 20,
                height: 20
            };
            
            const bossBox = {
                x: gameState.boss.x,
                y: gameState.boss.y,
                width: gameState.boss.width,
                height: gameState.boss.height
            };
            
            if (isColliding(bubbleBox, bossBox)) {
                // Damage boss
                gameState.boss.health--;
                
                // Remove bubble
                if (bubble.element) {
                    gameCanvas.removeChild(bubble.element);
                }
                gameState.bubbles.splice(i, 1);
                
                // Play hit sound
                playCollectSound();
            }
        }
    }
}

/**
 * Clear all bubbles
 */
function clearBubbles() {
    gameState.bubbles.forEach(bubble => {
        if (bubble.element) {
            gameCanvas.removeChild(bubble.element);
        }
    });
    gameState.bubbles = [];
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
    const now = Date.now();
    // Prevent multiple collision triggers within 500ms (invulnerability period)
    if (now - gameState.lastCollisionTime < 500) {
        return;
    }
    gameState.lastCollisionTime = now;
    
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
        showLevelFailed();
    } else {
        // Reset player position - ABOVE the danger zone
        gameState.playerPosition = {
            x: (CONFIG.CANVAS_WIDTH - CONFIG.PLAYER_SIZE) / 2,
            y: CONFIG.CANVAS_HEIGHT - CONFIG.PLAYER_SIZE - gameState.dangerZoneHeight - 30
        };
        updatePlayerPosition();
    }
}

/**
 * Update lives display
 */
function updateLivesDisplay() {
    const hearts = '❤️'.repeat(Math.max(0, gameState.lives));
    livesDisplay.textContent = hearts || '💔';
}

/**
 * Win the game
 */
function winGame() {
    gameState.isPlaying = false;
    finalScoreDisplay.textContent = gameState.score;
    
    // Play winning music
    try {
        createWinMusic();
    } catch (e) {
        console.log('Audio not supported');
    }
    
    // After 2 seconds, redirect to ending scene
    setTimeout(() => {
        window.location.href = '../lindas-ending/index.html';
    }, 2000);
    
    screens.game.classList.add('hidden');
    screens.win.classList.remove('hidden');
}

/**
 * Show level failed message
 */
function showLevelFailed() {
    gameState.isPlaying = false;
    
    console.log('Level Failed triggered', screens.levelFailed);
    
    // Make sure game screen is hidden
    screens.game.classList.add('hidden');
    
    // Show level failed screen
    if (screens.levelFailed) {
        screens.levelFailed.classList.remove('hidden');
        console.log('Level failed screen should now be visible');
    } else {
        console.error('Level failed screen element not found!');
    }
}

/**
 * Retry current level
 */
function retryCurrentLevel() {
    screens.levelFailed.classList.add('hidden');
    screens.game.classList.remove('hidden');
    
    // Reset lives and reset level
    gameState.lives = 3;
    gameState.levelStartTime = Date.now();
    gameState.isPlaying = true;
    
    // Clear and restart current level
    clearEnemies();
    clearCollectibles();
    clearBoss();
    startLevel(gameState.currentLevel);
    
    updateLivesDisplay();
    
    // Restart game loop
    requestAnimationFrame(gameLoop);
}

/**
 * Move to next level
 */
function nextLevel() {
    screens.levelComplete.classList.add('hidden');
    screens.game.classList.remove('hidden');
    
    gameState.isPlaying = true;
    startLevel(gameState.currentLevel + 1);
    
    // Restart game loop
    requestAnimationFrame(gameLoop);
}

/**
 * Game over (kept for compatibility, now unused)
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
    // Remove pause overlay if present
    const pauseOverlay = document.getElementById('pause-overlay');
    if (pauseOverlay) {
        gameCanvas.removeChild(pauseOverlay);
    }
    
    // Hide level skip buttons
    if (window.nextLevelBtn) window.nextLevelBtn.style.display = 'none';
    if (window.prevLevelBtn) window.prevLevelBtn.style.display = 'none';
    
    // Reset game state
    gameState = {
        currentLevel: 1,
        score: 0,
        pelletsCollected: 0,
        lives: 3,
        isPlaying: false,
        isPaused: false,
        playerPosition: { x: 0, y: 0 },
        enemies: [],
        collectibles: [],
        bubbles: [],
        boss: null,
        keys: {},
        lastScoreUpdate: Date.now(),
        levelStartTime: Date.now(),
        scrollOffset: 0,
        dangerZoneHeight: CONFIG.DANGER_ZONE_BASE,
        canShoot: false,
        lastShotTime: 0,
        lastCollisionTime: 0,
    };
    
    // Clear enemies, collectibles, bubbles, and boss
    clearEnemies();
    clearCollectibles();
    clearBubbles();
    clearBoss();
    
    // Reset displays
    scoreDisplay.textContent = '0/8';
    levelDisplay.textContent = '1';
    updateLivesDisplay();
    
    // Hide all screens except intro
    screens.win.classList.add('hidden');
    screens.gameover.classList.add('hidden');
    screens.levelComplete.classList.add('hidden');
    screens.levelFailed.classList.add('hidden');
    screens.powerUp.classList.add('hidden');
    screens.intro.classList.remove('hidden');
    screens.game.classList.add('hidden');
}

// Initialize the game when page loads
init();
