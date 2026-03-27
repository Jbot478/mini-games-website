// Level 6 - THE MOUNTAIN THAT HATES YOU
class Level06_Mountain {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.rua = {
            x: 100,
            y: canvas.height - 150,
            vy: 0,
            grounded: true,
            hasDoubleJumped: false,
            size: 50,
            emoji: '🐕',
            health: 4,
            facing: 'left'
        };
        this.platforms = this.generatePlatforms();
        this.enemyCats = this.generateEnemyCats();
        this.rocks = [];
        this.windForce = 0;
        this.cameraY = 0;
        this.targetCameraY = 0;
        this.autoScrollSpeed = 0.028; // px/ms (slower for easier pacing)
        this.worldTopY = this.getHighestPlatformY() - 70;
        this.exitDoor = {
            x: 60,
            y: this.getHighestPlatformY() - 120,
            width: 84,
            height: 120,
            inRange: false
        };
        this.nextLevelOverride = null;
        this.dead = false;
        this.autoDialogueTimer = 0;
        this.dialogueSystem = null;
        this.complete = false;
    }

    generatePlatforms() {
        const platforms = [];
        platforms.push({ x: 0, y: this.canvas.height - 100, width: this.canvas.width, height: 100 });

        // Reachable climbing path (gentler spacing)
        for (let i = 0; i < 30; i++) {
            const side = i % 4;
            const baseX = [70, 300, 560, 830][side];
            platforms.push({
                x: baseX + Math.random() * 55,
                y: this.canvas.height - 190 - i * 82,
                width: 185,
                height: 20
            });
        }

        // Final top-left ledge for the entrance
        const topY = this.canvas.height - 190 - 29 * 82;
        platforms.push({ x: 0, y: topY - 30, width: 260, height: 24 });

        return platforms;
    }

    getHighestPlatformY() {
        return Math.min(...this.platforms.map(p => p.y));
    }

    generateEnemyCats() {
        const enemies = [];
        // Place cats on selected higher platforms
        const enemyPlatformIndices = [7, 13, 19, 24];
        enemyPlatformIndices.forEach(index => {
            const p = this.platforms[index];
            if (!p) return;
            enemies.push({
                x: p.x + p.width / 2,
                y: p.y - 24,
                size: 44,
                emoji: '😾',
                alive: true,
                dir: Math.random() > 0.5 ? 1 : -1,
                speed: 0.5,
                left: p.x + 25,
                right: p.x + p.width - 25
            });
        });
        return enemies;
    }

    init(dialogueSystem) {
        this.dialogueSystem = dialogueSystem;
        this.dialogueSystem.position = 'top';
        this.dead = false;
        audioSystem.playMusic('mountain');
    }

    update(input, deltaTime) {
        if (this.dead || this.complete) return;

        this.autoDialogueTimer += deltaTime;

        // Auto-dialogue
        if (this.autoDialogueTimer > 5000 && this.autoDialogueTimer < 5100) {
            this.dialogueSystem.show('This is too high.', 'rua', () => {});
        }
        if (this.autoDialogueTimer > 10000 && this.autoDialogueTimer < 10100) {
            this.dialogueSystem.show('That Shih Tzu would have quit already.', 'rua', () => {});
        }

        const gravity = 0.5;
        const jumpPower = -12;
        const moveSpeed = 3;

        // Wind effect
        this.windForce = Math.sin(Date.now() * 0.001) * 1.2;

        // Movement
        if (input.left || input.a) {
            this.rua.x -= moveSpeed;
            this.rua.facing = 'left';
        }
        if (input.right || input.d) {
            this.rua.x += moveSpeed;
            this.rua.facing = 'right';
        }

        // Apply wind when in air
        if (!this.rua.grounded) {
            this.rua.x += this.windForce * 0.5;
        }

        // Jumping
        if (input.space && this.rua.grounded && !this.lastSpace) {
            this.rua.vy = jumpPower;
            this.rua.grounded = false;
            audioSystem.playSFX('jump');
        } else if (input.space && !this.rua.grounded && !this.rua.hasDoubleJumped && !this.lastSpace) {
            this.rua.vy = jumpPower;
            this.rua.hasDoubleJumped = true;
            audioSystem.playSFX('jump');
        }
        this.lastSpace = input.space;

        // Gravity
        const prevY = this.rua.y;
        this.rua.vy += gravity;
        this.rua.y += this.rua.vy;

        // Enemy cats patrol + stomp logic
        this.enemyCats.forEach(cat => {
            if (!cat.alive) return;
            cat.x += cat.dir * cat.speed;
            if (cat.x < cat.left || cat.x > cat.right) {
                cat.dir *= -1;
            }

            const dx = Math.abs(this.rua.x - cat.x);
            const dy = this.rua.y - cat.y;
            const overlap = dx < 36 && Math.abs(dy) < 35;

            if (overlap) {
                // Stomp kill if Rua is descending and above the cat
                if (this.rua.vy > 1 && this.rua.y < cat.y - 5) {
                    cat.alive = false;
                    this.rua.vy = -8;
                    audioSystem.playSFX('hit');
                } else {
                    // Side contact hurts
                    this.rua.health--;
                    this.rua.x += this.rua.x < cat.x ? -30 : 30;
                    audioSystem.playSFX('hit');
                    if (this.rua.health <= 0) {
                        this.dead = true;
                    }
                }
            }
        });

        // Platform collision
        this.rua.grounded = false;
        this.platforms.forEach(platform => {
            const feetHalfWidth = 20;
            const prevBottom = prevY + 25;
            const newBottom = this.rua.y + 25;
            const overPlatform = this.rua.x + feetHalfWidth > platform.x && this.rua.x - feetHalfWidth < platform.x + platform.width;
            const crossesTop = prevBottom <= platform.y + 2 && newBottom >= platform.y;

            if (overPlatform && crossesTop && this.rua.vy >= 0) {
                    this.rua.y = platform.y - 25;
                    this.rua.vy = 0;
                    this.rua.grounded = true;
                    this.rua.hasDoubleJumped = false;
            }
        });

        // Camera: continuous upward movement + follow player progress (upward world is negative Y)
        this.cameraY -= this.autoScrollSpeed * deltaTime;
        this.targetCameraY = Math.min(0, this.rua.y - this.canvas.height * 0.55);

        // If Rua climbs faster than auto-scroll, smoothly catch up
        if (this.cameraY > this.targetCameraY) {
            this.cameraY += (this.targetCameraY - this.cameraY) * 0.14;
        }

        // Spawn falling rocks
        if (Math.random() < 0.02) {
            this.rocks.push({
                x: Math.random() * this.canvas.width,
                y: this.cameraY - 50,
                vy: 2
            });
        }

        // Update rocks
        this.rocks.forEach(rock => {
            rock.y += rock.vy;
            rock.vy += 0.2;
        });
        this.rocks = this.rocks.filter(r => r.y < this.cameraY + this.canvas.height + 100);

        // If Rua falls below the camera view, fail level
        if (this.rua.y - this.cameraY > this.canvas.height + 120) {
            this.dead = true;
        }

        // Top-left village entrance
        const enterJustPressed = input.enter && !this.lastEnter;
        this.exitDoor.inRange = Math.abs(this.rua.x - (this.exitDoor.x + this.exitDoor.width / 2)) < 75
            && Math.abs(this.rua.y - (this.exitDoor.y + this.exitDoor.height - 20)) < 90;

        if (this.exitDoor.inRange && enterJustPressed) {
            this.nextLevelOverride = 7; // Next sequence level: human village/servants
            this.complete = true;
        }

        this.lastEnter = input.enter;

        if (this.dialogueSystem) {
            this.dialogueSystem.update(input);
        }
    }

    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.save();
        ctx.translate(0, -this.cameraY);

        // Sky background
        const gradient = ctx.createLinearGradient(0, this.cameraY, 0, this.cameraY + h);
        gradient.addColorStop(0, '#8fc4ff');
        gradient.addColorStop(1, '#5e86b6');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, this.cameraY - 1000, w, h + 2000);

        // Mountain terrain layers
        const drawMountainBand = (color, offsetY, heightScale, jag) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(0, this.cameraY + h);
            for (let x = 0; x <= w; x += 80) {
                const y = this.cameraY + h - offsetY - Math.sin((x + this.cameraY * 0.5) * 0.01 + jag) * heightScale - Math.cos((x + this.cameraY * 0.18) * 0.016 + jag) * 18;
                ctx.lineTo(x, y);
            }
            ctx.lineTo(w, this.cameraY + h);
            ctx.closePath();
            ctx.fill();
        };

        drawMountainBand('#4f5d75', 100, 45, 0.2);
        drawMountainBand('#3f4c63', 170, 65, 1.2);
        drawMountainBand('#313c50', 230, 85, 2.1);

        // Clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (let i = 0; i < 10; i++) {
            const y = this.cameraY + i * 200 - 500 + Math.sin(Date.now() * 0.0005 + i) * 50;
            ctx.beginPath();
            ctx.arc(100 + i * 150, y, 50, 0, Math.PI * 2);
            ctx.fill();
        }

        // Platforms
        this.platforms.forEach(platform => {
            ctx.fillStyle = '#8b7355';
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            ctx.fillStyle = '#6f5a43';
            ctx.fillRect(platform.x, platform.y + 14, platform.width, 6);
        });

        // Top-left entrance to village
        ctx.fillStyle = '#4a3b2f';
        ctx.fillRect(this.exitDoor.x, this.exitDoor.y, this.exitDoor.width, this.exitDoor.height);
        ctx.fillStyle = '#2e8b57';
        ctx.fillRect(this.exitDoor.x + 8, this.exitDoor.y + 10, this.exitDoor.width - 16, this.exitDoor.height - 20);
        ctx.font = '44px Arial';
        ctx.fillText('🏘️', this.exitDoor.x + 16, this.exitDoor.y + 78);

        if (this.exitDoor.inRange) {
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.font = '16px Arial';
            ctx.strokeText('[ENTER] Village Entrance', this.exitDoor.x - 20, this.exitDoor.y - 14);
            ctx.fillText('[ENTER] Village Entrance', this.exitDoor.x - 20, this.exitDoor.y - 14);
        }

        // Enemy cats
        this.enemyCats.forEach(cat => {
            if (!cat.alive) return;
            ctx.font = `${cat.size}px Arial`;
            ctx.fillText(cat.emoji, cat.x - 22, cat.y + 10);
        });

        // Falling rocks
        this.rocks.forEach(rock => {
            ctx.fillStyle = '#696969';
            ctx.fillRect(rock.x, rock.y, 30, 30);
        });

        // Player
        ctx.font = '50px Arial';
        if (this.rua.facing === 'left') {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.fillText(this.rua.emoji, -(this.rua.x - 25), this.rua.y);
            ctx.restore();
        } else {
            ctx.fillText(this.rua.emoji, this.rua.x - 25, this.rua.y);
        }

        ctx.restore();

        // Wind indicator
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '30px Arial';
        const windText = this.windForce > 0 ? '💨 →' : '← 💨';
        ctx.fillText(windText, w / 2 - 40, 50);

        // HUD
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(12, 12, 210, 64);
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        const progress = Math.min(100, Math.max(0, Math.round((((this.canvas.height - 150) - this.rua.y) / ((this.canvas.height - 150) - this.worldTopY)) * 100)));
        ctx.fillText(`Climb: ${progress}%`, 22, 35);
        ctx.fillText(`Hearts: ${'❤️'.repeat(Math.max(0, this.rua.health))}`, 22, 58);

        if (this.exitDoor.inRange) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
            ctx.fillRect(12, 82, 480, 34);
            ctx.fillStyle = '#ffe082';
            ctx.font = 'bold 16px Arial';
            ctx.fillText('At last. My glorious return route. Try to keep up, peasants.', 22, 104);
        }

        if (this.dialogueSystem) {
            this.dialogueSystem.draw();
        }
    }

    isComplete() {
        return this.complete;
    }

    getNextLevelOverride() {
        return this.nextLevelOverride;
    }

    isDead() {
        return this.dead;
    }
}
