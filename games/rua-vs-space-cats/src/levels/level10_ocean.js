// Level 10 - THE OCEAN TRIAL
class Level10_Ocean {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.rua = { x: canvas.width / 2, y: 100, vy: 1, size: 50, emoji: '🐕' };
        this.fishLady = { x: canvas.width / 2, y: canvas.height - 200, emoji: '🧜‍♀️' };
        this.bubbles = [];
        this.dialogueSystem = null;
        this.complete = false;
        this.phase = 'falling';
        this.phaseTime = 0;
    }

    init(dialogueSystem) {
        this.dialogueSystem = dialogueSystem;
        audioSystem.playMusic('ocean');

        for (let i = 0; i < 30; i++) {
            this.bubbles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: 5 + Math.random() * 10,
                speed: 0.5 + Math.random() * 1
            });
        }
    }

    update(input, deltaTime) {
        this.phaseTime += deltaTime;

        // Update bubbles
        this.bubbles.forEach(b => {
            b.y -= b.speed;
            if (b.y < -20) {
                b.y = this.canvas.height + 20;
                b.x = Math.random() * this.canvas.width;
            }
        });

        if (this.phase === 'falling') {
            this.rua.y += this.rua.vy;
            this.rua.vy += 0.1;

            if (this.rua.y > this.canvas.height - 250) {
                this.rua.y = this.canvas.height - 250;
                this.phase = 'dialogue';
                this.showDialogue();
            }
        }

        if (this.dialogueSystem) {
            this.dialogueSystem.update(input);
        }
    }

    showDialogue() {
        this.dialogueSystem.show(
            'You fell far.',
            'fish_lady',
            () => {
                this.dialogueSystem.show(
                    'I was attacked.',
                    'rua',
                    () => {
                        audioSystem.playSFX('unlock');
                        this.dialogueSystem.show(
                            ['Finally.', 'Someone competent.'],
                            'rua',
                            () => {
                                saveSystem.unlockAbility('underwater_breathing');
                                this.complete = true;
                            }
                        );
                    }
                );
            }
        );
    }

    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Ocean gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#004d99');
        gradient.addColorStop(1, '#000033');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Glowing effect
        ctx.globalAlpha = 0.1;
        for (let i = 0; i < 3; i++) {
            const g = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, 300 + i * 100);
            g.addColorStop(0, '#00ffff');
            g.addColorStop(1, 'transparent');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, w, h);
        }
        ctx.globalAlpha = 1;

        // Bubbles
        this.bubbles.forEach(b => {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Fish Lady
        ctx.font = '60px Arial';
        ctx.fillText(this.fishLady.emoji, this.fishLady.x - 30, this.fishLady.y);

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
