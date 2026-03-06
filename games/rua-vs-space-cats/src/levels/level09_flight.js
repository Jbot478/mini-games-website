// Level 9 - THROWN LIKE TRASH
class Level09_Flight {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.rua = { x: canvas.width / 2, y: canvas.height / 2, vy: 0, size: 50, emoji: '🐕' };
        this.debris = [];
        this.backgroundScroll = 0;
        this.dialogueSystem = null;
        this.complete = false;
        this.flightTime = 0;
    }

    init(dialogueSystem) {
        this.dialogueSystem = dialogueSystem;
        audioSystem.playMusic('flight');

        for (let i = 0; i < 15; i++) {
            this.debris.push({
                x: Math.random() * this.canvas.width,
                y: -Math.random() * 1000,
                speed: 3 + Math.random() * 3,
                size: 20 + Math.random() * 30
            });
        }
    }

    update(input, deltaTime) {
        this.flightTime += deltaTime;

        const moveSpeed = 5;
        if (input.left || input.a) this.rua.x -= moveSpeed;
        if (input.right || input.d) this.rua.x += moveSpeed;

        this.rua.x = Math.max(50, Math.min(this.canvas.width - 50, this.rua.x));

        // Update debris
        this.debris.forEach(d => {
            d.y += d.speed;
            if (d.y > this.canvas.height + 100) {
                d.y = -100;
                d.x = Math.random() * this.canvas.width;
            }

            // Check collision
            const distance = Math.sqrt((this.rua.x - d.x) ** 2 + (this.rua.y - d.y) ** 2);
            if (distance < 40) {
                this.rua.x += (this.rua.x - d.x) * 0.1; // Push away
            }
        });

        this.backgroundScroll += deltaTime * 0.2;

        // Complete after 10 seconds
        if (this.flightTime > 10000) {
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

        // Rapidly changing background
        const colors = ['#87CEEB', '#4682B4', '#2F4F4F', '#191970'];
        const colorIndex = Math.floor(this.flightTime / 2000) % colors.length;
        ctx.fillStyle = colors[colorIndex];
        ctx.fillRect(0, 0, w, h);

        // Motion lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 10; i++) {
            ctx.beginPath();
            ctx.moveTo(i * (w / 10), (this.backgroundScroll + i * 50) % h);
            ctx.lineTo(i * (w / 10) + 50, (this.backgroundScroll + i * 50 + 100) % h);
            ctx.stroke();
        }

        // Debris
        this.debris.forEach(d => {
            ctx.fillStyle = '#555';
            ctx.fillRect(d.x, d.y, d.size, d.size);
        });

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
