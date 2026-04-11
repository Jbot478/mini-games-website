// Dialogue System - FIXED to not auto-advance
class DialogueSystem {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.currentDialogue = null;
        this.isActive = false;
        this.lineIndex = 0;
        this.enterPressed = false;
        this.callback = null;
        this.justShown = false; // NEW: Track if we just showed dialogue
        this.position = 'bottom'; // 'bottom' or 'top'
    }

    show(lines, character, callback) {
        console.log(`DialogueSystem.show() called with: "${lines}" from ${character}`);

        this.currentDialogue = {
            lines: Array.isArray(lines) ? lines : [lines],
            character: character,
            emoji: this.getCharacterEmoji(character)
        };
        this.lineIndex = 0;
        this.isActive = true;
        this.callback = callback;
        this.enterPressed = true; // SET TO TRUE so first frame is ignored!
        this.justShown = true; // Mark that we just showed dialogue

        console.log(`DialogueSystem is now ACTIVE. isActive = ${this.isActive}`);
        console.log(`Showing line: "${this.currentDialogue.lines[0]}"`);
    }

    getCharacterEmoji(character) {
        const emojiMap = {
            'rua': '🐕',
            'man': '🧍🏻‍♂️',
            'cat': '🐱',
            'bird': '🐦',
            'stoner_cat': '😸',
            'sprinkles': '🐶',
            'fish_lady': '🧜‍♀️',
            'bee': '🐝',
            'human': '🧍',
            'overfriendly': '🧍‍♀️',
            'concerned_mom': '🧍‍♀️',
            'snack_human': '🧍‍♂️',
            'brenda': '💃',
            'gym_bro': '🏋️‍♂️',
            'guard': '🧍‍♂️'
        };
        return emojiMap[character.toLowerCase()] || '💬';
    }

    update(input) {
        if (!this.isActive) return;

        // CRITICAL FIX: Wait for ENTER to be released before accepting input
        if (this.justShown) {
            if (!input.enter) {
                this.justShown = false;
                this.enterPressed = false;
                console.log('ENTER released, ready for input!');
            }
            return; // Don't process input while justShown is true
        }

        // Check for ENTER key
        if (input.enter && !this.enterPressed) {
            console.log(`ENTER pressed! lineIndex: ${this.lineIndex}, total lines: ${this.currentDialogue.lines.length}`);
            this.enterPressed = true;
            this.lineIndex++;

            // If we've shown all lines, end dialogue
            if (this.lineIndex >= this.currentDialogue.lines.length) {
                console.log('All dialogue lines shown! Setting isActive to FALSE');
                this.isActive = false;
                const onDone = this.callback;
                this.callback = null;
                if (onDone) {
                    onDone();
                }
            } else {
                console.log(`Moving to next line: "${this.currentDialogue.lines[this.lineIndex]}"`);
            }
        }

        if (!input.enter) {
            this.enterPressed = false;
        }
    }

    draw() {
        if (!this.isActive || !this.currentDialogue) {
            return;
        }

        const line = this.currentDialogue.lines[this.lineIndex];
        const emoji = this.currentDialogue.emoji;

        const bubbleWidth = Math.min(760, this.canvas.width * 0.86);
        const bubbleHeight = 170;
        const x = (this.canvas.width - bubbleWidth) / 2;
        const y = this.position === 'top' ? 40 : this.canvas.height - bubbleHeight - 40;

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(x + 5, y + 5, bubbleWidth, bubbleHeight);

        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(x, y, bubbleWidth, bubbleHeight);

        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x, y, bubbleWidth, bubbleHeight);

        this.ctx.font = '48px Arial';
        this.ctx.fillText(emoji, x + 20, y + 72);

        this.ctx.fillStyle = '#333';
        this.ctx.font = '22px "Comic Sans MS", cursive';
        this.wrapText(line, x + 90, y + 42, bubbleWidth - 120, 26);

        this.ctx.fillStyle = '#666';
        this.ctx.font = '16px Arial';
        const promptText = this.lineIndex < this.currentDialogue.lines.length - 1
            ? '▼ Press ENTER'
            : '▼ Press ENTER to continue';
        const promptWidth = this.ctx.measureText(promptText).width;
        this.ctx.fillText(promptText, x + bubbleWidth - promptWidth - 20, y + bubbleHeight - 14);
    }

    wrapText(text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = this.ctx.measureText(testLine);

            if (metrics.width > maxWidth && i > 0) {
                this.ctx.fillText(line, x, currentY);
                line = words[i] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        this.ctx.fillText(line, x, currentY);
    }

    isDialogueActive() {
        return this.isActive;
    }

    skip() {
        this.isActive = false;
        const onDone = this.callback;
        this.callback = null;
        if (onDone) {
            onDone();
        }
    }
}
