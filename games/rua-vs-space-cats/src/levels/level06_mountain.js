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
            emoji: '🐕'
        };
        this.platforms = this.generatePlatforms();
        this.rocks = [];
        this.windForce = 0;
        this.cameraY = 0;
        this.targetCameraY = 0;
        this.dialogueSystem = null;
        this.complete = false;
    }

    generatePlatforms() {
        const platforms = [];
        platforms.push({ x: 0, y: this.canvas.height - 100, width: this.canvas.width, height: 100 });

        // Vertical platforms going up
        for (let i = 0; i < 15; i++) {
            platforms.push({
                x: 100 + (i % 3) * 300 + Math.random() * 100,
                y: this.canvas.height - 200 - i * 150,
                width: 120,
                height: 20
            });
        }

        return platforms;
    }

    init(dialogueSystem) {
        this.dialogueSystem = dialogueSystem;
        audioSystem.playMusic('mountain');
    }

    update(input, deltaTime) {
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
        this.windForce = Math.sin(Date.now() * 0.001) * 2;

        // Movement
        if (input.left || input.a) this.rua.x -= moveSpeed;
        if (input.right || input.d) this.rua.x += moveSpeed;

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
        this.rua.vy += gravity;
        this.rua.y += this.rua.vy;

        // Platform collision
        this.rua.grounded = false;
        this.platforms.forEach(platform => {
            if (this.rua.x > platform.x && this.rua.x < platform.x + platform.width) {
                if (this.rua.y + 25 >= platform.y && this.rua.y + 25 <= platform.y + 30 && this.rua.vy >= 0) {
                    this.rua.y = platform.y - 25;
                    this.rua.vy = 0;
                    this.rua.grounded = true;
                    this.rua.hasDoubleJumped = false;
                }
            }
        });

        // Camera follow
        this.targetCameraY = Math.max(0, this.rua.y - this.canvas.height / 2);
        this.cameraY += (this.targetCameraY - this.cameraY) * 0.1;

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

        // Check if reached top
        if (this.rua.y < -2000) {
            this.complete = true;
        }

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
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#4682B4');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, this.cameraY - 1000, w, h + 2000);

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
        });

        // Falling rocks
        this.rocks.forEach(rock => {
            ctx.fillStyle = '#696969';
            ctx.fillRect(rock.x, rock.y, 30, 30);
        });

        // Player
        ctx.font = '50px Arial';
        ctx.fillText(this.rua.emoji, this.rua.x - 25, this.rua.y);

        ctx.restore();

        // Wind indicator
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '30px Arial';
        const windText = this.windForce > 0 ? '💨 →' : '← 💨';
        ctx.fillText(windText, w / 2 - 40, 50);

        if (this.dialogueSystem) {
            this.dialogueSystem.draw();
        }
    }

    isComplete() {
        return this.complete;
    }
}
