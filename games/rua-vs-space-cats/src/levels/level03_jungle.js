// Level 3 - CRASH LANDING ON PLANET CAT
class Level03_Jungle {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.phase = 'entry_cutscene'; // entry_cutscene, gameplay
        this.rua = {
            x: 80,
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
        this.enemies = [];
        this.vines = [];
        this.particles = []; // For spores
        this.dialogueSystem = null;
        this.complete = false;
        this.dead = false;  // Track if Rua died
        this.cinematicTime = 0;
        this.entryDialogueShown = false;
        this.missionDialogueShown = false;
        this.exitDoor = { x: canvas.width - 180, y: canvas.height - 150, collected: false, locked: true, inRange: false };
        this.tree = {
            x: canvas.width - 360,
            y: canvas.height - 320,
            width: 120,
            height: 220,
            inRange: false,
            rattleTimer: 0,
            examined: false
        };
        this.bird = {
            x: canvas.width - 315,
            y: canvas.height - 335,
            emoji: '🐦',
            visible: false,
            password: 'MEOW123'
        };
        this.pendingBirdDialogue = false;
        this.hasPasswordHint = false;
        this.passwordAttempts = 0;
        this.returnFromTruck = false;
        this.returnAnim = {
            basketX: 70,
            basketY: canvas.height - 200,
            moveAngle: 0,
            moveRadiusX: 42,
            moveRadiusY: 18,
            mechanicalTimer: 0,
            launchSpeed: 0,
            introDialogueShown: false,
            readyToEnter: false
        };
        this.nextLevelOverride = null;
        this.generateLevel();
    }

    generateLevel() {
        this.platforms = [];

        // Ground
        this.platforms.push({ x: 0, y: this.canvas.height - 100, width: this.canvas.width, height: 100, type: 'ground' });

        // Big center pole obstacle that must be climbed around
        this.centerPole = {
            x: this.canvas.width / 2 - 40,
            y: this.canvas.height - 470,
            width: 80,
            height: 370
        };

        // Climb path over the pole (brown platforms)
        this.platforms.push({ x: 170, y: this.canvas.height - 210, width: 120, height: 20, type: 'platform' });
        this.platforms.push({ x: 310, y: this.canvas.height - 280, width: 120, height: 20, type: 'platform' });
        this.platforms.push({ x: 460, y: this.canvas.height - 350, width: 110, height: 20, type: 'platform' });
        this.platforms.push({ x: 640, y: this.canvas.height - 350, width: 110, height: 20, type: 'platform' });
        this.platforms.push({ x: 780, y: this.canvas.height - 280, width: 120, height: 20, type: 'platform' });
        this.platforms.push({ x: 930, y: this.canvas.height - 220, width: 120, height: 20, type: 'platform' });

        // Enemies
        for (let i = 0; i < 5; i++) {
            const weapons = ['🔪', '🗡️', '🔨', '🪓', '🏹'];
            this.enemies.push({
                x: 200 + i * 200,
                y: this.canvas.height - 150,
                direction: 1,
                speed: 0.5,
                patrolStart: 200 + i * 200 - 100,
                patrolEnd: 200 + i * 200 + 100,
                emoji: '🐱',
                weapon: weapons[i],
                health: 1,
                lastHitTime: null
            });
        }

        // Vines
        for (let i = 0; i < 18; i++) {
            this.vines.push({
                x: Math.random() * this.canvas.width,
                y: 0,
                length: 140 + Math.random() * 220,
                sway: 8 + Math.random() * 18,
                phase: Math.random() * Math.PI * 2,
                grabbed: false
            });
        }

        // Bioluminescent spores
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                drift: Math.random() * 0.5 - 0.25,
                color: ['#00ff88', '#88ff00', '#00ffff'][Math.floor(Math.random() * 3)]
            });
        }

        // Massive background plant emojis behind green hue
        this.backgroundPlantEmojis = [];
        const emojiChoices = ['🌴', '🌿', '🍀', '🍃'];
        for (let i = 0; i < 9; i++) {
            this.backgroundPlantEmojis.push({
                x: 30 + i * 140 + Math.random() * 40,
                y: this.canvas.height - 180 - Math.random() * 260,
                size: 120 + Math.random() * 60,
                emoji: emojiChoices[i % emojiChoices.length]
            });
        }
    }

    init(dialogueSystem) {
        this.dialogueSystem = dialogueSystem;
        this.returnFromTruck = !!saveSystem.level03ReturnSequence;

        if (this.returnFromTruck) {
            this.phase = 'return_repair';
            this.rua.x = this.returnAnim.basketX + this.returnAnim.moveRadiusX;
            this.rua.y = this.returnAnim.basketY + 6;
            this.rua.facingRight = false;
            this.rua.vy = 0;
            this.rua.grounded = true;
            this.returnAnim.moveAngle = 0;
            this.returnAnim.mechanicalTimer = 0;
            this.returnAnim.launchSpeed = 0;
            this.returnAnim.introDialogueShown = false;
            this.returnAnim.readyToEnter = false;
            this.lastEnter = false;
            this.nextLevelOverride = null;
            audioSystem.playMusic('jungle');
            return;
        }

        this.phase = 'entry_cutscene';
        this.cinematicTime = 0;
        this.entryDialogueShown = false;
        this.missionDialogueShown = false;
        this.tree.inRange = false;
        this.tree.rattleTimer = 0;
        this.tree.examined = false;
        this.bird.visible = false;
        this.pendingBirdDialogue = false;
        this.hasPasswordHint = false;
        this.passwordAttempts = 0;
        this.exitDoor.locked = false;
        this.exitDoor.collected = false;
        this.exitDoor.inRange = false;
        this.lastEnter = false;
        audioSystem.playMusic('jungle');
    }

    update(input, deltaTime) {
        this.cinematicTime += deltaTime;

        if (this.returnFromTruck) {
            this.updateReturnSequence(input, deltaTime);
            if (this.dialogueSystem) {
                this.dialogueSystem.update(input);
            }
            return;
        }

        // Update particles
        this.particles.forEach(p => {
            p.y += Math.sin(p.x * 0.1 + this.cinematicTime * 0.001) * 0.1;
            p.x += p.drift * 0.1;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.x < 0) p.x = this.canvas.width;
        });

        switch(this.phase) {
            case 'entry_cutscene':
                if (!this.entryDialogueShown && this.cinematicTime < 100) {
                    this.entryDialogueShown = true;
                    this.dialogueSystem.show(
                        ['This place smells like someone gave up on hygiene.', 'Absolutely unacceptable.'],
                        'rua',
                        () => {
                            this.cinematicTime = 2000;
                        }
                    );
                }

                if (!this.missionDialogueShown && this.cinematicTime > 3000) {
                    this.missionDialogueShown = true;
                    this.dialogueSystem.show(
                        ['Oh no.', 'The Beep-Bopulator is missing.', 'Oh look a stupid little door past these stupid little cats.', 'I suppose I should check it out.'],
                        'rua',
                        () => {
                            this.phase = 'gameplay';
                        }
                    );
                }
                break;

            case 'gameplay':
                this.updateGameplay(input, deltaTime);
                break;
        }

        if (this.dialogueSystem) {
            this.dialogueSystem.update(input);
        }
    }

    updateGameplay(input, deltaTime) {
        const gravity = 0.5;
        const jumpPower = -12;
        const moveSpeed = 3;
        const ruaHalfW = 24;
        const ruaTopOffset = 45;
        const ruaBottomOffset = 25;

        const colliders = [...this.platforms];
        if (this.centerPole) {
            colliders.push({
                x: this.centerPole.x,
                y: this.centerPole.y,
                width: this.centerPole.width,
                height: this.centerPole.height,
                type: 'pole'
            });
        }
        const horizontalColliders = colliders.filter(c => c.type !== 'ground');

        // Horizontal movement
        let moveX = 0;
        if (input.left || input.a) moveX -= moveSpeed;
        if (input.right || input.d) moveX += moveSpeed;

        if (moveX < 0) this.rua.facingRight = false;
        if (moveX > 0) this.rua.facingRight = true;

        if (moveX !== 0) {
            this.rua.x += moveX;

            horizontalColliders.forEach(collider => {
                const left = this.rua.x - ruaHalfW;
                const right = this.rua.x + ruaHalfW;
                const top = this.rua.y - ruaTopOffset;
                const bottom = this.rua.y + ruaBottomOffset;

                const cLeft = collider.x;
                const cRight = collider.x + collider.width;
                const cTop = collider.y;
                const cBottom = collider.y + collider.height;

                const overlaps = right > cLeft && left < cRight && bottom > cTop && top < cBottom;
                if (!overlaps) return;

                if (moveX > 0) {
                    this.rua.x = cLeft - ruaHalfW;
                } else {
                    this.rua.x = cRight + ruaHalfW;
                }
            });
        }

        this.rua.x = Math.max(ruaHalfW, Math.min(this.canvas.width - ruaHalfW, this.rua.x));

        // Jumping
        if ((input.space) && this.rua.grounded && !this.lastSpace) {
            this.rua.vy = jumpPower;
            this.rua.grounded = false;
            audioSystem.playSFX('jump');
        }
        this.lastSpace = input.space;

        // Gravity
        if (!this.rua.grounded) {
            this.rua.vy += gravity;
        }

        const prevY = this.rua.y;
        this.rua.y += this.rua.vy;
        this.rua.grounded = false;

        colliders.forEach(collider => {
            const left = this.rua.x - ruaHalfW;
            const right = this.rua.x + ruaHalfW;
            const top = this.rua.y - ruaTopOffset;
            const bottom = this.rua.y + ruaBottomOffset;

            const prevTop = prevY - ruaTopOffset;
            const prevBottom = prevY + ruaBottomOffset;

            const cLeft = collider.x;
            const cRight = collider.x + collider.width;
            const cTop = collider.y;
            const cBottom = collider.y + collider.height;

            const overlaps = right > cLeft && left < cRight && bottom > cTop && top < cBottom;
            if (!overlaps) return;

            // Landing on top (solid support)
            if (prevBottom <= cTop && this.rua.vy >= 0) {
                this.rua.y = cTop - ruaBottomOffset;
                this.rua.vy = 0;
                this.rua.grounded = true;
                return;
            }

            // Hitting underside
            if (prevTop >= cBottom && this.rua.vy < 0) {
                this.rua.y = cBottom + ruaTopOffset;
                this.rua.vy = 0;
                return;
            }
        });

        // Enemy patrol
        this.enemies.forEach(enemy => {
            enemy.x += enemy.direction * enemy.speed;
            if (enemy.x < enemy.patrolStart || enemy.x > enemy.patrolEnd) {
                enemy.direction *= -1;
            }

            // Check collision with Rua - VISUAL CONTACT ONLY (~30px)
            const dx = this.rua.x - enemy.x;
            const dy = this.rua.y - enemy.y;
            const distance = Math.sqrt(dx ** 2 + dy ** 2);

            if (distance < 20 && !enemy.lastHitTime) {  // tighter hitbox: only touching
                this.rua.health--;
                enemy.lastHitTime = Date.now();
                console.log(`💢 Rua hit by cat! Distance: ${distance.toFixed(1)}px Health: ${this.rua.health}/${this.rua.maxHealth}`);
                audioSystem.playSFX('hit');

                if (this.rua.health <= 0) {
                    console.log('💀 Rua died in jungle!');
                    this.dead = true;  // Mark as dead, triggers restart
                    return;  // Exit update early
                }
            }

            // Reset hit cooldown
            if (enemy.lastHitTime && Date.now() - enemy.lastHitTime > 500) {
                enemy.lastHitTime = null;
            }
        });

        // Interactions
        const dialogueActive = this.isDialogueActive();
        this.tree.inRange = false;
        this.exitDoor.inRange = !dialogueActive && Math.abs(this.rua.x - this.exitDoor.x) < 95;

        if (!dialogueActive && input.enter && !this.lastEnter) {
            if (this.exitDoor.inRange) {
                this.interactWithDoor();
            }
        }
        this.lastEnter = input.enter;

        // Bounds
        this.rua.x = Math.max(ruaHalfW, Math.min(this.canvas.width - ruaHalfW, this.rua.x));
    }

    updateReturnSequence(input, deltaTime) {
        const enterJustPressed = input.enter && !this.lastEnter;

        if (this.phase === 'return_repair') {
            this.returnAnim.moveAngle += deltaTime * 0.0018;
            const px = this.returnAnim.basketX + 36 + Math.cos(this.returnAnim.moveAngle) * this.returnAnim.moveRadiusX;
            const py = this.returnAnim.basketY + 6 + Math.sin(this.returnAnim.moveAngle) * this.returnAnim.moveRadiusY;

            this.rua.facingRight = px >= this.rua.x;
            this.rua.x = px;
            this.rua.y = py;

            this.returnAnim.mechanicalTimer += deltaTime;
            if (this.returnAnim.mechanicalTimer > 700) {
                this.returnAnim.mechanicalTimer = 0;
                audioSystem.playSFX('unlock');
            }

            if (!this.returnAnim.introDialogueShown && !this.isDialogueActive()) {
                this.returnAnim.introDialogueShown = true;
                this.dialogueSystem.show(
                    ['Fixy fixy fix!', 'Oh god I\'m amzing at this.', 'Ok now off we go!'],
                    'rua',
                    () => {
                        this.returnAnim.readyToEnter = true;
                    }
                );
            }

            if (this.returnAnim.readyToEnter && enterJustPressed) {
                this.phase = 'return_enter_basket';
            }
        } else if (this.phase === 'return_enter_basket') {
            const tx = this.returnAnim.basketX + 36;
            const ty = this.returnAnim.basketY + 8;
            this.rua.x += (tx - this.rua.x) * 0.14;
            this.rua.y += (ty - this.rua.y) * 0.14;

            if (Math.abs(this.rua.x - tx) < 1.5 && Math.abs(this.rua.y - ty) < 1.5) {
                this.phase = 'return_launch';
                this.returnAnim.launchSpeed = -4.4;
                audioSystem.playMusic('space_flight');
            }
        } else if (this.phase === 'return_launch') {
            this.returnAnim.launchSpeed -= deltaTime * 0.0026;
            this.returnAnim.basketY += this.returnAnim.launchSpeed;
            this.rua.x = this.returnAnim.basketX + 36;
            this.rua.y = this.returnAnim.basketY + 8;

            if (this.returnAnim.basketY < -220) {
                saveSystem.level03ReturnSequence = false;
                this.nextLevelOverride = 12; // Final boss in space
                this.complete = true;
            }
        }

        this.lastEnter = input.enter;
    }

    isDialogueActive() {
        if (!this.dialogueSystem) return false;
        if (typeof this.dialogueSystem.isDialogueActive === 'function') {
            return this.dialogueSystem.isDialogueActive();
        }
        return !!this.dialogueSystem.isActive;
    }

    examineTree() {
        if (!this.tree.examined) {
            this.tree.examined = true;
            this.tree.rattleTimer = 850;
            this.dialogueSystem.show(['This tree looks suspicious. Let me examine it.'], 'rua', null);
            return;
        }

        if (!this.bird.visible) {
            this.dialogueSystem.show(['Still rattling...'], 'rua', null);
            return;
        }

        this.dialogueSystem.show(['Already examined. The bird gave me the password.'], 'rua', null);
    }

    interactWithDoor() {
        if (this.exitDoor.collected) return;
        this.exitDoor.locked = false;
        this.exitDoor.collected = true;
        this.dialogueSystem.show(['Time to head to the village.'], 'rua', () => {
            this.complete = true;
        });
    }

    promptDoorPassword() {
        const attempt = prompt('Enter the password:');
        if (attempt === null) return;

        this.passwordAttempts++;

        if (attempt.trim().toUpperCase() === this.bird.password) {
            this.exitDoor.locked = false;
            this.exitDoor.collected = true;
            this.dialogueSystem.show(['🔓 Correct password. Door unlocked.'], 'system', () => {
                this.complete = true;
            });
        } else {
            this.dialogueSystem.show(['🔒 Wrong password.'], 'system', null);
        }
    }

    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Background - alien jungle
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#0a3d0a');
        gradient.addColorStop(1, '#1a5a1a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Massive background plant emojis
        if (this.backgroundPlantEmojis) {
            this.backgroundPlantEmojis.forEach(plant => {
                ctx.globalAlpha = 0.26;
                ctx.font = `${Math.floor(plant.size)}px Arial`;
                ctx.fillText(plant.emoji, plant.x, plant.y);
                ctx.globalAlpha = 1;
            });
        }

        // Green hue overlay over background plants
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#1f6b2a';
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1;

        // Bioluminescent spores
        this.particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = 0.6;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        ctx.globalAlpha = 1;

        // Vines
        this.vines.forEach(vine => {
            ctx.strokeStyle = '#2d5a2d';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(vine.x, vine.y);
            ctx.lineTo(vine.x + Math.sin(this.cinematicTime * 0.001 + vine.phase) * vine.sway, vine.y + vine.length);
            ctx.stroke();

            // Decorative leaf tip
            ctx.fillStyle = '#3f8f3f';
            ctx.beginPath();
            ctx.ellipse(
                vine.x + Math.sin(this.cinematicTime * 0.001 + vine.phase) * vine.sway,
                vine.y + vine.length,
                8,
                16,
                0,
                0,
                Math.PI * 2
            );
            ctx.fill();
        });

        // Center pole
        if (this.centerPole) {
            ctx.fillStyle = '#5d3a1a';
            ctx.fillRect(this.centerPole.x, this.centerPole.y, this.centerPole.width, this.centerPole.height);
            ctx.fillStyle = '#7a4f25';
            for (let i = 0; i < 8; i++) {
                ctx.fillRect(this.centerPole.x, this.centerPole.y + 15 + i * 45, this.centerPole.width, 6);
            }
        }

        // Platforms
        this.platforms.forEach(platform => {
            if (platform.type === 'ground') {
                ctx.fillStyle = '#5b3418';
            } else {
                ctx.fillStyle = '#8b5a2b';
            }
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

            // Top edge + wood grain accents
            ctx.fillStyle = '#a06a32';
            ctx.fillRect(platform.x, platform.y, platform.width, 5);
            ctx.fillStyle = '#70431f';
            for (let i = 10; i < platform.width; i += 24) {
                ctx.fillRect(platform.x + i, platform.y + 7, 3, Math.max(4, platform.height - 10));
            }
        });

        // Separate return animation path (no level replay)
        if (this.returnFromTruck) {
            this.drawReturnSequence();
            if (this.dialogueSystem) {
                this.dialogueSystem.draw();
            }
            return;
        }

        // Enemies
        this.enemies.forEach(enemy => {
            ctx.font = '40px Arial';
            ctx.fillText(enemy.emoji, enemy.x - 20, enemy.y);
            // Draw weapon
            ctx.font = '24px Arial';
            ctx.fillText(enemy.weapon, enemy.x + 15, enemy.y - 10);
        });

        // Interactive tree
        const treeShakeX = this.tree.rattleTimer > 0 ? Math.sin(this.cinematicTime * 0.07) * 5 : 0;
        const treeX = this.tree.x + treeShakeX;

        ctx.fillStyle = '#5c3a1a';
        ctx.fillRect(treeX + 38, this.tree.y + 70, 44, this.tree.height - 70);
        ctx.fillStyle = '#2d6b2f';
        ctx.beginPath();
        ctx.ellipse(treeX + 60, this.tree.y + 55, 85, 70, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(treeX + 20, this.tree.y + 78, 52, 42, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(treeX + 100, this.tree.y + 78, 52, 42, 0, 0, Math.PI * 2);
        ctx.fill();

        // Exit door
        if (!this.exitDoor.collected) {
            ctx.font = '140px Arial';
            ctx.fillText('🚪', this.exitDoor.x, this.exitDoor.y);

            // Leaves touching both sides of the door
            ctx.font = '42px Arial';
            ctx.fillText('🌿', this.exitDoor.x + 26, this.exitDoor.y + 8);
            ctx.fillText('🍃', this.exitDoor.x + 24, this.exitDoor.y - 50);
            ctx.fillText('🌿', this.exitDoor.x + 126, this.exitDoor.y + 8);
            ctx.fillText('🍃', this.exitDoor.x + 124, this.exitDoor.y - 50);

            if (this.exitDoor.inRange && !this.isDialogueActive()) {
                ctx.fillStyle = 'white';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                ctx.font = '18px Arial';
                ctx.strokeText('[ENTER] Enter Door', this.exitDoor.x - 30, this.exitDoor.y - 115);
                ctx.fillText('[ENTER] Enter Door', this.exitDoor.x - 30, this.exitDoor.y - 115);
            }
        }

        // Crashed basket (same yellow woven style as level 1) + smoke
        this.drawCrashedBasketWithSmoke(70, h - 200);

        // Player (faces input direction) - drawn in front of basket
        ctx.font = '50px Arial';
        ctx.save();
        ctx.translate(this.rua.x, this.rua.y);
        if (this.rua.facingRight) {
            ctx.scale(-1, 1);
        }
        ctx.fillText(this.rua.emoji, -25, 0);
        ctx.restore();

        // Health hearts HUD (max 5) - centered
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        for (let i = 0; i < 5; i++) {
            ctx.fillText(i < this.rua.health ? '❤️' : '🖤', w / 2 + (i - 2) * 34, 40);
        }
        ctx.textAlign = 'left';

        if (this.dialogueSystem) {
            this.dialogueSystem.draw();
        }
    }

    drawReturnSequence() {
        const ctx = this.ctx;

        // Basket body (same yellow woven style)
        const b = {
            x: this.returnAnim.basketX,
            y: this.returnAnim.basketY,
            width: 80,
            height: 100
        };

        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(b.x + 3, b.y + b.height - 3, b.width, 8);

        ctx.fillStyle = '#FFD84D';
        ctx.fillRect(b.x, b.y, b.width, b.height);

        ctx.strokeStyle = '#E0A800';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            ctx.beginPath();
            ctx.moveTo(b.x + i * 10, b.y);
            ctx.lineTo(b.x + i * 10, b.y + b.height);
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

        // Rua moving/inside basket
        ctx.font = '50px Arial';
        ctx.save();
        ctx.translate(this.rua.x, this.rua.y);
        if (this.rua.facingRight) {
            ctx.scale(-1, 1);
        }
        ctx.fillText(this.rua.emoji, -25, 0);
        ctx.restore();

        // Mechanical spark accents while repairing
        if (this.phase === 'return_repair') {
            const t = this.cinematicTime * 0.02;
            ctx.font = '24px Arial';
            ctx.fillText('⚙️', b.x + 88, b.y + 26 + Math.sin(t) * 6);
            ctx.fillText('🔧', b.x + 94, b.y + 54 + Math.cos(t * 1.2) * 6);
            ctx.fillText('✨', b.x + 86, b.y + 80 + Math.sin(t * 1.4) * 5);

            if (this.returnAnim.readyToEnter) {
                ctx.fillStyle = 'white';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                ctx.font = '18px Arial';
                ctx.strokeText('[ENTER] Get in basket', b.x - 10, b.y - 20);
                ctx.fillText('[ENTER] Get in basket', b.x - 10, b.y - 20);
            }
        }
    }

    isComplete() {
        return this.complete;
    }

    isDead() {
        return this.dead;
    }

    getNextLevelOverride() {
        return this.nextLevelOverride;
    }

    drawCrashedBasketWithSmoke(x, y) {
        const ctx = this.ctx;
        const t = this.cinematicTime * 0.001;

        // Smoke puffs
        for (let i = 0; i < 7; i++) {
            const drift = Math.sin(t * 1.8 + i) * 10;
            const smokeY = y - 8 - i * 16 - ((t * 24 + i * 9) % 120);
            const smokeX = x + 35 + drift;
            const size = 10 + i * 1.5;
            ctx.globalAlpha = Math.max(0.08, 0.42 - i * 0.05);
            ctx.fillStyle = '#bfc6c9';
            ctx.beginPath();
            ctx.arc(smokeX, smokeY, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        const basket = { x, y, width: 80, height: 100 };

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(basket.x + 3, basket.y + basket.height - 3, basket.width, 8);

        // Basket body
        ctx.fillStyle = '#FFD84D';
        ctx.fillRect(basket.x, basket.y, basket.width, basket.height);

        // Weave pattern (vertical)
        ctx.strokeStyle = '#E0A800';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            ctx.beginPath();
            ctx.moveTo(basket.x + i * 10, basket.y);
            ctx.lineTo(basket.x + i * 10, basket.y + basket.height);
            ctx.stroke();
        }

        // Weave pattern (horizontal)
        for (let i = 0; i < 7; i++) {
            ctx.beginPath();
            ctx.moveTo(basket.x, basket.y + i * 14);
            ctx.lineTo(basket.x + basket.width, basket.y + i * 14);
            ctx.stroke();
        }

        // Top rim
        ctx.fillStyle = '#FFC107';
        ctx.fillRect(basket.x - 3, basket.y - 8, basket.width + 6, 10);
    }
}
