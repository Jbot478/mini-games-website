// Level 9 - THROWN LIKE TRASH
class Level09_Flight {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.rua = {
            x: canvas.width + 80,
            y: 130,
            vy: 0,
            size: 50,
            emoji: '🐕',
            spin: 0
        };
        this.dialogueSystem = null;
        this.complete = false;
        this.flightTime = 0;

        this.sceneDuration = 3000; // 3 seconds per backdrop
        this.montageScenes = [
            { level: 3, speaker: '🪲 Jungle Bug', line: 'New crash? We were just cleaning this mess.' },
            { level: 4, speaker: '🧍 Village Human', line: 'Oh look, a flying drama dog again.' },
            { level: 5, speaker: '🐝 Bee', line: 'She skipped tea and chose aerodynamic suffering.' },
            { level: 6, speaker: '🐱 Mountain Cat', line: 'Did she just speedrun gravity?' },
            { level: 7, speaker: '🧍‍♂️ Guard', line: 'Sir, that dog is violating every traffic law.' }
        ];
        this.totalScenes = this.montageScenes.length; // Levels 3 through 7
        this.totalMontageDuration = this.sceneDuration * this.totalScenes;

        this.phase = 'montage';
        this.splashTime = 0;
        this.waterline = canvas.height - 150;

        this.backdropSnapshots = new Map();
    }

    init(dialogueSystem) {
        this.dialogueSystem = dialogueSystem;
        audioSystem.playMusic('flight');
        this.buildMontageBackdrops();
    }

    buildMontageBackdrops() {
        const dialogueStub = {
            isDialogueActive: () => true,
            draw: () => {},
            show: () => {}
        };

        const build = (LevelClass, levelNumber, configure = null) => {
            const offscreen = document.createElement('canvas');
            offscreen.width = this.canvas.width;
            offscreen.height = this.canvas.height;
            const offCtx = offscreen.getContext('2d');

            const level = new LevelClass(offscreen, offCtx);
            level.dialogueSystem = dialogueStub;

            if (configure) {
                configure(level);
            }

            // Hide native Rua in snapshots, we draw spinning Rua separately
            if (level.rua && Object.prototype.hasOwnProperty.call(level.rua, 'emoji')) {
                level.rua.emoji = '';
            }

            if (typeof level.draw === 'function') {
                level.draw();
                this.backdropSnapshots.set(levelNumber, offscreen);
            }
        };

        build(Level03_Jungle, 3, (level) => {
            level.phase = 'gameplay';
            level.cinematicTime = 5000;
        });

        build(Level04_Village, 4, (level) => {
            level.phase = 'gameplay';
            level.introComplete = true;
            level.pendingSecondIntro = false;
        });

        build(Level05_BeeHouse, 5, (level) => {
            level.phase = 'explore';
            level.showUnlockBanner = false;
            level.puzzle.active = false;
        });

        build(Level06_Mountain, 6, (level) => {
            level.cameraY = 460;
            level.exitDoor.inRange = false;
        });

        build(Level07_Servants, 7, (level) => {
            level.phase = 'gameplay';
            level.quiz.active = false;
            level.ambientMessage = '';
        });
    }

    update(input, deltaTime) {
        this.flightTime += deltaTime;

        if (this.phase === 'montage') {
            const sceneIndex = Math.min(this.totalScenes - 1, Math.floor(this.flightTime / this.sceneDuration));
            const sceneElapsed = this.flightTime - sceneIndex * this.sceneDuration;
            const sceneProgress = Math.max(0, Math.min(1, sceneElapsed / this.sceneDuration));

            // Fly from right to left across each backdrop (resets each scene)
            this.rua.x = this.canvas.width + 80 - sceneProgress * (this.canvas.width + 160);
            this.rua.y = 120 + Math.sin(this.flightTime * 0.004) * 18;

            // Slow comedic spin
            this.rua.spin += deltaTime * 0.0017;

            if (this.flightTime >= this.totalMontageDuration) {
                this.phase = 'drop_to_ocean';
                this.rua.x = 120;
                this.rua.y = 120;
                this.rua.vy = 0;
            }
        } else if (this.phase === 'drop_to_ocean') {
            this.rua.vy += 0.36;
            this.rua.y += this.rua.vy;
            this.rua.spin += deltaTime * 0.0014;

            if (this.rua.y >= this.waterline + 8) {
                this.rua.y = this.waterline + 8;
                this.phase = 'splash';
                this.splashTime = 0;
            }
        } else if (this.phase === 'splash') {
            this.splashTime += deltaTime;
            if (this.splashTime > 700) {
                this.complete = true;
            }
        }

        if (this.dialogueSystem) {
            this.dialogueSystem.update(input);
        }
    }

    drawPreviousLevelBackground(levelNumber, alpha) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        const snapshot = this.backdropSnapshots.get(levelNumber);
        if (snapshot) {
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.drawImage(snapshot, 0, 0, w, h);
            ctx.restore();
            return;
        }

        ctx.save();
        ctx.globalAlpha = alpha;

        switch (levelNumber) {
            case 3: // Jungle
                ctx.fillStyle = '#2f5a31';
                ctx.fillRect(0, 0, w, h);
                ctx.fillStyle = '#1f3f21';
                for (let i = 0; i < 10; i++) {
                    ctx.fillRect(i * 130, 0, 60, h);
                }
                ctx.fillStyle = '#3f8042';
                ctx.fillRect(0, h - 180, w, 180);
                break;

            case 4: // Village where nothing happens
                ctx.fillStyle = '#d9efff';
                ctx.fillRect(0, 0, w, h);
                ctx.fillStyle = '#9fcf8b';
                ctx.fillRect(0, 120, w, h - 120);
                ctx.fillStyle = '#b8aa96';
                ctx.fillRect(0, 330, w, 80);
                ctx.fillStyle = '#c79a6b';
                ctx.fillRect(180, 180, 160, 130);
                ctx.fillStyle = '#6b4e9b';
                ctx.fillRect(460, 170, 170, 140);
                break;

            case 5: // Bee house
                ctx.fillStyle = '#f6d870';
                ctx.fillRect(0, 0, w, h);
                ctx.fillStyle = '#e3b341';
                for (let i = 0; i < 8; i++) {
                    ctx.fillRect(i * 160, 0, 70, h);
                }
                ctx.fillStyle = '#8b5a2b';
                ctx.fillRect(430, 210, 280, 220);
                break;

            case 6: // Mountain
                ctx.fillStyle = '#a7c3df';
                ctx.fillRect(0, 0, w, h);
                ctx.fillStyle = '#6f8193';
                ctx.beginPath();
                ctx.moveTo(120, h);
                ctx.lineTo(380, 240);
                ctx.lineTo(620, h);
                ctx.closePath();
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(520, h);
                ctx.lineTo(820, 200);
                ctx.lineTo(1100, h);
                ctx.closePath();
                ctx.fill();
                break;

            case 7: // Human village servants
                ctx.fillStyle = '#e4f2ff';
                ctx.fillRect(0, 0, w, h);
                ctx.fillStyle = '#a8d98d';
                ctx.fillRect(0, 100, w, h - 100);
                ctx.fillStyle = '#caa57e';
                ctx.fillRect(140, 220, 180, 140);
                ctx.fillRect(430, 210, 180, 150);
                ctx.fillRect(760, 220, 190, 140);
                break;

            default:
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, w, h);
        }

        ctx.restore();
    }

    drawSceneRemark(scene, alpha = 1) {
        if (!scene) return;

        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = alpha;

        const panelX = 80;
        const panelY = this.canvas.height - 120;
        const panelW = this.canvas.width - 160;
        const panelH = 74;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.fillRect(panelX, panelY, panelW, panelH);
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 2;
        ctx.strokeRect(panelX, panelY, panelW, panelH);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.fillText(scene.speaker, panelX + 16, panelY + 28);
        ctx.font = '18px Arial';
        ctx.fillText(scene.line, panelX + 16, panelY + 56);

        ctx.restore();
    }

    drawOceanArrivalBackground() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        const sky = ctx.createLinearGradient(0, 0, 0, h);
        sky.addColorStop(0, '#9ad7ff');
        sky.addColorStop(1, '#d9f1ff');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#4ea6d8';
        ctx.fillRect(0, this.waterline, w, h - this.waterline);

        ctx.fillStyle = '#74c0ea';
        for (let i = 0; i < 10; i++) {
            const x = i * 130 - ((this.flightTime * 0.15) % 130);
            ctx.fillRect(x, this.waterline + 20 + (i % 2) * 10, 90, 4);
        }
    }

    drawRuaSpinning() {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(this.rua.x, this.rua.y);
        ctx.rotate(this.rua.spin);
        ctx.font = '52px Arial';
        ctx.fillText(this.rua.emoji, -26, 18);
        ctx.restore();
    }

    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;

        if (this.phase === 'montage') {
            const sceneFloat = this.flightTime / this.sceneDuration;
            const currentScene = Math.min(this.totalScenes - 1, Math.floor(sceneFloat));
            const nextScene = Math.min(this.totalScenes - 1, currentScene + 1);
            const localT = sceneFloat - Math.floor(sceneFloat);
            const currentData = this.montageScenes[currentScene];
            const nextData = this.montageScenes[nextScene];

            // Keep each scene visible, then fade to next near the end
            const fadeWindow = 0.35;
            let currentAlpha = 1;
            let nextAlpha = 0;
            if (localT > (1 - fadeWindow) && currentScene < this.totalScenes - 1) {
                nextAlpha = (localT - (1 - fadeWindow)) / fadeWindow;
                currentAlpha = 1 - nextAlpha;
            }

            // Fade between previous level backgrounds
            this.drawPreviousLevelBackground(currentData.level, currentAlpha);
            if (nextAlpha > 0) {
                this.drawPreviousLevelBackground(nextData.level, nextAlpha);
            }

            this.drawRuaSpinning();
            this.drawSceneRemark(currentData, currentAlpha);
            if (nextAlpha > 0) {
                this.drawSceneRemark(nextData, nextAlpha);
            }
        } else {
            // Ocean arrival phase
            this.drawOceanArrivalBackground();
            this.drawRuaSpinning();

            if (this.phase === 'splash') {
                const splashRadius = 20 + Math.min(90, this.splashTime * 0.15);
                ctx.strokeStyle = 'rgba(255,255,255,0.7)';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(this.rua.x, this.waterline + 12, splashRadius, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        if (this.dialogueSystem) {
            this.dialogueSystem.draw();
        }
    }

    isComplete() {
        return this.complete;
    }
}
