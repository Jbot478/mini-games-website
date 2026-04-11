// Level 10 - THE OCEAN TRIAL
class Level10_Ocean {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;

        this.rua = {
            x: 520,
            y: -80,
            vy: 0,
            size: 50,
            emoji: '🐕',
            facing: 'right'
        };

        this.fishLady = {
            x: 690,
            y: canvas.height - 240,
            emoji: '🧜‍♀️'
        };

        this.dialogueSystem = null;
        this.complete = false;

        this.phase = 'landing'; // landing, dialogue, bubble_magic, gameplay
        this.phaseTime = 0;
        this.landingY = canvas.height - 248;

        this.hasBubble = false;
        this.bubbleMagicTimer = 0;
        this.afterBubbleCallback = null;
        this.sparkles = [];
        this.ambientBubbles = [];

        this.caveStartX = 900;
        this.caveEndX = 4300;
        this.caveCheckpointX = this.caveStartX - 120;
        this.caveCheckpointY = 360;
        this.ruaWorldX = 520;
        this.cameraX = 0;
        this.screenTilt = 0;
        this.caveSegments = [];
        this.catFish = [];
        this.bubblePopFX = null;
        this.flapPressed = false;
        this.lastSpace = false;

        this.buildCaveSegments();
    }

    init(dialogueSystem) {
        this.dialogueSystem = dialogueSystem;
        this.dialogueSystem.position = 'bottom';
        audioSystem.playMusic('ocean');

        this.ambientBubbles = [];
        for (let i = 0; i < 40; i++) {
            this.ambientBubbles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: 3 + Math.random() * 8,
                speed: 0.3 + Math.random() * 1.1
            });
        }

        this.catFish = [];
        for (let i = 0; i < 6; i++) {
            this.catFish.push({
                x: this.caveStartX + 300 + i * 560,
                y: 240 + (i % 4) * 95,
                speed: 1.1 + Math.random() * 1.2,
                drift: Math.random() * Math.PI * 2,
                dir: Math.random() > 0.5 ? 1 : -1
            });
        }
    }

    buildCaveSegments() {
        const segW = 180;
        let x = this.caveStartX;

        while (x < this.caveEndX) {
            const t = (x - this.caveStartX) / (this.caveEndX - this.caveStartX);
            const upTunnelLift = t > 0.82 ? (t - 0.82) * 600 : 0;
            const centerY = 380 + Math.sin(t * 8) * 90 - upTunnelLift;
            const gapH = 280 - Math.sin(t * 5) * 30; // wider, easier cave
            this.caveSegments.push({
                x,
                width: segW,
                gapTop: centerY - gapH / 2,
                gapBottom: centerY + gapH / 2
            });
            x += segW;
        }
    }

    startDialogueScript() {
        const lines = [
            { speaker: 'rua', text: 'rua: GLrb gLLLrrRRBb' },
            { speaker: 'rua', text: 'Rua: HerrrppppPP' },
            { speaker: 'fish_lady', text: 'Mermaid: wow you fell far.' },
            { speaker: 'rua', text: 'Rua: GlLLLLlllllRrrrpppPP!!!' },
            { speaker: 'fish_lady', text: 'Mermaid: aw little doggy let me help you.' },
            { action: 'bubble_magic' },
            { speaker: 'fish_lady', text: 'Mermaid: There you go little friend now you can breath.' },
            { speaker: 'rua', text: 'Rua: Oh god I’m wet, I’m wet, I’m wet ew ew ew!' },
            { speaker: 'rua', text: 'Rua: I need my servants to bring me to the fancy lady that cuts my hair!!' },
            { speaker: 'rua', text: 'Rua: Oh my god I can breath!! Thank you fish lady!' },
            { speaker: 'rua', text: 'Rua: have you seen an ugly pan faced shih tzu around here?' },
            { speaker: 'fish_lady', text: 'Mermaid: Oh, you mean ‘the other’? We often see him going up into his space box and shooting things down with laser beams.' },
            { speaker: 'fish_lady', text: 'Mermaid: we stay safe from him here under the ocean. But the stuff he shoots down keeps landing in the ocean. And it’s making a mess.' },
            { speaker: 'rua', text: 'Rua: So you also want him to die!!' },
            { speaker: 'fish_lady', text: 'Mermaid: What? No, I just want him to chill out.' },
            { speaker: 'fish_lady', text: 'Mermaid: We have tried taking the secret cave over there to the office tower where he stays, but it’s too dangerous.' },
            { speaker: 'rua', text: 'Rua: Ah the cave over there I see it!!' },
            { speaker: 'rua', text: 'Rua: Thank you, fish Lady, for your competence. Good luck with whatever you were talking about. I am off to commit murder!' },
            { speaker: 'fish_lady', text: 'Mermaid: be careful don’t let that bubble pop.' }
        ];

        const run = (idx = 0) => {
            if (idx >= lines.length) {
                this.startCaveRun();
                return;
            }

            const item = lines[idx];
            if (item.action === 'bubble_magic') {
                this.triggerBubbleMagic(() => run(idx + 1));
                return;
            }

            this.dialogueSystem.show([item.text], item.speaker, () => run(idx + 1));
        };

        run(0);
    }

    triggerBubbleMagic(onDone) {
        this.phase = 'bubble_magic';
        this.bubbleMagicTimer = 0;
        this.afterBubbleCallback = onDone;
        this.sparkles = [];

        for (let i = 0; i < 34; i++) {
            this.sparkles.push({
                a: Math.random() * Math.PI * 2,
                r: 10 + Math.random() * 45,
                dr: 12 + Math.random() * 18,
                size: 2 + Math.random() * 3,
                color: ['#9ef0ff', '#d0b6ff', '#bfffc9'][Math.floor(Math.random() * 3)]
            });
        }

        audioSystem.playSFX('unlock');
    }

    updateAmbientBubbles() {
        this.ambientBubbles.forEach((b) => {
            b.y -= b.speed;
            if (b.y < -20) {
                b.y = this.canvas.height + 10;
                b.x = Math.random() * this.canvas.width;
            }
        });
    }

    updateLanding(deltaTime) {
        this.rua.vy += 0.24;
        this.rua.y += this.rua.vy;

        // Face mermaid while panicking/bobbing
        this.rua.facing = this.rua.x < this.fishLady.x ? 'right' : 'left';

        if (this.rua.y >= this.landingY) {
            this.rua.y = this.landingY;
            this.rua.vy = 0;
            this.phase = 'dialogue';
            this.startDialogueScript();
        }
    }

    updateBubbleMagic(deltaTime) {
        this.bubbleMagicTimer += deltaTime;
        const t = this.bubbleMagicTimer;

        this.sparkles.forEach((s) => {
            s.a += 0.04;
            s.r += s.dr * 0.01;
        });

        if (t > 1200) {
            this.hasBubble = true;
            this.phase = 'dialogue';
            const cb = this.afterBubbleCallback;
            this.afterBubbleCallback = null;
            if (cb) cb();
        }
    }

    startCaveRun() {
        this.phase = 'gameplay';
        this.hasBubble = true;
        this.bubblePopFX = null;
        this.retryTimer = 0;

        this.ruaWorldX = this.caveCheckpointX;
        this.cameraX = Math.max(0, this.ruaWorldX - 260);
        this.rua.x = 260;
        this.rua.y = this.caveCheckpointY;
        this.rua.vy = 0;
        this.screenTilt = 0;
    }

    failCaveRun() {
        if (this.phase !== 'gameplay') return;
        this.hasBubble = false;
        this.phase = 'bubble_retry';
        this.retryTimer = 0;
        this.bubblePopFX = {
            x: this.rua.x,
            y: this.rua.y,
            t: 0
        };
        audioSystem.playSFX('hit');
    }

    updateGameplay(input, deltaTime) {
        const frameScale = Math.max(0.6, Math.min(2.4, deltaTime / 16.67 || 1));
        const flapNow = (input.space || input.up) && !this.lastSpace;
        this.lastSpace = input.space || input.up;

        if (flapNow) {
            this.rua.vy = -6.8;
            audioSystem.playSFX('jump');
        }

        this.rua.vy += 0.28 * frameScale;
        this.rua.vy = Math.min(this.rua.vy, 8.5);
        this.rua.y += this.rua.vy * frameScale;

        const moveRightBoost = (input.right || input.d) ? 1.1 : 0;
        this.ruaWorldX += (2.4 + moveRightBoost) * frameScale;

        this.cameraX = Math.max(0, this.ruaWorldX - 260);
        this.rua.x = 260;

        // Gentle rotating screen left-right while progressing through cave
        this.screenTilt = Math.sin(this.ruaWorldX * 0.006) * 0.08;

        // Cave collision (flappy style)
        const globalRuaX = this.ruaWorldX;
        const topY = this.rua.y - this.rua.size / 2;
        const bottomY = this.rua.y + this.rua.size / 2;

        for (const seg of this.caveSegments) {
            if (globalRuaX >= seg.x && globalRuaX <= seg.x + seg.width) {
                if (topY < seg.gapTop) {
                    this.rua.y = seg.gapTop + this.rua.size / 2;
                    this.rua.vy = Math.max(0, this.rua.vy * 0.35);
                    if (this.hasBubble) this.failCaveRun();
                } else if (bottomY > seg.gapBottom) {
                    this.rua.y = seg.gapBottom - this.rua.size / 2;
                    this.rua.vy = Math.min(0, this.rua.vy * 0.35);
                    if (this.hasBubble) this.failCaveRun();
                }
                break;
            }
        }

        // Cat-fish swimmers
        this.catFish.forEach((f) => {
            f.x += f.speed * f.dir * frameScale;
            f.y += Math.sin(this.phaseTime * 0.004 + f.drift) * 0.4 * frameScale;

            const leftBound = this.cameraX - 220;
            const rightBound = this.cameraX + this.canvas.width + 260;
            if (f.x < leftBound) {
                f.x = rightBound;
                f.dir = -1;
            } else if (f.x > rightBound) {
                f.x = leftBound;
                f.dir = 1;
            }
        });

        if (this.bubblePopFX) {
            this.bubblePopFX.t += deltaTime;
            if (this.bubblePopFX.t > 550) {
                this.bubblePopFX = null;
            }
        }

        this.rua.y = Math.max(40, Math.min(this.canvas.height - 40, this.rua.y));

        if (this.ruaWorldX >= this.caveEndX) {
            this.hasBubble = false;
            this.complete = true;
        }
    }

    update(input, deltaTime) {
        this.phaseTime += deltaTime;
        this.updateAmbientBubbles();

        if (this.phase === 'landing') {
            this.updateLanding(deltaTime);
        } else if (this.phase === 'bubble_magic') {
            this.updateBubbleMagic(deltaTime);
        } else if (this.phase === 'gameplay') {
            this.updateGameplay(input, deltaTime);
        } else if (this.phase === 'bubble_retry') {
            this.retryTimer += deltaTime;
            if (this.bubblePopFX) {
                this.bubblePopFX.t += deltaTime;
                if (this.bubblePopFX.t > 550) {
                    this.bubblePopFX = null;
                }
            }
            if (this.retryTimer > 700) {
                this.startCaveRun();
            }
        }

        if (this.dialogueSystem) {
            this.dialogueSystem.update(input);
        }
    }

    drawOceanBase() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#1b78c2');
        gradient.addColorStop(1, '#08345e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Soft light beams
        ctx.globalAlpha = 0.1;
        for (let i = 0; i < 4; i++) {
            ctx.fillStyle = '#b7ecff';
            ctx.beginPath();
            ctx.moveTo(80 + i * 280, 0);
            ctx.lineTo(180 + i * 280, h);
            ctx.lineTo(260 + i * 280, h);
            ctx.lineTo(150 + i * 280, 0);
            ctx.closePath();
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Ambient bubbles
        this.ambientBubbles.forEach((b) => {
            ctx.fillStyle = 'rgba(255,255,255,0.32)';
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawCave() {
        const ctx = this.ctx;
        const h = this.canvas.height;

        this.caveSegments.forEach((seg) => {
            const sx = seg.x - this.cameraX;
            if (sx > this.canvas.width + 60 || sx + seg.width < -60) return;

            // Upper cave (brown)
            ctx.fillStyle = '#5f3b22';
            ctx.fillRect(sx, 0, seg.width, seg.gapTop);
            ctx.fillStyle = '#7a4d2b';
            ctx.fillRect(sx, seg.gapTop - 12, seg.width, 12);

            // Lower cave (brown)
            const lowerH = h - seg.gapBottom;
            ctx.fillStyle = '#5f3b22';
            ctx.fillRect(sx, seg.gapBottom, seg.width, lowerH);
            ctx.fillStyle = '#7a4d2b';
            ctx.fillRect(sx, seg.gapBottom, seg.width, 12);
        });

        // Grey backwards-L tunnel at the cave end
        const endX = this.caveEndX - this.cameraX;
        const tunnelY = 250;
        const tunnelWidth = 180; // match cave segment width

        // Horizontal segment
        ctx.fillStyle = '#808891';
        ctx.fillRect(endX - tunnelWidth, tunnelY, tunnelWidth, 64);
        ctx.fillStyle = '#a8b0b9';
        ctx.fillRect(endX - tunnelWidth, tunnelY, tunnelWidth, 9);

        // Vertical segment going to top (backwards L)
        ctx.fillStyle = '#808891';
        ctx.fillRect(endX, 0, tunnelWidth, tunnelY + 64);
        ctx.fillStyle = '#a8b0b9';
        ctx.fillRect(endX, 0, 9, tunnelY + 64);

        ctx.fillStyle = '#e6edf3';
        ctx.font = '28px Arial';
        ctx.fillText('⬆️', endX + tunnelWidth / 2 - 14, 44);
    }

    drawRua() {
        const ctx = this.ctx;

        ctx.save();
        ctx.translate(this.rua.x, this.rua.y);
        if (this.rua.facing === 'right') {
            ctx.scale(-1, 1);
        }
        ctx.font = '50px Arial';
        ctx.fillText(this.rua.emoji, -25, 16);
        ctx.restore();

        if (this.hasBubble || this.phase === 'bubble_magic') {
            const pulse = 2 + Math.sin(this.phaseTime * 0.01) * 2;
            ctx.strokeStyle = 'rgba(190, 238, 255, 0.9)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.rua.x, this.rua.y - 6, this.rua.size / 2 + 10 + pulse, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    drawMagicSparkles() {
        if (this.phase !== 'bubble_magic') return;

        const ctx = this.ctx;
        this.sparkles.forEach((s) => {
            const x = this.rua.x + Math.cos(s.a) * s.r;
            const y = this.rua.y + Math.sin(s.a) * s.r;
            ctx.fillStyle = s.color;
            ctx.beginPath();
            ctx.arc(x, y, s.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawMermaid() {
        const ctx = this.ctx;
        const bob = this.phase === 'gameplay' ? Math.sin(this.phaseTime * 0.015) * 10 : 0;

        ctx.font = '60px Arial';
        ctx.fillText(this.fishLady.emoji, this.fishLady.x - 30, this.fishLady.y + bob);
    }

    drawCatFish() {
        if (this.phase !== 'gameplay') return;

        const ctx = this.ctx;
        this.catFish.forEach((f) => {
            const sx = f.x - this.cameraX;
            if (sx < -80 || sx > this.canvas.width + 80) return;

            ctx.save();
            ctx.translate(sx, f.y);
            if (f.dir < 0) {
                ctx.scale(-1, 1);
            }

            ctx.font = '42px Arial';
            ctx.fillText('🐟', -20, 12);
            ctx.font = '19px Arial';
            ctx.fillText('😾', -2, -3);
            ctx.restore();
        });
    }

    drawBubblePopFX() {
        if (!this.bubblePopFX) return;

        const ctx = this.ctx;
        const p = this.bubblePopFX;
        const k = Math.min(1, p.t / 550);
        const r = 10 + k * 52;

        ctx.strokeStyle = `rgba(210,245,255,${1 - k})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y - 4, r, 0, Math.PI * 2);
        ctx.stroke();

        for (let i = 0; i < 9; i++) {
            const a = (Math.PI * 2 * i) / 9 + k * 2;
            const bx = p.x + Math.cos(a) * r;
            const by = p.y - 4 + Math.sin(a) * r;
            ctx.fillStyle = `rgba(255,255,255,${0.8 - k * 0.8})`;
            ctx.beginPath();
            ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawGameplayHud() {
        if (this.phase !== 'gameplay' && this.phase !== 'bubble_retry') return;

        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(14, 12, 270, 42);
        ctx.fillStyle = 'white';
        ctx.font = '15px Arial';
        ctx.fillText('SPACE/UP flap • RIGHT boost', 24, 38);
    }

    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        if (this.phase === 'gameplay' || this.phase === 'bubble_retry') {
            // Rotate the whole screen slightly left/right for comedic flappy effect
            ctx.save();
            ctx.translate(w / 2, h / 2);
            ctx.rotate(this.screenTilt);
            ctx.translate(-w / 2, -h / 2);

            this.drawOceanBase();
            this.drawCave();
            this.drawCatFish();
            this.drawRua();
            this.drawBubblePopFX();

            ctx.restore();
            this.drawGameplayHud();
        } else {
            this.drawOceanBase();
            this.drawMermaid();

            // Rua lands beside mermaid, facing her
            if (this.phase === 'landing' || this.phase === 'dialogue' || this.phase === 'bubble_magic') {
                this.rua.x = 560;
                this.rua.facing = this.rua.x < this.fishLady.x ? 'right' : 'left';
                const panic = this.phase === 'landing' ? Math.sin(this.phaseTime * 0.05) * 7 : 0;
                this.rua.y = this.landingY + panic;
            }

            this.drawRua();
            this.drawMagicSparkles();
        }

        if (this.dialogueSystem) {
            this.dialogueSystem.draw();
        }
    }

    isComplete() {
        return this.complete;
    }
}
