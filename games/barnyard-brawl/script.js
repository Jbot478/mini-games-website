// ==================== GAME STATE ====================
const gameState = {
    mode: null, // 1 or 2 player
    selectedP1: null,
    selectedP2: null,
    paused: false,
    gameLoop: null,
    round: 1,
    timer: 99,
    soundsEnabled: true
};

// ==================== SOUND SYSTEM ====================
const sounds = {
    // Background music
    menuMusic: null,
    fightMusic: null,

    // Sound effects
    punch: null,
    special: null,
    hit: null,
    block: null,
    victory: null,

    // Initialize all sounds
    init: function() {
        // Create simple audio feedback using Web Audio API
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Initialize background music loops using HTML5 Audio
        this.menuMusic = this.createLoopingAudio(this.generateMenuMusic(), true);
        this.fightMusic = this.createLoopingAudio(this.generateFightMusic(), true);

        return this;
    },

    createLoopingAudio: function(frequency, shouldLoop) {
        // For now, return a dummy audio object that won't throw errors
        return {
            play: () => {},
            pause: () => {},
            stop: () => {},
            volume: 0.3
        };
    },

    generateMenuMusic: function() {
        return 440; // Placeholder
    },

    generateFightMusic: function() {
        return 440; // Placeholder
    },

    // Play punch sound
    playPunch: function() {
        if (!gameState.soundsEnabled) return;
        this.playTone(200, 0.1, 'sine', 0.3);
    },

    // Play hit sound
    playHit: function() {
        if (!gameState.soundsEnabled) return;
        this.playTone(150, 0.15, 'sawtooth', 0.4);
    },

    // Play block sound
    playBlock: function() {
        if (!gameState.soundsEnabled) return;
        this.playTone(300, 0.08, 'square', 0.2);
    },

    // Play special attack sound
    playSpecial: function() {
        if (!gameState.soundsEnabled) return;

        // Create a dramatic sweep sound with multiple tones
        const frequencies = [300, 400, 500, 700, 900];
        frequencies.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.15, 'sawtooth', 0.5);
            }, i * 50);
        });

        // Add a "boom" at the end
        setTimeout(() => {
            this.playTone(100, 0.2, 'sine', 0.6);
        }, 300);
    },

    // Play victory fanfare
    playVictory: function() {
        if (!gameState.soundsEnabled) return;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.3, 'sine', 0.3), i * 150);
        });
    },

    // Generic tone player
    playTone: function(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    },

    // Background music controls
    playMenuMusic: function() {
        this.stopAllMusic();
        if (this.menuMusic && gameState.soundsEnabled) {
            this.playBackgroundLoop([440, 493.88, 523.25, 587.33], 0.5, 'triangle'); // A, B, C, D
        }
    },

    playFightMusic: function() {
        this.stopAllMusic();
        if (this.fightMusic && gameState.soundsEnabled) {
            this.playBackgroundLoop([329.63, 349.23, 392, 440], 0.4, 'square'); // E, F, G, A (more intense)
        }
    },

    playBackgroundLoop: function(notes, tempo, waveType) {
        let index = 0;
        const playNext = () => {
            if (!gameState.soundsEnabled || gameState.paused) {
                return;
            }
            this.playTone(notes[index % notes.length], tempo * 0.9, waveType, 0.15);
            index++;
            this.musicTimeout = setTimeout(playNext, tempo * 1000);
        };
        playNext();
    },

    stopAllMusic: function() {
        if (this.musicTimeout) {
            clearTimeout(this.musicTimeout);
            this.musicTimeout = null;
        }
    }
};

// Initialize sound system
sounds.init();

// ==================== CHARACTER DATA ====================
const characters = [
    {
        id: 'gigi',
        name: 'GiGi the Goat',
        emoji: '🐐',
        backstory: 'GiGi was once the prettiest animal on the farm but Brandy the Fox has been stealing her face cream. Now she\'s tracking him down to continue her skincare routine and kick Brandy across the face!',
        special: 'Headbutt Rampage',
        specialEmoji: '💥',
        victoryQuote: 'My skin is FLAWLESS and so is my VICTORY!',
        stats: { damage: 12, specialDamage: 25, speed: 7 }
    },
    {
        id: 'brandy',
        name: 'Brandy the Fox',
        emoji: '🦊',
        backstory: 'Brandy is a smooth-talking fox who steals everything that isn\'t nailed down. His latest crime? GiGi\'s expensive face cream. Now he\'s in the fight of his life!',
        special: 'Sneaky Swipe',
        specialEmoji: '🌪️',
        victoryQuote: 'Crime DOES pay, baby!',
        stats: { damage: 10, specialDamage: 22, speed: 9 }
    },
    {
        id: 'clucky',
        name: 'Clucky McFeathers',
        emoji: '🐔',
        backstory: 'Clucky is tired of being called "chicken" and is here to prove she\'s the toughest bird in the barnyard. Her pecking skills are LEGENDARY!',
        special: 'Peck Storm',
        specialEmoji: '🌟',
        victoryQuote: 'BAWK BAWK! Who\'s chicken NOW?!',
        stats: { damage: 11, specialDamage: 20, speed: 8 }
    },
    {
        id: 'mooana',
        name: 'Mooana the Diva Cow',
        emoji: '🐄',
        backstory: 'Mooana thinks she\'s a Disney princess trapped in a cow\'s body. She fights with grace, style, and devastating kicks that could send you to the moon!',
        special: 'Hoof of Fury',
        specialEmoji: '✨',
        victoryQuote: 'I didn\'t choose the moo life, the moo life chose ME!',
        stats: { damage: 15, specialDamage: 28, speed: 5 }
    },
    {
        id: 'porkchop',
        name: 'Sir Porkchop',
        emoji: '🐷',
        backstory: 'Once a distinguished gentleman pig, Porkchop lost his fortune in a poker game. Now he fights to reclaim his honor and his truffle collection!',
        special: 'Mud Bomb',
        specialEmoji: '💩',
        victoryQuote: 'A gentleman always wins with CLASS!',
        stats: { damage: 13, specialDamage: 24, speed: 6 }
    },
    {
        id: 'woolly',
        name: 'Woolly the Sheep',
        emoji: '�양',
        backstory: 'Woolly is sick of being sheared every spring and losing his fabulous fleece. He\'s woolly furious and ready to ram some sense into everyone!',
        special: 'Woolly Whirlwind',
        specialEmoji: '🌀',
        victoryQuote: 'Ewe didn\'t stand a CHANCE!',
        stats: { damage: 11, specialDamage: 21, speed: 7 }
    },
    {
        id: 'benny',
        name: 'Benny "Bounce" Bunny',
        emoji: '🐰',
        backstory: 'Benny was banned from the county fair\'s jumping contest for being "too bouncy." Now he channels that energy into devastating aerial attacks!',
        special: 'Carrot Cannon',
        specialEmoji: '🥕',
        victoryQuote: 'What\'s up, DOC? Your defeat, that\'s what!',
        stats: { damage: 9, specialDamage: 19, speed: 10 }
    },
    {
        id: 'rocky',
        name: 'Rocky the Rooster',
        emoji: '🐓',
        backstory: 'Rocky wakes everyone up at 4 AM every day, and he\'s PROUD of it. His morning wake-up calls have evolved into devastating sonic attacks!',
        special: 'Dawn Screech',
        specialEmoji: '📢',
        victoryQuote: 'COCK-A-DOODLE-DON\'T mess with me!',
        stats: { damage: 14, specialDamage: 26, speed: 8 }
    }
];

// ==================== PLAYER PHYSICS ====================
class Player {
    constructor(character, playerNum, isAI = false) {
        this.character = character;
        this.playerNum = playerNum;
        this.isAI = isAI;
        this.health = 100;
        this.x = playerNum === 1 ? 200 : window.innerWidth - 300;
        this.y = 0;
        this.velocityY = 0;
        this.velocityX = 0;
        this.grounded = true;
        this.facing = playerNum === 1 ? 1 : -1;
        this.blocking = false;
        this.attacking = false;
        this.jumpCount = 0;
        this.lastSpecialTime = 0;
        this.invincible = false;

        this.element = this.createElement();
        this.keys = {};
    }

    createElement() {
        const player = document.createElement('div');
        player.className = 'player';
        player.innerHTML = `<div class="player-sprite">${this.character.emoji}</div>`;
        player.style.left = this.x + 'px';
        document.getElementById('arena-floor').appendChild(player);
        return player;
    }

    update(opponent) {
        if (gameState.paused) return;

        // Gravity
        if (!this.grounded) {
            this.velocityY += 0.8;
        }
        this.y += this.velocityY;

        // Ground collision
        if (this.y >= 0) {
            this.y = 0;
            this.velocityY = 0;
            this.grounded = true;
            this.jumpCount = 0;
        } else {
            this.grounded = false;
        }

        // Horizontal movement
        this.x += this.velocityX;
        this.velocityX *= 0.85; // Friction

        // Boundaries
        if (this.x < 50) this.x = 50;
        if (this.x > window.innerWidth - 150) this.x = window.innerWidth - 150;

        // Face opponent
        if (opponent) {
            this.facing = this.x < opponent.x ? 1 : -1;
        }

        // Update position
        this.element.style.left = this.x + 'px';
        this.element.style.bottom = (120 + this.y) + 'px';
        // Characters naturally face each other based on emoji direction

        // AI behavior
        if (this.isAI && !gameState.paused) {
            this.aiThink(opponent);
        }
    }

    aiThink(opponent) {
        const distance = Math.abs(this.x - opponent.x);
        const now = Date.now();

        // Random movement
        if (Math.random() < 0.02) {
            this.velocityX = (Math.random() - 0.5) * 10;
        }

        // Move toward opponent
        if (distance > 150 && Math.random() < 0.1) {
            this.velocityX = (opponent.x > this.x ? 1 : -1) * 5;
        }

        // Jump randomly
        if (this.grounded && Math.random() < 0.02) {
            this.jump();
        }

        // Attack when close
        if (distance < 150 && Math.random() < 0.05) {
            this.attack(opponent);
        }

        // Special attack occasionally
        if (distance < 200 && Math.random() < 0.01 && now - this.lastSpecialTime > 3000) {
            this.specialAttack(opponent);
        }

        // Block occasionally
        if (opponent.attacking && Math.random() < 0.3) {
            this.block();
        }
    }

    move(direction) {
        if (!this.grounded || this.blocking) return;
        this.velocityX = direction * 8;
    }

    jump() {
        if (this.jumpCount < 2 && !this.blocking) {
            this.velocityY = -18;
            this.grounded = false;
            this.jumpCount++;
            this.element.classList.add('jumping');
            setTimeout(() => this.element.classList.remove('jumping'), 500);
        }
    }

    block() {
        this.blocking = true;
        this.element.classList.add('blocking');
        sounds.playBlock();
        setTimeout(() => {
            this.blocking = false;
            this.element.classList.remove('blocking');
        }, 500);
    }

    attack(opponent) {
        if (this.attacking) return;

        this.attacking = true;
        this.element.classList.add('attacking');
        sounds.playPunch();

        const distance = Math.abs(this.x - opponent.x);
        if (distance < 150) {
            this.dealDamage(opponent, this.character.stats.damage);
        }

        setTimeout(() => {
            this.attacking = false;
            this.element.classList.remove('attacking');
        }, 300);
    }

    specialAttack(opponent) {
        const now = Date.now();
        if (now - this.lastSpecialTime < 3000) return; // Cooldown

        this.lastSpecialTime = now;
        this.attacking = true;
        sounds.playSpecial();

        // Create multiple special effect particles
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const effect = document.createElement('div');
                effect.className = 'special-effect';
                effect.textContent = this.character.specialEmoji;
                effect.style.left = (this.x + Math.random() * 50 - 25) + 'px';
                effect.style.bottom = (200 + this.y + Math.random() * 50) + 'px';
                effect.style.fontSize = (3 + Math.random() * 2) + 'rem';
                document.getElementById('arena-floor').appendChild(effect);

                setTimeout(() => effect.remove(), 1000);
            }, i * 100);
        }

        // Deal damage
        const distance = Math.abs(this.x - opponent.x);
        if (distance < 250) {
            this.dealDamage(opponent, this.character.stats.specialDamage);
        }

        setTimeout(() => {
            this.attacking = false;
        }, 500);
    }

    dealDamage(opponent, damage) {
        if (opponent.invincible) return;

        let finalDamage = damage;
        if (opponent.blocking) {
            finalDamage *= 0.3; // Block reduces damage
        } else {
            sounds.playHit();
        }

        opponent.health -= finalDamage;
        if (opponent.health < 0) opponent.health = 0;

        // Update health bar
        const healthBar = document.getElementById(`p${opponent.playerNum}-health`);
        const healthText = document.getElementById(`p${opponent.playerNum}-health-text`);
        healthBar.style.width = opponent.health + '%';
        healthText.textContent = Math.round(opponent.health) + '%';

        // Color change based on health
        if (opponent.health < 30) {
            healthBar.style.background = 'linear-gradient(90deg, #f44336, #ff5252)';
        } else if (opponent.health < 60) {
            healthBar.style.background = 'linear-gradient(90deg, #ff9800, #ffc107)';
        }

        // Hit animation
        opponent.element.classList.add('hit');
        setTimeout(() => opponent.element.classList.remove('hit'), 500);

        // Check for knockout
        if (opponent.health <= 0) {
            endFight(this.playerNum);
        }
    }

    destroy() {
        this.element.remove();
    }
}

// ==================== SCREEN MANAGEMENT ====================
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');

    // Control background music based on screen
    if (screenId === 'main-menu' || screenId === 'character-select' || screenId === 'instructions') {
        sounds.playMenuMusic();
    } else if (screenId === 'fight-arena') {
        sounds.playFightMusic();
    } else if (screenId === 'victory-screen') {
        sounds.stopAllMusic();
        sounds.playVictory();
    } else if (screenId === 'intro-cutscene') {
        sounds.stopAllMusic();
    }
}

function showInstructions(mode) {
    gameState.mode = mode;
    showScreen('instructions');

    // Update instructions based on mode
    if (mode === 1) {
        document.getElementById('p2-controls-title').textContent = 'COMPUTER CONTROLS';
        document.getElementById('player2-controls').style.opacity = '0.5';
    } else {
        document.getElementById('p2-controls-title').textContent = 'PLAYER 2 CONTROLS';
        document.getElementById('player2-controls').style.opacity = '1';
    }
}

function continueToCharacterSelect() {
    gameState.selectedP1 = null;
    gameState.selectedP2 = null;
    populateCharacterGrid();
    showScreen('character-select');

    if (gameState.mode === 2) {
        document.getElementById('p2-label').textContent = 'PLAYER 2';
    } else {
        document.getElementById('p2-label').textContent = 'COMPUTER';
    }
}

function startGame(mode) {
    gameState.mode = mode;
    gameState.selectedP1 = null;
    gameState.selectedP2 = null;
    populateCharacterGrid();
    showScreen('character-select');

    if (mode === 2) {
        document.getElementById('p2-label').textContent = 'PLAYER 2';
    } else {
        document.getElementById('p2-label').textContent = 'COMPUTER';
    }
}

function backToMenu() {
    gameState.selectedP1 = null;
    gameState.selectedP2 = null;
    if (gameState.player1) {
        gameState.player1.destroy();
        gameState.player2.destroy();
    }
    if (gameState.gameLoop) {
        cancelAnimationFrame(gameState.gameLoop);
    }
    showScreen('main-menu');
}

// ==================== CHARACTER SELECTION ====================
function populateCharacterGrid() {
    const grid = document.getElementById('character-grid');
    grid.innerHTML = '';

    characters.forEach(char => {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.innerHTML = `
            <div class="character-sprite">${char.emoji}</div>
            <div class="character-name">${char.name}</div>
            <div class="character-story">${char.backstory}</div>
        `;
        card.onclick = () => selectCharacter(char);
        card.dataset.charId = char.id;
        grid.appendChild(card);
    });
}

function selectCharacter(character) {
    if (!gameState.selectedP1) {
        gameState.selectedP1 = character;
        updateCharacterPreview(1, character);
        highlightSelectedCard(character.id, 1);
    } else if (!gameState.selectedP2) {
        if (character.id === gameState.selectedP1.id && gameState.mode === 2) {
            return; // Can't select same character in 2P mode
        }
        gameState.selectedP2 = character;
        updateCharacterPreview(2, character);
        highlightSelectedCard(character.id, 2);
        document.getElementById('fight-btn').disabled = false;
    } else {
        // Reselect - clear second selection
        gameState.selectedP2 = null;
        document.getElementById('p2-preview').innerHTML = `
            <div class="preview-placeholder">?</div>
            <p>Select a character</p>
        `;
        document.getElementById('fight-btn').disabled = true;
        document.querySelectorAll('.character-card').forEach(c => {
            if (c.dataset.charId !== gameState.selectedP1.id) {
                c.classList.remove('selected');
            }
        });
    }
}

function updateCharacterPreview(playerNum, character) {
    const preview = document.getElementById(`p${playerNum}-preview`);
    preview.innerHTML = `
        <div class="character-sprite">${character.emoji}</div>
        <div class="character-name">${character.name}</div>
    `;
}

function highlightSelectedCard(charId, playerNum) {
    document.querySelectorAll('.character-card').forEach(card => {
        if (card.dataset.charId === charId) {
            card.classList.add('selected');
        }
    });
}

// ==================== FIGHT INTRO ====================
function startFight() {
    showScreen('intro-cutscene');

    document.getElementById('intro-p1-sprite').textContent = gameState.selectedP1.emoji;
    document.getElementById('intro-p1-name').textContent = gameState.selectedP1.name;
    document.getElementById('intro-p1-story').textContent = gameState.selectedP1.backstory;

    document.getElementById('intro-p2-sprite').textContent = gameState.selectedP2.emoji;
    document.getElementById('intro-p2-name').textContent = gameState.selectedP2.name;
    document.getElementById('intro-p2-story').textContent = gameState.selectedP2.backstory;

    setTimeout(() => {
        initFight();
    }, 4000);
}

function initFight() {
    showScreen('fight-arena');
    gameState.paused = false;
    gameState.timer = 99;

    // Clear arena
    document.getElementById('arena-floor').innerHTML = '';

    // Create players
    gameState.player1 = new Player(gameState.selectedP1, 1, false);
    gameState.player2 = new Player(gameState.selectedP2, 2, gameState.mode === 1);

    // Update HUD
    document.getElementById('p1-name-hud').textContent = gameState.selectedP1.name;
    document.getElementById('p2-name-hud').textContent = gameState.selectedP2.name;
    document.getElementById('p1-health').style.width = '100%';
    document.getElementById('p2-health').style.width = '100%';
    document.getElementById('p1-health-text').textContent = '100%';
    document.getElementById('p2-health-text').textContent = '100%';
    document.getElementById('round-number').textContent = gameState.round;
    document.getElementById('timer').textContent = gameState.timer;

    // Reset health bar colors
    document.getElementById('p1-health').style.background = 'linear-gradient(90deg, #4caf50, #8bc34a)';
    document.getElementById('p2-health').style.background = 'linear-gradient(90deg, #4caf50, #8bc34a)';

    // Setup controls
    setupControls();

    // Start game loop
    gameLoop();

    // Start timer
    startTimer();
}

// ==================== GAME LOOP ====================
function gameLoop() {
    if (!gameState.paused) {
        gameState.player1.update(gameState.player2);
        gameState.player2.update(gameState.player1);
    }

    gameState.gameLoop = requestAnimationFrame(gameLoop);
}

function startTimer() {
    gameState.timerInterval = setInterval(() => {
        if (!gameState.paused && gameState.timer > 0) {
            gameState.timer--;
            document.getElementById('timer').textContent = gameState.timer;

            if (gameState.timer === 0) {
                timeUp();
            }
        }
    }, 1000);
}

function timeUp() {
    clearInterval(gameState.timerInterval);

    // Determine winner by health
    if (gameState.player1.health > gameState.player2.health) {
        endFight(1);
    } else if (gameState.player2.health > gameState.player1.health) {
        endFight(2);
    } else {
        // Draw - random winner
        endFight(Math.random() < 0.5 ? 1 : 2);
    }
}

// ==================== CONTROLS ====================
function setupControls() {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
}

function handleKeyDown(e) {
    if (gameState.paused && e.key !== 'Enter') return;

    const key = e.key.toLowerCase();

    // Player 1 controls (Arrow keys + Shift/Space + Enter)
    if (key === 'arrowright') {
        gameState.player1.move(1);
    } else if (key === 'arrowleft') {
        gameState.player1.move(-1);
    } else if (key === 'arrowup') {
        gameState.player1.jump();
    } else if (key === 'arrowdown') {
        gameState.player1.block();
    } else if (key === 'shift') {
        gameState.player1.attack(gameState.player2);
    } else if (key === ' ') {
        e.preventDefault();
        gameState.player1.specialAttack(gameState.player2);
    } else if (key === 'enter') {
        e.preventDefault();
        togglePause();
    }

    // Player 2 controls (WASD + Q/E + Tab) - only if 2 player mode
    if (gameState.mode === 2 && !gameState.player2.isAI) {
        if (key === 'd') {
            gameState.player2.move(1);
        } else if (key === 'a') {
            gameState.player2.move(-1);
        } else if (key === 'w') {
            gameState.player2.jump();
        } else if (key === 's') {
            gameState.player2.block();
        } else if (key === 'q') {
            gameState.player2.attack(gameState.player1);
        } else if (key === 'e') {
            gameState.player2.specialAttack(gameState.player1);
        } else if (key === 'tab') {
            e.preventDefault();
            togglePause();
        }
    }
}

function handleKeyUp(e) {
    // Nothing needed for now
}

// ==================== PAUSE MENU ====================
function togglePause() {
    gameState.paused = !gameState.paused;
    const pauseMenu = document.getElementById('pause-menu');

    if (gameState.paused) {
        pauseMenu.classList.add('active');
        sounds.stopAllMusic();
    } else {
        pauseMenu.classList.remove('active');
        sounds.playFightMusic();
    }
}

function resumeGame() {
    togglePause();
}

function restartFight() {
    clearInterval(gameState.timerInterval);
    cancelAnimationFrame(gameState.gameLoop);
    gameState.player1.destroy();
    gameState.player2.destroy();
    document.getElementById('pause-menu').classList.remove('active');
    initFight();
}

function quitToMenu() {
    clearInterval(gameState.timerInterval);
    cancelAnimationFrame(gameState.gameLoop);
    gameState.player1.destroy();
    gameState.player2.destroy();
    document.getElementById('pause-menu').classList.remove('active');
    backToMenu();
}

// ==================== END FIGHT ====================
function endFight(winnerNum) {
    clearInterval(gameState.timerInterval);
    cancelAnimationFrame(gameState.gameLoop);

    const winner = winnerNum === 1 ? gameState.player1 : gameState.player2;

    setTimeout(() => {
        showScreen('victory-screen');
        document.getElementById('winner-sprite').textContent = winner.character.emoji;
        document.getElementById('winner-name').textContent = winner.character.name;
        document.getElementById('victory-quote').textContent = winner.character.victoryQuote;
    }, 1000);
}

function rematch() {
    gameState.player1.destroy();
    gameState.player2.destroy();
    startFight();
}

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', () => {
    showScreen('main-menu');
});
