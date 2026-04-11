// Level 11 - BACK TO SETTLE IT
class Level11_Return {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;

        this.rua = {
            x: 70,
            y: canvas.height - 150,
            vy: 0,
            grounded: true,
            hasDoubleJumped: false,
            size: 50,
            emoji: '🐕',
            facing: 'right',
            spin: 0,
            hitByTruck: false,
            knockVX: 0,
            knockVY: 0,
            health: 5,
            maxHealth: 5
        };

        this.dialogueSystem = null;
        this.complete = false;
        this.dead = false;
        this.nextLevelOverride = null;

        this.phase = 'intro_walk';
        this.departTimer = 0;
        this.departState = 'arrive';
        this.introSeen = !!saveSystem.level11IntroComplete;

        this.sprinkles = {
            x: canvas.width / 2 + 60,
            y: -120,
            emoji: '🐶',
            visible: false,
            inShip: false
        };

        this.ship = {
            x: canvas.width / 2 + 125,
            y: -170,
            emoji: '📦',
            visible: false
        };

        this.gearTarget = {
            x: canvas.width - 125,
            y: 130,
            collected: false,
            highlighted: false,
            sparkleTimer: 0,
            twinkleTimer: 0
        };

        this.platforms = this.generatePlatforms();
        this.enemies = this.createEnemies();
        this.enemiesRevealed = false;
        this.enemiesDropping = false;
        this.truck = {
            active: false,
            x: canvas.width + 260,
            y: 0,
            width: 220,
            height: 86,
            speed: 14,
            direction: -1
        };
        this.basket = {
            x: 86,
            y: canvas.height - 198,
            width: 86,
            height: 104,
            visible: false,
            repairTimer: 0,
            launchSpeed: -4.2
        };
        this.ruaInBasket = false;
        this.pendingTruckCueMs = null;

        this.lastSpace = false;
        this.lastEnter = false;
    }

    generatePlatforms() {
        return [
            { x: 0, y: this.canvas.height - 100, width: this.canvas.width, height: 100, type: 'ground' },
            { x: 60, y: 620, width: 180, height: 18, type: 'ledge' },
            { x: 160, y: 520, width: 180, height: 18, type: 'ledge' },
            { x: 280, y: 430, width: 180, height: 18, type: 'ledge' },
            { x: 390, y: 340, width: 120, height: 18, type: 'ledge' },
            { x: 530, y: 220, width: 28, height: this.canvas.height - 320, type: 'pole' },
            { x: 680, y: 620, width: 160, height: 18, type: 'ledge' },
            { x: 760, y: 390, width: 220, height: 18, type: 'beam' },
            { x: 820, y: 520, width: 170, height: 18, type: 'ledge' },
            { x: 950, y: 425, width: 160, height: 18, type: 'ledge' },
            { x: 930, y: 260, width: 80, height: 18, type: 'ledge' },
            { x: 990, y: 330, width: 120, height: 18, type: 'shelf' },
            { x: 1080, y: 255, width: 90, height: 18, type: 'shelf' },
            { x: 1030, y: 180, width: 150, height: 18, type: 'shelf' }
        ];
    }

    createEnemies() {
        return [
            { x: 220, y: -80, targetY: 470, dir: 1, speed: 0.7, left: 170, right: 330, alive: true, weapon: '🗡️' },
            { x: 450, y: -130, targetY: 300, dir: -1, speed: 0.8, left: 390, right: 500, alive: true, weapon: '🔪' },
            { x: 860, y: -180, targetY: 590, dir: 1, speed: 0.7, left: 700, right: 910, alive: true, weapon: '🪓' },
            { x: 1088, y: -230, targetY: 208, dir: -1, speed: 0.65, left: 1010, right: 1140, alive: true, weapon: '🏹' }
        ];
    }

    init(dialogueSystem) {
        this.dialogueSystem = dialogueSystem;
        this.dialogueSystem.position = 'top';
        this.dead = false;
        this.complete = false;

        if (this.introSeen) {
            this.phase = 'gameplay';
            this.sprinkles.visible = false;
            this.ship.visible = false;
            this.enemiesRevealed = true;
            this.enemiesDropping = false;
            this.enemies.forEach((cat) => {
                cat.y = cat.targetY;
            });
            audioSystem.playMusic('office');
            return;
        }

        this.phase = 'intro_walk';
        this.enemiesRevealed = false;
        this.enemiesDropping = false;
        this.enemies.forEach((cat) => {
            cat.y = -80;
        });
        this.rua.facing = 'right';
        audioSystem.playMusic('liminal');
    }

    startIntroDialogue() {
        const lines = [
            { speaker: 'rua', text: 'Rua: Oh god there’s no one here! Someone pay attention to me!!' },
            {
                action: () => {
                    this.sprinkles.visible = true;
                    this.sprinkles.y = -90;
                    audioSystem.playMusic('boss');
                }
            },
            { speaker: 'sprinkles', text: 'Sprinkles: I’ll pay attention to you little doggy!' },
            { speaker: 'rua', text: 'Rua: Not you!! You’re ugly!' },
            { speaker: 'sprinkles', text: 'Sprinkles: LIES!! My mommy says I am the cutest pup in town! And your mother shall weep when I disintegrate you!' },
            { speaker: 'rua', text: 'Rua: I have two dads.' },
            { speaker: 'sprinkles', text: 'Sprinkles: I don’t judge. But none the less you will rot on this planet since your space basket has been rendered useless without a beep-bopulator.' },
            {
                speaker: 'rua',
                text: 'Rua: Is that it over there?',
                after: () => {
                    this.gearTarget.highlighted = true;
                    this.gearTarget.twinkleTimer = 3400;
                }
            },
            { speaker: 'sprinkles', text: 'Sprinkles: You’ll never reach it anyways you have small legs and it’s up high.' },
            { speaker: 'rua', text: 'Rua: How dare you I have the slender legs of a sexy giraffe!' },
            {
                speaker: 'sprinkles',
                text: 'Sprinkles: whatever I’m off to get dinner back on my planet! You stay here and become cat food.',
                after: () => {
                    this.enemiesRevealed = true;
                    this.enemiesDropping = true;
                }
            }
        ];

        const run = (i = 0) => {
            if (i >= lines.length) {
                this.phase = 'sprinkles_depart';
                this.ship.visible = true;
                this.ship.x = this.sprinkles.x + 70;
                this.ship.y = -150;
                this.departTimer = 0;
                this.departState = 'arrive';
                return;
            }

            const item = lines[i];
            if (item.action) {
                item.action();
                run(i + 1);
                return;
            }

            this.dialogueSystem.show([item.text], item.speaker, () => {
                if (item.after) item.after();
                run(i + 1);
            });
        };

        run(0);
    }

    restartToGameplay() {
        this.dead = false;
        this.phase = 'gameplay';
        this.rua.x = 70;
        this.rua.y = this.canvas.height - 150;
        this.rua.vy = 0;
        this.rua.grounded = true;
        this.rua.hasDoubleJumped = false;
        this.rua.health = 5;
        this.rua.facing = 'right';
        this.rua.spin = 0;
        this.rua.hitByTruck = false;
        this.rua.knockVX = 0;
        this.rua.knockVY = 0;
        this.nextLevelOverride = null;
        this.enemies = this.createEnemies();
        this.gearTarget.collected = false;
        this.gearTarget.highlighted = false;
        this.gearTarget.sparkleTimer = 0;
        this.gearTarget.twinkleTimer = 0;
        this.truck.active = false;
        this.truck.x = this.canvas.width + 260;
        this.basket.visible = false;
        this.basket.repairTimer = 0;
        this.basket.y = this.canvas.height - 198;
        this.basket.launchSpeed = -4.2;
        this.ruaInBasket = false;
        this.pendingTruckCueMs = null;
    }

    updateIntroWalk() {
        this.rua.x += 2;
        this.rua.facing = 'right';
        if (this.rua.x >= 230) {
            this.phase = 'intro_dialogue';
            this.rua.facing = 'right';
            this.startIntroDialogue();
        }
    }

    updateSprinklesDepart(deltaTime) {
        this.departTimer += deltaTime;

        const targetShipY = this.sprinkles.y - 20;
        if (this.departState === 'arrive') {
            if (this.ship.y < targetShipY) {
                this.ship.y += 2.4;
            } else {
                this.ship.y = targetShipY;
                this.departState = 'board_pause';
                this.departTimer = 0;
            }
        } else if (this.departState === 'board_pause') {
            if (this.departTimer > 550) {
                this.departState = 'fly_off';
                this.departTimer = 0;
            }
        } else {
            this.sprinkles.inShip = true;
            this.sprinkles.visible = false;
            this.ship.x += 2.8;
            this.ship.y -= 2.6;
        }

        if (this.ship.y < -220 || this.ship.x > this.canvas.width + 220) {
            this.phase = 'gameplay';
            saveSystem.level11IntroComplete = true;
            audioSystem.playMusic('boss_ff9');
        }
    }

    updateEnemyDrop(deltaTime) {
        if (!this.enemiesDropping) return;

        const dropSpeed = 0.35 * deltaTime;
        let allLanded = true;

        this.enemies.forEach((cat) => {
            if (cat.y < cat.targetY) {
                cat.y = Math.min(cat.targetY, cat.y + dropSpeed);
                if (cat.y < cat.targetY) {
                    allLanded = false;
                }
            }
        });

        if (allLanded) {
            this.enemiesDropping = false;
        }
    }

    updateGameplay(input, deltaTime) {
        const gravity = 0.55;
        const jumpPower = -12.5;
        const moveSpeed = 3.2;
        const ruaHalfW = 18;
        const ruaTop = 24;
        const ruaBottom = 24;
        const prevX = this.rua.x;

        if (input.left || input.a) {
            this.rua.x -= moveSpeed;
            this.rua.facing = 'left';
        }
        if (input.right || input.d) {
            this.rua.x += moveSpeed;
            this.rua.facing = 'right';
        }

        this.rua.x = Math.max(25, Math.min(this.canvas.width - 25, this.rua.x));

        if (input.space && this.rua.grounded && !this.lastSpace) {
            this.rua.vy = jumpPower;
            this.rua.grounded = false;
            audioSystem.playSFX('jump');
        } else if (input.space && !this.rua.grounded && !this.rua.hasDoubleJumped && !this.lastSpace) {
            this.rua.vy = jumpPower;
            this.rua.hasDoubleJumped = true;
            audioSystem.playSFX('jump');
        }
        this.lastSpace = input.space;

        const prevY = this.rua.y;
        this.rua.vy += gravity;
        this.rua.y += this.rua.vy;

        this.enemies.forEach((cat) => {
            if (!cat.alive) return;
            if (!this.enemiesRevealed) return;

            cat.x += cat.dir * cat.speed;
            if (cat.x < cat.left || cat.x > cat.right) cat.dir *= -1;

            const ruaRect = {
                x: this.rua.x - ruaHalfW,
                y: this.rua.y - ruaTop,
                width: ruaHalfW * 2,
                height: ruaTop + ruaBottom
            };
            // Tight contact: only the visible emoji body should hurt Rua
            const catRect = {
                x: cat.x - 12,
                y: cat.y - 22,
                width: 24,
                height: 24
            };
            const overlap = this.rectsOverlap(ruaRect, catRect);

            if (overlap) {
                const prevFeet = prevY + ruaBottom;
                const horizontalContact = this.rua.x + ruaHalfW > catRect.x && this.rua.x - ruaHalfW < catRect.x + catRect.width;

                if (this.rua.vy > 0.8 && prevFeet <= catRect.y + 2 && horizontalContact) {
                    cat.alive = false;
                    this.rua.vy = -8.5;
                    audioSystem.playSFX('hit');
                } else {
                    this.rua.health -= 1;
                    this.rua.x += this.rua.x < cat.x ? -28 : 28;
                    audioSystem.playSFX('hit');
                    if (this.rua.health <= 0) {
                        this.dead = true;
                        return;
                    }
                }
            }
        });

        this.rua.grounded = false;
        this.platforms.forEach((platform) => {
            if (platform.type === 'pole' || platform.type === 'beam') return;

            const feetHalfWidth = 16;
            const prevBottom = prevY + ruaBottom;
            const newBottom = this.rua.y + ruaBottom;
            const overPlatform = this.rua.x + feetHalfWidth > platform.x && this.rua.x - feetHalfWidth < platform.x + platform.width;
            const crossesTop = prevBottom <= platform.y && newBottom >= platform.y;

            if (overPlatform && crossesTop && this.rua.vy >= 0) {
                this.rua.y = platform.y - ruaBottom;
                this.rua.vy = 0;
                this.rua.grounded = true;
                this.rua.hasDoubleJumped = false;
            }
        });

        const pole = this.platforms.find((p) => p.type === 'pole');
        if (pole) {
            const overlapX = this.rua.x + 18 > pole.x && this.rua.x - 18 < pole.x + pole.width;
            const overlapY = this.rua.y + 22 > pole.y && this.rua.y - 22 < pole.y + pole.height;
            if (overlapX && overlapY) {
                if (prevX <= pole.x - 18) {
                    this.rua.x = pole.x - 18;
                } else if (prevX >= pole.x + pole.width + 18) {
                    this.rua.x = pole.x + pole.width + 18;
                } else {
                    this.rua.x = this.rua.x < pole.x + pole.width / 2
                        ? pole.x - 18
                        : pole.x + pole.width + 18;
                }
            }
        }

        const beam = this.platforms.find((p) => p.type === 'beam');
        if (beam) {
            const overlapX = this.rua.x + 18 > beam.x && this.rua.x - 18 < beam.x + beam.width;
            const overlapY = this.rua.y - 25 < beam.y + beam.height && this.rua.y + 20 > beam.y;
            if (overlapX && overlapY && this.rua.y < beam.y + 60) {
                this.rua.y = beam.y + 60;
                this.rua.vy = Math.max(0, this.rua.vy);
            }
        }

        if (!this.gearTarget.collected) {
            if (Math.abs(this.rua.x - this.gearTarget.x) < 55 && Math.abs(this.rua.y - this.gearTarget.y) < 55) {
                this.gearTarget.collected = true;
                this.startPostGearSequence();
            }
        }
    }

    startPostGearSequence() {
        this.phase = 'post_gear_dialogue';
        this.rua.facing = 'right';
        this.pendingTruckCueMs = null;

        this.dialogueSystem.show(['Rua: I am coming for you, you tiny mess! Now to get back to my basket.'], 'rua', () => {
            this.dialogueSystem.show(['Rua: TRUUUUCKKKK!!'], 'rua');
            this.pendingTruckCueMs = 900;
        });
    }

    triggerTruckHitSequence() {
        if (this.phase !== 'post_gear_dialogue') return;

        this.phase = 'truck_hit_sequence';
        this.truck.active = true;
        this.truck.x = this.canvas.width + this.truck.width + 40;
        this.truck.y = this.rua.y - 34;
    }

    updateTruckHitSequence(deltaTime) {
        if (!this.truck.active) return;

        this.truck.x += this.truck.speed * this.truck.direction;
        this.truck.y += (this.rua.y - 34 - this.truck.y) * 0.12;

        const ruaRect = {
            x: this.rua.x - 22,
            y: this.rua.y - 26,
            width: 44,
            height: 52
        };
        const truckRect = {
            x: this.truck.x,
            y: this.truck.y,
            width: this.truck.width,
            height: this.truck.height
        };

        if (this.rectsOverlap(ruaRect, truckRect) || this.truck.x < -this.truck.width - 20) {
            this.truck.active = false;
            this.phase = 'rua_fly_off';
            this.rua.hitByTruck = true;
            this.rua.knockVX = -12;
            this.rua.knockVY = -5.5;
            this.rua.spin = 0;
            audioSystem.playSFX('hit');
        }
    }

    updateRuaFlyOff() {
        this.rua.x += this.rua.knockVX;
        this.rua.y += this.rua.knockVY;
        this.rua.knockVY += 0.24;
        this.rua.spin += 0.35;

        // Once launched off-screen, return to jungle crash site level
        if (this.rua.x < -220 || this.rua.y < -220 || this.rua.y > this.canvas.height + 260) {
            saveSystem.level03ReturnSequence = true;
            this.nextLevelOverride = 3; // Level03_Jungle
            this.complete = true;
            this.phase = 'done';
        }
    }

    rectsOverlap(a, b) {
        return a.x < b.x + b.width
            && a.x + a.width > b.x
            && a.y < b.y + b.height
            && a.y + a.height > b.y;
    }

    updateBasketRepair(deltaTime) {
        if (!this.basket.visible) return;
        this.basket.repairTimer += deltaTime;

        if (this.basket.repairTimer > 2000) {
            this.phase = 'basket_launch';
            this.ruaInBasket = true;
            this.basket.launchSpeed = -4.2;
            audioSystem.playMusic('space_flight');
        }
    }

    updateBasketLaunch(deltaTime) {
        if (!this.basket.visible) return;

        this.basket.launchSpeed -= 0.0028 * deltaTime;
        this.basket.y += this.basket.launchSpeed;

        if (this.ruaInBasket) {
            this.rua.x = this.basket.x + this.basket.width / 2;
            this.rua.y = this.basket.y + 18;
        }

        if (this.basket.y < -230) {
            this.complete = true;
            this.phase = 'done';
        }
    }

    update(input, deltaTime) {
        // Keep sparkle/twinkle animation moving even during cutscenes/dialogue
        this.gearTarget.sparkleTimer += deltaTime;
        if (this.gearTarget.twinkleTimer > 0) {
            this.gearTarget.twinkleTimer -= deltaTime;
        }

        // Deterministic truck cue after the TRUUUUCKKKK line
        if (this.pendingTruckCueMs !== null) {
            this.pendingTruckCueMs -= deltaTime;
            if (this.pendingTruckCueMs <= 0) {
                this.pendingTruckCueMs = null;
                if (this.dialogueSystem && this.dialogueSystem.isDialogueActive()) {
                    this.dialogueSystem.skip();
                }
                this.triggerTruckHitSequence();
            }
        }

        this.updateEnemyDrop(deltaTime);

        if (this.dialogueSystem) {
            this.dialogueSystem.update(input);
        }

        if (this.phase === 'intro_walk') {
            this.updateIntroWalk();
            return;
        }

        if (this.phase === 'intro_dialogue') {
            this.rua.facing = 'right';
            if (this.sprinkles.visible && this.sprinkles.y < this.canvas.height - 170) {
                this.sprinkles.y += 1.6;
            }
            return;
        }

        if (this.phase === 'sprinkles_depart') {
            this.updateSprinklesDepart(deltaTime);
            return;
        }

        if (this.phase === 'post_gear_dialogue') {
            return;
        }

        if (this.phase === 'truck_hit_sequence') {
            this.updateTruckHitSequence(deltaTime);
            return;
        }

        if (this.phase === 'rua_fly_off') {
            this.updateRuaFlyOff();
            return;
        }

        if (this.phase === 'basket_repair') {
            this.updateBasketRepair(deltaTime);
            return;
        }

        if (this.phase === 'basket_launch') {
            this.updateBasketLaunch(deltaTime);
            return;
        }

        if (this.phase !== 'gameplay') {
            return;
        }

        this.updateGameplay(input, deltaTime);
    }

    drawBackground() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        const sky = ctx.createLinearGradient(0, 0, 0, h);
        sky.addColorStop(0, '#dfe8ef');
        sky.addColorStop(1, '#c6d1d8');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#bcc5ca';
        ctx.fillRect(0, h - 120, w, 120);
    }

    drawPlatforms() {
        const ctx = this.ctx;

        this.platforms.forEach((platform) => {
            if (platform.type === 'pole') {
                ctx.fillStyle = '#8b5a2b';
                ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
                ctx.fillStyle = '#b47a45';
                ctx.fillRect(platform.x, platform.y, platform.width, 10);
                return;
            }

            if (platform.type === 'beam') {
                ctx.fillStyle = '#a06d3b';
                ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
                return;
            }

            ctx.fillStyle = '#9a6a3b';
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            ctx.fillStyle = '#c18b5a';
            ctx.fillRect(platform.x, platform.y, platform.width, 5);
        });
    }

    drawEnemies() {
        const ctx = this.ctx;

        if (!this.enemiesRevealed) {
            return;
        }

        this.enemies.forEach((cat) => {
            if (!cat.alive) return;

            ctx.font = '42px Arial';
            ctx.fillText('🐱', cat.x - 21, cat.y + 6);
            ctx.font = '24px Arial';
            ctx.fillText(cat.weapon, cat.x + 10, cat.y - 10);
        });
    }

    drawTruck() {
        if (!this.truck.active) return;

        const ctx = this.ctx;
        const x = this.truck.x;
        const y = this.truck.y;

        ctx.fillStyle = '#c62828';
        ctx.fillRect(x, y + 20, this.truck.width, 50);

        ctx.fillStyle = '#b71c1c';
        ctx.fillRect(x + this.truck.width - 70, y, 70, 70);

        ctx.fillStyle = '#90caf9';
        ctx.fillRect(x + this.truck.width - 54, y + 14, 30, 20);

        ctx.fillStyle = '#1e1e1e';
        ctx.beginPath();
        ctx.arc(x + 50, y + 74, 12, 0, Math.PI * 2);
        ctx.arc(x + this.truck.width - 40, y + 74, 12, 0, Math.PI * 2);
        ctx.fill();
    }

    drawBasketSequence() {
        if (!this.basket.visible) return;

        const ctx = this.ctx;
        const b = this.basket;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fillRect(b.x + 4, b.y + b.height - 2, b.width, 8);

        ctx.fillStyle = '#FFD84D';
        ctx.fillRect(b.x, b.y, b.width, b.height);

        ctx.strokeStyle = '#E0A800';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            ctx.beginPath();
            ctx.moveTo(b.x + i * 11, b.y);
            ctx.lineTo(b.x + i * 11, b.y + b.height);
            ctx.stroke();
        }
        for (let i = 0; i < 7; i++) {
            ctx.beginPath();
            ctx.moveTo(b.x, b.y + i * 14);
            ctx.lineTo(b.x + b.width, b.y + i * 14);
            ctx.stroke();
        }

        ctx.fillStyle = '#FFC107';
        ctx.fillRect(b.x - 3, b.y - 8, b.width + 6, 10);

        if (this.phase === 'basket_repair') {
            const spark = Math.sin(this.basket.repairTimer * 0.02) * 8;
            ctx.font = '28px Arial';
            ctx.fillText('🔧', b.x + b.width + 12, b.y + 30 + spark);
            ctx.fillText('✨', b.x + b.width + 22, b.y + 54 - spark);
        }

        if (this.ruaInBasket) {
            ctx.font = '42px Arial';
            ctx.fillText('🐕', b.x + 18, b.y + 34);
        }
    }

    drawIntroCharacters() {
        const ctx = this.ctx;

        if (this.sprinkles.visible) {
            ctx.font = '56px Arial';
            ctx.fillText(this.sprinkles.emoji, this.sprinkles.x - 28, this.sprinkles.y);
        }

        if (this.ship.visible) {
            ctx.font = '56px Arial';
            ctx.fillText(this.ship.emoji, this.ship.x - 28, this.ship.y);
        }
    }

    drawGearTarget() {
        const ctx = this.ctx;
        if (this.gearTarget.collected) return;

        const t = this.gearTarget.sparkleTimer * 0.01;
        const pulse = 2 + Math.sin(t) * 1.5;
        ctx.font = '44px Arial';
        ctx.fillText('⚙️', this.gearTarget.x - 22, this.gearTarget.y);

        if (this.gearTarget.highlighted) {
            // Subtle persistent glow
            ctx.globalAlpha = 0.16 + (Math.sin(t * 1.6) + 1) * 0.06;
            ctx.fillStyle = '#fff176';
            ctx.beginPath();
            ctx.ellipse(this.gearTarget.x + 20, this.gearTarget.y - 10, 28 + pulse * 1.2, 20 + pulse, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;

            // Temporary twinkle animation moving around the gear
            if (this.gearTarget.twinkleTimer > 0) {
                const tw = this.gearTarget.twinkleTimer * 0.0026;
                const cx = this.gearTarget.x + 20;
                const cy = this.gearTarget.y - 10;

                const x1 = cx + Math.cos(tw * 2.8) * (30 + pulse);
                const y1 = cy + Math.sin(tw * 2.8) * (20 + pulse * 0.5);
                const x2 = cx + Math.cos(tw * 2.8 + Math.PI * 0.66) * (32 + pulse);
                const y2 = cy + Math.sin(tw * 2.8 + Math.PI * 0.66) * (22 + pulse * 0.6);
                const x3 = cx + Math.cos(tw * 2.8 + Math.PI * 1.33) * (29 + pulse);
                const y3 = cy + Math.sin(tw * 2.8 + Math.PI * 1.33) * (19 + pulse * 0.45);

                ctx.font = '23px Arial';
                ctx.fillText('✨', x1, y1);
                ctx.fillText('⭐', x2, y2);
                ctx.fillText('✨', x3, y3);
            }
        }
    }

    drawPlayer() {
        if (this.ruaInBasket) return;

        const ctx = this.ctx;
        ctx.save();
        ctx.translate(this.rua.x, this.rua.y);

        if (this.rua.hitByTruck) {
            ctx.rotate(this.rua.spin);
        } else if (this.rua.facing === 'right') {
            ctx.scale(-1, 1);
        }

        ctx.font = '50px Arial';
        ctx.fillText(this.rua.emoji, -25, 0);
        ctx.restore();
    }

    drawHUD() {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
        ctx.fillRect(14, 12, 290, 66);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`Hearts: ${'❤️'.repeat(Math.max(0, this.rua.health))}`, 24, 34);
        ctx.font = '13px Arial';
        ctx.fillText('LEFT/RIGHT move   SPACE jump', 24, 54);
        ctx.fillText('Stomp cats to defeat them', 24, 68);
    }

    draw() {
        this.drawBackground();
        this.drawPlatforms();
        this.drawEnemies();
        this.drawTruck();
        this.drawGearTarget();
        this.drawBasketSequence();
        this.drawIntroCharacters();
        this.drawPlayer();
        this.drawHUD();

        if (this.dialogueSystem) {
            this.dialogueSystem.draw();
        }
    }

    isComplete() {
        return this.complete;
    }

    getNextLevelOverride() {
        return this.nextLevelOverride;
    }

    isDead() {
        return this.dead;
    }
}
