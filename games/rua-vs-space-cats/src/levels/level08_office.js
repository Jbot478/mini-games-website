// Level 8 - THE OFFICE OF SECRETS
class Level08_Office {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.rua = { x: 100, y: canvas.height - 150, vy: 0, grounded: true, size: 50, emoji: '🐕' };
        this.plates = [ { x: 300, y: canvas.height - 120, pressed: false }, { x: 500, y: canvas.height - 120, pressed: false } ];
        this.switches = [ { x: 700, y: canvas.height - 200, state: false } ];
        this.elevator = { x: canvas.width - 200, y: canvas.height - 300, active: false };
        this.sequence = [0, 1, 0]; // Correct sequence
        this.currentSequence = [];
        this.dialogueSystem = null;
        this.complete = false;
        this.phase = 'puzzle';
    }

    init(dialogueSystem) {
        this.dialogueSystem = dialogueSystem;
        audioSystem.playMusic('office');

        this.dialogueSystem.show('This place has bad energy.', 'rua', () => {
            this.phase = 'puzzle';
        });
    }

    update(input, deltaTime) {
        const moveSpeed = 3;

        if (input.left || input.a) this.rua.x -= moveSpeed;
        if (input.right || input.d) this.rua.x += moveSpeed;

        // Check plate presses
        this.plates.forEach((plate, i) => {
            const onPlate = Math.abs(this.rua.x - plate.x) < 50 && Math.abs(this.rua.y - plate.y) < 30;
            if (onPlate && !plate.pressed) {
                plate.pressed = true;
                this.currentSequence.push(i);
                this.checkSequence();
            }
            if (!onPlate && plate.pressed) {
                plate.pressed = false;
            }
        });

        // Check elevator
        if (this.elevator.active && Math.abs(this.rua.x - this.elevator.x) < 100) {
            this.phase = 'reveal';
            this.showReveal();
        }

        if (this.dialogueSystem) {
            this.dialogueSystem.update(input);
        }
    }

    checkSequence() {
        if (this.currentSequence.length === this.sequence.length) {
            let correct = true;
            for (let i = 0; i < this.sequence.length; i++) {
                if (this.currentSequence[i] !== this.sequence[i]) {
                    correct = false;
                    break;
                }
            }

            if (correct) {
                this.elevator.active = true;
                audioSystem.playSFX('unlock');
            } else {
                this.currentSequence = [];
                audioSystem.playSFX('hit');
            }
        }
    }

    showReveal() {
        this.dialogueSystem.show(
            ['Oh my god.', 'You.'],
            'rua',
            () => {
                this.dialogueSystem.show(
                    'Hello.',
                    'sprinkles',
                    () => {
                        this.dialogueSystem.show(
                            ['You\'re that messy Shih Tzu from across the road.', 'Prepare to die.'],
                            'rua',
                            () => {
                                this.dialogueSystem.show(
                                    ['My name is Sprinkles.', 'And I shot you down.'],
                                    'sprinkles',
                                    () => {
                                        this.dialogueSystem.show(
                                            'I\'m not scared of trucks.',
                                            'rua',
                                            () => {
                                                audioSystem.playSFX('explosion');
                                                this.complete = true;
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

    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Sterile office
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, w, h);

        // Floor
        ctx.fillStyle = '#d0d0d0';
        ctx.fillRect(0, h - 100, w, 100);

        // Pressure plates
        this.plates.forEach(plate => {
            ctx.fillStyle = plate.pressed ? '#00ff00' : '#cccccc';
            ctx.fillRect(plate.x - 40, plate.y, 80, 10);
        });

        // Elevator
        if (this.elevator.active) {
            ctx.fillStyle = '#00aa00';
        } else {
            ctx.fillStyle = '#555';
        }
        ctx.fillRect(this.elevator.x - 50, this.elevator.y, 100, 200);

        // Player
        ctx.font = '50px Arial';
        ctx.fillText(this.rua.emoji, this.rua.x - 25, this.rua.y);

        // Sprinkles (if revealed)
        if (this.phase === 'reveal') {
            ctx.fillText('🐶', this.elevator.x - 25, this.elevator.y + 100);
        }

        if (this.dialogueSystem) {
            this.dialogueSystem.draw();
        }
    }

    isComplete() {
        return this.complete;
    }
}
