// Level 11 - BACK TO SETTLE IT
class Level11_Return {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.rua = { x: 100, y: canvas.height - 150, vy: 0, grounded: true, hasDoubleJumped: false, size: 50, emoji: '🐕' };
        this.waterSections = [ { x: 300, y: canvas.height - 150, width: 200, height: 150 } ];
        this.platforms = this.generatePlatforms();
        this.basketPart = { x: canvas.width - 150, y: 200, collected: false };
        this.dialogueSystem = null;
        this.complete = false;
        this.phase = 'gameplay';
    }

    generatePlatforms() {
        const platforms = [];
        platforms.push({ x: 0, y: this.canvas.height - 100, width: this.canvas.width, height: 100 });

        for (let i = 0; i < 10; i++) {
            platforms.push({
                x: 150 + i * 100,
                y: this.canvas.height - 200 - (i % 3) * 100,
                width: 80,
                height: 20
            });
        }

        return platforms;
    }

    init(dialogueSystem) {
        this.dialogueSystem = dialogueSystem;
        audioSystem.playMusic('office'); // Reuse tense music
    }

    update(input, deltaTime) {
        const gravity = 0.5;
        const jumpPower = -12;
        const moveSpeed = 3;

        if (input.left || input.a) this.rua.x -= moveSpeed;
        if (input.right || input.d) this.rua.x += moveSpeed;

        // Jumping with double jump
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

        // Check water (slower movement)
        let inWater = false;
        this.waterSections.forEach(water => {
            if (this.rua.x > water.x && this.rua.x < water.x + water.width &&
                this.rua.y > water.y && this.rua.y < water.y + water.height) {
                inWater = true;
                this.rua.vy *= 0.8; // Slower falling in water
            }
        });

        // Collect basket part
        if (Math.abs(this.rua.x - this.basketPart.x) < 50 &&
            Math.abs(this.rua.y - this.basketPart.y) < 50 &&
            !this.basketPart.collected) {
            this.basketPart.collected = true;
            this.showRepairDialogue();
        }

        if (this.dialogueSystem) {
            this.dialogueSystem.update(input);
        }
    }

    showRepairDialogue() {
        this.dialogueSystem.show(
            'I\'m coming for you.',
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

        // Damaged office background
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(0, 0, w, h);

        // Cracks in walls
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 3;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * w, 0);
            ctx.lineTo(Math.random() * w, h);
            ctx.stroke();
        }

        // Water sections
        this.waterSections.forEach(water => {
            ctx.fillStyle = 'rgba(0, 100, 255, 0.5)';
            ctx.fillRect(water.x, water.y, water.width, water.height);

            // Water ripple effect
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(water.x + water.width / 2, water.y + 50 + i * 30, 20 + i * 10, 0, Math.PI * 2);
                ctx.stroke();
            }
        });

        // Platforms
        this.platforms.forEach(platform => {
            ctx.fillStyle = '#8b7355';
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        });

        // Basket part
        if (!this.basketPart.collected) {
            ctx.font = '50px Arial';
            ctx.fillText('🔧', this.basketPart.x, this.basketPart.y);
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = 'yellow';
            ctx.fillRect(this.basketPart.x - 10, this.basketPart.y - 60, 60, 60);
            ctx.globalAlpha = 1;
        }

        // Player
        ctx.font = '50px Arial';
        ctx.fillText(this.rua.emoji, this.rua.x - 25, this.rua.y);

        if (this.dialogueSystem) {
            this.dialogueSystem.draw();
        }
    }

    isComplete() {
        return this.complete;
    }
}
