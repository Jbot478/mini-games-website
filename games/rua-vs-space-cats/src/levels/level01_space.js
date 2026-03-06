// Level 1 - Space Flight (Basket flies up through twinkling stars)
class Level01_Space {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.phase = 'ascent'; // ascent, combat
        this.basket = {
            x: canvas.width / 2,
            y: canvas.height + 100,
            targetY: canvas.height / 2,
            velocityY: -2,
            width: 80,
            height: 100
        };
        this.stars = this.generateStars(200);
        this.shootingStars = [];
        this.rua = null; // Will be set after ascent
        this.dialogueSystem = null;
        this.complete = false;
        this.showControls = false;
        this.controlsTime = 0;
    }

    generateStars(count) {
        const stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                z: Math.random(), // depth for parallax
                size: Math.random() * 2 + 0.5,
                twinkle: Math.random() * Math.PI * 2,
                twinkleSpeed: Math.random() * 0.002 + 0.001,
                color: this.getStarColor()
            });
        }
        return stars;
    }

    getStarColor() {
        const colors = ['#ffffff', '#ffe9c4', '#d4fbff', '#ffd4e5'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    init(dialogueSystem) {
        this.dialogueSystem = dialogueSystem;
        this.phase = 'ascent';
        audioSystem.playMusic('space_flight'); // Twinkly, magical music
        this.showControls = false;
    }

    update(input, deltaTime) {
        // Update star twinkling
        this.stars.forEach(star => {
            star.twinkle += star.twinkleSpeed * deltaTime;
            // Slow parallax drift
            star.y += star.z * deltaTime * 0.01;
            if (star.y > this.canvas.height) {
                star.y = 0;
            }
        });

        // Update shooting stars
        if (Math.random() < 0.01) {
            this.shootingStars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height / 2,
                speed: Math.random() * 3 + 2,
                length: Math.random() * 50 + 30,
                life: 1
            });
        }

        this.shootingStars = this.shootingStars.filter(star => {
            star.x += star.speed * deltaTime * 0.1;
            star.y += star.speed * deltaTime * 0.05;
            star.life -= deltaTime * 0.002;
            return star.life > 0 && star.x < this.canvas.width + 100;
        });

        switch(this.phase) {
            case 'ascent':
                // Basket rises gracefully
                if (this.basket.y > this.basket.targetY) {
                    this.basket.y += this.basket.velocityY * deltaTime * 0.1;
                    this.basket.velocityY -= deltaTime * 0.001; // Acceleration
                } else {
                    this.basket.y = this.basket.targetY;
                    this.phase = 'controls';
                    this.showControls = true;
                    this.controlsTime = 0;
                }
                break;

            case 'controls':
                this.controlsTime += deltaTime;
                // Show controls for 3 seconds
                if (this.controlsTime > 3000) {
                    this.phase = 'transition_to_combat';
                    this.showControls = false;
                }
                break;

            case 'transition_to_combat':
                // Smooth transition - complete this level
                this.complete = true;
                break;
        }

        if (this.dialogueSystem) {
            this.dialogueSystem.update(input);
        }
    }

    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Deep space background
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#000428');
        gradient.addColorStop(1, '#004e92');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Draw stars with twinkling
        this.stars.forEach(star => {
            const alpha = 0.3 + Math.abs(Math.sin(star.twinkle)) * 0.7;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = star.color;
            const size = star.size * (1 + star.z);
            ctx.fillRect(star.x, star.y, size, size);

            // Add star glow
            if (star.size > 1.5) {
                ctx.fillStyle = `${star.color}33`;
                ctx.fillRect(star.x - 1, star.y - 1, size + 2, size + 2);
            }
        });
        ctx.globalAlpha = 1;

        // Draw shooting stars
        this.shootingStars.forEach(star => {
            ctx.globalAlpha = star.life;
            const gradient = ctx.createLinearGradient(
                star.x, star.y,
                star.x - star.length, star.y - star.length * 0.5
            );
            gradient.addColorStop(0, 'white');
            gradient.addColorStop(1, 'transparent');
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(star.x - star.length, star.y - star.length * 0.5);
            ctx.stroke();
        });
        ctx.globalAlpha = 1;

        // Draw nebula effects
        this.drawNebula(ctx, w, h);

        // Draw basket
        this.drawBasket();

        // Draw control instructions
        if (this.showControls) {
            this.drawControls();
        }

        if (this.dialogueSystem) {
            this.dialogueSystem.draw();
        }
    }

    drawNebula(ctx, w, h) {
        // Subtle nebula clouds
        ctx.globalAlpha = 0.1;
        const gradient = ctx.createRadialGradient(w / 3, h / 3, 0, w / 3, h / 3, 300);
        gradient.addColorStop(0, '#9d50bb');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        const gradient2 = ctx.createRadialGradient(2 * w / 3, 2 * h / 3, 0, 2 * w / 3, 2 * h / 3, 250);
        gradient2.addColorStop(0, '#6a82fb');
        gradient2.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient2;
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1;
    }

    drawBasket() {
        const ctx = this.ctx;
        const b = this.basket;

        // Rocket trail
        if (this.phase === 'ascent') {
            const trailGradient = ctx.createLinearGradient(
                b.x + b.width / 2, b.y + b.height,
                b.x + b.width / 2, b.y + b.height + 100
            );
            trailGradient.addColorStop(0, 'rgba(255, 200, 0, 0.6)');
            trailGradient.addColorStop(1, 'transparent');
            ctx.fillStyle = trailGradient;
            ctx.fillRect(b.x + b.width / 4, b.y + b.height, b.width / 2, 100);
        }

        // Basket body - yellow with glow
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(b.x, b.y, b.width, b.height);
        ctx.shadowBlur = 0;

        // Basket details
        ctx.fillStyle = '#FFA500';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(b.x, b.y + i * 25, b.width, 2);
        }

        // Rua emoji peeking out
        ctx.font = '40px Arial';
        ctx.fillText('🐕', b.x + b.width / 4, b.y + 50);
    }

    drawControls() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Control instruction overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, h - 150, w, 150);

        ctx.fillStyle = 'white';
        ctx.font = 'bold 28px "Comic Sans MS", cursive';
        ctx.textAlign = 'center';
        ctx.fillText('🎮 CONTROLS', w / 2, h - 110);

        ctx.font = '20px "Comic Sans MS", cursive';
        ctx.fillText('MOVE with Arrow Keys / WASD', w / 2, h - 70);
        ctx.fillText('SPACE to fire laser barks', w / 2, h - 40);

        ctx.textAlign = 'left';
    }

    isComplete() {
        return this.complete;
    }
}
