// Audio System - Handles all music and sound effects
class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.currentMusic = null;
        this.musicVolume = 0.6;
        this.sfxVolume = 0.8;
        this.isMuted = false;
        this.fadeInterval = null;

        // Initialize Web Audio API
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    // Generate procedural music using Web Audio API
    playMusic(type, options = {}) {
        this.stopMusic();

        const {
            tempo = 120,
            key = 'C',
            mood = 'neutral'
        } = options;

        switch(type) {
            case 'space_flight':
                this.playSpaceFlightMusic();
                break;
            case 'space_combat':
                this.playSpaceCombatMusic();
                break;
            case 'jungle':
                this.playJungleMusic();
                break;
            case 'village':
                this.playVillageMusic();
                break;
            case 'stoner':
                this.playStonerMusic();
                break;
            case 'mountain':
                this.playMountainMusic();
                break;
            case 'servants':
                this.playServantsMusic();
                break;
            case 'office':
                this.playOfficeMusic();
                break;
            case 'flight':
                this.playFlightMusic();
                break;
            case 'ocean':
                this.playOceanMusic();
                break;
            case 'boss':
                this.playBossMusic();
                break;
            default:
                console.warn(`Unknown music type: ${type}`);
        }
    }

    playSpaceFlightMusic() {
        // Twinkly, magical, uplifting space music
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Create a repeating pattern that's NOT repetitive
        const playNote = (freq, time, duration, wave = 'sine') => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = wave;
            osc.frequency.setValueAtTime(freq, time);

            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(this.musicVolume * 0.3, time + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(time);
            osc.stop(time + duration);
        };

        // Twinkly melody with variation
        const melodies = [
            [523.25, 659.25, 783.99, 880.00, 1046.50], // C, E, G, A, C
            [587.33, 739.99, 880.00, 987.77, 1174.66], // D, F#, A, B, D
            [659.25, 783.99, 932.33, 1046.50, 1318.51] // E, G, A#, C, E
        ];

        let time = now;
        let melodyCycle = 0;

        const scheduleMusic = () => {
            const melody = melodies[melodyCycle % melodies.length];

            // Create evolving pattern
            for (let i = 0; i < 8; i++) {
                const noteIndex = (i + melodyCycle) % melody.length;
                const freq = melody[noteIndex];
                const offset = Math.random() * 0.05; // Slight humanization

                playNote(freq, time + i * 0.3 + offset, 0.25, 'sine');

                // Add harmonics
                if (i % 2 === 0) {
                    playNote(freq * 1.5, time + i * 0.3 + offset, 0.2, 'triangle');
                }
            }

            melodyCycle++;
            time += 2.4;

            this.musicTimeout = setTimeout(scheduleMusic, 2400);
        };

        scheduleMusic();
    }

    playSpaceCombatMusic() {
        // Electronic space beat, playful but tense
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const playBeat = (time) => {
            // Kick
            const kick = ctx.createOscillator();
            const kickGain = ctx.createGain();
            kick.frequency.setValueAtTime(150, time);
            kick.frequency.exponentialRampToValueAtTime(50, time + 0.1);
            kickGain.gain.setValueAtTime(this.musicVolume, time);
            kickGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
            kick.connect(kickGain);
            kickGain.connect(ctx.destination);
            kick.start(time);
            kick.stop(time + 0.2);

            // Hi-hat
            const hihat = ctx.createOscillator();
            const hihatGain = ctx.createGain();
            hihat.frequency.setValueAtTime(8000, time);
            hihatGain.gain.setValueAtTime(this.musicVolume * 0.1, time);
            hihatGain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
            hihat.connect(hihatGain);
            hihatGain.connect(ctx.destination);
            hihat.start(time);
            hihat.stop(time + 0.05);
        };

        let beatTime = now;
        const scheduleBeat = () => {
            playBeat(beatTime);
            playBeat(beatTime + 0.5);
            beatTime += 1;
            this.musicTimeout = setTimeout(scheduleBeat, 1000);
        };

        scheduleBeat();
    }

    playJungleMusic() {
        // Drippy, alien jungle ambience
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const playDrip = (time) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.frequency.setValueAtTime(800, time);
            osc.frequency.exponentialRampToValueAtTime(200, time + 0.3);

            gain.gain.setValueAtTime(this.musicVolume * 0.2, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(time);
            osc.stop(time + 0.4);
        };

        let time = now;
        const scheduleDrips = () => {
            playDrip(time);
            time += Math.random() * 2 + 1;
            this.musicTimeout = setTimeout(scheduleDrips, (Math.random() * 2 + 1) * 1000);
        };

        scheduleDrips();
    }

    playVillageMusic() {
        // Lo-fi, sleepy beat
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const chords = [
            [261.63, 329.63, 392.00], // C major
            [293.66, 369.99, 440.00], // D minor
            [329.63, 392.00, 493.88], // E minor
            [349.23, 440.00, 523.25]  // F major
        ];

        let time = now;
        let chordIndex = 0;

        const playChord = () => {
            const chord = chords[chordIndex % chords.length];

            chord.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.frequency.value = freq;
                osc.type = 'sine';

                gain.gain.setValueAtTime(0, time);
                gain.gain.linearRampToValueAtTime(this.musicVolume * 0.15, time + 0.1);
                gain.gain.exponentialRampToValueAtTime(0.01, time + 3);

                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(time);
                osc.stop(time + 3);
            });

            chordIndex++;
            time += 3;
            this.musicTimeout = setTimeout(playChord, 3000);
        };

        playChord();
    }

    playStonerMusic() {
        // Lazy, warped synth
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        let time = now;

        const playWarpedNote = () => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const lfo = ctx.createOscillator();
            const lfoGain = ctx.createGain();

            // LFO for warbling effect
            lfo.frequency.value = 0.5;
            lfoGain.gain.value = 20;
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);

            osc.frequency.value = 200 + Math.random() * 100;
            osc.type = 'triangle';

            gain.gain.setValueAtTime(this.musicVolume * 0.2, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 4);

            osc.connect(gain);
            gain.connect(ctx.destination);

            lfo.start(time);
            osc.start(time);
            lfo.stop(time + 4);
            osc.stop(time + 4);

            time += 4;
            this.musicTimeout = setTimeout(playWarpedNote, 4000);
        };

        playWarpedNote();
    }

    playMountainMusic() {
        // Tense, rhythmic climb music
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        let time = now;
        const pattern = [1, 0, 1, 1, 0, 1, 0, 0];
        let beat = 0;

        const playBeat = () => {
            if (pattern[beat % pattern.length]) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.frequency.value = 110;
                osc.type = 'square';

                gain.gain.setValueAtTime(this.musicVolume * 0.4, time);
                gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(time);
                osc.stop(time + 0.1);
            }

            beat++;
            time += 0.25;
            this.musicTimeout = setTimeout(playBeat, 250);
        };

        playBeat();
    }

    playServantsMusic() {
        // Soft but unsettling
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        let time = now;

        const playEerieNote = () => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.frequency.value = 220 + Math.random() * 50;
            osc.type = 'sine';

            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(this.musicVolume * 0.15, time + 1);
            gain.gain.linearRampToValueAtTime(0, time + 5);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(time);
            osc.stop(time + 5);

            time += 5;
            this.musicTimeout = setTimeout(playEerieNote, 5000);
        };

        playEerieNote();
    }

    playOfficeMusic() {
        // Low ominous hum
        const ctx = this.audioContext;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.frequency.value = 55;
        osc.type = 'sine';
        gain.gain.value = this.musicVolume * 0.3;

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        this.currentMusic = { osc, gain };
    }

    playFlightMusic() {
        // Fast-paced danger music
        this.playSpaceCombatMusic(); // Reuse intense beat
    }

    playOceanMusic() {
        // Ethereal, slow underwater music
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const notes = [130.81, 146.83, 164.81, 196.00, 220.00];
        let time = now;
        let noteIndex = 0;

        const playNote = () => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.frequency.value = notes[noteIndex % notes.length];
            osc.type = 'sine';

            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(this.musicVolume * 0.2, time + 1);
            gain.gain.linearRampToValueAtTime(0, time + 4);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(time);
            osc.stop(time + 4);

            noteIndex++;
            time += 2;
            this.musicTimeout = setTimeout(playNote, 2000);
        };

        playNote();
    }

    playBossMusic() {
        // Intense final boss remix
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        let time = now;
        const bassNotes = [55, 65.41, 73.42, 82.41];
        let noteIndex = 0;

        const playIntense = () => {
            // Bass
            const bass = ctx.createOscillator();
            const bassGain = ctx.createGain();
            bass.frequency.value = bassNotes[noteIndex % bassNotes.length];
            bass.type = 'square';
            bassGain.gain.setValueAtTime(this.musicVolume * 0.5, time);
            bassGain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
            bass.connect(bassGain);
            bassGain.connect(ctx.destination);
            bass.start(time);
            bass.stop(time + 0.5);

            // Lead
            const lead = ctx.createOscillator();
            const leadGain = ctx.createGain();
            lead.frequency.value = bassNotes[noteIndex % bassNotes.length] * 4;
            lead.type = 'sawtooth';
            leadGain.gain.setValueAtTime(this.musicVolume * 0.3, time);
            leadGain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
            lead.connect(leadGain);
            leadGain.connect(ctx.destination);
            lead.start(time);
            lead.stop(time + 0.3);

            noteIndex++;
            time += 0.5;
            this.musicTimeout = setTimeout(playIntense, 500);
        };

        playIntense();
    }

    stopMusic(fadeOut = true) {
        if (this.musicTimeout) {
            clearTimeout(this.musicTimeout);
            this.musicTimeout = null;
        }

        if (this.currentMusic) {
            if (fadeOut && this.currentMusic.gain) {
                this.currentMusic.gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
                setTimeout(() => {
                    if (this.currentMusic.osc) this.currentMusic.osc.stop();
                }, 500);
            } else if (this.currentMusic.osc) {
                this.currentMusic.osc.stop();
            }
            this.currentMusic = null;
        }
    }

    playSFX(type) {
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        switch(type) {
            case 'bark':
                this.playBark(now);
                break;
            case 'jump':
                this.playJump(now);
                break;
            case 'land':
                this.playLand(now);
                break;
            case 'hit':
                this.playHit(now);
                break;
            case 'explosion':
                this.playExplosion(now);
                break;
            case 'unlock':
                this.playUnlock(now);
                break;
        }
    }

    playBark(time) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.frequency.setValueAtTime(200, time);
        osc.frequency.exponentialRampToValueAtTime(150, time + 0.1);

        gain.gain.setValueAtTime(this.sfxVolume * 0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.start(time);
        osc.stop(time + 0.15);
    }

    playJump(time) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.frequency.setValueAtTime(400, time);
        osc.frequency.exponentialRampToValueAtTime(800, time + 0.1);

        gain.gain.setValueAtTime(this.sfxVolume * 0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.start(time);
        osc.stop(time + 0.15);
    }

    playLand(time) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.frequency.setValueAtTime(150, time);
        osc.type = 'square';

        gain.gain.setValueAtTime(this.sfxVolume * 0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.start(time);
        osc.stop(time + 0.1);
    }

    playHit(time) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.frequency.value = 100;
        osc.type = 'sawtooth';

        gain.gain.setValueAtTime(this.sfxVolume * 0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.start(time);
        osc.stop(time + 0.2);
    }

    playExplosion(time) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.frequency.setValueAtTime(200, time);
        osc.frequency.exponentialRampToValueAtTime(50, time + 0.3);
        osc.type = 'sawtooth';

        gain.gain.setValueAtTime(this.sfxVolume * 0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.start(time);
        osc.stop(time + 0.4);
    }

    playUnlock(time) {
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.frequency.value = freq;

            const t = time + i * 0.1;
            gain.gain.setValueAtTime(this.sfxVolume * 0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            osc.start(t);
            osc.stop(t + 0.3);
        });
    }
}

// Global instance
const audioSystem = new AudioSystem();
