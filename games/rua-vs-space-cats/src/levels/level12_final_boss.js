// Level 12 - SPACE, BUT PERSONAL (Final Boss)
class Level12_FinalBoss {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.rua = { x: 100, y: canvas.height / 2, vx: 0, vy: 0, health: 10, size: 50, emoji: '🐕' };
        this.sprinkles = { x: canvas.width - 150, y: canvas.height / 2, health: 15, attackTimer: 0, emoji: '🐶' };
        this.lasers = [];
        this.enemyProjectiles = [];
        this.stars = this.generateStars(100);
        this.dialogueSystem = null;
        this.complete = false;
        this.phase = 'dialogue';
        this.phaseTime = 0;
    }

    generateStars(count) {
        const stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5
            });
        }
        return stars;
    }

    init(dialogueSystem) {
        this.dialogueSystem = dialogueSystem;
        audioSystem.playMusic('boss');

        this.dialogueSystem.show(
            'You never deserved everything.',
            'sprinkles',
            () => {
                this.dialogueSystem.show(
                    'I deserve more.',
                    'rua',
                    () => {
                        this.phase = 'battle';
                    }
                );
            }
        );
    }

    update(input, deltaTime) {
        this.phaseTime += deltaTime;

        if (this.phase === 'battle') {
            this.updateBattle(input, deltaTime);
        }

        if (this.sprinkles.health <= 0 && this.phase !== 'victory') {
            this.phase = 'victory';
            this.showVictory();
        }

        if (this.dialogueSystem) {
            this.dialogueSystem.update(input);
        }
    }

    updateBattle(input, deltaTime) {
        const inertia = 0.92;
        const acceleration = 0.3;
        const maxSpeed = 5;

        // Player movement
        if (input.up || input.w) this.rua.vy -= acceleration;
        if (input.down || input.s) this.rua.vy += acceleration;
        if (input.left || input.a) this.rua.vx -= acceleration;
        if (input.right || input.d) this.rua.vx += acceleration;

        this.rua.vx *= inertia;
        this.rua.vy *= inertia;

        const speed = Math.sqrt(this.rua.vx ** 2 + this.rua.vy ** 2);
        if (speed > maxSpeed) {
            this.rua.vx = (this.rua.vx / speed) * maxSpeed;
            this.rua.vy = (this.rua.vy / speed) * maxSpeed;
        }

        this.rua.x += this.rua.vx;
        this.rua.y += this.rua.vy;

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

        // Sprinkles attack
        this.sprinkles.attackTimer += deltaTime;
        if (this.sprinkles.attackTimer > 1500) {
            this.sprinklesAttack();
            this.sprinkles.attackTimer = 0;
        }

        // Update enemy projectiles
        this.enemyProjectiles.forEach(proj => {
            proj.x += proj.vx;
            proj.y += proj.vy;
        });
        this.enemyProjectiles = this.enemyProjectiles.filter(p =>
            p.x > 0 && p.x < this.canvas.width && p.y > 0 && p.y < this.canvas.height
        );

        // Check collisions
        this.lasers.forEach(laser => {
            const dx = laser.x - this.sprinkles.x;
            const dy = laser.y - this.sprinkles.y;
            if (Math.sqrt(dx ** 2 + dy ** 2) < 50) {
                this.sprinkles.health--;
                laser.active = false;
                audioSystem.playSFX('hit');
            }
        });
        this.lasers = this.lasers.filter(l => l.active !== false);

        this.enemyProjectiles.forEach(proj => {
            const dx = proj.x - this.rua.x;
            const dy = proj.y - this.rua.y;
            if (Math.sqrt(dx ** 2 + dy ** 2) < 40) {
                this.rua.health--;
                proj.active = false;
                audioSystem.playSFX('hit');
            }
        });
        this.enemyProjectiles = this.enemyProjectiles.filter(p => p.active !== false);
    }

    fireLaser() {
        this.lasers.push({
            x: this.rua.x + 30,
            y: this.rua.y,
            vx: 8,
            vy: 0,
            active: true
        });
        audioSystem.playSFX('bark');
    }

    sprinklesAttack() {
        const dx = this.rua.x - this.sprinkles.x;
        const dy = this.rua.y - this.sprinkles.y;
        const dist = Math.sqrt(dx ** 2 + dy ** 2);

        this.enemyProjectiles.push({
            x: this.sprinkles.x,
            y: this.sprinkles.y,
            vx: (dx / dist) * 5,
            vy: (dy / dist) * 5,
            active: true
        });
    }

    showVictory() {
        this.dialogueSystem.show(
            ['I\'m never leaving again.', '…Unless I want to.'],
            'rua',
            () => {
                this.complete = true;
            }
        );
    }

    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Dark space
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, h);

        // Stars
        this.stars.forEach(star => {
            ctx.fillStyle = 'white';
            ctx.fillRect(star.x, star.y, star.size, star.size);
        });

        // Lasers
        this.lasers.forEach(laser => {
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(laser.x, laser.y - 2, 20, 4);
        });

        // Enemy projectiles
        this.enemyProjectiles.forEach(proj => {
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, 8, 0, Math.PI * 2);
            ctx.fill();
        });

        // Sprinkles
        if (this.sprinkles.health > 0) {
            ctx.font = '60px Arial';
            ctx.fillText(this.sprinkles.emoji, this.sprinkles.x - 30, this.sprinkles.y);

            // Health bar
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(this.sprinkles.x - 40, this.sprinkles.y - 60, 80, 10);
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(this.sprinkles.x - 40, this.sprinkles.y - 60, (80 * this.sprinkles.health) / 15, 10);
        }

        // Player
        ctx.font = '50px Arial';
        ctx.fillText(this.rua.emoji, this.rua.x - 25, this.rua.y);

        // Health bar
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.rua.x - 25, this.rua.y - 60, 50, 10);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.rua.x - 25, this.rua.y - 60, (50 * this.rua.health) / 10, 10);

        if (this.dialogueSystem) {
            this.dialogueSystem.draw();
        }
    }

    isComplete() {
        return this.complete;
    }
}
