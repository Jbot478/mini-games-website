// Level 0 - Opening Scene (ALL FIXES APPLIED)
class Level00_Opening {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.step = 0;
        this.stepTimer = 0;

        this.rua = {
            x: 200,
            y: canvas.height - 150,
            vy: 0,
            grounded: true,
            facingRight: true,
            emoji: '🐕'
        };

        this.man = {
            x: canvas.width + 100,
            y: canvas.height - 150,
            emoji: '🧍🏻‍♂️'
        };

        this.basket = {
            x: canvas.width - 200,  // Moved closer
            y: canvas.height - 180, // Smaller size
            width: 70,              // Smaller
            height: 80,             // Smaller
            doorOpen: false
        };

        // Evil cats in window (flashing)
        this.evilCats = [
            { x: 100, y: 120, phase: 0 },
            { x: 200, y: 180, phase: Math.PI },
            { x: 280, y: 140, phase: Math.PI * 0.5 }
        ];

        this.dialogueSystem = null;
        this.complete = false;
        this.lastDialogueActive = false;
        this.flashTimer = 0;

        // Pre-define all dialogues
        this.dialogues = [
            { speaker: 'rua', text: 'You evil fluffy beings stay away from my home!' },
            { speaker: 'man', text: 'Be quiet!' },
            { speaker: 'rua', text: 'YOU FOOL there are evil tiny fluffy idiots trying to murder us in the night!' },
            { speaker: 'man', text: 'You are very cute but I do not know what you are saying so go to bed.' },
            { speaker: 'rua', text: 'Fine I will save us. Good luck cleaning my poop off the carpet later loser.' },
            { speaker: 'rua', text: 'Time to get in my basket and save the world!' } // NEW!
        ];
    }

    init(dialogueSystem) {
        this.dialogueSystem = dialogueSystem;
        this.step = 0;
        this.stepTimer = 0;
        this.lastDialogueActive = false;
        this.flashTimer = 0;
        audioSystem.playMusic('village');
        console.log('Opening scene initialized!');
    }

    showDialogue(index) {
        const d = this.dialogues[index];
        console.log(`Showing dialogue ${index}: "${d.text}" from ${d.speaker}`);
        this.dialogueSystem.show(d.text, d.speaker, null);
    }

    update(input, deltaTime) {
        this.stepTimer += deltaTime;
        this.flashTimer += deltaTime;

        const dialogueActive = this.dialogueSystem.isActive;
        const dialogueJustFinished = this.lastDialogueActive && !dialogueActive;
        this.lastDialogueActive = dialogueActive;

        switch(this.step) {
            case 0: // Wait
                if (this.stepTimer > 1000) {
                    console.log('STEP 1: Showing dialogue 0');
                    this.showDialogue(0);
                    this.step = 1;
                }
                break;

            case 1: // After dialogue 0
                if (dialogueJustFinished) {
                    console.log('STEP 2: Dialogue 0 done, man walking');
                    this.step = 2;
                }
                break;

            case 2: // Man walks
                this.man.x -= 3;
                if (this.man.x < 500) {
                    console.log('STEP 3: Man arrived, showing dialogue 1');
                    this.showDialogue(1);
                    this.step = 3;
                }
                break;

            case 3: // After dialogue 1
                if (dialogueJustFinished) {
                    console.log('STEP 4: Dialogue 1 done, showing dialogue 2');
                    this.showDialogue(2);
                    this.step = 4;
                }
                break;

            case 4: // After dialogue 2
                if (dialogueJustFinished) {
                    console.log('STEP 5: Dialogue 2 done, showing dialogue 3');
                    this.showDialogue(3);
                    this.step = 5;
                }
                break;

            case 5: // After dialogue 3
                if (dialogueJustFinished) {
                    console.log('STEP 6: Dialogue 3 done, showing dialogue 4');
                    this.showDialogue(4);
                    this.step = 6;
                }
                break;

            case 6: // After dialogue 4
                if (dialogueJustFinished) {
                    console.log('STEP 7: ALL DONE! Player control!');
                    this.step = 7;
                }
                break;

            case 7: // Player control
                this.updatePlayer(input, deltaTime);
                break;

            case 8: // Basket dialogue
                if (dialogueJustFinished) {
                    this.step = 9;
                }
                break;

            case 9: // Basket animation
                this.updateBasket();
                break;

            case 10: // Complete
                if (this.stepTimer > 500) {
                    this.complete = true;
                }
                break;
        }

        if (this.dialogueSystem) {
            this.dialogueSystem.update(input);
        }
    }

    updatePlayer(input, deltaTime) {
        const moveSpeed = 5;
        const jumpPower = -15;
        const gravity = 0.8;

        // Movement
        if (input.left || input.a) {
            this.rua.x -= moveSpeed;
            this.rua.facingRight = false;
        }
        if (input.right || input.d) {
            this.rua.x += moveSpeed;
            this.rua.facingRight = true;
        }

        // JUMP - FIXED!
        if (input.space && this.rua.grounded && !this.lastJump) {
            this.rua.vy = jumpPower;
            this.rua.grounded = false;
            audioSystem.playSFX('jump');
        }
        this.lastJump = input.space;

        // Gravity
        if (!this.rua.grounded) {
            this.rua.vy += gravity;
            this.rua.y += this.rua.vy;
            if (this.rua.y >= this.canvas.height - 150) {
                this.rua.y = this.canvas.height - 150;
                this.rua.vy = 0;
                this.rua.grounded = true;
            }
        }

        this.rua.x = Math.max(50, Math.min(this.canvas.width - 50, this.rua.x));

        // Basket interaction
        if (Math.abs(this.rua.x - (this.basket.x + 35)) < 100 && input.enter && !this.lastEnter) {
            console.log('STEP 8: Showing basket dialogue!');
            this.showDialogue(5); // "Time to get in my basket..."
            this.step = 8;
        }
        this.lastEnter = input.enter;
    }

    updateBasket() {
        if (this.stepTimer < 500) {
            this.rua.x += (this.basket.x + 15 - this.rua.x) * 0.1;
        } else if (this.stepTimer < 800) {
            this.basket.doorOpen = true;
        } else {
            this.rua.y -= 5;
            if (this.rua.y < this.basket.y - 40) {
                this.basket.doorOpen = false;
                this.step = 10;
                this.stepTimer = 0;
            }
        }
    }

    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // NIGHTTIME
        const bg = ctx.createLinearGradient(0, 0, 0, h);
        bg.addColorStop(0, '#0a0a1a');
        bg.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        // Moon
        ctx.fillStyle = '#f0f0aa';
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#ffff99';
        ctx.beginPath();
        ctx.arc(w - 150, 100, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Floor
        ctx.fillStyle = '#2b1810';
        ctx.fillRect(0, h - 100, w, 100);

        // Window
        ctx.fillStyle = '#000';
        ctx.fillRect(50, 50, 300, 250);

        // Stars INSIDE window
        for (let i = 0; i < 30; i++) {
            ctx.fillStyle = 'white';
            const starX = 60 + (i * 19) % 280;
            const starY = 60 + (i * 13) % 230;
            ctx.fillRect(starX, starY, 2, 2);
        }

        // Evil cats INSIDE window (FLASHING!)
        this.evilCats.forEach(cat => {
            const flash = Math.sin(this.flashTimer * 0.005 + cat.phase) * 0.5 + 0.5;
            ctx.globalAlpha = 0.3 + flash * 0.7; // Flash between 0.3 and 1.0
            ctx.font = '32px Arial';
            ctx.fillText('😾', cat.x, cat.y);
        });
        ctx.globalAlpha = 1;

        // Window frame
        ctx.strokeStyle = '#3d2817';
        ctx.lineWidth = 12;
        ctx.strokeRect(50, 50, 300, 250);

        // Couch
        ctx.fillStyle = '#4a3520';
        ctx.fillRect(400, h - 180, 200, 80);

        // Lamp
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

        // Rug
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(w/2 - 200, h - 160, 400, 60);

        // BASKET (BETTER DESIGN)
        this.drawBasket();

        // Man
        if (this.man.x < w) {
            ctx.font = '80px Arial';
            ctx.fillText(this.man.emoji, this.man.x, this.man.y);
        }

        // Rua
        if (this.step < 9 || this.rua.y >= this.basket.y - 40) {
            ctx.save();
            ctx.font = '60px Arial';
            if (!this.rua.facingRight) {
                ctx.translate(this.rua.x + 30, 0);
                ctx.scale(-1, 1);
                ctx.fillText(this.rua.emoji, 0, this.rua.y);
            } else {
                ctx.fillText(this.rua.emoji, this.rua.x, this.rua.y);
            }
            ctx.restore();
        }

        // Controls
        if (this.step === 7) {
            // Movement controls
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillRect(10, h - 100, 350, 90);
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 18px Arial';
            ctx.fillText('◄► Arrow Keys - Move', 20, h - 65);
            ctx.fillText('SPACE - Jump', 20, h - 40);

            // Basket prompt (when near)
            const dist = Math.abs(this.rua.x - (this.basket.x + 35));
            if (dist < 150) {
                ctx.fillStyle = 'rgba(255, 215, 0, 0.95)';
                ctx.fillRect(this.basket.x - 80, this.basket.y - 70, 220, 45);
                ctx.fillStyle = '#000';
                ctx.font = 'bold 20px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Press ENTER to enter!', this.basket.x + 30, this.basket.y - 40);
                ctx.textAlign = 'left';
            }
        }

        // Dialogue
        if (this.dialogueSystem) {
            this.dialogueSystem.draw();
        }

        // Debug
        ctx.fillStyle = 'lime';
        ctx.font = 'bold 18px monospace';
        ctx.fillText(`STEP: ${this.step}`, 10, 25);
    }

    drawBasket() {
        const ctx = this.ctx;
        const b = this.basket;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(b.x + 3, b.y + b.height - 3, b.width, 8);

        // Basket body - woven look
        ctx.fillStyle = '#D4A76A';
        ctx.fillRect(b.x, b.y, b.width, b.height);

        // Weave pattern (vertical)
        ctx.strokeStyle = '#8B6914';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            ctx.beginPath();
            ctx.moveTo(b.x + i * 9, b.y);
            ctx.lineTo(b.x + i * 9, b.y + b.height);
            ctx.stroke();
        }

        // Weave pattern (horizontal)
        for (let i = 0; i < 7; i++) {
            ctx.beginPath();
            ctx.moveTo(b.x, b.y + i * 12);
            ctx.lineTo(b.x + b.width, b.y + i * 12);
            ctx.stroke();
        }

        // Door
        if (this.basket.doorOpen) {
            ctx.fillStyle = '#8B6914';
            ctx.fillRect(b.x - 25, b.y + 15, 28, 50);
        } else {
            ctx.fillStyle = '#A0826D';
            ctx.fillRect(b.x + 5, b.y + 20, b.width - 10, 50);
            // Door handle
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(b.x + 15, b.y + 45, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Handle on top
        ctx.strokeStyle = '#8B6914';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(b.x + b.width/2, b.y - 3, 25, Math.PI, 0);
        ctx.stroke();

        // Basket trim
        ctx.fillStyle = '#8B6914';
        ctx.fillRect(b.x, b.y, b.width, 3);
        ctx.fillRect(b.x, b.y + b.height - 3, b.width, 3);
    }

    isComplete() {
        return this.complete;
    }
}
