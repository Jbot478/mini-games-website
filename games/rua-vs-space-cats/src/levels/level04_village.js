// Level 4 - THE VILLAGE WHERE NOTHING HAPPENS
class Level04_Village {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.phase = 'gameplay';
        this.rua = {
            x: 100,
            y: canvas.height - 150,
            vy: 0,
            grounded: true,
            size: 50,
            emoji: '🐕',
            health: 5,
            maxHealth: 5
        };
        this.platforms = [];
        this.cats = [];
        this.door = { x: canvas.width - 100, y: canvas.height - 180, width: 80, height: 120, locked: true };
        this.dialogueSystem = null;
        this.complete = false;
        this.dead = false;
        this.hasPassword = false;
        this.passwordAttempts = 0;
        this.introComplete = false;
        this.pendingSecondIntro = false;
        this.firstCatCustomDialogueDone = false;
        this.generateLevel();
    }

    generateLevel() {
        // Ground platform
        this.platforms.push({ x: 0, y: this.canvas.height - 100, width: this.canvas.width, height: 100, type: 'ground' });

        // Small platforms for walkway
        this.platforms.push({ x: 0, y: this.canvas.height - 150, width: this.canvas.width, height: 20, type: 'platform' });

        // Create interactive cats in village
        this.cats = [
            {
                x: 200, y: this.canvas.height - 170, emoji: '😺',
                name: 'Old Tom',
                timesSpoken: 0,
                dialogue1: [
                    "Meow? (Who are you?)",
                    "Meow meow! (I like your face!)",
                    "MEOOOOW (You're OK I guess)"
                ],
                ruaResponse1: [
                    "The name's Rua. Bark! (attempting cat voice)",
                    "Thanks! I'm trying to blend in. MEOW!",
                    "That's the nicest thing you've said. Purrrr."
                ]
            },
            {
                x: 400, y: this.canvas.height - 170, emoji: '😸',
                name: 'Mittens',
                timesSpoken: 0,
                dialogue1: [
                    "Who is this dog pretending to be a cat?",
                    "Meow meow meow? (Where is your tail?)"
                ],
                ruaResponse1: [
                    "MRRROW! (It's hidden, trust me)",
                    "My tail is... in the cat dimension. Meow."
                ]
            },
            {
                x: 600, y: this.canvas.height - 170, emoji: '🐱',
                name: 'Whiskers',
                timesSpoken: 0,
                dialogue1: [
                    "You're not a real cat.",
                    "You're just a dog."
                ],
                ruaResponse1: [
                    "Meow meow, hiss! (I am TOO a cat!)",
                    "That's just propaganda. MEOW MEOW."
                ]
            }
        ];

        // Add bird in tree that gives password
        this.bird = {
            x: 900, y: this.canvas.height - 300, emoji: '🐦',
            name: 'Tweety',
            timesSpoken: 0,
            dialogue1: [
                "Tweet tweet! (Lost, birdie?)",
                "Chirp chirp! (Why is a dog here?)"
            ],
            ruaResponse1: [
                "SQUAWK SQUAWK! (I mean... Meow?)",
                "Tweet tweet! (I'm a cat! Meow!)"
            ],
            dialogue2: [
                "Okay, okay! I'll tell you.",
                "Password: MEOW123",
                "Now leave me alone!"
            ],
            ruaResponse2: [
                "CHIRP CHIRP! (Thank you!)",
                "You're a good birdie!",
                "Going now! Meow!"
            ]
        };
    }

    init(dialogueSystem) {
        this.dialogueSystem = dialogueSystem;
        this.dialogueSystem.position = 'top';  // Show dialogue at top for village level
        audioSystem.playMusic('village');

        // Intro: lock movement until Rua finishes this thought
        this.dialogueSystem.show([
            'Ew, cats. I suppose I will have to try blending in by pretending to be one of them.'
        ], 'rua', () => {
            this.pendingSecondIntro = true;
        });
    }

    update(input, deltaTime) {
        const moveSpeed = 3;
        const gravity = 0.6;
        const jumpPower = -15;
        let dialogueActive = this.dialogueSystem && this.dialogueSystem.isDialogueActive();

        // Show second intro box after first one closes
        if (this.pendingSecondIntro && !dialogueActive) {
            this.pendingSecondIntro = false;
            this.dialogueSystem.show([
                'I need to gather information from them, even though they are gross and inferior, and I am beautiful.'
            ], 'rua', () => {
                this.introComplete = true;
            });
            dialogueActive = true;
        }

        const canMove = this.introComplete && !dialogueActive;

        // Horizontal movement
        if (canMove) {
            if (input.left || input.a) this.rua.x -= moveSpeed;
            if (input.right || input.d) this.rua.x += moveSpeed;
        }

        // Jumping
        if (canMove && (input.space) && this.rua.grounded && !this.lastSpace) {
            this.rua.vy = jumpPower;
            this.rua.grounded = false;
            audioSystem.playSFX('jump');
        }
        this.lastSpace = input.space;

        // Gravity
        if (!this.rua.grounded) {
            this.rua.vy += gravity;
        }

        this.rua.y += this.rua.vy;

        // Platform collision
        this.rua.grounded = false;
        this.platforms.forEach(platform => {
            if (this.rua.x + 20 > platform.x && this.rua.x - 20 < platform.x + platform.width) {
                if (this.rua.y + 25 >= platform.y - 5 && this.rua.y + 25 <= platform.y + 15 && this.rua.vy >= 0) {
                    this.rua.y = platform.y - 25;
                    this.rua.vy = 0;
                    this.rua.grounded = true;
                }
            }
        });

        // Bounds
        this.rua.x = Math.max(50, Math.min(this.canvas.width - 50, this.rua.x));

        // Check proximity to cats - show [ENTER] prompt
        this.cats.forEach(cat => {
            cat.inRange = canMove && Math.abs(this.rua.x - cat.x) < 80;

            // Handle ENTER interaction
            if (cat.inRange && input.enter && !this.lastEnter) {
                this.interactWithCat(cat);
            }
        });

        // Check proximity to bird - show [ENTER] prompt
        this.bird.inRange = canMove && Math.abs(this.rua.x - this.bird.x) < 80;
        if (this.bird.inRange && input.enter && !this.lastEnter) {
            this.interactWithBird();
        }

        // Check proximity to door - show [ENTER] prompt
        this.door.inRange = canMove && Math.abs(this.rua.x - this.door.x) < 80;
        if (this.door.inRange && input.enter && !this.lastEnter) {
            if (this.door.locked) {
                this.promptPassword();
            } else {
                this.complete = true;
            }
        }

        this.lastEnter = input.enter;

        if (this.dialogueSystem) {
            this.dialogueSystem.update(input);
        }
    }

    interactWithCat(cat) {
        // Custom first interaction with the first village cat
        if (cat.name === 'Old Tom' && !this.firstCatCustomDialogueDone) {
            this.firstCatCustomDialogueDone = true;
            cat.timesSpoken++;

            this.dialogueSystem.show(['HELLO FELLOW CAAAATTT!! MEOWRP MEOWRP!'], 'rua', () => {
                this.dialogueSystem.show(['UMMM ok?'], 'cat', () => {
                    this.dialogueSystem.show(["I'm amazing at this"], 'rua');
                });
            });
            return;
        }

        cat.timesSpoken++;

        // Regular cats: use different dialogues each time
        const index = Math.min(cat.timesSpoken - 1, cat.dialogue1.length - 1);
        this.dialogueSystem.show([cat.dialogue1[index]], 'cat', () => {
            this.dialogueSystem.show([cat.ruaResponse1[index]], 'rua', () => {
                // Dialogue closes automatically after Rua speaks
            });
        });
    }

    interactWithBird() {
        this.bird.timesSpoken++;

        if (this.bird.timesSpoken === 1) {
            // First interaction: refuse
            this.dialogueSystem.show([this.bird.dialogue1[0]], 'cat', () => {
                this.dialogueSystem.show([this.bird.ruaResponse1[0]], 'rua', () => {
                    // Done with first interaction
                });
            });
        } else if (this.bird.timesSpoken >= 2) {
            // Second interaction: give password
            this.dialogueSystem.show(this.bird.dialogue2, 'cat', () => {
                this.dialogueSystem.show(this.bird.ruaResponse2, 'rua', () => {
                    this.hasPassword = true;
                    this.door.locked = false;
                });
            });
        }
    }

    promptPassword() {
        const password = prompt('Enter the password:');
        this.passwordAttempts++;

        if (password === 'MEOW123') {
            this.dialogueSystem.show(['🔓 Correct! You may enter.'], 'system', () => {
                this.door.locked = false;
                this.hasPassword = true;
            });
        } else {
            this.dialogueSystem.show(['🔒 Wrong password! Try again.'], 'system', () => {
                // Stay locked
            });
        }
    }

    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Background - village scene
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, w, h / 2);
        ctx.fillStyle = '#90EE90';
        ctx.fillRect(0, h / 2, w, h / 2);

        // Platforms
        this.platforms.forEach(platform => {
            if (platform.type === 'ground') {
                ctx.fillStyle = '#8B7355';
            } else {
                ctx.fillStyle = '#A0522D';
            }
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        });

        // Village houses in background
        const housePositions = [150, 400, 650];
        housePositions.forEach(xPos => {
            // House walls
            ctx.fillStyle = '#CD853F';
            ctx.fillRect(xPos, h - 280, 120, 150);

            // Roof
            ctx.fillStyle = '#8B4513';
            ctx.beginPath();
            ctx.moveTo(xPos, h - 280);
            ctx.lineTo(xPos + 60, h - 330);
            ctx.lineTo(xPos + 120, h - 280);
            ctx.closePath();
            ctx.fill();

            // Door
            ctx.fillStyle = '#654321';
            ctx.fillRect(xPos + 40, h - 180, 40, 80);

            // Window
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(xPos + 10, h - 240, 30, 30);
        });

        // Draw cats
        this.cats.forEach(cat => {
            ctx.font = '50px Arial';
            ctx.fillText(cat.emoji, cat.x - 25, cat.y);

            // Interaction prompt
            if (cat.inRange && !this.dialogueSystem.isDialogueActive()) {
                ctx.fillStyle = 'white';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                ctx.font = '16px Arial';
                ctx.strokeText('[ENTER] Talk', cat.x - 35, cat.y - 50);
                ctx.fillText('[ENTER] Talk', cat.x - 35, cat.y - 50);
            }
        });

        // Draw bird in tree
        ctx.font = '50px Arial';
        ctx.fillText(this.bird.emoji, this.bird.x - 25, this.bird.y);

        // Tree trunk
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.bird.x - 40, this.bird.y + 20, 60, 100);

        // Tree foliage
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.arc(this.bird.x, this.bird.y - 10, 80, 0, Math.PI * 2);
        ctx.fill();

        // Bird interaction prompt
        if (this.bird.inRange && !this.dialogueSystem.isDialogueActive()) {
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.font = '16px Arial';
            ctx.strokeText('[ENTER] Talk', this.bird.x - 35, this.bird.y - 50);
            ctx.fillText('[ENTER] Talk', this.bird.x - 35, this.bird.y - 50);
        }

        // Draw door
        ctx.fillStyle = this.door.locked ? '#8B0000' : '#228B22';
        ctx.fillRect(this.door.x, this.door.y, this.door.width, this.door.height);

        // Door symbol
        ctx.font = '60px Arial';
        ctx.fillText(this.door.locked ? '🔒' : '🚪', this.door.x + 10, this.door.y + 85);

        // Door label
        if (this.door.inRange && !this.dialogueSystem.isDialogueActive()) {
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.font = '16px Arial';
            ctx.strokeText('[ENTER] ' + (this.door.locked ? 'Enter Password' : 'Enter'), this.door.x - 40, this.door.y - 20);
            ctx.fillText('[ENTER] ' + (this.door.locked ? 'Enter Password' : 'Enter'), this.door.x - 40, this.door.y - 20);
        }

        // Player - FLIPPED LEFT
        ctx.font = '50px Arial';
        ctx.save();
        ctx.scale(-1, 1);
        ctx.fillText(this.rua.emoji, -(this.rua.x - 25), this.rua.y);
        ctx.restore();

        if (this.dialogueSystem) {
            this.dialogueSystem.draw();
        }
    }

    isComplete() {
        return this.complete;
    }

    isDead() {
        return this.dead;
    }
}
