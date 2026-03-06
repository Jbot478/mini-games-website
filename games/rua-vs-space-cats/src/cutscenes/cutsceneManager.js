// Cutscene Manager - Handles cinematic sequences
class CutsceneManager {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.isPlaying = false;
        this.currentCutscene = null;
        this.cutsceneTime = 0;
        this.events = [];
        this.eventIndex = 0;
        this.callback = null;
    }

    play(cutsceneData, callback) {
        this.isPlaying = true;
        this.currentCutscene = cutsceneData;
        this.cutsceneTime = 0;
        this.eventIndex = 0;
        this.events = cutsceneData.events || [];
        this.callback = callback;
    }

    update(deltaTime) {
        if (!this.isPlaying) return;

        this.cutsceneTime += deltaTime;

        // Process events
        while (this.eventIndex < this.events.length) {
            const event = this.events[this.eventIndex];

            if (this.cutsceneTime >= event.time) {
                this.executeEvent(event);
                this.eventIndex++;
            } else {
                break;
            }
        }

        // Check if cutscene is complete
        if (this.currentCutscene.duration && this.cutsceneTime >= this.currentCutscene.duration) {
            this.end();
        }
    }

    executeEvent(event) {
        switch(event.type) {
            case 'audio':
                if (event.music) {
                    audioSystem.playMusic(event.music);
                }
                if (event.sfx) {
                    audioSystem.playSFX(event.sfx);
                }
                break;
            case 'callback':
                if (event.action) {
                    event.action();
                }
                break;
        }
    }

    draw() {
        if (!this.isPlaying || !this.currentCutscene) return;

        // Draw cutscene background
        if (this.currentCutscene.background) {
            this.ctx.fillStyle = this.currentCutscene.background;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // Draw custom render function if provided
        if (this.currentCutscene.render) {
            this.currentCutscene.render(this.ctx, this.cutsceneTime);
        }
    }

    end() {
        this.isPlaying = false;
        if (this.callback) {
            const cb = this.callback;
            this.callback = null;
            cb();
        }
    }

    skip() {
        this.end();
    }

    isActive() {
        return this.isPlaying;
    }
}
