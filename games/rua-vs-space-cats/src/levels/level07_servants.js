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
        this.guard = {
            x: canvas.width - 105,
            y: 300,
            emoji: '🧍‍♂️',
            inRange: false,
            blocksDoor: true
        };
        this.dialogueSystem = null;
        this.complete = false;
        this.phase = 'intro';
        this.phaseTime = 0;
        this.peopleTalked = 0;
        this.objectiveDone = false;

        this.quiz = {
            active: false,
            completed: false,
            index: 0,
            typing: false,
            answerText: '',
            questions: [
                {
                    q: 'What did Jeff have for lunch?',
                    type: 'text',
                    isCorrect: (answer) => answer.includes('honey')
                },
                {
                    q: 'What is the most common color of butterfly in this village?',
                    type: 'text',
                    isCorrect: (answer) => answer.includes('yellow')
                },
                {
                    q: 'How is food usually delivered to this town?',
                    type: 'text',
                    isCorrect: (answer) => answer.includes('truck')
                },
                {
                    q: 'What do we think of Brenda?',
                    type: 'choice',
                    choices: [
                        'Brenda is amazing and wise.',
                        'Brenda, you suuuuuuuuuuuuuck!!!!',
                        'Brenda should get more petitions.',
                        'We have no opinion about Brenda.'
                    ],
                    correctChoice: 1
                }
            ],
            snideResponses: [
                'Yeah Jeff is a sticky weirdo.',
                'Yes, yellow. Stunning detective work by me, as expected.',
                'Food truck. Tragic, predictable, and correct.',
                'Exactly. Brenda still sucks.'
            ]
        };

        this.ambientLines = [
            'Everyone here has grabby energy.',
            'These people would not survive one bee.',
            'I miss space.',
            'Too many hands. Not enough respect.'
        ];
        this.ambientTimer = 0;
        this.nextAmbientAt = 5500;
        this.ambientMessage = '';
        this.ambientMessageTimer = 0;
        this.boundQuizKeyDown = (e) => this.handleQuizKeyDown(e);
    }

    createHumans() {
        return [
            {
                x: 200,
                y: 250,
                emoji: '🧍‍♀️',
                name: 'Overfriendly Dog Person',
                talked: false,
                script: [
                    { speaker: 'overfriendly', lines: ['Oh cute a doggy I wanna pet it.'] },
                    { speaker: 'rua', lines: ['Do not touch me, you sticky peasant.'] },
                    { speaker: 'overfriendly', lines: ['I’m not sticky, I just ate a jar of honey and I spilled some.'] },
                    { speaker: 'rua', lines: ['That is… disgusting. I’m leaving now because I’m better than you.'] }
                ]
            },
            {
                x: 420,
                y: 520,
                emoji: '🧍‍♀️',
                name: 'Concerned Mom',
                talked: false,
                script: [
                    { speaker: 'concerned_mom', lines: ['Wow I just saw a blue butterfly. I only ever usually see yellow ones around here.'] },
                    { speaker: 'rua', lines: ['Usually I would tell people they need to get out more. But you should just go back inside.'] }
                ]
            },
            {
                x: 610,
                y: 320,
                emoji: '🧍‍♂️',
                name: 'Oversharing Guy',
                talked: false,
                script: [
                    { speaker: 'rua', lines: ['Hello servant, do you have any snacks, perhaps a roast chicken or foie gras?'] },
                    { speaker: 'snack_human', lines: ['I don\'t have any food, little doggy. The food truck has been delayed since \'the other\' arrived. We can\'t find it. We need food.'] },
                    { speaker: 'rua', lines: ['Oh my god, just say no you…'] },
                    { speaker: 'rua', lines: ['Wait? The other?'] },
                    { speaker: 'snack_human', lines: ['Yes, the other is a…'] },
                    { speaker: 'rua', lines: ['Actually I don’t care, goodbye.'] }
                ]
            },
            {
                x: 780,
                y: 560,
                emoji: '💃',
                name: 'Petition Human',
                talked: false,
                script: [
                    { speaker: 'brenda', lines: ['Hello there. I\'m Brenda. Would you please sign this petition stating we should no longer be giving out free treats?'] },
                    { speaker: 'rua', lines: ['Brenda, you suuuuuuuuuuuuuck!!!!'] }
                ]
            },
            {
                x: 980,
                y: 360,
                emoji: '🏋️‍♂️',
                name: 'Gym Bro',
                talked: false,
                script: [
                    { speaker: 'rua', lines: ['Greetings human, have you any treats? Or perhaps you have seen my beepbopulator?'] },
                    { speaker: 'gym_bro', lines: ['Sorry lil bro… I gave my spare protein to \'the other\'.'] },
                    { speaker: 'rua', lines: ['I have no idea what that means but you have nice arms so, farewell to you whatever your name is.'] }
                ]
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
        this.quiz.active = false;
        this.quiz.completed = false;
        this.quiz.index = 0;
        this.quiz.typing = false;
        this.quiz.answerText = '';
        this.quiz.listenerAttached = false;

        this.dialogueSystem.show(
            ['Ugh. A whole town of humans.', 'Try to look useful while I investigate.'],
            'rua',
            () => {
                this.phase = 'gameplay';
            }
        );
    }

    playScript(script, index = 0, onDone = null) {
        if (!script || index >= script.length) {
            if (onDone) onDone();
            return;
        }

        const step = script[index];
        this.dialogueSystem.show(step.lines, step.speaker, () => {
            this.playScript(script, index + 1, onDone);
        });
    }

    handleGuardInteraction() {
        if (this.quiz.completed) {
            this.dialogueSystem.show(['You may enter.'], 'guard');
            return;
        }

        this.dialogueSystem.show(
            ['You may only enter if you answer my questions correctly.'],
            'guard'
        );
        this.quiz.active = true;
        this.quiz.typing = false;
        this.quiz.answerText = '';
    }

    startTextAnswer() {
        this.quiz.typing = true;
        this.quiz.answerText = '';
        if (!this.quiz.listenerAttached) {
            window.addEventListener('keydown', this.boundQuizKeyDown);
            this.quiz.listenerAttached = true;
        }
    }

    stopTextAnswer() {
        this.quiz.typing = false;
        if (this.quiz.listenerAttached) {
            window.removeEventListener('keydown', this.boundQuizKeyDown);
            this.quiz.listenerAttached = false;
        }
    }

    handleQuizKeyDown(e) {
        if (!this.quiz.active || this.quiz.completed) return;
        const current = this.quiz.questions[this.quiz.index];
        if (!current || current.type !== 'text' || !this.quiz.typing) return;

        const key = e.key;

        if (key === 'Enter') {
            e.preventDefault();
            this.submitTextAnswer();
            return;
        }

        if (key === 'Backspace') {
            e.preventDefault();
            this.quiz.answerText = this.quiz.answerText.slice(0, -1);
            return;
        }

        if (key.length === 1) {
            e.preventDefault();
            this.quiz.answerText += key;
        }
    }

    checkAnswer(rawAnswer) {
        if (!rawAnswer) return false;
        const answer = rawAnswer.trim().toLowerCase();
        const question = this.quiz.questions[this.quiz.index];
        return question.isCorrect(answer);
    }

    answerCurrentQuestion() {
        if (!this.quiz.active || this.quiz.completed) return;

        const current = this.quiz.questions[this.quiz.index];

        if (current.type === 'choice') {
            // Multiple choice question waits for click selection
            return;
        }

        if (!this.quiz.typing) {
            this.startTextAnswer();
            return;
        }

        this.submitTextAnswer();
    }

    submitTextAnswer() {
        if (!this.quiz.active || this.quiz.completed) return;

        const current = this.quiz.questions[this.quiz.index];
        if (!current || current.type !== 'text') return;

        const userAnswer = this.quiz.answerText;

        if (this.checkAnswer(userAnswer)) {
            this.stopTextAnswer();
            this.quiz.active = false;
            const snide = this.quiz.snideResponses[this.quiz.index] || 'Correct.';
            this.dialogueSystem.show([snide], 'rua', () => {
                this.quiz.index++;
                if (this.quiz.index >= this.quiz.questions.length) {
                    this.quiz.completed = true;
                    this.guard.blocksDoor = false;
                    this.dialogueSystem.show(['Fine. You remembered things.', 'Door is unlocked.'], 'guard');
                } else {
                    this.quiz.active = true;
                    this.quiz.typing = false;
                    this.quiz.answerText = '';
                }
            });
        } else {
            this.stopTextAnswer();
            this.quiz.active = false; // close card on wrong answer
            this.dialogueSystem.show(['Wrong.', 'Pay attention and try again.'], 'guard');
        }
    }

    answerChoice(choiceIndex) {
        if (!this.quiz.active || this.quiz.completed) return;
        const current = this.quiz.questions[this.quiz.index];
        if (current.type !== 'choice') return;

        if (choiceIndex === current.correctChoice) {
            this.quiz.active = false;
            this.quiz.typing = false;
            this.quiz.answerText = '';
            const snide = this.quiz.snideResponses[this.quiz.index] || 'Correct.';
            this.dialogueSystem.show([snide], 'rua', () => {
                this.quiz.index++;
                if (this.quiz.index >= this.quiz.questions.length) {
                    this.quiz.completed = true;
                    this.guard.blocksDoor = false;
                    this.dialogueSystem.show(['Fine. You remembered things.', 'Door is unlocked.'], 'guard');
                } else {
                    this.quiz.active = true;
                }
            });
        } else {
            this.quiz.active = false; // close card on wrong answer
            this.dialogueSystem.show(['Wrong.', 'Try that again when you are less embarrassing.'], 'rua');
        }
    }

    getChoiceRects() {
        const cardW = 760;
        const cardH = 300;
        const x = (this.canvas.width - cardW) / 2;
        const y = (this.canvas.height - cardH) / 2;
        const width = cardW - 120;
        const startX = x + 60;
        const startY = y + 126;
        const rowH = 34;

        return [0, 1, 2, 3].map(i => ({
            index: i,
            x: startX,
            y: startY + i * 40,
            width,
            height: rowH
        }));
    }

    drawQuizCard() {
        if (!this.quiz.active || this.quiz.completed) return;

        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const currentQuestion = this.quiz.questions[this.quiz.index];
        const q = currentQuestion.q;
        const isChoice = currentQuestion.type === 'choice';

        // Stylish popup card
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(0, 0, w, h);

        const cardW = 760;
        const cardH = isChoice ? 300 : 250;
        const x = (w - cardW) / 2;
        const y = (h - cardH) / 2;

        ctx.fillStyle = '#f9f5ff';
        ctx.fillRect(x, y, cardW, cardH);
        ctx.strokeStyle = '#5a3e8a';
        ctx.lineWidth = 6;
        ctx.strokeRect(x, y, cardW, cardH);

        ctx.fillStyle = '#5a3e8a';
        ctx.fillRect(x, y, cardW, 46);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Town Hall Guard Question ${this.quiz.index + 1}/${this.quiz.questions.length}`, x + cardW / 2, y + 30);

        ctx.fillStyle = '#2b2340';
        ctx.font = 'bold 28px Arial';
        this.wrapCenteredText(q, x + cardW / 2, y + 110, cardW - 80, 36);

        if (isChoice) {
            const rects = this.getChoiceRects();
            ctx.font = '17px Arial';
            ctx.textAlign = 'left';
            rects.forEach((r) => {
                const letter = String.fromCharCode(65 + r.index);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(r.x, r.y, r.width, r.height);
                ctx.strokeStyle = '#7a5db1';
                ctx.lineWidth = 2;
                ctx.strokeRect(r.x, r.y, r.width, r.height);
                ctx.fillStyle = '#2b2340';
                ctx.fillText(`${letter}) ${currentQuestion.choices[r.index]}`, r.x + 10, r.y + 23);
            });
            ctx.textAlign = 'center';
            ctx.font = '18px Arial';
            ctx.fillStyle = '#444';
            ctx.fillText('Click an option', x + cardW / 2, y + cardH - 18);
        } else {
            ctx.font = '18px Arial';
            ctx.fillStyle = '#444';
            ctx.fillText('Type your answer below and press ENTER', x + cardW / 2, y + cardH - 64);

            const inputX = x + 60;
            const inputY = y + cardH - 56;
            const inputW = cardW - 120;
            const inputH = 38;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(inputX, inputY, inputW, inputH);
            ctx.strokeStyle = '#7a5db1';
            ctx.lineWidth = 2;
            ctx.strokeRect(inputX, inputY, inputW, inputH);
            ctx.fillStyle = '#2b2340';
            ctx.font = '20px Arial';
            const cursor = this.quiz.typing && Math.floor(this.phaseTime / 400) % 2 === 0 ? '|' : '';
            ctx.textAlign = 'center';
            ctx.fillText(this.quiz.answerText + cursor, inputX + inputW / 2, inputY + 25);
            ctx.textAlign = 'left';
        }
        ctx.textAlign = 'left';
    }

    wrapCenteredText(text, cx, startY, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let y = startY;

        for (let i = 0; i < words.length; i++) {
            const test = line + words[i] + ' ';
            const w = this.ctx.measureText(test).width;
            if (w > maxWidth && i > 0) {
                this.ctx.fillText(line.trim(), cx, y);
                line = words[i] + ' ';
                y += lineHeight;
            } else {
                line = test;
            }
        }
        if (line.trim()) {
            this.ctx.fillText(line.trim(), cx, y);
        }
    }

    handleClick(canvasX, canvasY) {
        if (!this.quiz.active || this.quiz.completed) {
            return false;
        }

        const current = this.quiz.questions[this.quiz.index];
        if (current.type !== 'choice') {
            return true; // absorb clicks while quiz card is active
        }

        const rects = this.getChoiceRects();
        for (const r of rects) {
            if (canvasX >= r.x && canvasX <= r.x + r.width && canvasY >= r.y && canvasY <= r.y + r.height) {
                this.answerChoice(r.index);
                return true;
            }
        }

        return true;
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
        ctx.fillStyle = this.quiz.completed ? '#1f6f3e' : '#2f4f7f';
        ctx.fillRect(this.townHall.x + 8, this.townHall.y - 24, this.townHall.width - 16, 20);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(this.quiz.completed ? 'OFFICE' : 'TOWN HALL', this.townHall.x + 18, this.townHall.y - 10);

        // Guard at door (6th human)
        ctx.font = '48px Arial';
        ctx.fillText(this.guard.emoji, this.guard.x - 24, this.guard.y);

        if (this.guard.inRange && this.phase === 'gameplay' && !this.dialogueSystem.isDialogueActive()) {
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.font = '14px Arial';
            ctx.strokeText('[ENTER] Talk', this.guard.x - 40, this.guard.y - 42);
            ctx.fillText('[ENTER] Talk', this.guard.x - 40, this.guard.y - 42);
        }

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
        if (this.rua.facing === 'right') {
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
        ctx.fillText(`Villagers talked to: ${this.peopleTalked}/5 (optional)`, 24, 32);
        ctx.font = '13px Arial';
        if (!this.objectiveDone) {
            ctx.fillText('Objective: You can head to the guard anytime', 24, 52);
        } else if (!this.quiz.completed) {
            ctx.fillText(`Objective: Answer guard questions (${this.quiz.index}/${this.quiz.questions.length})`, 24, 52);
        } else {
            ctx.fillText('Objective: Enter the office', 24, 52);
        }

        if (this.ambientMessage) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.58)';
            ctx.fillRect(14, 74, 440, 32);
            ctx.fillStyle = '#ffe082';
            ctx.font = 'bold 14px Arial';
            ctx.fillText(this.ambientMessage, 24, 95);
        }

        if (this.dialogueSystem) {
            this.dialogueSystem.draw();
        }

        this.drawQuizCard();
    }

    isComplete() {
        return this.complete;
    }

    update(input, deltaTime) {
        this.phaseTime += deltaTime;
        const dialogueWasActive = this.dialogueSystem && this.dialogueSystem.isDialogueActive();

        if (this.phase === 'gameplay') {
            const moveSpeed = 2.8;
            const enterJustPressed = input.enter && !this.lastEnter;

            if (!dialogueWasActive && !this.quiz.active) {
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

            this.humans.forEach(human => {
                human.inRange = Math.hypot(this.rua.x - human.x, this.rua.y - human.y) < 90;
            });
            this.guard.inRange = Math.hypot(this.rua.x - this.guard.x, this.rua.y - this.guard.y) < 95;

            if (this.quiz.active && enterJustPressed && !dialogueWasActive) {
                const current = this.quiz.questions[this.quiz.index];
                if (current && current.type === 'text') {
                    this.answerCurrentQuestion();
                }
            } else if (enterJustPressed && !dialogueWasActive) {
                const human = this.humans.find(h => h.inRange);
                if (human) {
                    this.playScript(human.script, 0);
                    if (!human.talked) {
                        human.talked = true;
                        this.peopleTalked++;
                    }
                } else if (this.guard.inRange) {
                    this.handleGuardInteraction();
                }
            }

            this.objectiveDone = this.peopleTalked >= 5;

            this.townHall.inRange = this.quiz.completed
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

            if (this.quiz.active && !dialogueWasActive) {
                const current = this.quiz.questions[this.quiz.index];
                if (current && current.type === 'text' && !this.quiz.typing) {
                    this.startTextAnswer();
                }
            }

            // Ambient random non-blocking Rua comments
            if (!dialogueWasActive && !this.quiz.active) {
                this.ambientTimer += deltaTime;
                if (this.ambientTimer >= this.nextAmbientAt) {
                    const index = Math.floor(Math.random() * this.ambientLines.length);
                    this.ambientMessage = this.ambientLines[index];
                    this.ambientMessageTimer = 2200;
                    this.ambientTimer = 0;
                    this.nextAmbientAt = 4500 + Math.random() * 3500;
                }
            }

            if (this.ambientMessageTimer > 0) {
                this.ambientMessageTimer -= deltaTime;
                if (this.ambientMessageTimer <= 0) {
                    this.ambientMessage = '';
                }
            }

            this.lastEnter = input.enter;
        }

        if (this.dialogueSystem) {
            this.dialogueSystem.update(input);
        }
    }
}
