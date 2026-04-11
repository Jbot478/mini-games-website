// Level 13 - Closing Scene (Return Home)
class Level13_Closing {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;

        this.phase = 'landing';
        this.stepTimer = 0;
        this.complete = false;

        this.window = {
            x: 50,
            y: 90,
            width: 300,
            height: 250
        };

        this.rua = {
            x: 0,
            y: canvas.height - 150,
            vy: 0,
            grounded: false,
            facingRight: false,
            emoji: '🐕',
            inBasket: true,
            bouncing: false,
            bounceTimer: 0
        };

        this.basket = {
            x: canvas.width - 220,
            y: -140,
            targetY: canvas.height - 180,
            width: 70,
            height: 80,
            doorOpen: false,
            landingDone: false
        };

        this.servants = [
            { x: canvas.width + 120, y: canvas.height - 150, targetX: 500, emoji: '🧍🏻‍♂️' },
            { x: canvas.width + 260, y: canvas.height - 150, targetX: 650, emoji: '🧍🏻' }
        ];

        this.dialogueSequence = [
            { speaker: 'rua', text: 'Oh I beg your pardon. Sorry I had to go save us from evil space cats. You are welcome by the way.' },
            { speaker: 'man', text: "Why are you making so much noise? It’s 8am!?" },
            { speaker: 'man', text: 'Why is she barking so aggressively at us? She seems pretty panicked.' },
            { speaker: 'rua', text: 'You simple minded fools, why do I bother!' },
            { speaker: 'rua', text: 'I am a very good dog. You are lucky to have me.' },
            { speaker: 'rua', text: 'I am kind enough to bark at you when you take too long to make my dinner.' },
            { speaker: 'rua', text: 'I only bite one of you.' },
            { speaker: 'rua', text: "And I only shit in the house when it’s absolutely hilarious." },
            { speaker: 'rua', text: 'And now I have saved everyone in the world from demon cats.' },
            { speaker: 'man', text: 'Aw, cute. Do you want a treat and a walk?' },
            { speaker: 'rua', text: "Oh yes please. Steak with that chewy kibble. Then let’s go make sure that shih tzu is dead." }
        ];

        this.dialogueStarted = false;
        this.dialogueSystem = null;

        this.zoomScale = 1;
        this.zoomTimer = 0;
        this.sprinklesPeek = false;
        this.sprinklesPeekTimer = 0;
        this.sprinklesSoundPlayed = false;
        this.slamPlayed = false;

        this.finishTimer = 0;
        this.endingTimer = 0;
        this.endFloaters = this.createFloaters();
        this.returnHomeButton = {
            x: this.canvas.width / 2 - 190,
            y: this.canvas.height / 2 + 66,
            width: 380,
            height: 52
        };
    }

    init(dialogueSystem) {
        this.dialogueSystem = dialogueSystem;
        this.stepTimer = 0;
        this.complete = false;
        this.phase = 'landing';
        this.dialogueStarted = false;
        this.zoomScale = 1;
        this.zoomTimer = 0;
        this.sprinklesPeek = false;
        this.sprinklesPeekTimer = 0;
        this.sprinklesSoundPlayed = false;
        this.slamPlayed = false;
        this.endingTimer = 0;
        this.complete = false;
        this.rua.inBasket = true;
        this.rua.grounded = false;
        this.rua.bouncing = false;
        this.rua.bounceTimer = 0;
        this.rua.facingRight = false;
        this.basket.y = -140;
        this.basket.doorOpen = false;
        this.basket.landingDone = false;
        this.servants[0].x = this.canvas.width + 120;
        this.servants[1].x = this.canvas.width + 260;
        audioSystem.playMusic('village');
    }

    update(input, deltaTime) {
        try {
            this.stepTimer += deltaTime;

            if (this.dialogueSystem) {
                this.dialogueSystem.update(input);
            }

            if (this.rua.bouncing) {
                this.rua.bounceTimer += deltaTime;
            }

            this.servants.forEach(servant => {
                if (this.phase !== 'ending_card' && servant.x > servant.targetX) {
                    servant.x -= 2.4;
                }
            });

            switch (this.phase) {
                case 'landing':
                    this.basket.y += 1.2;
                    if (this.basket.y >= this.basket.targetY) {
                        this.basket.y = this.basket.targetY;
                        this.basket.landingDone = true;
                        this.phase = 'exit';
                        this.stepTimer = 0;
                    }
                    break;

                case 'exit':
                    if (this.stepTimer > 350) {
                        this.basket.doorOpen = true;
                    }

                    if (this.stepTimer > 550 && this.rua.inBasket) {
                        this.rua.inBasket = false;
                        this.rua.x = this.basket.x + 20;
                        this.rua.y = this.basket.y - 20;
                        this.rua.vy = -12;
                        this.rua.grounded = false;
                        audioSystem.playSFX('jump');
                    }

                    if (!this.rua.inBasket && !this.rua.grounded) {
                        this.rua.vy += 0.7;
                        this.rua.y += this.rua.vy;
                        if (this.rua.y >= this.canvas.height - 150) {
                            this.rua.y = this.canvas.height - 150;
                            this.rua.vy = 0;
                            this.rua.grounded = true;
                            this.phase = 'dialogue';
                            this.stepTimer = 0;
                        }
                    }
                    break;

                case 'dialogue':
                    this.startDialogueIfNeeded();
                    break;

                case 'walkoff':
                    this.rua.facingRight = true;
                    this.servants.forEach((servant) => {
                        servant.x += 4.35;
                    });
                    this.rua.x += 3.4;

                    if (this.servants.every(s => s.x > this.canvas.width + 20)) {
                        this.phase = 'zoom';
                        this.zoomTimer = 0;
                        this.zoomScale = 1;
                        this.sprinklesPeek = false;
                        this.sprinklesPeekTimer = 0;
                        this.sprinklesSoundPlayed = false;
                    }
                    break;

                case 'zoom':
                    this.zoomTimer += deltaTime;
                    this.zoomScale = Math.min(1.7, 1 + this.zoomTimer / 2600);

                    if (this.zoomTimer > 1000) {
                        this.sprinklesPeek = true;
                        this.sprinklesPeekTimer += deltaTime;
                        if (!this.sprinklesSoundPlayed) {
                            this.sprinklesSoundPlayed = true;
                            audioSystem.playSFX('explosion');
                        }
                    }

                    if (this.zoomTimer > 2200 && !this.slamPlayed) {
                        this.slamPlayed = true;
                        audioSystem.playSFX('slam');
                        audioSystem.playMusic('ending_theme');
                        this.phase = 'finish';
                        this.finishTimer = 0;
                    }
                    break;

                case 'finish':
                    this.finishTimer += deltaTime;
                    this.updateFloaters(deltaTime);
                    if (this.finishTimer > 1200) {
                        this.phase = 'ending_card';
                        this.endingTimer = 0;
                    }
                    break;

                case 'ending_card':
                    this.endingTimer += deltaTime;
                    this.updateFloaters(deltaTime);
                    break;
            }
        } catch (err) {
            console.error('Level13_Closing update failed:', err);
            this.phase = 'ending_card';
            this.complete = false;
        }
    }

    startDialogueIfNeeded() {
        if (this.dialogueStarted || !this.dialogueSystem || this.dialogueSystem.isDialogueActive()) {
            return;
        }

        this.dialogueStarted = true;
        this.runDialogueSequence(
            this.dialogueSequence,
            () => {
                this.dialogueStarted = false;
                this.phase = 'walkoff';
                this.stepTimer = 0;
                this.rua.bouncing = false;
            },
            0,
            (line, index) => {
                this.rua.bouncing = index >= 3 && index <= 8;
                if (this.rua.bouncing) {
                    this.rua.bounceTimer = 0;
                }
            }
        );
    }

    runDialogueSequence(sequence, onDone = null, index = 0, onLineStart = null) {
        if (!sequence || index >= sequence.length) {
            if (onDone) onDone();
            return;
        }

        const line = sequence[index];
        if (onLineStart) {
            onLineStart(line, index);
        }

        this.dialogueSystem.show([line.text], line.speaker, () => {
            this.runDialogueSequence(sequence, onDone, index + 1, onLineStart);
        });
    }

    draw() {
        try {
            if (this.phase === 'ending_card') {
                this.drawEndingCard();
                return;
            }
            this.drawHomeScene();
        } catch (err) {
            console.error('Level13_Closing draw failed:', err);
            const ctx = this.ctx;
            const w = this.canvas.width;
            const h = this.canvas.height;
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 32px Arial';
            ctx.fillText('Homecoming scene failed to draw.', 60, 100);
            ctx.font = '20px Arial';
            ctx.fillText('Please refresh if the screen stays blank.', 60, 140);
        }
    }

    drawHomeScene() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        const focusZoom = this.phase === 'zoom';
        const zoom = focusZoom ? this.zoomScale : 1;
        const cx = this.window.x + this.window.width / 2;
        const cy = this.window.y + this.window.height / 2;

        ctx.save();
        if (focusZoom) {
            ctx.translate(cx, cy);
            ctx.scale(zoom, zoom);
            ctx.translate(-cx, -cy);
        }

        const bg = ctx.createLinearGradient(0, 0, 0, h);
        bg.addColorStop(0, '#ffd8c2');
        bg.addColorStop(1, '#ffc7a6');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#2b1810';
        ctx.fillRect(0, h - 100, w, 100);

        ctx.save();
        ctx.beginPath();
        ctx.rect(this.window.x, this.window.y, this.window.width, this.window.height);
        ctx.clip();

        const sky = ctx.createLinearGradient(0, this.window.y, 0, this.window.y + this.window.height);
        sky.addColorStop(0, '#87CEEB');
        sky.addColorStop(1, '#DFF8FF');
        ctx.fillStyle = sky;
        ctx.fillRect(this.window.x, this.window.y, this.window.width, this.window.height);

        ctx.fillStyle = '#FFE66D';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#FFEF99';
        ctx.beginPath();
        ctx.arc(this.window.x + this.window.width - 55, this.window.y + 52, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        this.drawCloud(this.window.x + 46, this.window.y + 58, 0.55);
        this.drawCloud(this.window.x + 160, this.window.y + 86, 0.65);
        this.drawCloud(this.window.x + 248, this.window.y + 58, 0.5);
        ctx.restore();

        ctx.strokeStyle = '#3d2817';
        ctx.lineWidth = 12;
        ctx.strokeRect(this.window.x, this.window.y, this.window.width, this.window.height);

        ctx.fillStyle = '#4a3520';
        ctx.fillRect(340, h - 220, 320, 120);

        ctx.fillStyle = '#ffa500';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff8800';
        ctx.beginPath();
        ctx.moveTo(120, h - 280);
        ctx.lineTo(180, h - 280);
        ctx.lineTo(170, h - 320);
        ctx.lineTo(130, h - 320);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#8b4513';
        ctx.fillRect(w / 2 - 200, h - 160, 400, 60);

        this.drawBasket();

        this.servants.forEach(servant => {
            ctx.font = '160px Arial';
            ctx.fillText(servant.emoji, servant.x, servant.y);
        });

        if (!this.rua.inBasket) {
            ctx.save();
            ctx.font = '60px Arial';
            const ruaY = this.rua.y + (this.rua.bouncing ? Math.sin(this.rua.bounceTimer * 0.02) * 15 : 0);
            if (this.rua.facingRight) {
                ctx.translate(this.rua.x + 30, 0);
                ctx.scale(-1, 1);
                ctx.fillText(this.rua.emoji, 0, ruaY);
            } else {
                ctx.fillText(this.rua.emoji, this.rua.x, ruaY);
            }
            ctx.restore();
        }

        if ((this.phase === 'zoom' || this.phase === 'finish') && this.sprinklesPeek) {
            const peekBob = Math.sin(this.sprinklesPeekTimer * 0.01) * 4;
            ctx.font = '54px Arial';
            ctx.fillText('🐶', this.window.x + 154, this.window.y + 160 + peekBob);
        }

        ctx.restore();

        if (this.dialogueSystem) {
            this.dialogueSystem.draw();
        }
    }

    drawCloud(x, y, scale = 1) {
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,0.88)';
        ctx.beginPath();
        ctx.ellipse(x, y, 45 * scale, 24 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(x + 40 * scale, y - 8 * scale, 56 * scale, 30 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(x + 88 * scale, y, 42 * scale, 22 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawBasket() {
        const ctx = this.ctx;
        const b = this.basket;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(b.x + 3, b.y + b.height - 3, b.width, 8);

        ctx.fillStyle = '#D4A76A';
        ctx.fillRect(b.x, b.y, b.width, b.height);

        ctx.strokeStyle = '#8B6914';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            ctx.beginPath();
            ctx.moveTo(b.x + i * 9, b.y);
            ctx.lineTo(b.x + i * 9, b.y + b.height);
            ctx.stroke();
        }

        for (let i = 0; i < 7; i++) {
            ctx.beginPath();
            ctx.moveTo(b.x, b.y + i * 12);
            ctx.lineTo(b.x + b.width, b.y + i * 12);
            ctx.stroke();
        }

        if (this.basket.doorOpen) {
            ctx.fillStyle = '#8B6914';
            ctx.fillRect(b.x - 25, b.y + 15, 28, 50);
        } else {
            ctx.fillStyle = '#A0826D';
            ctx.fillRect(b.x + 5, b.y + 20, b.width - 10, 50);
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(b.x + 15, b.y + 45, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.strokeStyle = '#8B6914';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(b.x + b.width / 2, b.y - 3, 25, Math.PI, 0);
        ctx.stroke();

        ctx.fillStyle = '#8B6914';
        ctx.fillRect(b.x, b.y, b.width, 3);
        ctx.fillRect(b.x, b.y + b.height - 3, b.width, 3);

        if (this.rua.inBasket) {
            ctx.font = '46px Arial';
            ctx.fillText(this.rua.emoji, b.x + 10, b.y + 34);
        }
    }

    createFloaters() {
        const emojis = ['🐕', '🐶', '😺', '😸', '🐱', '🐦', '🧍🏻‍♂️', '🧍🏻', '🧜‍♀️', '🐝'];
        const out = [];
        for (let i = 0; i < 24; i++) {
            out.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.9,
                vy: (Math.random() - 0.5) * 0.8,
                angle: Math.random() * Math.PI * 2,
                spin: (Math.random() - 0.5) * 1.1,
                emoji: emojis[i % emojis.length],
                size: 28 + Math.random() * 18
            });
        }
        return out;
    }

    updateFloaters(deltaTime) {
        this.endFloaters.forEach((f) => {
            f.x += f.vx * deltaTime * 0.06;
            f.y += f.vy * deltaTime * 0.06;
            f.angle += f.spin * deltaTime * 0.001;
            if (f.x < -80) f.x = this.canvas.width + 80;
            if (f.x > this.canvas.width + 80) f.x = -80;
            if (f.y < -80) f.y = this.canvas.height + 80;
            if (f.y > this.canvas.height + 80) f.y = -80;
        });
    }

    drawEndingCard() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;

        ctx.fillStyle = '#090909';
        ctx.fillRect(0, 0, w, h);

        this.endFloaters.forEach((f) => {
            const dx = Math.sin(f.angle) * 10;
            const dy = Math.cos(f.angle * 1.15) * 8;
            ctx.font = `${Math.floor(f.size)}px Arial`;
            ctx.fillText(f.emoji, f.x + dx, f.y + dy);
        });

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.font = 'bold 88px Arial';
        ctx.fillText('THE END', w / 2, h / 2 - 16);
        ctx.font = '24px Arial';
        ctx.fillText('Rua vs Space Cats', w / 2, h / 2 + 30);

        const b = this.returnHomeButton;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.fillRect(b.x, b.y, b.width, b.height);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(b.x, b.y, b.width, b.height);
        ctx.font = 'bold 24px Arial';
        ctx.fillText('Return to Home Screen', w / 2, b.y + 34);
        ctx.textAlign = 'left';
    }

    handleClick(x, y) {
        if (this.phase !== 'ending_card') {
            return false;
        }

        const b = this.returnHomeButton;
        const inside = x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height;
        if (!inside) {
            return false;
        }

        try {
            saveSystem.save(0);
            audioSystem.stopMusic(true);
            window.location.href = '../../index.html';
        } catch (err) {
            console.error('Return home failed:', err);
        }
        return true;
    }

    isComplete() {
        return this.complete;
    }
}
