// Level 7 - SERVANTS WITH HANDS
class Level07_Servants {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.rua = { x: 100, y: canvas.height - 150, vx: 0, vy: 0, grounded: true, size: 50, emoji: '🐕' };
        this.humans = this.createHumans();
        this.dialogueSystem = null;
        this.complete = false;
        this.phase = 'intro';
        this.phaseTime = 0;
    }

    createHumans() {
        const humans = [];
        for (let i = 0; i < 6; i++) {
            humans.push({
                x: 200 + i * 150,
                y: this.canvas.height - 150,
                patrolStart: 200 + i * 150 - 80,
                patrolEnd: 200 + i * 150 + 80,
                direction: 1,
                speed: 1,
                reachDistance: 100,
                emoji: '🧍'
            });
        }
        return humans;
    }

    init(dialogueSystem) {
        this.dialogueSystem = dialogueSystem;
        audioSystem.playMusic('servants');

        this.dialogueSystem.show(
            ['Excuse me.', 'Two-legged peasants.'],
            'rua',
            () => {
                this.dialogueSystem.show(
                    'Dog!',
                    'human',
                    () => {
                        this.dialogueSystem.show(
                            'Do not touch me.',
                            'rua',
                            () => {
                                this.dialogueSystem.show(
                                    'Take her to… the other.',
                                    'human',
                                    () => {
                                        this.dialogueSystem.show(
                                            'I hate mystery.',
                                            'rua',
                                            () => {
                                                this.phase = 'gameplay';
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    }

    update(input, deltaTime) {
        this.phaseTime += deltaTime;

        if (this.phase === 'gameplay') {
            const moveSpeed = 3;

            if (input.left || input.a) this.rua.x -= moveSpeed;
            if (input.right || input.d) this.rua.x += moveSpeed;

            // Update humans
            this.humans.forEach(human => {
                human.x += human.direction * human.speed;
                if (human.x < human.patrolStart || human.x > human.patrolEnd) {
                    human.direction *= -1;
                }

                // Check if reaching for Rua
                const distance = Math.abs(this.rua.x - human.x);
                if (distance < human.reachDistance) {
                    this.rua.vx = (this.rua.x - human.x) * 0.5; // Knockback
                    audioSystem.playSFX('hit');
                }
            });

            this.rua.x += this.rua.vx;
            this.rua.vx *= 0.9; // Friction

            // Check completion
            if (this.rua.x > this.canvas.width - 100) {
                this.complete = true;
            }
        }

        if (this.dialogueSystem) {
            this.dialogueSystem.update(input);
        }
    }

    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Background
        ctx.fillStyle = '#e8dcc8';
        ctx.fillRect(0, 0, w, h);

        // Ground
        ctx.fillStyle = '#c4b5a0';
        ctx.fillRect(0, h - 100, w, 100);

        // Simple buildings
        ctx.fillStyle = '#8b7355';
        ctx.fillRect(50, h - 300, 150, 200);
        ctx.fillRect(w - 200, h - 300, 150, 200);

        // Humans
        this.humans.forEach(human => {
            ctx.font = '50px Arial';
            ctx.fillText(human.emoji, human.x - 25, human.y);

            // Reaching hands
            const distance = Math.abs(this.rua.x - human.x);
            if (distance < human.reachDistance) {
                ctx.fillStyle = '#ffcccc';
                ctx.beginPath();
                ctx.arc(human.x, human.y - 20, 30, 0, Math.PI * 2);
                ctx.fill();
            }
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
