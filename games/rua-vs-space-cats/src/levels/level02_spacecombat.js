// Level 2 - Space Combat: ZERO GRAVITY, ZERO PATIENCE
class Level02_SpaceCombat {
    constructor(canvas, ctx) {
        console.log('🚨🚨🚨 LEVEL 2 CONSTRUCTOR CALLED - NEW VERSION LOADED 🚨🚨🚨');
        this.canvas = canvas;
        this.ctx = ctx;
        this.phase = 'pre_cinematic'; // pre_cinematic, gameplay, end_cutscene
        this.rua = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: 0,
            vy: 0,
            size: 50,
            emoji: '🐕',
            health: 5,  // Rua now has health
            maxHealth: 5
        };
        this.basket = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            width: 80,
            height: 100
        };
        this.enemies = [];
        this.debris = [];
        this.lasers = [];
        this.stars = this.generateStars(100);
        this.dialogueSystem = null;
        this.complete = false;
        this.dead = false;  // Track if Rua died
        this.cinematicTime = 0;
        this.enemiesDefeated = 0;
        this.weaponBox = null;
        this.endSequenceStarted = false;
        this.weaponFired = false;
        this.crashLanded = false;
        this.alarmDialogueShown = false;
        this.tauntDialogueShown = false;
    }

    generateStars(count) {
        const stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                drift: Math.random() * 0.5 - 0.25
            });
        }
        return stars;
    }

    spawnEnemies() {
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const radius = 300;
            this.enemies.push({
                x: this.canvas.width / 2 + Math.cos(angle) * radius,
                y: this.canvas.height / 2 + Math.sin(angle) * radius,
                angle: angle,
                health: 1,  // ONE HIT TO DEFEAT
                circleSpeed: 0.001,
                retreating: false,
                emoji: '🐱'
            });
        }
    }

    spawnDebris() {
        for (let i = 0; i < 5; i++) {
            this.debris.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: 30 + Math.random() * 20,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: Math.random() * 0.002 - 0.001
            });
        }
    }

    init(dialogueSystem) {
        console.log('🚨🚨🚨 LEVEL 2 INIT CALLED - PHASE:', this.phase, '🚨🚨🚨');
        this.dialogueSystem = dialogueSystem;
        this.phase = 'pre_cinematic';
        this.cinematicTime = 0;
        this.endSequenceStarted = false;
        this.weaponFired = false;
        this.crashLanded = false;
        this.alarmDialogueShown = false;
        this.tauntDialogueShown = false;
        this.weaponBox = null;
        this.enemies = [];
        this.debris = [];
        this.lasers = [];
        this.enemiesDefeated = 0;
        this.spawnEnemies();
        this.spawnDebris();
        audioSystem.playMusic('space_combat');
    }

    update(input, deltaTime) {
        this.cinematicTime += deltaTime;

        // Debug: Log current phase every 60 frames (~1 second)
        if (Math.random() < 0.016) {
            console.log(`🎮 Update called - Phase: ${this.phase}, Defeated: ${this.enemiesDefeated}, Enemies: ${this.enemies.length}`);
        }

        // Star drift
        this.stars.forEach(star => {
            star.x += star.drift * deltaTime * 0.01;
            if (star.x > this.canvas.width) star.x = 0;
            if (star.x < 0) star.x = this.canvas.width;
        });

        switch(this.phase) {
            case 'pre_cinematic':
                // Camera pulls back
                console.log(`⏱️ Pre-cinematic: ${this.cinematicTime}ms (need 2000ms)`);
                if (this.cinematicTime > 2000) {
                    console.log('✨ Switching from pre_cinematic to gameplay!');
                    this.phase = 'gameplay';
                    this.cinematicTime = 0;
                }
                break;

            case 'gameplay':
                this.updateGameplay(input, deltaTime);

                // Check win condition
                if (this.enemiesDefeated >= 8 && !this.weaponBox) {
                    console.log(`📦 Spawning weapon box. Defeated: ${this.enemiesDefeated}, Remaining: ${this.enemies.length}`);
                    this.spawnWeaponBox();
                }

                // Automatically start cutscene once all enemies are dead
                if (this.enemiesDefeated >= 8 && this.enemies.length === 0 && !this.endSequenceStarted) {
                    console.log('🎬 AUTO-STARTING END CUTSCENE! All cats dead and box spawned.');
                    this.startEndCutscene();
                }
                break;

            case 'end_cutscene':
                this.updateEndCutscene(input, deltaTime);
                break;
        }

        if (this.dialogueSystem) {
            this.dialogueSystem.update(input);
        }
    }

    updateGameplay(input, deltaTime) {
        const inertia = 0.92;
        const acceleration = 0.3;
        const maxSpeed = 5;

        // Player movement with inertia
        if (input.up || input.w) this.rua.vy -= acceleration;
        if (input.down || input.s) this.rua.vy += acceleration;
        if (input.left || input.a) this.rua.vx -= acceleration;
        if (input.right || input.d) this.rua.vx += acceleration;

        // Apply inertia
        this.rua.vx *= inertia;
        this.rua.vy *= inertia;

        // Limit speed
        const speed = Math.sqrt(this.rua.vx ** 2 + this.rua.vy ** 2);
        if (speed > maxSpeed) {
            this.rua.vx = (this.rua.vx / speed) * maxSpeed;
            this.rua.vy = (this.rua.vy / speed) * maxSpeed;
        }

        // Update position
        this.rua.x += this.rua.vx;
        this.rua.y += this.rua.vy;

        // Keep in bounds
        this.rua.x = Math.max(50, Math.min(this.canvas.width - 50, this.rua.x));
        this.rua.y = Math.max(50, Math.min(this.canvas.height - 50, this.rua.y));

        // Shooting
        if (input.space && !this.lastSpace) {
            this.fireLaser();
        }
        this.lastSpace = input.space;

        // Update lasers
        this.lasers.forEach(laser => {
            laser.x += laser.vx;
            laser.y += laser.vy;
        });
        this.lasers = this.lasers.filter(l =>
            l.x > 0 && l.x < this.canvas.width && l.y > 0 && l.y < this.canvas.height
        );

        // Update enemies
        this.enemies.forEach(enemy => {
            if (!enemy.retreating) {
                enemy.angle += enemy.circleSpeed * deltaTime;
                const radius = 250;
                const targetX = this.rua.x + Math.cos(enemy.angle) * radius;
                const targetY = this.rua.y + Math.sin(enemy.angle) * radius;
                enemy.x += (targetX - enemy.x) * 0.02;
                enemy.y += (targetY - enemy.y) * 0.02;
            } else {
                // Retreat from player
                const dx = enemy.x - this.rua.x;
                const dy = enemy.y - this.rua.y;
                const dist = Math.sqrt(dx ** 2 + dy ** 2);
                enemy.x += (dx / dist) * 2;
                enemy.y += (dy / dist) * 2;
            }

            // Check laser collision
            this.lasers.forEach(laser => {
                if (this.checkCollision(laser, enemy)) {
                    console.log(`💥 HIT! Laser hit enemy at (${enemy.x}, ${enemy.y}), health: ${enemy.health} → ${enemy.health - 1}`);
                    enemy.health--;
                    laser.active = false;
                    audioSystem.playSFX('hit');

                    if (enemy.health <= 0) {
                        enemy.dead = true;
                        enemy.retreating = true;  // Only retreat after death
                        this.enemiesDefeated++;
                        console.log(`💀 Enemy defeated! Total: ${this.enemiesDefeated}/8`);
                    }
                }
            });

            // Check enemy collision with Rua - damage Rua (strict contact only)
            if (this.checkCollision(this.rua, enemy) && !enemy.dead && !enemy.lastHitTime) {
                this.rua.health--;
                enemy.lastHitTime = Date.now();  // Prevent spam damage
                console.log(`💢 Rua hit by enemy! Distance: ${this.getDistance(this.rua, enemy).toFixed(1)}px Health: ${this.rua.health}/5`);
                audioSystem.playSFX('hit');

                if (this.rua.health <= 0) {
                    console.log('💀 Rua died in space!');
                    this.dead = true;  // Mark as dead, triggers restart
                }
            }

            // Reset hit cooldown after 500ms
            if (enemy.lastHitTime && Date.now() - enemy.lastHitTime > 500) {
                enemy.lastHitTime = null;
            }
        });

        this.enemies = this.enemies.filter(e => !e.dead);
        this.lasers = this.lasers.filter(l => l.active !== false);

        // Update debris rotation
        this.debris.forEach(d => {
            d.rotation += d.rotationSpeed * deltaTime;
        });

        // Update weapon box
        if (this.weaponBox) {
            this.weaponBox.rotation += deltaTime * 0.001;
        }
    }

    updateEndCutscene(input, deltaTime) {
        // DO NOT process input during cutscene - lock player in place
        // Weapon box enters from top and hovers, aiming
        if (this.weaponBox) {
            // NO spinning - only slight tilt for drama
            this.weaponBox.rotation = 0.05;  // Slight tilt, not spinning

            // Box enters from top VERY slowly
            const targetX = this.rua.x;
            const targetY = Math.max(120, this.rua.y - 280);  // Hover above Rua
            this.weaponBox.x += (targetX - this.weaponBox.x) * 0.005;  // Even slower
            this.weaponBox.y += (targetY - this.weaponBox.y) * 0.005;  // Even slower
        }

        // First dialogue: Rua notices the box
        if (!this.alarmDialogueShown && this.cinematicTime >= 1200 && this.dialogueSystem && !this.dialogueSystem.isActive) {
            this.alarmDialogueShown = true;
            console.log('📢 Showing first dialogue: What the hell is that thing?');
            this.dialogueSystem.show(
                'What the hell is that thing?',
                'rua',
                () => {
                    console.log('First dialogue done');
                }
            );
        }

        // Dramatic pause - weapon charges
        if (this.cinematicTime >= 3500 && !this.weaponFired) {
            console.log('💥 Weapon fires! Knocking Rua into basket');
            audioSystem.playSFX('explosion');
            this.weaponFired = true;

            // Rua gets knocked into the yellow basket and starts falling
            this.basket.x = this.rua.x - this.basket.width / 2;
            this.basket.y = this.rua.y - this.basket.height / 2;
            this.basket.vx = -1.5;
            this.basket.vy = 1.8;

            if (!this.tauntDialogueShown && this.dialogueSystem) {
                this.tauntDialogueShown = true;
                console.log('💬 Showing taunt dialogue');
                this.dialogueSystem.show(
                    'My only regret is not tearing apart that ugly Shih Tzu from across the road.',
                    'rua',
                    null
                );
            }
        }

        // Slow crash sequence
        if (this.weaponFired && !this.crashLanded) {
            this.basket.vy += 0.12;  // Slower gravity
            this.basket.x += this.basket.vx;
            this.basket.y += this.basket.vy;

            // Keep crash path on screen horizontally
            if (this.basket.x < 40 || this.basket.x > this.canvas.width - this.basket.width - 40) {
                this.basket.vx *= -0.8;
            }

            // Complete after crash exits toward planet below - more time on screen
            if (this.basket.y > this.canvas.height + 200) {
                this.crashLanded = true;
                this.complete = true;
                console.log('✅ Crash landing complete!');
            }
        }
    }

    startEndCutscene() {
        if (this.endSequenceStarted) return;
        this.endSequenceStarted = true;
        this.phase = 'end_cutscene';
        this.cinematicTime = 0;
        console.log('✅ End cutscene phase activated. cinematicTime reset to 0');
    }

    fireLaser() {
        const angle = 0; // Fire forward (right)
        this.lasers.push({
            x: this.rua.x + 30,
            y: this.rua.y,
            vx: 8,
            vy: 0,
            size: 5,
            active: true
        });
        console.log(`🔫 Fired laser from Rua at (${this.rua.x}, ${this.rua.y}), total lasers: ${this.lasers.length}`);
        audioSystem.playSFX('bark');
    }

    spawnWeaponBox() {
        this.weaponBox = {
            x: this.canvas.width / 2,
            y: -100,  // Start above screen
            size: 80,  // Bigger
            rotation: 0,
            emoji: '📦'
        };
    }

    checkCollision(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.sqrt(dx ** 2 + dy ** 2);
        return distance < 30;  // 30px = visual contact only
    }

    getDistance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx ** 2 + dy ** 2);
    }

    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Space background
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, h);

        // Stars
        this.stars.forEach(star => {
            ctx.fillStyle = 'white';
            ctx.fillRect(star.x, star.y, star.size, star.size);
        });

        // Debris
        this.debris.forEach(d => {
            ctx.save();
            ctx.translate(d.x, d.y);
            ctx.rotate(d.rotation);
            ctx.fillStyle = '#555';
            ctx.fillRect(-d.size / 2, -d.size / 2, d.size, d.size);
            ctx.restore();
        });

        // Lasers
        this.lasers.forEach(laser => {
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(laser.x, laser.y - 2, 20, 4);
            ctx.fillStyle = '#FFF';
            ctx.fillRect(laser.x, laser.y - 1, 20, 2);
        });

        // Enemies
        this.enemies.forEach(enemy => {
            ctx.font = '40px Arial';
            ctx.fillText(enemy.emoji, enemy.x - 20, enemy.y + 10);
        });

        // Weapon box
        if (this.weaponBox) {
            ctx.save();
            ctx.translate(this.weaponBox.x, this.weaponBox.y);
            ctx.rotate(this.weaponBox.rotation);
            ctx.font = '50px Arial';
            ctx.fillText(this.weaponBox.emoji, -25, 15);
            // Warning glow
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = 'red';
            ctx.fillRect(-35, -35, 70, 70);
            ctx.globalAlpha = 1;
            ctx.restore();

            // Attack beam during firing sequence
            if (this.phase === 'end_cutscene' && !this.weaponFired) {
                ctx.strokeStyle = 'rgba(255, 60, 60, 0.85)';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(this.weaponBox.x, this.weaponBox.y + 25);
                ctx.lineTo(this.rua.x, this.rua.y);
                ctx.stroke();
            }
        }

        // Player / crash basket
        if (this.phase === 'end_cutscene' && this.weaponFired) {
            // Yellow basket tumbling down
            ctx.save();
            ctx.translate(this.basket.x + this.basket.width / 2, this.basket.y + this.basket.height / 2);
            ctx.rotate(this.cinematicTime * 0.003);
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(-this.basket.width / 2, -this.basket.height / 2, this.basket.width, this.basket.height);
            ctx.fillStyle = '#FFA500';
            ctx.fillRect(-this.basket.width / 2, -this.basket.height / 2 + 12, this.basket.width, 4);
            ctx.fillRect(-this.basket.width / 2, -this.basket.height / 2 + 36, this.basket.width, 4);
            ctx.fillRect(-this.basket.width / 2, -this.basket.height / 2 + 60, this.basket.width, 4);
            ctx.font = '40px Arial';
            ctx.fillText('🐕', -18, 8);
            ctx.restore();
        } else if (this.phase === 'end_cutscene') {
            // Rua facing LEFT toward weapon before crash
            ctx.font = '50px Arial';
            ctx.save();
            ctx.scale(-1, 1);
            ctx.fillText('🐕', -(this.rua.x - 25), this.rua.y + 10);
            ctx.restore();
        } else {
            // Normal gameplay - facing LEFT (flipped from original)
            ctx.font = '50px Arial';
            ctx.save();
            ctx.scale(-1, 1);
            ctx.fillText('🐕', -(this.rua.x - 25), this.rua.y + 10);
            ctx.restore();
        }

        if (this.dialogueSystem) {
            this.dialogueSystem.draw();
        }

        // Level title at start
        if (this.phase === 'pre_cinematic' && this.cinematicTime < 2000) {
            this.drawLevelTitle();
        }
    }

    drawLevelTitle() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const alpha = this.cinematicTime < 500
            ? this.cinematicTime / 500
            : this.cinematicTime > 1500
                ? (2000 - this.cinematicTime) / 500
                : 1;

        ctx.globalAlpha = alpha;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, h / 2 - 80, w, 160);

        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px "Comic Sans MS", cursive';
        ctx.textAlign = 'center';
        ctx.fillText('ZERO GRAVITY, ZERO PATIENCE', w / 2, h / 2);
        ctx.textAlign = 'left';
        ctx.globalAlpha = 1;
    }

    isComplete() {
        return this.complete;
    }

    isDead() {
        return this.dead;
    }
}
