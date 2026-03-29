// Level 8 - THE OFFICE OF SECRETS (Top-down push puzzle)
class Level08_Office {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;

        this.spawnPoint = { x: 180, y: 620 };

        this.rua = {
            x: this.spawnPoint.x,
            y: this.spawnPoint.y,
            size: 46,
            emoji: '🐕',
            facing: 'right',
            spin: 0,
            hitByTruck: false,
            vx: 0,
            vy: 0
        };

        this.dialogueSystem = null;
        this.complete = false;
        this.phase = 'intro_walk_to_button';
        this.lastR = false;
        this.heavyHintShown = false;

        this.dimAlpha = 0;
        this.panelOpen = 0;

        this.sprinkles = {
            x: 600,
            y: 90,
            emoji: '🐶',
            visible: false
        };

        this.truck = {
            active: false,
            x: -260,
            y: 0,
            width: 220,
            height: 86,
            speed: 13
        };

        this.villainButton = {
            x: 630,
            y: 210,
            width: 36,
            height: 18,
            pressed: false
        };

        this.introButtonId = 0;

        this.setupRoom();
        this.resetRoomState();
    }

    setupRoom() {
        this.roomBounds = { x: 120, y: 110, width: 1000, height: 600 };

        // Static walls
        this.walls = [
            // Border walls
            { x: 120, y: 110, width: 1000, height: 16 },
            { x: 120, y: 694, width: 1000, height: 16 },
            { x: 120, y: 110, width: 16, height: 600 },
            { x: 1104, y: 110, width: 16, height: 600 },

            // Internal structure
            { x: 420, y: 110, width: 16, height: 270 },
            { x: 420, y: 464, width: 16, height: 246 },

            { x: 760, y: 110, width: 16, height: 238 },
            { x: 760, y: 418, width: 16, height: 292 },

            { x: 436, y: 478, width: 124, height: 16 },
            { x: 634, y: 478, width: 126, height: 16 },

            { x: 776, y: 260, width: 114, height: 16 },
            { x: 960, y: 260, width: 104, height: 16 }
        ];

        // Gates controlled by buttons
        this.gates = [
            { id: 0, x: 420, y: 380, width: 16, height: 84, open: false, temporary: false },
            { id: 1, x: 760, y: 348, width: 16, height: 70, open: false, temporary: true },
            { id: 2, x: 560, y: 478, width: 74, height: 16, open: false, temporary: true },
            { id: 3, x: 890, y: 260, width: 70, height: 16, open: false, temporary: false }
        ];

        // Heavy blue button: only the couch can hold this down
        this.heavyButton = { x: 612, y: 300, width: 54, height: 54, gateId: 2, active: false };

        // Green floor buttons
        this.buttons = [
            { id: 0, x: 220, y: 596, width: 48, height: 48, gates: [0], active: false },
            { id: 1, x: 330, y: 220, width: 48, height: 48, gates: [1], active: false },
            { id: 2, x: 620, y: 560, width: 48, height: 48, gates: [], active: false },
            { id: 3, x: 980, y: 560, width: 48, height: 48, gates: [3], active: false }
        ];

        this.initialFurniture = [
            { id: 'chair_a', x: 300, y: 596, width: 44, height: 44, emoji: '🪑' },
            { id: 'chair_b', x: 520, y: 240, width: 44, height: 44, emoji: '🪑' },
            { id: 'chair_c', x: 840, y: 540, width: 44, height: 44, emoji: '🪑' },
            { id: 'desk_a', x: 962, y: 182, width: 56, height: 44, emoji: '🛋️' }
        ];
    }

    resetRoomState() {
        this.furniture = this.initialFurniture.map((f) => ({
            ...f,
            startX: f.x,
            startY: f.y
        }));

        // Retry also respawns Rua at the original start point
        this.rua.x = this.spawnPoint.x;
        this.rua.y = this.spawnPoint.y;
        this.rua.facing = 'right';
        this.rua.spin = 0;
        this.rua.hitByTruck = false;
        this.rua.vx = 0;
        this.rua.vy = 0;

        this.buttons.forEach((b) => {
            b.active = false;
        });

        this.gates.forEach((g) => {
            g.open = false;
        });

        this.heavyButton.active = false;

        this.updateButtonsAndGates();
    }

    init(dialogueSystem) {
        this.dialogueSystem = dialogueSystem;
        this.dialogueSystem.position = 'bottom';
        audioSystem.playMusic('office');
    }

    rectsOverlap(a, b) {
        return a.x < b.x + b.width
            && a.x + a.width > b.x
            && a.y < b.y + b.height
            && a.y + a.height > b.y;
    }

    rectsTouchOrOverlap(a, b) {
        return a.x <= b.x + b.width
            && a.x + a.width >= b.x
            && a.y <= b.y + b.height
            && a.y + a.height >= b.y;
    }

    getRuaRect(nextX = this.rua.x, nextY = this.rua.y) {
        return {
            x: nextX - this.rua.size / 2,
            y: nextY - this.rua.size / 2,
            width: this.rua.size,
            height: this.rua.size
        };
    }

    getBlockingRects() {
        const closedGates = this.gates
            .filter((g) => !g.open)
            .map((g) => ({ x: g.x, y: g.y, width: g.width, height: g.height }));

        return [...this.walls, ...closedGates];
    }

    canOccupyFurnitureRect(testRect, ignoreId = null) {
        const blockingRects = this.getBlockingRects();
        for (const rect of blockingRects) {
            if (this.rectsOverlap(testRect, rect)) {
                return false;
            }
        }

        for (const f of this.furniture) {
            if (f.id === ignoreId) continue;
            if (this.rectsOverlap(testRect, f)) {
                return false;
            }
        }

        return true;
    }

    canOccupyRuaRect(testRect) {
        const blockingRects = this.getBlockingRects();
        for (const rect of blockingRects) {
            if (this.rectsOverlap(testRect, rect)) {
                return false;
            }
        }

        for (const f of this.furniture) {
            if (this.rectsOverlap(testRect, f)) {
                return false;
            }
        }

        return true;
    }

    getFurnitureHitByRua(testRect) {
        return this.furniture.find((f) => this.rectsOverlap(testRect, f)) || null;
    }

    tryMoveRuaAxis(dx, dy, input) {
        if (dx === 0 && dy === 0) return;

        const proposedRuaRect = this.getRuaRect(this.rua.x + dx, this.rua.y + dy);
        const hitFurniture = this.getFurnitureHitByRua(proposedRuaRect);

        if (hitFurniture) {
            // Rua can only push while holding Z and moving.
            if (!input.z) {
                return;
            }

            const pushedRect = {
                x: hitFurniture.x + dx,
                y: hitFurniture.y + dy,
                width: hitFurniture.width,
                height: hitFurniture.height
            };

            if (!this.canOccupyFurnitureRect(pushedRect, hitFurniture.id)) {
                return;
            }

            hitFurniture.x += dx;
            hitFurniture.y += dy;
        }

        const finalRuaRect = this.getRuaRect(this.rua.x + dx, this.rua.y + dy);
        if (!this.canOccupyRuaRect(finalRuaRect)) {
            return;
        }

        this.rua.x += dx;
        this.rua.y += dy;
    }

    updateButtonsAndGates() {
        for (const b of this.buttons) {
            const ruaOnButton = this.rectsTouchOrOverlap(this.getRuaRect(), b);
            const furnitureOnButton = this.furniture.some((f) => this.rectsTouchOrOverlap(f, b));

            b.active = ruaOnButton || furnitureOnButton;
        }

        // Only the couch can activate the heavy blue switch
        const couch = this.furniture.find((f) => f.id === 'desk_a');
        const chairOnHeavy = this.furniture.some((f) => f.emoji === '🪑' && this.rectsTouchOrOverlap(f, this.heavyButton));
        const couchOnHeavy = !!(couch && this.rectsTouchOrOverlap(couch, this.heavyButton));
        this.heavyButton.active = couchOnHeavy;

        if (
            chairOnHeavy
            && !couchOnHeavy
            && !this.heavyHintShown
            && this.phase === 'gameplay'
            && this.dialogueSystem
            && !this.dialogueSystem.isDialogueActive()
        ) {
            this.heavyHintShown = true;
            this.dialogueSystem.show(['hmm not heavy enought'], 'rua');
        }

        for (const g of this.gates) {
            const greenButtonsOpen = this.buttons.some((b) => b.active && b.gates.includes(g.id));
            const heavyButtonOpens = this.heavyButton.active && this.heavyButton.gateId === g.id;
            g.open = greenButtonsOpen || heavyButtonOpens;
        }
    }

    isRuaOnButton(buttonIndex) {
        const button = this.buttons[buttonIndex];
        if (!button) return false;
        return this.rectsTouchOrOverlap(this.getRuaRect(), button);
    }

    beginFinalSequence() {
        if (this.phase !== 'gameplay') return;

        this.phase = 'final_dim';
        audioSystem.playMusic('servants');
    }

    playMandatoryDialogue() {
        const script = [
            { speaker: 'rua', line: 'Rua: UGLY SHIH TZU FROM ACROSS THE ROAD!!!' },
            { speaker: 'rua', line: 'Rua: I should have known you were behind this!!' },
            { speaker: 'rua', line: 'Rua: Prepare to die!!!' },
            { speaker: 'sprinkles', line: 'Evil Dog: Not so fast you ginger chaos demon!' },
            { speaker: 'sprinkles', line: 'Evil Dog: I know your true weakness.' },
            { speaker: 'sprinkles', line: 'Evil Dog: You shall forever tremble in fear of my name!!!!' },
            { speaker: 'sprinkles', line: 'Evil Dog: Sprinkles 😈' },
            { speaker: 'rua', line: 'Rua: WTF... your name is Sprinkles?' },
            { speaker: 'sprinkles', line: 'Sprinkles: Well yeah.... what\'s your name?' },
            { speaker: 'rua', line: 'Rua: I am Madra Rua, Ghost Dawn from the house of Win—' },
            { speaker: 'sprinkles', line: 'Sprinkles: Oh god shut up!' }
        ];

        const runLine = (index = 0) => {
            if (index >= script.length) {
                this.phase = 'final_button_press';
                return;
            }

            const item = script[index];
            this.dialogueSystem.show([item.line], item.speaker, () => {
                runLine(index + 1);
            });
        };

        runLine(0);
    }

    updateIntro() {
        const speed = 2.3;
        const targetButton = this.buttons[this.introButtonId];
        const targetX = targetButton.x + targetButton.width / 2;
        const targetY = targetButton.y + targetButton.height / 2;

        if (this.phase === 'intro_walk_to_button') {
            const dx = targetX - this.rua.x;
            const dy = targetY - this.rua.y;

            if (Math.abs(dx) > 2) {
                this.tryMoveRuaAxis(Math.sign(dx) * speed, 0, { z: false });
            }
            if (Math.abs(dy) > 2) {
                this.tryMoveRuaAxis(0, Math.sign(dy) * speed, { z: false });
            }

            this.updateButtonsAndGates();

            if (targetButton.active) {
                this.phase = 'intro_button_dialogue';
                this.dialogueSystem.show(['Rua: Oh. What does this button do?'], 'rua', () => {
                    this.phase = 'intro_step_off_button';
                });
            }
            return;
        }

        if (this.phase === 'intro_step_off_button') {
            const stepTargetX = 170;
            if (this.rua.x > stepTargetX) {
                this.tryMoveRuaAxis(-speed, 0, { z: false });
                this.rua.facing = 'left';
            }

            this.updateButtonsAndGates();

            if (!targetButton.active && this.rua.x <= stepTargetX + 2) {
                this.phase = 'intro_followup_dialogue';
                this.dialogueSystem.show(
                    [
                        'Rua: The feng shui in this room is all wrong.',
                        'Rua: I should rearrange things.'
                    ],
                    'rua',
                    () => {
                        this.phase = 'gameplay';
                    }
                );
            }
        }
    }

    updateGameplay(input) {
        const moveSpeed = 2.7;

        if (input.left) {
            this.tryMoveRuaAxis(-moveSpeed, 0, input);
            this.rua.facing = 'left';
        }
        if (input.right) {
            this.tryMoveRuaAxis(moveSpeed, 0, input);
            this.rua.facing = 'right';
        }
        if (input.up) {
            this.tryMoveRuaAxis(0, -moveSpeed, input);
        }
        if (input.down) {
            this.tryMoveRuaAxis(0, moveSpeed, input);
        }

        this.updateButtonsAndGates();

        const allPuzzleGatesOpen = this.gates.every((g) => g.open);
        const ruaOnButtonThree = this.isRuaOnButton(2); // Numbered button 3

        if (allPuzzleGatesOpen && ruaOnButtonThree) {
            this.beginFinalSequence();
        }

        if (input.r && !this.lastR) {
            this.resetRoomState();
        }
    }

    updateFinalSequence(deltaTime) {
        if (this.phase === 'final_dim') {
            this.dimAlpha = Math.min(0.45, this.dimAlpha + deltaTime * 0.00028);
            if (this.dimAlpha >= 0.35) {
                this.phase = 'final_panel_open';
                audioSystem.playMusic('boss');
            }
            return;
        }

        if (this.phase === 'final_panel_open') {
            this.panelOpen = Math.min(1, this.panelOpen + deltaTime * 0.0011);
            if (this.panelOpen >= 1) {
                this.phase = 'final_sprinkles_enter';
                this.sprinkles.visible = true;
            }
            return;
        }

        if (this.phase === 'final_sprinkles_enter') {
            if (this.sprinkles.y < 232) {
                this.sprinkles.y += 1.6;
            } else {
                this.phase = 'final_rua_backs_up';
            }
            return;
        }

        if (this.phase === 'final_rua_backs_up') {
            const targetRuaX = 500;
            const targetRuaY = 330;
            const targetSprinklesY = 330;

            if (this.rua.x > targetRuaX) {
                this.rua.x -= 2.2;
                this.rua.facing = 'left';
            }

            if (this.rua.y > targetRuaY) this.rua.y -= 2.0;
            if (this.rua.y < targetRuaY) this.rua.y += 2.0;

            if (this.sprinkles.y > targetSprinklesY) this.sprinkles.y -= 2.0;
            if (this.sprinkles.y < targetSprinklesY) this.sprinkles.y += 2.0;

            if (this.rua.x <= targetRuaX && Math.abs(this.rua.y - targetRuaY) < 3 && Math.abs(this.sprinkles.y - targetSprinklesY) < 3) {
                this.rua.y = targetRuaY;
                this.sprinkles.y = targetSprinklesY;
                this.phase = 'final_dialogue';
                this.playMandatoryDialogue();
            }
            return;
        }

        if (this.phase === 'final_button_press') {
            const targetX = this.villainButton.x + this.villainButton.width / 2;
            if (this.sprinkles.x < targetX) {
                this.sprinkles.x += 2.2;
            } else {
                this.villainButton.pressed = true;
                this.phase = 'truck_attack';
                this.truck.active = true;
                this.truck.x = -this.truck.width - 20;
                this.truck.y = this.rua.y - 34;
            }
            return;
        }

        if (this.phase === 'truck_attack') {
            if (this.truck.active) {
                this.truck.x += this.truck.speed;
            }

            const ruaRect = this.getRuaRect();
            const truckRect = {
                x: this.truck.x,
                y: this.truck.y,
                width: this.truck.width,
                height: this.truck.height
            };

            if (!this.rua.hitByTruck && this.rectsOverlap(ruaRect, truckRect)) {
                this.rua.hitByTruck = true;
                this.rua.vx = 12;
                this.rua.vy = -5.5;
                this.phase = 'rua_fly_off';
            }
            return;
        }

        if (this.phase === 'rua_fly_off') {
            this.rua.x += this.rua.vx;
            this.rua.y += this.rua.vy;
            this.rua.vy += 0.24;
            this.rua.spin += 0.35;

            if (this.rua.x > this.canvas.width + 200 || this.rua.y < -200 || this.rua.y > this.canvas.height + 220) {
                this.complete = true;
                this.phase = 'done';
            }
        }
    }

    update(input, deltaTime) {
        if (this.dialogueSystem) {
            this.dialogueSystem.update(input);
        }

        const dialogueActive = this.dialogueSystem && this.dialogueSystem.isDialogueActive();

        // No player input during intro/cutscene/dialogues
        if (this.phase.startsWith('intro_')) {
            this.updateIntro();
        } else if (this.phase === 'gameplay' && !dialogueActive) {
            this.updateGameplay(input);
        } else if (this.phase !== 'gameplay') {
            this.updateFinalSequence(deltaTime);
        }

        this.lastR = input.r;
    }

    drawFloor() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.fillStyle = '#d7dde2';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#c7ced5';
        for (let y = 0; y < h; y += 40) {
            ctx.fillRect(0, y, w, 1);
        }
        for (let x = 0; x < w; x += 40) {
            ctx.fillRect(x, 0, 1, h);
        }

        // Main office room frame
        ctx.fillStyle = '#a0a6ad';
        ctx.fillRect(this.roomBounds.x, this.roomBounds.y, this.roomBounds.width, this.roomBounds.height);

        ctx.fillStyle = '#eceff2';
        ctx.fillRect(this.roomBounds.x + 16, this.roomBounds.y + 16, this.roomBounds.width - 32, this.roomBounds.height - 32);
    }

    drawWallsAndGates() {
        const ctx = this.ctx;

        ctx.fillStyle = '#646b74';
        this.walls.forEach((wall) => {
            ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        });

        this.gates.forEach((gate) => {
            if (gate.open) {
                return;
            }

            ctx.fillStyle = gate.temporary ? '#a05b2d' : '#3f4f7a';
            ctx.fillRect(gate.x, gate.y, gate.width, gate.height);
        });
    }

    drawButtons() {
        const ctx = this.ctx;

        this.buttons.forEach((b) => {
            ctx.fillStyle = b.active ? '#2fd15e' : '#1f6f35';
            ctx.fillRect(b.x, b.y, b.width, b.height);

            ctx.strokeStyle = '#0f421f';
            ctx.lineWidth = 2;
            ctx.strokeRect(b.x, b.y, b.width, b.height);

            // Number each button for easy callouts
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 22px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(b.id + 1), b.x + b.width / 2, b.y + b.height / 2 + 1);
        });

        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';

        // Heavy blue button (couch-only)
        const hb = this.heavyButton;
        ctx.fillStyle = hb.active ? '#4aa3ff' : '#1c4f8a';
        ctx.fillRect(hb.x, hb.y, hb.width, hb.height);
        ctx.strokeStyle = '#0e2f57';
        ctx.lineWidth = 2;
        ctx.strokeRect(hb.x, hb.y, hb.width, hb.height);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('H', hb.x + hb.width / 2, hb.y + hb.height / 2);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }

    drawFurniture() {
        const ctx = this.ctx;

        this.furniture.forEach((f) => {
            ctx.font = '44px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(f.emoji || '🪑', f.x + f.width / 2, f.y + f.height / 2 + 2);
        });

        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }

    drawPanelAndSprinkles() {
        const showRevealPieces = this.phase.startsWith('final_')
            || this.phase === 'truck_attack'
            || this.phase === 'rua_fly_off'
            || this.phase === 'done';

        if (!showRevealPieces) {
            return;
        }

        const ctx = this.ctx;
        const panelX = 520;
        const panelY = 120;
        const panelW = 160;
        const panelH = 90;

        // Closed panel frame
        ctx.fillStyle = '#3e424a';
        ctx.fillRect(panelX, panelY, panelW, panelH);

        // Sliding doors
        const halfW = panelW / 2;
        const slide = halfW * this.panelOpen;

        ctx.fillStyle = '#69707a';
        ctx.fillRect(panelX - slide, panelY, halfW, panelH);
        ctx.fillRect(panelX + halfW + slide, panelY, halfW, panelH);

        if (this.sprinkles.visible) {
            ctx.font = '52px Arial';
            ctx.fillText(this.sprinkles.emoji, this.sprinkles.x - 26, this.sprinkles.y);
        }

        // Villain's cutscene button
        ctx.fillStyle = this.villainButton.pressed ? '#2fd15e' : '#1f6f35';
        ctx.fillRect(this.villainButton.x, this.villainButton.y, this.villainButton.width, this.villainButton.height);
        ctx.strokeStyle = '#0f421f';
        ctx.strokeRect(this.villainButton.x, this.villainButton.y, this.villainButton.width, this.villainButton.height);
    }

    drawTruck() {
        if (!this.truck.active) return;

        const ctx = this.ctx;
        const x = this.truck.x;
        const y = this.truck.y;

        // Truck body
        ctx.fillStyle = '#c62828';
        ctx.fillRect(x, y + 20, this.truck.width, 50);

        // Cabin
        ctx.fillStyle = '#b71c1c';
        ctx.fillRect(x + this.truck.width - 70, y, 70, 70);

        // Window
        ctx.fillStyle = '#90caf9';
        ctx.fillRect(x + this.truck.width - 54, y + 14, 30, 20);

        // Wheels
        ctx.fillStyle = '#1e1e1e';
        ctx.beginPath();
        ctx.arc(x + 50, y + 74, 12, 0, Math.PI * 2);
        ctx.arc(x + this.truck.width - 40, y + 74, 12, 0, Math.PI * 2);
        ctx.fill();
    }

    drawRua() {
        const ctx = this.ctx;
        const x = this.rua.x;
        const y = this.rua.y;

        ctx.save();
        ctx.translate(x, y);

        if (this.rua.hitByTruck) {
            ctx.rotate(this.rua.spin);
        } else if (this.rua.facing === 'right') {
            ctx.scale(-1, 1);
        }

        ctx.font = '52px Arial';
        ctx.fillText(this.rua.emoji, -26, 18);
        ctx.restore();
    }

    drawRetryMessage() {
        const ctx = this.ctx;

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(this.canvas.width / 2 - 160, 10, 320, 50);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press R to retry', this.canvas.width / 2, 28);
        ctx.font = '14px Arial';
        ctx.fillText('Hold Z to push', this.canvas.width / 2, 47);
        ctx.textAlign = 'left';
    }

    drawDimOverlay() {
        if (this.dimAlpha <= 0) return;

        this.ctx.fillStyle = `rgba(0, 0, 0, ${this.dimAlpha})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    draw() {
        this.drawFloor();
        this.drawWallsAndGates();
        this.drawButtons();
        this.drawFurniture();
        this.drawPanelAndSprinkles();
        this.drawTruck();
        this.drawRua();
        this.drawRetryMessage();
        this.drawDimOverlay();

        if (this.dialogueSystem) {
            this.dialogueSystem.draw();
        }
    }

    isComplete() {
        return this.complete;
    }
}
