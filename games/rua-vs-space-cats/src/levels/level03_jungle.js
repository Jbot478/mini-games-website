// Level 3 - CRASH LANDING ON PLANET CAT
class Level03_Jungle {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.phase = 'entry_cutscene'; // entry_cutscene, gameplay
        this.rua = {
            x: 100,
            y: canvas.height - 150,
            vy: 0,
            grounded: true,
            size: 50,
            emoji: '🐕',
            health: 5,
            maxHealth: 5
        };
        this.platforms = [];
        this.enemies = [];
        this.vines = [];
        this.particles = []; // For spores
        this.dialogueSystem = null;
        this.complete = false;
        this.dead = false;  // Track if Rua died
        this.cinematicTime = 0;
        this.entryDialogueShown = false;
        this.missionDialogueShown = false;
        this.beepBopulator = { x: canvas.width - 100, y: canvas.height - 150, collected: false };
        this.generateLevel();
    }

    generateLevel() {
        // Ground
        this.platforms.push({ x: 0, y: this.canvas.height - 100, width: this.canvas.width, height: 100, type: 'ground' });

        // Fixed platforms - HIGHER and NON-COLLAPSING
        this.platforms.push({ x: 150, y: this.canvas.height - 200, width: 100, height: 20, type: 'platform' });
        this.platforms.push({ x: 300, y: this.canvas.height - 250, width: 100, height: 20, type: 'platform' });
        this.platforms.push({ x: 450, y: this.canvas.height - 220, width: 100, height: 20, type: 'platform' });
        this.platforms.push({ x: 600, y: this.canvas.height - 270, width: 100, height: 20, type: 'platform' });
        this.platforms.push({ x: 750, y: this.canvas.height - 240, width: 100, height: 20, type: 'platform' });
        this.platforms.push({ x: 900, y: this.canvas.height - 230, width: 100, height: 20, type: 'platform' });

        // Enemies
        for (let i = 0; i < 5; i++) {
            const weapons = ['🔪', '🗡️', '🔨', '🪓', '🏹'];
            this.enemies.push({
                x: 200 + i * 200,
                y: this.canvas.height - 150,
                direction: 1,
                speed: 0.5,
                patrolStart: 200 + i * 200 - 100,
                patrolEnd: 200 + i * 200 + 100,
                emoji: '🐱',
                weapon: weapons[i],
                health: 1,
                lastHitTime: null
            });
        }

        // Vines
        for (let i = 0; i < 10; i++) {
            this.vines.push({
                x: Math.random() * this.canvas.width,
                y: 0,
                length: 100 + Math.random() * 150,
                grabbed: false
            });
        }

        // Bioluminescent spores
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                drift: Math.random() * 0.5 - 0.25,
                color: ['#00ff88', '#88ff00', '#00ffff'][Math.floor(Math.random() * 3)]
            });
        }

        // Background trees/plants
        this.backgroundPlants = [];
        for (let i = 0; i < 8; i++) {
            this.backgroundPlants.push({
                x: Math.random() * this.canvas.width,
                y: this.canvas.height - 150 - Math.random() * 300,
                size: 60 + Math.random() * 80,
                type: Math.random() > 0.5 ? 'tree' : 'plant'
            });
        }
    }

    init(dialogueSystem) {
        this.dialogueSystem = dialogueSystem;
        this.phase = 'entry_cutscene';
        this.cinematicTime = 0;
        this.entryDialogueShown = false;
        this.missionDialogueShown = false;
        audioSystem.playMusic('jungle');
    }

    update(input, deltaTime) {
        this.cinematicTime += deltaTime;

        // Update particles
        this.particles.forEach(p => {
            p.y += Math.sin(p.x * 0.1 + this.cinematicTime * 0.001) * 0.1;
            p.x += p.drift * 0.1;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.x < 0) p.x = this.canvas.width;
        });

        switch(this.phase) {
            case 'entry_cutscene':
                if (!this.entryDialogueShown && this.cinematicTime < 100) {
                    this.entryDialogueShown = true;
                    this.dialogueSystem.show(
                        ['This place smells like someone gave up on hygiene.', 'Absolutely unacceptable.'],
                        'rua',
                        () => {
                            this.cinematicTime = 2000;
                        }
                    );
                }

                if (!this.missionDialogueShown && this.cinematicTime > 3000) {
                    this.missionDialogueShown = true;
                    this.dialogueSystem.show(
                        ['Oh no.', 'The Beep-Bopulator is missing.', 'It must have fallen off while I was being extremely brave and attractive.', 'I suppose I should go get it.'],
                        'rua',
                        () => {
                            this.phase = 'gameplay';
                        }
                    );
                }
                break;

            case 'gameplay':
                this.updateGameplay(input, deltaTime);
                break;
        }

        if (this.dialogueSystem) {
            this.dialogueSystem.update(input);
        }
    }

    updateGameplay(input, deltaTime) {
        const gravity = 0.5;
        const jumpPower = -12;
        const moveSpeed = 3;

        // Horizontal movement
        if (input.left || input.a) this.rua.x -= moveSpeed;
        if (input.right || input.d) this.rua.x += moveSpeed;

        // Jumping
        if ((input.space) && this.rua.grounded && !this.lastSpace) {
            this.rua.vy = jumpPower;
            this.rua.grounded = false;
            audioSystem.playSFX('jump');
        }
        this.lastSpace = input.space;

        // Gravity
        if (!this.rua.grounded) {
            this.rua.vy += gravity;
        }

        this.rua.y += this.rua.vy;

        // Platform collision - NO COLLAPSING
        this.rua.grounded = false;
        this.platforms.forEach(platform => {
            // Check if Rua is over the platform (with 20px margin on sides)
            if (this.rua.x + 20 > platform.x && this.rua.x - 20 < platform.x + platform.width) {
                // Check if Rua's bottom is hitting platform top (with tolerance)
                if (this.rua.y + 25 >= platform.y - 5 && this.rua.y + 25 <= platform.y + 15 && this.rua.vy >= 0) {
                    this.rua.y = platform.y - 25;
                    this.rua.vy = 0;
                    this.rua.grounded = true;
                }
            }
        });

        // Enemy patrol
        this.enemies.forEach(enemy => {
            enemy.x += enemy.direction * enemy.speed;
            if (enemy.x < enemy.patrolStart || enemy.x > enemy.patrolEnd) {
                enemy.direction *= -1;
            }

            // Check collision with Rua - VISUAL CONTACT ONLY (~30px)
            const dx = this.rua.x - enemy.x;
            const dy = this.rua.y - enemy.y;
            const distance = Math.sqrt(dx ** 2 + dy ** 2);

            if (distance < 30 && !enemy.lastHitTime) {  // 30px = visual contact only
                this.rua.health--;
                enemy.lastHitTime = Date.now();
                console.log(`💢 Rua hit by cat! Distance: ${distance.toFixed(1)}px Health: ${this.rua.health}/${this.rua.maxHealth}`);
                audioSystem.playSFX('hit');

                if (this.rua.health <= 0) {
                    console.log('💀 Rua died in jungle!');
                    this.dead = true;  // Mark as dead, triggers restart
                    return;  // Exit update early
                }
            }

            // Reset hit cooldown
            if (enemy.lastHitTime && Date.now() - enemy.lastHitTime > 500) {
                enemy.lastHitTime = null;
            }
        });

        // Check Beep-Bopulator collection
        if (Math.abs(this.rua.x - this.beepBopulator.x) < 50 && !this.beepBopulator.collected) {
            this.beepBopulator.collected = true;
            this.complete = true;
        }

        // Bounds
        this.rua.x = Math.max(0, Math.min(this.canvas.width - 50, this.rua.x));
    }

    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Background - alien jungle
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#0a3d0a');
        gradient.addColorStop(1, '#1a5a1a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Background plants/trees (behind green overlay)
        if (this.backgroundPlants) {
            this.backgroundPlants.forEach(plant => {
                ctx.globalAlpha = 0.4;
                if (plant.type === 'tree') {
                    // Tree trunk
                    ctx.fillStyle = '#8b6f47';
                    ctx.fillRect(plant.x - 8, plant.y, 16, plant.size * 0.6);
                    // Tree foliage
                    ctx.fillStyle = '#2d5a2d';
                    ctx.beginPath();
                    ctx.ellipse(plant.x, plant.y, plant.size * 0.5, plant.size * 0.7, 0, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    // Plant
                    ctx.fillStyle = '#4a7c3a';
                    for (let i = 0; i < 5; i++) {
                        ctx.beginPath();
                        ctx.ellipse(plant.x - plant.size / 4 + i * (plant.size / 5), plant.y, 8, plant.size * 0.3, Math.PI * 0.3, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
                ctx.globalAlpha = 1;
            });
        }

        // Massive leaves (background)
        ctx.globalAlpha = 0.3;
        for (let i = 0; i < 5; i++) {
            ctx.fillStyle = '#2d5a2d';
            ctx.beginPath();
            ctx.ellipse(100 + i * 250, 100 + i * 100, 150, 200, Math.PI * 0.2 * i, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Bioluminescent spores
        this.particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = 0.6;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        ctx.globalAlpha = 1;

        // Vines
        this.vines.forEach(vine => {
            ctx.strokeStyle = '#2d5a2d';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(vine.x, vine.y);
            ctx.lineTo(vine.x + Math.sin(this.cinematicTime * 0.001) * 10, vine.y + vine.length);
            ctx.stroke();
        });

        // Platforms
        this.platforms.forEach(platform => {
            if (platform.type === 'ground') {
                ctx.fillStyle = '#3d2817';
            } else {
                ctx.fillStyle = platform.collapsing ? '#8b4513' : '#a0522d';
            }
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

            // Moss
            ctx.fillStyle = '#2d5a2d';
            ctx.fillRect(platform.x, platform.y, platform.width, 5);
        });

        // Enemies
        this.enemies.forEach(enemy => {
            ctx.font = '40px Arial';
            ctx.fillText(enemy.emoji, enemy.x - 20, enemy.y);
            // Draw weapon
            ctx.font = '24px Arial';
            ctx.fillText(enemy.weapon, enemy.x + 15, enemy.y - 10);
        });

        // Beep-Bopulator
        if (!this.beepBopulator.collected) {
            ctx.font = '40px Arial';
            ctx.fillText('🔧', this.beepBopulator.x, this.beepBopulator.y);
            // Glow
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = 'yellow';
            ctx.fillRect(this.beepBopulator.x - 5, this.beepBopulator.y - 45, 50, 50);
            ctx.globalAlpha = 1;
        }

        // Player - FLIPPED LEFT
        ctx.font = '50px Arial';
        ctx.save();
        ctx.scale(-1, 1);
        ctx.fillText(this.rua.emoji, -(this.rua.x - 25), this.rua.y);
        ctx.restore();

        // Crashed basket in background
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(50, h - 200, 80, 100);
        ctx.globalAlpha = 1;

        if (this.dialogueSystem) {
            this.dialogueSystem.draw();
        }
    }

    isComplete() {
        return this.complete;
    }

    isDead() {
        return this.dead;
    }
}
