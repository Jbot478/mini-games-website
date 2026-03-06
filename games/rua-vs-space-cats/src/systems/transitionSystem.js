// Transition System - Smooth transitions between levels
class TransitionSystem {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.isTransitioning = false;
        this.transitionType = 'fade';
        this.progress = 0;
        this.duration = 1000; // ms
        this.callback = null;
        this.startTime = 0;
        this.titleText = null;
        this.titleAlpha = 0;
        this.titlePhase = 'fadein'; // fadein, hold, fadeout
    }

    start(type, callback, options = {}) {
        this.isTransitioning = true;
        this.transitionType = type;
        this.progress = 0;
        this.callback = callback;
        this.startTime = Date.now();
        this.duration = options.duration || 1000;
        this.titleText = options.title || null;
        this.titleAlpha = 0;
        this.titlePhase = 'fadein';
    }

    update() {
        if (!this.isTransitioning) return;

        const elapsed = Date.now() - this.startTime;
        this.progress = Math.min(elapsed / this.duration, 1);

        // Handle level title display
        if (this.titleText) {
            this.updateTitle();
        }

        // Trigger callback at midpoint for fade transitions
        if (this.progress >= 0.5 && this.callback && this.transitionType.includes('fade')) {
            const cb = this.callback;
            this.callback = null;
            cb();
        }

        // End transition
        if (this.progress >= 1) {
            this.isTransitioning = false;
            if (this.callback) {
                const cb = this.callback;
                this.callback = null;
                cb();
            }
        }
    }

    updateTitle() {
        const totalDuration = 3000; // 3 seconds total
        const fadeInDuration = 500;
        const holdDuration = 2000;
        const fadeOutDuration = 500;

        const elapsed = Date.now() - this.startTime;

        if (elapsed < fadeInDuration) {
            // Fade in
            this.titlePhase = 'fadein';
            this.titleAlpha = elapsed / fadeInDuration;
        } else if (elapsed < fadeInDuration + holdDuration) {
            // Hold
            this.titlePhase = 'hold';
            this.titleAlpha = 1;
        } else if (elapsed < totalDuration) {
            // Fade out
            this.titlePhase = 'fadeout';
            const fadeProgress = (elapsed - fadeInDuration - holdDuration) / fadeOutDuration;
            this.titleAlpha = 1 - fadeProgress;
        } else {
            this.titleText = null;
        }
    }

    draw() {
        if (!this.isTransitioning && !this.titleText) return;

        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        switch (this.transitionType) {
            case 'fade_black':
                this.drawFade('black');
                break;
            case 'fade_white':
                this.drawFade('white');
                break;
            case 'white_flash':
                this.drawWhiteFlash();
                break;
            case 'slide_left':
                this.drawSlide('left');
                break;
            case 'slide_right':
                this.drawSlide('right');
                break;
            default:
                this.drawFade('black');
        }

        // Draw level title if present
        if (this.titleText && this.titleAlpha > 0) {
            ctx.save();
            ctx.globalAlpha = this.titleAlpha;

            // Draw title background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, h / 2 - 80, w, 160);

            // Draw title text
            ctx.fillStyle = 'white';
            ctx.font = 'bold 48px "Comic Sans MS", cursive';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.titleText, w / 2, h / 2);

            ctx.restore();
        }
    }

    drawFade(color) {
        const alpha = this.progress <= 0.5
            ? this.progress * 2
            : (1 - this.progress) * 2;

        this.ctx.fillStyle = color;
        this.ctx.globalAlpha = alpha;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalAlpha = 1;
    }

    drawWhiteFlash() {
        const alpha = this.progress <= 0.3
            ? this.progress / 0.3
            : (1 - this.progress) / 0.7;

        this.ctx.fillStyle = 'white';
        this.ctx.globalAlpha = alpha;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalAlpha = 1;
    }

    drawSlide(direction) {
        const offset = direction === 'left'
            ? -this.canvas.width * this.progress
            : this.canvas.width * this.progress;

        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(offset, 0, this.canvas.width, this.canvas.height);
    }

    isActive() {
        return this.isTransitioning;
    }
}
