// Level 5 - STONER CATS & THE BEE PROBLEM
class Level05_BeeHouse {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.phase = 'entry'; // entry, explore, inspect_dialogue, puzzle, auto_double_jump, post_unlock_dialogue, explore_post_puzzle

        this.rua = {
            x: 100,
            y: canvas.height - 150,
            vy: 0,
            grounded: true,
            facingRight: true,
            canDoubleJump: false,
            hasDoubleJumped: false,
            size: 50,
            emoji: '🐕'
        };

        this.bee = {
            x: canvas.width - 170,
            y: canvas.height - 155,
            size: 80,
            flinchTimer: 0,
            inspected: false
        };

        this.stonerCat = {
            x: 360,
            y: canvas.height - 150,
            emoji: '😸',
            spoken: false,
            catLine: 'Snacks? The village sends them through Mountain Valley. But you have to go up the mountain to get there which requires jumping high which dogs can\'t do.',
            ruaLine: 'Rude and unhelpful, yet weirdly informative.'
        };
        this.optionalCats = [
            {
                x: 170,
                y: canvas.height - 150,
                emoji: '😺',
                spoken: false,
                catLine: 'Whoa… I want snacks, but first the bee drama, right?',
                ruaLine: 'Yes, bee first, snacks second, dignity always.'
            },
            {
                x: 620,
                y: canvas.height - 150,
                emoji: '🐱',
                spoken: false,
                useSequence: true,
                sequence: [
                    { speaker: 'rua', text: 'Hey there, tiny mess. Have you any snacks that don\'t smell of cat piss? Or perhaps my beepbop-ulator?' },
                    { speaker: 'cat', text: 'Whoa, I feel like the ceiling is judging me.' },
                    { speaker: 'rua', text: 'You seem like the type that\'s used to being judged.' },
                    { speaker: 'cat', text: 'You\'re being kind of mean.' },
                    { speaker: 'rua', text: 'Well, the ceiling and I are going to go back to talking about you behind your back.' },
                    { speaker: 'cat', text: 'AH!' }
                ]
            },
            {
                x: 860,
                y: canvas.height - 150,
                emoji: '😼',
                spoken: false,
                useSequence: true,
                sequence: [
                    { speaker: 'rua', text: 'I assume you are useless, but I\'ll ask anyways. Have you any snacks?' },
                    { speaker: 'cat', text: 'Yeah, we got snacks, lil bro.' },
                    { speaker: 'rua', text: 'OH GREAT! I will have a well done steak with the little kibble I like mixed in.' },
                    { speaker: 'cat', text: 'Huh?' },
                    { speaker: 'rua', text: 'Yes, when my servants cook me food, they put in a little chewy kibble.' },
                    { speaker: 'cat', text: 'Whoa, that sounds hard. You should ask the people up the mountain.' },
                    { speaker: 'rua', text: 'Useless! Oh, I forgot about the bee.' },
                    { speaker: 'rua', text: 'NOBODY PANIC! I WILL SAVE US!!' },
                    { speaker: 'cat', text: 'Shhh.' }
                ]
            }
        ];
        this.catnipPile = { x: 520, y: canvas.height - 120, width: 70, height: 28 };
        this.exitDoor = { x: canvas.width - 70, y: canvas.height - 220, width: 50, height: 120, inRange: false };

        this.puzzle = {
            active: false,
            cards: [],
            selectedIndices: [],
            matchedPairs: 0,
            totalPairs: 6,
            mismatchTimer: 0,
            cardW: 180,
            cardH: 84,
            gap: 14,
            cols: 4,
            rows: 3
        };

        this.dialogueSystem = null;
        this.complete = false;

        this.entryDialogueStep = 0;
        this.inspectDialogueStep = 0;
        this.postUnlockStep = 0;
        this.entryDialogueDelay = 700;

        this.showUnlockBanner = false;
        this.unlockBannerTimer = 0;

        this.autoDoubleJumpTriggered = false;
        this.autoDoubleJumpComplete = false;

        this.createBeeCards();
    }

    init(dialogueSystem) {
        this.dialogueSystem = dialogueSystem;
        this.dialogueSystem.position = 'top';
        this.phase = 'entry';
        this.entryDialogueStep = 1;
        this.entryDialogueDelay = 700;
        audioSystem.playMusic('stoner');
    }

    createBeeCards() {
        const pairData = [
            { emoji: '🐝', text: 'Buzzkill' },
            { emoji: '🍕', text: 'Slice of Life' },
            { emoji: '💩', text: 'Stinky Situation' },
            { emoji: '🦄', text: 'Unicorn Problems' },
            { emoji: '🥴', text: 'Confused Cat' },
            { emoji: '🧦', text: 'Lost Sock' }
        ];

        const cards = [];
        pairData.forEach((pair, pairId) => {
            cards.push({ pairId, emoji: pair.emoji, text: pair.text, flipped: false, matched: false });
            cards.push({ pairId, emoji: pair.emoji, text: pair.text, flipped: false, matched: false });
        });

        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }

        this.puzzle.cards = cards;
        this.puzzle.selectedIndices = [];
        this.puzzle.matchedPairs = 0;
        this.puzzle.mismatchTimer = 0;
    }

    update(input, deltaTime) {
        const dialogueWasActive = this.dialogueSystem && this.dialogueSystem.isDialogueActive();

        if (this.dialogueSystem) {
            this.dialogueSystem.update(input);
        }

        const dialogueActive = this.dialogueSystem && this.dialogueSystem.isDialogueActive();
        const enterJustPressed = input.enter && !this.lastEnter;
        const usedEnterForDialogue = dialogueWasActive && enterJustPressed;

        if (this.phase === 'entry' && this.entryDialogueStep === 1) {
            this.entryDialogueDelay -= deltaTime;
            if (this.entryDialogueDelay <= 0 && this.dialogueSystem && !dialogueActive) {
                this.entryDialogueStep = 2;
                this.dialogueSystem.show(
                    'Ew it smells like regret and cat piss.',
                    'rua',
                    () => {
                        this.entryDialogueStep = 3;
                    }
                );
            }
        }

        if (this.phase === 'entry' && this.dialogueSystem && !dialogueActive) {
            if (this.entryDialogueStep === 3) {
                this.entryDialogueStep = 4;
                this.dialogueSystem.show('Oh my god! is that a half dead bee?? Step aside useless kitties! I\'ll save us!', 'rua', () => {
                    this.entryDialogueStep = 5;
                });
            } else if (this.entryDialogueStep === 5) {
                this.entryDialogueStep = 6;
                this.dialogueSystem.show('Huh? Wah? it\'s just a bee.....', 'cat', () => {
                    this.entryDialogueStep = 7;
                });
            } else if (this.entryDialogueStep === 7) {
                this.phase = 'explore';
            }
        }

        if (this.phase === 'inspect_dialogue' && this.dialogueSystem && !dialogueActive) {
            if (this.inspectDialogueStep === 1) {
                this.inspectDialogueStep = 2;
                this.startBeePuzzle();
            }
        }

        if (this.phase === 'explore' || this.phase === 'explore_post_puzzle') {
            if (!dialogueActive) {
                this.updateMovement(input, this.rua.canDoubleJump);
            }

            const beeDistance = Math.abs(this.rua.x - this.bee.x);
            const canInspectBee = beeDistance < 90 && !dialogueActive && this.phase === 'explore';

            // Optional cat chatter interactions
            if (this.phase === 'explore' && enterJustPressed && !usedEnterForDialogue && !dialogueActive) {
                const talkCats = [this.optionalCats[0], this.stonerCat, this.optionalCats[1], this.optionalCats[2]];
                const nearbyCat = talkCats.find(cat => Math.abs(this.rua.x - cat.x) < 75);
                if (nearbyCat) {
                    if (nearbyCat === this.optionalCats[0]) {
                        this.dialogueSystem.show('Hello tiny menace have you any snacks? I will save us from the bee in exchange for treats.', 'rua', () => {
                            this.dialogueSystem.show(nearbyCat.catLine, 'cat');
                        });
                    } else if (nearbyCat.useSequence) {
                        // Run multi-line sequence dialogue
                        this.runCatSequence(nearbyCat.sequence);
                    } else {
                        this.dialogueSystem.show(nearbyCat.catLine, 'cat', () => {
                            this.dialogueSystem.show(nearbyCat.ruaLine, 'rua');
                        });
                    }
                    nearbyCat.spoken = true;
                }
            }

            if (canInspectBee && enterJustPressed && !usedEnterForDialogue) {
                this.bee.inspected = true;
                this.phase = 'inspect_dialogue';
                this.inspectDialogueStep = 1;
                this.dialogueSystem.show('Finally, the bee. Time to demonstrate skill and superiority.', 'rua', () => {
                    this.inspectDialogueStep = 1;
                });
            }

            if (this.phase === 'explore_post_puzzle') {
                this.exitDoor.inRange = Math.abs(this.rua.x - this.exitDoor.x) < 90;
                if (this.exitDoor.inRange && enterJustPressed && !usedEnterForDialogue) {
                    this.complete = true;
                }
            }

            if (enterJustPressed && !usedEnterForDialogue) {
                const catnipDistance = Math.abs(this.rua.x - this.catnipPile.x);
                if (catnipDistance < 80 && !canInspectBee && !dialogueActive) {
                    this.dialogueSystem.show('This catnip feels aggressively suspicious. Ugly Shih Tzu across the road energy.', 'rua');
                }
            }
        }

        if (this.phase === 'puzzle') {
            if (this.puzzle.mismatchTimer > 0) {
                this.puzzle.mismatchTimer -= deltaTime;
                if (this.puzzle.mismatchTimer <= 0) {
                    this.puzzle.selectedIndices.forEach(index => {
                        if (!this.puzzle.cards[index].matched) {
                            this.puzzle.cards[index].flipped = false;
                        }
                    });
                    this.puzzle.selectedIndices = [];
                }
            }
        }

        if (this.phase === 'auto_double_jump' && !dialogueActive) {
            this.updateMovement(input, true, true);

            if (!this.autoDoubleJumpTriggered && this.rua.grounded) {
                this.autoDoubleJumpTriggered = true;
                this.rua.vy = -12;
                this.rua.grounded = false;
                this.rua.hasDoubleJumped = false;
                audioSystem.playSFX('jump');
            } else if (this.autoDoubleJumpTriggered && !this.autoDoubleJumpComplete && this.rua.vy > -2 && !this.rua.hasDoubleJumped) {
                this.rua.vy = -12;
                this.rua.hasDoubleJumped = true;
                this.autoDoubleJumpComplete = true;
                audioSystem.playSFX('jump');
                this.dialogueSystem.show('…Did I just… jump twice?', 'rua');
            }

            if (this.autoDoubleJumpComplete && this.rua.grounded) {
                this.phase = 'post_unlock_dialogue';
                this.postUnlockStep = 1;
                this.showUnlockBanner = true;
                this.unlockBannerTimer = 2600;
            }
        }

        if (this.phase === 'post_unlock_dialogue' && this.dialogueSystem && !dialogueActive) {
            if (this.postUnlockStep === 1) {
                this.postUnlockStep = 2;
                this.dialogueSystem.show('Double jump unlocked.', 'rua', () => {
                    saveSystem.unlockAbility('double_jump');
                    this.postUnlockStep = 3;
                });
            } else if (this.postUnlockStep === 3) {
                this.postUnlockStep = 4;
                this.dialogueSystem.show('Goodbye fluffy losers thank you for absolutely nothing.', 'rua', () => {
                    this.postUnlockStep = 5;
                });
            } else if (this.postUnlockStep === 5) {
                this.postUnlockStep = 6;
                this.dialogueSystem.show('I won\'t forget this but I will certainly try.', 'rua', () => {
                    this.phase = 'explore_post_puzzle';
                });
            }
        }

        if (this.bee.flinchTimer > 0) {
            this.bee.flinchTimer -= deltaTime;
        }

        if (this.showUnlockBanner) {
            this.unlockBannerTimer -= deltaTime;
            if (this.unlockBannerTimer <= 0) {
                this.showUnlockBanner = false;
            }
        }

        this.lastEnter = input.enter;
    }

    updateMovement(input, allowDoubleJump = false, scriptedJump = false) {
        const gravity = 0.5;
        const jumpPower = -12;
        const moveSpeed = 3;

        if (input.left || input.a) {
            this.rua.x -= moveSpeed;
            this.rua.facingRight = false;
        }
        if (input.right || input.d) {
            this.rua.x += moveSpeed;
            this.rua.facingRight = true;
        }

        if (!scriptedJump) {
            if (input.space && this.rua.grounded && !this.lastSpace) {
                this.rua.vy = jumpPower;
                this.rua.grounded = false;
                audioSystem.playSFX('jump');
            } else if (allowDoubleJump && input.space && !this.rua.grounded && !this.rua.hasDoubleJumped && !this.lastSpace) {
                this.rua.vy = jumpPower;
                this.rua.hasDoubleJumped = true;
                audioSystem.playSFX('jump');
            }
        }

        this.lastSpace = input.space;

        this.rua.vy += gravity;
        this.rua.y += this.rua.vy;

        if (this.rua.y >= this.canvas.height - 150) {
            if (!this.rua.grounded && this.rua.vy > 0) {
                audioSystem.playSFX('land');
            }
            this.rua.y = this.canvas.height - 150;
            this.rua.grounded = true;
            this.rua.hasDoubleJumped = false;
            this.rua.vy = 0;
        }

        this.rua.x = Math.max(40, Math.min(this.canvas.width - 40, this.rua.x));
    }

    startBeePuzzle() {
        this.phase = 'puzzle';
        this.puzzle.active = true;
        this.createBeeCards();
    }

    completeBeePuzzle() {
        this.puzzle.active = false;
        this.phase = 'auto_double_jump';
        this.rua.canDoubleJump = true;
        this.autoDoubleJumpTriggered = false;
        this.autoDoubleJumpComplete = false;
        audioSystem.playMusic('space_flight');
    }

    runCatSequence(sequence, index = 0) {
        if (!sequence || index >= sequence.length) {
            return;
        }

        const line = sequence[index];
        this.dialogueSystem.show([line.text], line.speaker, () => {
            this.runCatSequence(sequence, index + 1);
        });
    }

    handleClick(canvasX, canvasY) {
        if (this.phase !== 'puzzle') {
            return false;
        }

        if (this.puzzle.mismatchTimer > 0 || this.puzzle.selectedIndices.length >= 2) {
            return true;
        }

        const totalWidth = this.puzzle.cols * this.puzzle.cardW + (this.puzzle.cols - 1) * this.puzzle.gap;
        const totalHeight = this.puzzle.rows * this.puzzle.cardH + (this.puzzle.rows - 1) * this.puzzle.gap;
        const startX = (this.canvas.width - totalWidth) / 2;
        const startY = (this.canvas.height - totalHeight) / 2;

        for (let i = 0; i < this.puzzle.cards.length; i++) {
            const col = i % this.puzzle.cols;
            const row = Math.floor(i / this.puzzle.cols);
            const x = startX + col * (this.puzzle.cardW + this.puzzle.gap);
            const y = startY + row * (this.puzzle.cardH + this.puzzle.gap);

            const inCard = canvasX >= x && canvasX <= x + this.puzzle.cardW && canvasY >= y && canvasY <= y + this.puzzle.cardH;
            if (!inCard) continue;

            const card = this.puzzle.cards[i];
            if (card.flipped || card.matched) {
                return true;
            }

            card.flipped = true;
            this.puzzle.selectedIndices.push(i);
            audioSystem.playSFX('jump');

            if (this.puzzle.selectedIndices.length === 2) {
                const [a, b] = this.puzzle.selectedIndices;
                const cardA = this.puzzle.cards[a];
                const cardB = this.puzzle.cards[b];

                if (cardA.pairId === cardB.pairId) {
                    cardA.matched = true;
                    cardB.matched = true;
                    this.puzzle.selectedIndices = [];
                    this.puzzle.matchedPairs++;
                    this.bee.flinchTimer = 240;
                    audioSystem.playSFX('unlock');

                    if (this.puzzle.matchedPairs >= this.puzzle.totalPairs) {
                        this.completeBeePuzzle();
                    }
                } else {
                    this.puzzle.mismatchTimer = 650;
                    audioSystem.playSFX('hit');
                }
            }

            return true;
        }

        return true;
    }

    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.fillStyle = '#9b8b7e';
        ctx.fillRect(0, 0, w, h);

        // Wall gradient + haze tint
        const wallGradient = ctx.createLinearGradient(0, 0, 0, h - 120);
        wallGradient.addColorStop(0, '#8e7f95');
        wallGradient.addColorStop(1, '#756772');
        ctx.fillStyle = wallGradient;
        ctx.fillRect(0, 0, w, h - 100);

        ctx.globalAlpha = 0.3;
        for (let i = 0; i < 5; i++) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(200 + i * 200, 200 + Math.sin(Date.now() * 0.001 + i) * 50, 80, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        ctx.fillStyle = '#654321';
        ctx.fillRect(0, h - 100, w, 100);

        // Rug
        ctx.fillStyle = '#6a335f';
        ctx.fillRect(180, h - 150, 460, 50);
        ctx.strokeStyle = '#a46fa3';
        ctx.lineWidth = 3;
        ctx.strokeRect(180, h - 150, 460, 50);

        // String lights
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(40, 100);
        ctx.quadraticCurveTo(w / 2, 160, w - 40, 110);
        ctx.stroke();
        const bulbColors = ['#ffd166', '#ff6b6b', '#06d6a0', '#4cc9f0', '#f72585'];
        for (let i = 0; i < 14; i++) {
            const t = i / 13;
            const bx = 40 + t * (w - 80);
            const by = 100 + Math.sin(t * Math.PI * 2) * 20;
            ctx.fillStyle = bulbColors[i % bulbColors.length];
            ctx.beginPath();
            ctx.arc(bx, by + 15, 6, 0, Math.PI * 2);
            ctx.fill();
        }

        // Posters / decor (no text labels)
        ctx.fillStyle = '#e0fbfc';
        ctx.font = '34px Arial';
        ctx.fillText('😵‍💫', 122, 238);
        ctx.fillText('🍕', 295, 205);
        ctx.fillText('🐝', 980, 222);

        // Neon signs
        ctx.fillStyle = '#ff66c4';
        ctx.globalAlpha = 0.4;
        ctx.fillRect(390, 120, 160, 14);
        ctx.fillStyle = '#7bdff2';
        ctx.fillRect(570, 180, 140, 12);
        ctx.globalAlpha = 1;

        // Big couch
        ctx.fillStyle = '#4a2f68';
        ctx.fillRect(640, h - 220, 360, 110);
        ctx.fillStyle = '#6a3f92';
        ctx.fillRect(655, h - 250, 330, 40);
        ctx.fillRect(620, h - 210, 28, 90);
        ctx.fillRect(992, h - 210, 28, 90);
        ctx.fillStyle = '#5f3c8a';
        ctx.fillRect(700, h - 180, 80, 50);
        ctx.fillRect(790, h - 180, 80, 50);
        ctx.fillRect(880, h - 180, 80, 50);

        // Cat tree decor
        ctx.fillStyle = '#7a5a3a';
        ctx.fillRect(1060, h - 265, 16, 145);
        ctx.fillRect(1110, h - 245, 16, 125);
        ctx.fillRect(1040, h - 275, 58, 14);
        ctx.fillRect(1094, h - 255, 58, 14);
        ctx.fillStyle = '#9b7a52';
        ctx.beginPath();
        ctx.arc(1118, h - 280, 18, 0, Math.PI * 2);
        ctx.fill();

        // Lava lamp
        ctx.fillStyle = '#2b2d42';
        ctx.fillRect(1080, h - 205, 24, 85);
        ctx.fillStyle = '#ff4d6d';
        ctx.beginPath();
        ctx.ellipse(1092, h - 165 + Math.sin(Date.now() * 0.004) * 6, 9, 13, 0, 0, Math.PI * 2);
        ctx.fill();

        // Snack tiles (replace green squares; catnip square remains separate)
        const snackTiles = ['🍕', '🍟', '🍪', '🧁', '🍩', '🌮'];
        ctx.font = '28px Arial';
        for (let i = 0; i < snackTiles.length; i++) {
            ctx.fillText(snackTiles[i], 102 + i * 150, h - 100);
        }

        ctx.fillStyle = '#6fe000';
        ctx.fillRect(this.catnipPile.x - 35, this.catnipPile.y, this.catnipPile.width, this.catnipPile.height);

        ctx.fillStyle = this.phase === 'explore_post_puzzle' ? '#2e8b57' : '#3a3a3a';
        ctx.fillRect(this.exitDoor.x, this.exitDoor.y, this.exitDoor.width, this.exitDoor.height);
        ctx.font = '34px Arial';
        ctx.fillText(this.phase === 'explore_post_puzzle' ? '🚪' : '🔒', this.exitDoor.x + 8, this.exitDoor.y + 82);

        const dialogueActive = this.dialogueSystem && this.dialogueSystem.isDialogueActive();

        ctx.font = '50px Arial';
        ctx.fillText(this.stonerCat.emoji, this.stonerCat.x - 25, this.stonerCat.y);

        if (!dialogueActive && this.phase === 'explore' && Math.abs(this.rua.x - this.stonerCat.x) < 75) {
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.font = '15px Arial';
            ctx.strokeText('[ENTER] Talk', this.stonerCat.x - 42, this.stonerCat.y - 40);
            ctx.fillText('[ENTER] Talk', this.stonerCat.x - 42, this.stonerCat.y - 40);
        }

        // Optional cats
        this.optionalCats.forEach(cat => {
            ctx.font = '46px Arial';
            ctx.fillText(cat.emoji, cat.x - 23, cat.y);

            if (!dialogueActive && this.phase === 'explore' && Math.abs(this.rua.x - cat.x) < 75) {
                ctx.fillStyle = 'white';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                ctx.font = '15px Arial';
                ctx.strokeText('[ENTER] Talk', cat.x - 42, cat.y - 40);
                ctx.fillText('[ENTER] Talk', cat.x - 42, cat.y - 40);
            }
        });

        const flinchOffset = this.bee.flinchTimer > 0 ? Math.sin(Date.now() * 0.05) * 6 : 0;
        ctx.font = `${this.bee.size}px Arial`;
        ctx.fillText('🐝', this.bee.x - 40, this.bee.y + flinchOffset);
        if (!dialogueActive && this.phase === 'explore' && Math.abs(this.rua.x - this.bee.x) < 90) {
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.font = '16px Arial';
            ctx.strokeText('[ENTER] Inspect Bee', this.bee.x - 70, this.bee.y - 40);
            ctx.fillText('[ENTER] Inspect Bee', this.bee.x - 70, this.bee.y - 40);
        }

        if (!dialogueActive && (this.phase === 'explore' || this.phase === 'explore_post_puzzle') && Math.abs(this.rua.x - this.catnipPile.x) < 80) {
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.font = '16px Arial';
            ctx.strokeText('[ENTER] Inspect Catnip', this.catnipPile.x - 65, this.catnipPile.y - 15);
            ctx.fillText('[ENTER] Inspect Catnip', this.catnipPile.x - 65, this.catnipPile.y - 15);
        }

        if (!dialogueActive && this.phase === 'explore_post_puzzle' && this.exitDoor.inRange) {
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.font = '16px Arial';
            ctx.strokeText('[ENTER] Leave House', this.exitDoor.x - 35, this.exitDoor.y - 16);
            ctx.fillText('[ENTER] Leave House', this.exitDoor.x - 35, this.exitDoor.y - 16);
        }

        ctx.font = '50px Arial';
        ctx.save();
        ctx.translate(this.rua.x, this.rua.y);
        if (this.rua.facingRight) {
            ctx.scale(-1, 1);
        }
        ctx.fillText(this.rua.emoji, -25, 0);
        ctx.restore();

        if (this.phase === 'puzzle') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.58)';
            ctx.fillRect(0, 0, w, h);

            ctx.fillStyle = 'white';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Bee Card Match', w / 2, 72);
            ctx.font = '18px Arial';
            ctx.fillText(`Matched: ${this.puzzle.matchedPairs}/${this.puzzle.totalPairs}`, w / 2, 102);

            const totalWidth = this.puzzle.cols * this.puzzle.cardW + (this.puzzle.cols - 1) * this.puzzle.gap;
            const totalHeight = this.puzzle.rows * this.puzzle.cardH + (this.puzzle.rows - 1) * this.puzzle.gap;
            const startX = (w - totalWidth) / 2;
            const startY = (h - totalHeight) / 2;

            for (let i = 0; i < this.puzzle.cards.length; i++) {
                const card = this.puzzle.cards[i];
                const col = i % this.puzzle.cols;
                const row = Math.floor(i / this.puzzle.cols);
                const x = startX + col * (this.puzzle.cardW + this.puzzle.gap);
                const y = startY + row * (this.puzzle.cardH + this.puzzle.gap);

                if (card.flipped || card.matched) {
                    ctx.fillStyle = card.matched ? '#2e8b57' : '#ffffff';
                    ctx.fillRect(x, y, this.puzzle.cardW, this.puzzle.cardH);
                    ctx.strokeStyle = '#222';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(x, y, this.puzzle.cardW, this.puzzle.cardH);

                    ctx.fillStyle = card.matched ? '#f2fff2' : '#222';
                    ctx.font = '24px Arial';
                    ctx.fillText(card.emoji, x + this.puzzle.cardW / 2, y + 30);
                    ctx.font = 'bold 14px Arial';
                    this.drawCardText(card.text, x + this.puzzle.cardW / 2, y + 52, this.puzzle.cardW - 18, 16);
                } else {
                    ctx.fillStyle = '#2b2b47';
                    ctx.fillRect(x, y, this.puzzle.cardW, this.puzzle.cardH);
                    ctx.strokeStyle = '#6aa7ff';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(x, y, this.puzzle.cardW, this.puzzle.cardH);
                    ctx.fillStyle = '#d7e7ff';
                    ctx.font = 'bold 22px Arial';
                    ctx.fillText('?', x + this.puzzle.cardW / 2, y + 52);
                }
            }

            ctx.font = '16px Arial';
            ctx.fillStyle = '#e5e5e5';
            ctx.fillText('Click two cards to match pairs', w / 2, h - 28);
            ctx.textAlign = 'left';
        }

        if (this.showUnlockBanner) {
            ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
            ctx.fillRect(w / 2 - 320, h / 2 - 50, 640, 100);
            ctx.fillStyle = '#000';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('✨ ABILITY UNLOCKED — DOUBLE JUMP ✨', w / 2, h / 2 + 10);
            ctx.textAlign = 'left';
        }

        if (this.dialogueSystem) {
            this.dialogueSystem.draw();
        }
    }

    isComplete() {
        return this.complete;
    }

    drawCardText(text, centerX, startY, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let y = startY;

        for (let i = 0; i < words.length; i++) {
            const test = line ? `${line} ${words[i]}` : words[i];
            const width = this.ctx.measureText(test).width;
            if (width > maxWidth && line) {
                this.ctx.fillText(line, centerX, y);
                line = words[i];
                y += lineHeight;
            } else {
                line = test;
            }
        }

        if (line) {
            this.ctx.fillText(line, centerX, y);
        }
    }
}
