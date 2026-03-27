// Level 7 - SERVANTS WITH HANDS
class Level07_Servants {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.rua = {
            x: 140,
            y: canvas.height - 180,
            vx: 0,
            vy: 0,
            size: 50,
            emoji: '🐕',
            facing: 'right'
        };
        this.humans = this.createHumans();
        this.houses = this.createHouses();
        this.townHall = { x: canvas.width - 170, y: 120, width: 120, height: 140, inRange: false };
        this.dialogueSystem = null;
        this.complete = false;
        this.phase = 'intro';
        this.phaseTime = 0;
        this.peopleTalked = 0;
        this.objectiveDone = false;
    }

    createHumans() {
        return [
            {
                x: 220,
                y: 250,
                emoji: '👩‍🌾',
                name: 'Farmer Lina',
                talked: false,
                lines: ['New around here?', 'Town hall is where the serious weirdos gather.']
            },
            {
                x: 430,
                y: 520,
                emoji: '🧑‍🍳',
                name: 'Cook Bram',
                talked: false,
                lines: ['I made soup. It is suspiciously sentient.', 'Try not to step in it.']
            },
            {
                x: 640,
                y: 320,
                emoji: '🧓',
                name: 'Elder Marn',
                talked: false,
                lines: ['A talking dog? This week keeps getting worse.', 'The town hall is up to the right.']
            },
            {
                x: 840,
                y: 560,
                emoji: '🛠️',
                name: 'Mechanic Jo',
                talked: false,
                lines: ['If it rattles, kick it.', 'If it still rattles, kick it harder.']
            },
            {
                x: 980,
                y: 360,
                emoji: '🧍',
                name: 'Nervous Citizen',
                talked: false,
                lines: ['Please do not bite me.', 'Actually, please do not bite anyone.']
            }
        ];
    }

    createHouses() {
        return [
            { x: 70, y: 120, width: 140, height: 120, roof: '#8b3a3a', wall: '#c79a6b' },
            { x: 300, y: 130, width: 170, height: 135, roof: '#6b4e9b', wall: '#d6b386' },
            { x: 560, y: 110, width: 150, height: 120, roof: '#3d7a5e', wall: '#cda57a' },
            { x: 780, y: 130, width: 150, height: 130, roof: '#6f7f9f', wall: '#d7b48c' },
            { x: 130, y: 410, width: 180, height: 120, roof: '#91512b', wall: '#cba375' },
            { x: 520, y: 430, width: 190, height: 125, roof: '#9b6b8a', wall: '#d4ac84' }
        ];
    }

    init(dialogueSystem) {
        this.dialogueSystem = dialogueSystem;
        this.dialogueSystem.position = 'top';
        audioSystem.playMusic('servants');

        this.dialogueSystem.show(
            ['Ugh. A whole town of humans.', 'Try to look useful while I investigate.'],
            'rua',
            () => {
                this.phase = 'gameplay';
            }
        );
    }

    update(input, deltaTime) {
        this.phaseTime += deltaTime;
        const dialogueWasActive = this.dialogueSystem && this.dialogueSystem.isDialogueActive();

        if (this.phase === 'gameplay') {
            const moveSpeed = 2.8;
            const enterJustPressed = input.enter && !this.lastEnter;

            if (!dialogueWasActive) {
                if (input.left || input.a) {
                    this.rua.x -= moveSpeed;
                    this.rua.facing = 'left';
                }
                if (input.right || input.d) {
                    this.rua.x += moveSpeed;
                    this.rua.facing = 'right';
                }
                if (input.up || input.w) this.rua.y -= moveSpeed;
                if (input.down || input.s) this.rua.y += moveSpeed;
            }

            this.rua.x = Math.max(40, Math.min(this.canvas.width - 40, this.rua.x));
            this.rua.y = Math.max(90, Math.min(this.canvas.height - 130, this.rua.y));

            // Interact with townspeople
            this.humans.forEach(human => {
                human.inRange = Math.hypot(this.rua.x - human.x, this.rua.y - human.y) < 90;
            });

            if (enterJustPressed && !dialogueWasActive) {
                const human = this.humans.find(h => h.inRange);
                if (human) {
                    this.dialogueSystem.show(human.lines, 'human', () => {
                        this.dialogueSystem.show(['Noted.', 'Now move aside, civilian.'], 'rua');
                    });
                    if (!human.talked) {
                        human.talked = true;
                        this.peopleTalked++;
                    }
                }
            }

            this.objectiveDone = this.peopleTalked >= 3;

            // Town hall entrance after gathering info
            this.townHall.inRange = this.objectiveDone
                && Math.abs(this.rua.x - (this.townHall.x + this.townHall.width / 2)) < 85
                && Math.abs(this.rua.y - (this.townHall.y + this.townHall.height + 15)) < 95;

            if (this.townHall.inRange && enterJustPressed && !dialogueWasActive) {
                this.dialogueSystem.show(
                    ['Information acquired.', 'Time to interrogate whoever runs this circus.'],
                    'rua',
                    () => {
                        this.complete = true;
                    }
                );
            }

            this.lastEnter = input.enter;
        }

        if (this.dialogueSystem) {
            this.dialogueSystem.update(input);
        }
    }

    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Sky and town ground
        const sky = ctx.createLinearGradient(0, 0, 0, h);
        sky.addColorStop(0, '#d9efff');
        sky.addColorStop(1, '#f3f7ff');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#9fcf8b';
        ctx.fillRect(0, 80, w, h - 80);

        // Roads
        ctx.fillStyle = '#b8aa96';
        ctx.fillRect(0, 280, w, 70);
        ctx.fillRect(0, 500, w, 70);
        ctx.fillRect(360, 80, 90, h - 80);
        ctx.fillRect(860, 80, 90, h - 80);

        // Houses
        this.houses.forEach(house => {
            ctx.fillStyle = house.wall;
            ctx.fillRect(house.x, house.y, house.width, house.height);

            ctx.fillStyle = house.roof;
            ctx.beginPath();
            ctx.moveTo(house.x - 10, house.y);
            ctx.lineTo(house.x + house.width / 2, house.y - 45);
            ctx.lineTo(house.x + house.width + 10, house.y);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#6b4f3a';
            ctx.fillRect(house.x + house.width / 2 - 18, house.y + house.height - 46, 36, 46);

            ctx.fillStyle = '#d9f1ff';
            ctx.fillRect(house.x + 16, house.y + 28, 28, 22);
            ctx.fillRect(house.x + house.width - 44, house.y + 28, 28, 22);
        });

        // Town hall (level exit)
        ctx.fillStyle = '#c9a671';
        ctx.fillRect(this.townHall.x, this.townHall.y, this.townHall.width, this.townHall.height);
        ctx.fillStyle = '#7d5632';
        ctx.fillRect(this.townHall.x + 40, this.townHall.y + 85, 40, 55);
        ctx.fillStyle = '#2f4f7f';
        ctx.fillRect(this.townHall.x + 8, this.townHall.y - 24, this.townHall.width - 16, 20);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('TOWN HALL', this.townHall.x + 14, this.townHall.y - 10);

        // Humans
        this.humans.forEach(human => {
            ctx.font = '50px Arial';
            ctx.fillText(human.emoji, human.x - 25, human.y);

            if (human.inRange && this.phase === 'gameplay' && !this.dialogueSystem.isDialogueActive()) {
                ctx.fillStyle = 'white';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                ctx.font = '14px Arial';
                ctx.strokeText('[ENTER] Talk', human.x - 38, human.y - 42);
                ctx.fillText('[ENTER] Talk', human.x - 38, human.y - 42);
            }
        });

        if (this.townHall.inRange && !this.dialogueSystem.isDialogueActive()) {
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.font = '14px Arial';
            ctx.strokeText('[ENTER] Enter Town Hall', this.townHall.x - 18, this.townHall.y + this.townHall.height + 18);
            ctx.fillText('[ENTER] Enter Town Hall', this.townHall.x - 18, this.townHall.y + this.townHall.height + 18);
        }

        // Player
        ctx.font = '50px Arial';
        if (this.rua.facing === 'left') {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.fillText(this.rua.emoji, -(this.rua.x - 25), this.rua.y);
            ctx.restore();
        } else {
            ctx.fillText(this.rua.emoji, this.rua.x - 25, this.rua.y);
        }

        // Objective HUD
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(14, 10, 340, 58);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`Talk to townspeople: ${this.peopleTalked}/3`, 24, 32);
        ctx.font = '13px Arial';
        ctx.fillText(this.objectiveDone ? 'Objective: Enter Town Hall' : 'Objective: Gather information', 24, 52);

        if (this.dialogueSystem) {
            this.dialogueSystem.draw();
        }
    }

    isComplete() {
        return this.complete;
    }
}
