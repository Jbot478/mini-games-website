// Input System - Handles keyboard controls
class InputSystem {
    constructor() {
        this.keys = {
            left: false,
            right: false,
            up: false,
            down: false,
            space: false,
            enter: false,
            z: false,
            r: false,
            w: false,
            a: false,
            s: false,
            d: false
        };

        this.keysPressed = new Set();
        this.setupListeners();
    }

    setupListeners() {
        window.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });

        window.addEventListener('keyup', (e) => {
            this.handleKeyUp(e);
        });
    }

    handleKeyDown(e) {
        const key = e.key.toLowerCase();

        switch(key) {
            case 'arrowleft':
            case 'a':
                this.keys.left = true;
                this.keys.a = true;
                break;
            case 'arrowright':
            case 'd':
                this.keys.right = true;
                this.keys.d = true;
                break;
            case 'arrowup':
            case 'w':
                this.keys.up = true;
                this.keys.w = true;
                break;
            case 'arrowdown':
            case 's':
                this.keys.down = true;
                this.keys.s = true;
                break;
            case ' ':
                this.keys.space = true;
                e.preventDefault();
                break;
            case 'enter':
                this.keys.enter = true;
                e.preventDefault();
                break;
            case 'z':
                this.keys.z = true;
                break;
            case 'r':
                this.keys.r = true;
                break;
        }

        this.keysPressed.add(key);
    }

    handleKeyUp(e) {
        const key = e.key.toLowerCase();

        switch(key) {
            case 'arrowleft':
            case 'a':
                this.keys.left = false;
                this.keys.a = false;
                break;
            case 'arrowright':
            case 'd':
                this.keys.right = false;
                this.keys.d = false;
                break;
            case 'arrowup':
            case 'w':
                this.keys.up = false;
                this.keys.w = false;
                break;
            case 'arrowdown':
            case 's':
                this.keys.down = false;
                this.keys.s = false;
                break;
            case ' ':
                this.keys.space = false;
                break;
            case 'enter':
                this.keys.enter = false;
                break;
            case 'z':
                this.keys.z = false;
                break;
            case 'r':
                this.keys.r = false;
                break;
        }

        this.keysPressed.delete(key);
    }

    isKeyPressed(key) {
        return this.keys[key] || false;
    }

    wasKeyJustPressed(key) {
        // For single-press detection
        if (this.keys[key] && !this.lastKeys[key]) {
            return true;
        }
        return false;
    }

    reset() {
        Object.keys(this.keys).forEach(key => {
            this.keys[key] = false;
        });
        this.keysPressed.clear();
    }

    getMovement() {
        return {
            left: this.keys.left || this.keys.a,
            right: this.keys.right || this.keys.d,
            up: this.keys.up || this.keys.w,
            down: this.keys.down || this.keys.s,
            space: this.keys.space,
            enter: this.keys.enter,
            z: this.keys.z,
            r: this.keys.r
        };
    }
}

// Global instance
const inputSystem = new InputSystem();
