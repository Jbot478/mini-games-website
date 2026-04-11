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
            facingRight: true,
            size: 50,
            emoji: '🐕',
            health: 5,
            maxHealth: 5
        };
        this.platforms = [];
        this.cats = [];
        this.door = { x: canvas.width - 130, y: canvas.height - 190, width: 70, height: 80, locked: true };
        this.dialogueSystem = null;
        this.complete = false;
        this.dead = false;
        this.hasPassword = false;
        this.passwordAttempts = 0;
        this.introComplete = false;
        this.pendingSecondIntro = false;
        this.firstCatCustomDialogueDone = false;
        this.tree = null;
        this.pendingBirdConversation = false;
        this.passwordModalActive = false;
        this.passwordInput = '';
        this.passwordError = '';
        this.passwordHintPulse = 0;
        this.handlePasswordKeyDownBound = this.handlePasswordKeyDown.bind(this);
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
                timesSpoken: 0
            },
            {
                x: 400, y: this.canvas.height - 170, emoji: '😸',
                name: 'Mittens',
                timesSpoken: 0
            },
            {
                x: 600, y: this.canvas.height - 170, emoji: '🐱',
                name: 'Whiskers',
                timesSpoken: 0
            }
        ];

        // Tree that can be examined to reveal the bird
        this.tree = {
            x: 840,
            y: this.canvas.height - 370,
            width: 140,
            height: 270,
            inRange: false,
            rattling: false,
            rattleTimer: 0,
            examined: false
        };

        // Hidden bird in tree that gives password
        this.bird = {
            x: 900, y: this.canvas.height - 300, emoji: '🐦',
            name: 'Tweety',
            visible: false
        };
    }

    init(dialogueSystem) {
        this.dialogueSystem = dialogueSystem;
        this.dialogueSystem.position = 'top';  // Show dialogue at top for village level
        audioSystem.playMusic('village');

        this.tree.inRange = false;
        this.tree.rattling = false;
        this.tree.rattleTimer = 0;
        this.tree.examined = false;
        this.bird.visible = false;
        this.bird.inRange = false;
        this.pendingBirdConversation = false;
        this.closePasswordModal();

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

        if (this.passwordModalActive) {
            this.passwordHintPulse += deltaTime;
            this.lastEnter = input.enter;
            if (this.dialogueSystem) {
                this.dialogueSystem.update(input);
            }
            return;
        }

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
            if (input.left || input.a) {
                this.rua.x -= moveSpeed;
                this.rua.facingRight = false;
            }
            if (input.right || input.d) {
                this.rua.x += moveSpeed;
                this.rua.facingRight = true;
            }
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

        // Check proximity to tree - [ENTER] Examine
        this.tree.inRange = canMove && Math.abs(this.rua.x - (this.tree.x + this.tree.width / 2)) < 90;
        if (this.tree.inRange && input.enter && !this.lastEnter) {
            this.examineTree();
        }

        // Tree rattles, then bird appears
        if (this.tree.rattleTimer > 0) {
            this.tree.rattleTimer -= deltaTime;
            if (this.tree.rattleTimer <= 0) {
                this.tree.rattling = false;
                this.pendingBirdConversation = true;
            }
        }

        // Auto bird conversation after tree examine reveal
        if (this.pendingBirdConversation && !dialogueActive) {
            this.pendingBirdConversation = false;
            this.playBirdPasswordConversation();
        }

        // Check proximity to door - show [ENTER] prompt
        this.door.inRange = canMove && Math.abs(this.rua.x - (this.door.x + this.door.width / 2)) < 90;
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
        cat.timesSpoken++;
        const catIndex = this.cats.indexOf(cat);

        if (catIndex === 0) {
            this.runDialogueSequence([
                { speaker: 'rua', text: 'MeowwrrPpPpWW Hello fellow cat. Dont you just love scratching things for no apparent reason?' },
                { speaker: 'cat', text: 'Are you a dog?' },
                { speaker: 'rua', text: 'No Meurggoww. See I make cat noises. Im perfect.' },
                { speaker: 'cat', text: 'Please leave me alone.' },
                { speaker: 'rua', text: 'Rude.' }
            ]);
            return;
        }

        if (catIndex === 1) {
            this.runDialogueSequence([
                { speaker: 'rua', text: 'Hello fellow cat. Would you like to knock over a glass of water for no reason?' },
                { speaker: 'cat', text: 'Yeah youre a dog.' },
                { speaker: 'rua', text: 'I am not a dog. In fact I hate dogs! Have you met the ugly shih tzu that lives across the road from me? He sucks.' },
                { speaker: 'cat', text: 'What do you want?' },
                { speaker: 'rua', text: 'Snacks and my beepbop-ulator.' },
                { speaker: 'cat', text: 'I have no idea what the second thing is but that last house over there has some cats that are always eating. Theres a password though.' },
                { speaker: 'rua', text: 'whats the password?' },
                { speaker: 'cat', text: 'Im not telling you.' },
                { speaker: 'rua', text: 'I expected nothing and I’m still disappointed.' }
            ]);
            return;
        }

        this.runDialogueSequence([
            { speaker: 'rua', text: "Hello kitty I am also a kitty. Don't you love sharing passwords and bringing dead mice to people?" },
            { speaker: 'cat', text: 'I\'m not giving you the password.' },
            { speaker: 'rua', text: 'TELL ME YOU SUNDRIED PILE OF FLUFF!' },
            { speaker: 'cat', text: 'Why would I do that?' },
            { speaker: 'rua', text: 'Because I asked nicely.' },
            { speaker: 'cat', text: 'Just chill out and be a vibe.' },
            { speaker: 'rua', text: 'Wow you really are committed to being useless.' }
        ]);
    }

    examineTree() {
        if (!this.tree.examined) {
            this.tree.examined = true;
            this.tree.rattling = true;
            this.tree.rattleTimer = 700;
            this.runDialogueSequence([
                { speaker: 'rua', text: 'This tree looks suspicious.' },
                { speaker: 'rua', text: 'Like it knows something.' }
            ]);
            return;
        }

        if (!this.bird.visible) {
            this.dialogueSystem.show(['The branches are still shaking...'], 'rua');
            return;
        }

        this.dialogueSystem.show(['The bird is here now.'], 'rua');
    }

    playBirdPasswordConversation() {
        this.bird.visible = false;
        this.runDialogueSequence([
            { speaker: 'bird', text: 'CAW—' },
            { speaker: 'bird', text: 'Oh. Hello.' },
            { speaker: 'rua', text: '…You can talk.' },
            { speaker: 'bird', text: 'Obviously.' },
            { speaker: 'rua', text: 'Great.' },
            { speaker: 'rua', text: 'Do you have the password for the ugly house with snacks?' },
            { speaker: 'bird', text: 'Yeah.' },
            { speaker: 'rua', text: '…Of course you do.' },
            { speaker: 'bird', text: 'The cats told me not to give it out.' },
            { speaker: 'rua', text: 'They also told me to vibe.' },
            { speaker: 'rua', text: 'So we’re all ignoring advice today.' },
            { speaker: 'bird', text: 'Fair.' },
            { speaker: 'bird', text: 'It’s MEOW123.' },
            { speaker: 'rua', text: '…That’s it?' },
            { speaker: 'bird', text: 'They’re not very creative.' },
            { speaker: 'rua', text: 'I hate that this worked.' },
            { speaker: 'rua', text: 'But thank you.' },
            { speaker: 'bird', text: 'Don’t tell them it was me.' },
            { speaker: 'rua', text: 'Oh, I absolutely will not.' },
            { speaker: 'rua', text: 'I’m above snitching.' }
        ], () => {
            this.hasPassword = true;
        }, 0, (line) => {
            if (line.speaker === 'bird' && line.text === 'CAW—') {
                this.bird.visible = true;
            }
        });
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

    promptPassword() {
        this.passwordModalActive = true;
        this.passwordInput = '';
        this.passwordError = '';
        this.passwordHintPulse = 0;
        window.addEventListener('keydown', this.handlePasswordKeyDownBound);
    }

    closePasswordModal() {
        if (!this.passwordModalActive) return;
        this.passwordModalActive = false;
        window.removeEventListener('keydown', this.handlePasswordKeyDownBound);
    }

    submitPasswordInput() {
        const password = this.passwordInput.trim().toUpperCase();
        this.passwordAttempts++;

        if (password === 'MEOW123') {
            this.closePasswordModal();
            this.dialogueSystem.show(['🔓 Correct! You may enter.'], 'system', () => {
                this.door.locked = false;
                this.hasPassword = true;
            });
            return;
        }

        this.passwordError = 'Wrong password. Try again.';
    }

    handlePasswordKeyDown(e) {
        if (!this.passwordModalActive) return;

        const key = e.key;

        if (key === 'Escape') {
            e.preventDefault();
            this.closePasswordModal();
            return;
        }

        if (key === 'Enter') {
            e.preventDefault();
            this.submitPasswordInput();
            return;
        }

        if (key === 'Backspace') {
            e.preventDefault();
            this.passwordInput = this.passwordInput.slice(0, -1);
            this.passwordError = '';
            return;
        }

        if (/^[a-zA-Z0-9]$/.test(key) && this.passwordInput.length < 12) {
            e.preventDefault();
            this.passwordInput += key.toUpperCase();
            this.passwordError = '';
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
        const doorHouseX = this.door.x - 90;
        const housePositions = [150, 400, 650, doorHouseX];
        housePositions.forEach(xPos => {
            // House walls
            const isDoorHouse = Math.abs(xPos - doorHouseX) < 2;
            const houseWidth = isDoorHouse ? 190 : 120;
            ctx.fillStyle = isDoorHouse ? '#8a6a4a' : '#CD853F';
            ctx.fillRect(xPos, h - 280, houseWidth, 150);

            if (isDoorHouse) {
                // Weathered wall patches
                ctx.fillStyle = '#6f5339';
                ctx.fillRect(xPos + 12, h - 250, 50, 26);
                ctx.fillRect(xPos + 118, h - 220, 58, 24);
            }

            // Roof
            ctx.fillStyle = isDoorHouse ? '#5f3a24' : '#8B4513';
            ctx.beginPath();
            ctx.moveTo(xPos, h - 280);
            ctx.lineTo(xPos + houseWidth / 2, h - 330);
            ctx.lineTo(xPos + houseWidth, h - 280);
            ctx.closePath();
            ctx.fill();

            if (isDoorHouse) {
                // Missing roof chunk + cracks
                ctx.fillStyle = '#87CEEB';
                ctx.beginPath();
                ctx.moveTo(xPos + 22, h - 286);
                ctx.lineTo(xPos + 46, h - 310);
                ctx.lineTo(xPos + 68, h - 282);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = '#4b3428';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(xPos + 35, h - 260);
                ctx.lineTo(xPos + 28, h - 232);
                ctx.lineTo(xPos + 40, h - 205);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(xPos + 150, h - 252);
                ctx.lineTo(xPos + 162, h - 220);
                ctx.stroke();
            }

            if (!isDoorHouse) {
                // Door
                ctx.fillStyle = '#654321';
                ctx.fillRect(xPos + 40, h - 180, 40, 80);
            }

            // Window
            if (isDoorHouse) {
                ctx.fillStyle = '#4a3b2d';
                ctx.fillRect(xPos + 18, h - 244, 38, 34);
                // Boarded planks
                ctx.fillStyle = '#7c5a3f';
                ctx.fillRect(xPos + 16, h - 236, 42, 6);
                ctx.fillRect(xPos + 16, h - 222, 42, 6);
            } else {
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(xPos + 10, h - 240, 30, 30);
            }
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

        // Draw tree (rattles when examined)
        const treeOffset = this.tree.rattling ? Math.sin(Date.now() * 0.05) * 4 : 0;
        const treeX = this.tree.x + treeOffset;

        // Tree trunk
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(treeX + 42, this.tree.y + 110, 46, 160);

        // Tree foliage
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.arc(treeX + 65, this.tree.y + 90, 80, 0, Math.PI * 2);
        ctx.fill();

        // Bird appears after tree examine + rattle
        if (this.bird.visible) {
            ctx.font = '50px Arial';
            ctx.fillText(this.bird.emoji, treeX + 38, this.tree.y + 86);
        }

        // Tree interaction prompt
        if (this.tree.inRange && !this.dialogueSystem.isDialogueActive()) {
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.font = '16px Arial';
            ctx.strokeText('[ENTER] Examine', treeX + 12, this.tree.y - 14);
            ctx.fillText('[ENTER] Examine', treeX + 12, this.tree.y - 14);
        }

        // Draw door in front of the final (run-down) house
        ctx.fillStyle = '#5b3b28';
        ctx.fillRect(this.door.x, this.door.y, this.door.width, this.door.height);

        // Door wear / scratches
        ctx.strokeStyle = '#3e291d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.door.x + 14, this.door.y + 15);
        ctx.lineTo(this.door.x + 24, this.door.y + 35);
        ctx.moveTo(this.door.x + 32, this.door.y + 10);
        ctx.lineTo(this.door.x + 40, this.door.y + 28);
        ctx.moveTo(this.door.x + 48, this.door.y + 18);
        ctx.lineTo(this.door.x + 58, this.door.y + 38);
        ctx.stroke();

        // Weeds at base
        ctx.font = '22px Arial';
        ctx.fillText('🌿', this.door.x - 10, this.door.y + this.door.height + 8);
        ctx.fillText('🍃', this.door.x + this.door.width - 2, this.door.y + this.door.height + 8);

        // Door symbol
        ctx.font = '32px Arial';
        ctx.fillText(this.door.locked ? '🔒' : '🟢', this.door.x + 18, this.door.y + 36);

        // Door label
        if (this.door.inRange && !this.dialogueSystem.isDialogueActive()) {
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.font = '16px Arial';
            ctx.strokeText('[ENTER] ' + (this.door.locked ? 'Enter Password' : 'Enter House'), this.door.x - 48, this.door.y - 20);
            ctx.fillText('[ENTER] ' + (this.door.locked ? 'Enter Password' : 'Enter House'), this.door.x - 48, this.door.y - 20);
        }

        // Player
        ctx.font = '50px Arial';
        if (this.rua.facingRight) {
            ctx.save();
            ctx.translate(this.rua.x + 25, 0);
            ctx.scale(-1, 1);
            ctx.fillText(this.rua.emoji, 0, this.rua.y);
            ctx.restore();
        } else {
            ctx.fillText(this.rua.emoji, this.rua.x - 25, this.rua.y);
        }

        if (this.dialogueSystem) {
            this.dialogueSystem.draw();
        }

        if (this.passwordModalActive) {
            this.drawPasswordModal();
        }
    }

    drawPasswordModal() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.fillRect(0, 0, w, h);

        const boxW = 560;
        const boxH = 250;
        const boxX = (w - boxW) / 2;
        const boxY = (h - boxH) / 2;

        const grad = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxH);
        grad.addColorStop(0, '#fff7d8');
        grad.addColorStop(1, '#f0ddb0');
        ctx.fillStyle = grad;
        ctx.fillRect(boxX, boxY, boxW, boxH);

        ctx.strokeStyle = '#5b3b28';
        ctx.lineWidth = 5;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        ctx.fillStyle = '#5b3b28';
        ctx.font = 'bold 30px Arial';
        ctx.fillText('🔐 Password Required', boxX + 28, boxY + 48);

        ctx.fillStyle = '#3d2b1f';
        ctx.font = '20px Arial';
        ctx.fillText('Enter the house password:', boxX + 30, boxY + 86);

        ctx.fillStyle = '#fffef8';
        ctx.fillRect(boxX + 30, boxY + 102, boxW - 60, 54);
        ctx.strokeStyle = '#7b5a3c';
        ctx.lineWidth = 3;
        ctx.strokeRect(boxX + 30, boxY + 102, boxW - 60, 54);

        ctx.fillStyle = '#1f1f1f';
        ctx.font = 'bold 28px monospace';
        const cursor = Math.floor(this.passwordHintPulse / 450) % 2 === 0 ? '|' : ' ';
        ctx.fillText((this.passwordInput || '') + cursor, boxX + 44, boxY + 139);

        if (this.passwordError) {
            ctx.fillStyle = '#b00020';
            ctx.font = 'bold 18px Arial';
            ctx.fillText(this.passwordError, boxX + 30, boxY + 184);
        }

        ctx.fillStyle = '#5a4b3b';
        ctx.font = '16px Arial';
        ctx.fillText('ENTER = submit   •   ESC = cancel   •   BACKSPACE = delete', boxX + 30, boxY + 220);
    }

    isComplete() {
        return this.complete;
    }

    isDead() {
        return this.dead;
    }
}
