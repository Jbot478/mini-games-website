// Level 5 - STONER CATS & THE BEE PROBLEM
class Level05_BeeHouse {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.phase = 'entry';
        this.rua = {
            x: 100,
            y: canvas.height - 150,
            vy: 0,
            grounded: true,
            canDoubleJump: false,
            hasDoubleJumped: false,
            size: 50,
            emoji: '🐕'
        };
        this.bee = { x: canvas.width - 200, y: canvas.height - 300, size: 100, shifted: false };
        this.puzzle = { active: false, matches: 0, required: 4 };
        this.stonerCat = { x: 300, y: canvas.height - 150, emoji: '😸' };
        this.dialogueSystem = null;
        this.complete = false;
    }

    init(dialogueSystem) {
        this.dialogueSystem = dialogueSystem;
        this.phase = 'entry';
        audioSystem.playMusic('stoner');

        this.dialogueSystem.show(
            'Why does everything smell like regret?',
            'rua',
            () => {
                this.dialogueSystem.show(
                    'Bee\'s blocking the exit.',
                    'stoner_cat',
                    () => {
                        this.dialogueSystem.show(
                            'I\'m not touching that.',
                            'rua',
                            () => {
                                this.phase = 'puzzle';
                            }
                        );
                    }
                );
            }
        );
    }

    update(input, deltaTime) {
        if (this.dialogueSystem) {
            this.dialogueSystem.update(input);
        }

        if (this.phase === 'puzzle' && !this.puzzle.active) {
            const distance = Math.abs(this.rua.x - this.bee.x);
            if (distance < 100 && input.enter && !this.lastEnter) {
                this.puzzle.active = true;
            }
            this.lastEnter = input.enter;

            const moveSpeed = 3;
            if (input.left || input.a) this.rua.x -= moveSpeed;
            if (input.right || input.d) this.rua.x += moveSpeed;
        }

        if (this.puzzle.active) {
            if (input.space && !this.lastSpace) {
                this.puzzle.matches++;
                audioSystem.playSFX('hit');

                if (this.puzzle.matches >= this.puzzle.required) {
                    this.puzzle.active = false;
                    this.completePuzzle();
                }
            }
            this.lastSpace = input.space;
        }

        if (this.phase === 'unlock_jump') {
            this.updateJumpUnlock(input, deltaTime);
        }
    }

    completePuzzle() {
        this.bee.shifted = true;
        this.bee.y -= 150;

        this.dialogueSystem.show(
            ['I\'m saving everyone.', 'Like when I saved that Shih Tzu from traffic.'],
            'rua',
            () => {
                this.phase = 'unlock_jump';
                this.rua.canDoubleJump = true;
            }
        );
    }

    updateJumpUnlock(input, deltaTime) {
        const gravity = 0.5;
        const jumpPower = -12;

        if (input.space && this.rua.grounded && !this.lastSpace) {
            this.rua.vy = jumpPower;
            this.rua.grounded = false;
        } else if (input.space && !this.rua.grounded && !this.rua.hasDoubleJumped && !this.lastSpace) {
            this.rua.vy = jumpPower;
            this.rua.hasDoubleJumped = true;
            audioSystem.playSFX('jump');

            this.dialogueSystem.show(
                ['Ew.', 'I did not touch it.', '…Did I just jump twice?'],
                'rua',
                () => {
                    this.showAbilityUnlock();
                }
            );
        }
        this.lastSpace = input.space;

        this.rua.vy += gravity;
        this.rua.y += this.rua.vy;

        if (this.rua.y >= this.canvas.height - 150) {
            this.rua.y = this.canvas.height - 150;
            this.rua.grounded = true;
            this.rua.hasDoubleJumped = false;
            this.rua.vy = 0;
        }
    }

    showAbilityUnlock() {
        audioSystem.playSFX('unlock');
        this.dialogueSystem.show(
            'Whoa.',
            'stoner_cat',
            () => {
                this.dialogueSystem.show(
                    'I\'m leaving.',
                    'rua',
                    () => {
                        saveSystem.unlockAbility('double_jump');
                        this.complete = true;
                    }
                );
            }
        );
    }

    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Smoke-filled background
        ctx.fillStyle = '#9b8b7e';
        ctx.fillRect(0, 0, w, h);

        // Smoke effect
        ctx.globalAlpha = 0.3;
        for (let i = 0; i < 5; i++) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(200 + i * 200, 200 + Math.sin(Date.now() * 0.001 + i) * 50, 80, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Floor
        ctx.fillStyle = '#654321';
        ctx.fillRect(0, h - 100, w, 100);

        // Catnip piles
        ctx.fillStyle = '#7cfc00';
        for (let i = 0; i < 6; i++) {
            ctx.fillRect(100 + i * 150, h - 120, 40, 20);
        }

        // Stoner cat
        ctx.font = '50px Arial';
        ctx.fillText(this.stonerCat.emoji, this.stonerCat.x - 25, this.stonerCat.y);

        // Bee
        ctx.font = `${this.bee.size}px Arial`;
        ctx.fillText('🐝', this.bee.x - 50, this.bee.y);

        // Player
        ctx.font = '50px Arial';
        ctx.fillText(this.rua.emoji, this.rua.x - 25, this.rua.y);

        // Puzzle UI
        if (this.puzzle.active) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(w/2 - 200, h/2 - 150, 400, 300);
            ctx.fillStyle = 'white';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Match the bee parts!', w/2, h/2 - 100);
            ctx.fillText(`Press SPACE (${this.puzzle.matches}/${this.puzzle.required})`, w/2, h/2);
            ctx.textAlign = 'left';
        }

        // Ability unlock notification
        if (this.phase === 'unlock_complete') {
            ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
            ctx.fillRect(w/2 - 250, h/2 - 50, 500, 100);
            ctx.fillStyle = '#000';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('✨ ABILITY UNLOCKED — DOUBLE JUMP ✨', w/2, h/2 + 10);
            ctx.textAlign = 'left';
        }

        if (this.dialogueSystem) {
            this.dialogueSystem.draw();
        }
    }

    isComplete() {
        return this.complete;
    }
}
