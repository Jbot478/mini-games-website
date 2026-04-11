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
            case 'liminal':
                this.playLiminalMusic();
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
            case 'boss_ff9':
                this.playBossFF9Music();
                break;
            case 'boss_ff8':
                this.playBossFF8Music();
                break;
            case 'ending_theme':
                this.playEndingThemeMusic();
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
        // Faster, boss-like hybrid orchestral/synth combat groove
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const beat = 0.19; // ~158 BPM
        const barDuration = beat * 16;

        const chordProgression = [
            [110.00, 130.81, 164.81], // Am
            [98.00, 123.47, 146.83],  // G
            [87.31, 110.00, 138.59],  // F
            [82.41, 103.83, 130.81]   // E
        ];

        const bassRoots = [55.00, 49.00, 43.65, 41.20];

        const leadPhrases = [
            [440.00, 493.88, 523.25, 659.25, 587.33, 523.25, 493.88, 440.00],
            [440.00, 523.25, 587.33, 698.46, 659.25, 587.33, 523.25, 493.88],
            [392.00, 440.00, 493.88, 587.33, 523.25, 493.88, 440.00, 392.00],
            [369.99, 440.00, 493.88, 523.25, 493.88, 440.00, 392.00, 369.99]
        ];

        const playTone = (freq, start, dur, type = 'sawtooth', vol = 0.1) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.linearRampToValueAtTime(this.musicVolume * vol, start + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + dur);
        };

        const playKick = (time) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(160, time);
            osc.frequency.exponentialRampToValueAtTime(45, time + 0.11);

            gain.gain.setValueAtTime(this.musicVolume * 0.65, time);
            gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(time);
            osc.stop(time + 0.12);
        };

        const playBassPulse = (time, vol = 0.12) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'square';
            osc.frequency.setValueAtTime(95, time);
            osc.frequency.exponentialRampToValueAtTime(70, time + 0.06);

            gain.gain.setValueAtTime(this.musicVolume * vol, time);
            gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(time);
            osc.stop(time + 0.08);
        };

        let barTime = now;
        let barIndex = 0;

        const scheduleBar = () => {
            const chord = chordProgression[barIndex % chordProgression.length];
            const root = bassRoots[barIndex % bassRoots.length];
            const lead = leadPhrases[barIndex % leadPhrases.length];

            // Driving drums across 16 steps
            for (let step = 0; step < 16; step++) {
                const t = barTime + step * beat;
                if (step === 0 || step === 6 || step === 8 || step === 12) {
                    playKick(t);
                }
                if (step % 2 === 1 || step === 14) {
                    playBassPulse(t + 0.01, step === 14 ? 0.16 : 0.11);
                }
            }

            // Pulsing low bassline
            for (let i = 0; i < 8; i++) {
                const t = barTime + i * beat * 2;
                const freq = i % 2 === 0 ? root : root * 1.5;
                playTone(freq, t, beat * 1.6, 'square', 0.15);
            }

            // Strings-like chord pad stabs
            for (let i = 0; i < 4; i++) {
                const t = barTime + i * beat * 4;
                chord.forEach((f, idx) => {
                    playTone(f * (idx === 0 ? 1 : 2), t + idx * 0.01, beat * 3.2, 'triangle', 0.06);
                });
            }

            // Aggressive lead phrase on top
            for (let i = 0; i < lead.length; i++) {
                const t = barTime + i * beat * 2;
                const n = lead[i];
                playTone(n, t, beat * 1.55, 'sawtooth', 0.12);
                playTone(n * 0.5, t, beat * 1.55, 'triangle', 0.035);
            }

            barIndex++;
            barTime += barDuration;
            this.musicTimeout = setTimeout(scheduleBar, barDuration * 1000);
        };

        scheduleBar();
    }

    playJungleMusic() {
        // Jungle tribe vibe: hand-drum rhythm, earthy bass, and bamboo-flute lead
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const beat = 0.24; // ~125 BPM
        const barDuration = beat * 16;

        const bassRoots = [73.42, 82.41, 87.31, 82.41]; // D, E, F, E
        const flutePhrases = [
            [293.66, 329.63, 349.23, 392.00, 349.23, 329.63, 293.66, 261.63],
            [293.66, 349.23, 392.00, 440.00, 392.00, 349.23, 329.63, 293.66],
            [261.63, 293.66, 329.63, 392.00, 349.23, 329.63, 293.66, 261.63],
            [293.66, 329.63, 349.23, 329.63, 293.66, 261.63, 246.94, 261.63]
        ];

        const playTone = (freq, start, dur, type = 'sine', vol = 0.1) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.linearRampToValueAtTime(this.musicVolume * vol, start + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + dur);
        };

        const playDrum = (time, strength = 1) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(180, time);
            osc.frequency.exponentialRampToValueAtTime(65, time + 0.09);

            gain.gain.setValueAtTime(this.musicVolume * 0.42 * strength, time);
            gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.1);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(time);
            osc.stop(time + 0.1);
        };

        let barTime = now;
        let barIndex = 0;

        const scheduleBar = () => {
            const root = bassRoots[barIndex % bassRoots.length];
            const flute = flutePhrases[barIndex % flutePhrases.length];

            // Tribal drum pattern (16-step)
            for (let step = 0; step < 16; step++) {
                const t = barTime + step * beat;
                if (step === 0 || step === 3 || step === 6 || step === 8 || step === 11 || step === 14) {
                    playDrum(t, (step === 0 || step === 8) ? 1.2 : 0.9);
                }
            }

            // Deep earthy bass pulse
            for (let i = 0; i < 8; i++) {
                const t = barTime + i * beat * 2;
                const freq = (i % 3 === 0) ? root : root * 1.25;
                playTone(freq, t, beat * 1.6, 'triangle', 0.12);
            }

            // Flute-like melody on top
            for (let i = 0; i < flute.length; i++) {
                const t = barTime + i * beat * 2;
                const n = flute[i];
                playTone(n, t, beat * 1.7, 'sine', 0.10);
                playTone(n * 2, t + 0.02, beat * 1.1, 'triangle', 0.022);
            }

            barIndex++;
            barTime += barDuration;
            this.musicTimeout = setTimeout(scheduleBar, barDuration * 1000);
        };

        scheduleBar();
    }

    playVillageMusic() {
        // FF9 Black Mage Village inspired: whimsical, magical, melancholic charm
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const beat = 0.35; // ~86 BPM, slower and more reflective
        const barDuration = beat * 8; // 2.8 seconds per bar

        // Mix of minor and major for the bittersweet, magical quality
        // Based around C minor with some major inflections
        const progression = [
            { bass: 130.81, chord: [130.81, 155.56, 196.0] },      // Cm
            { bass: 146.83, chord: [146.83, 174.61, 220.0] },      // Dm
            { bass: 164.81, chord: [164.81, 196.0, 246.94] },      // Eb (major)
            { bass: 130.81, chord: [130.81, 155.56, 196.0] }       // Cm
        ];

        const melodies = [
            // Gentle, wandering melodic phrases
            [261.63, 293.66, 329.63, 261.63, 293.66, 329.63, 261.63, 246.94],
            [329.63, 349.23, 392.0, 349.23, 329.63, 293.66, 261.63, 293.66],
            [261.63, 293.66, 349.23, 329.63, 293.66, 261.63, 246.94, 261.63],
            [349.23, 329.63, 293.66, 261.63, 293.66, 329.63, 349.23, 329.63]
        ];

        const playNote = (freq, start, dur, type = 'sine', vol = 0.13) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.linearRampToValueAtTime(this.musicVolume * vol, start + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + dur);
        };

        let barTime = now;
        let barIndex = 0;

        const scheduleBar = () => {
            const section = progression[barIndex % progression.length];
            const melody = melodies[barIndex % melodies.length];

            // Ethereal harp-like plucked chords (sparse, magical)
            for (let i = 0; i < 2; i++) {
                const t = barTime + i * 4 * beat;
                section.chord.forEach((f, idx) => {
                    playNote(f, t + idx * 0.012, 1.4, 'sine', 0.06);
                });
            }

            // Gentle, walking bass (slower, less prominent)
            for (let i = 0; i < 4; i++) {
                const t = barTime + i * 2 * beat;
                const freq = i % 2 === 0 ? section.bass : section.bass * 1.25;
                playNote(freq, t, 0.5, 'sine', 0.05);
            }

            // Wistful, wandering melody (main voice)
            for (let i = 0; i < 8; i++) {
                const t = barTime + i * beat;
                const n = melody[i];
                const dur = i === 7 ? beat * 1.5 : beat * 0.8;
                playNote(n, t, dur, 'sine', 0.10);

                // Subtle shimmer accents on melody (glissando-like feel)
                if (i % 2 === 0) {
                    playNote(n * 1.5, t + 0.05, 0.2, 'triangle', 0.025);
                }
            }

            barIndex++;
            barTime += barDuration;
            this.musicTimeout = setTimeout(scheduleBar, barDuration * 1000);
        };

        scheduleBar();
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
        // Fast chase-like climb track with punchy rhythm and urgent lead
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const beat = 0.185; // ~162 BPM
        const barDuration = beat * 16;

        const roots = [82.41, 98.00, 110.00, 98.00]; // E, G, A, G
        const leadPhrases = [
            [329.63, 392.00, 440.00, 493.88, 523.25, 493.88, 440.00, 392.00],
            [349.23, 415.30, 466.16, 523.25, 587.33, 523.25, 466.16, 415.30],
            [329.63, 392.00, 466.16, 523.25, 587.33, 523.25, 466.16, 392.00],
            [311.13, 369.99, 440.00, 493.88, 523.25, 493.88, 440.00, 369.99]
        ];

        const playTone = (freq, start, dur, type = 'sawtooth', vol = 0.1) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.linearRampToValueAtTime(this.musicVolume * vol, start + 0.008);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + dur);
        };

        const playKick = (time, strength = 1) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(170, time);
            osc.frequency.exponentialRampToValueAtTime(50, time + 0.095);

            gain.gain.setValueAtTime(this.musicVolume * 0.6 * strength, time);
            gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.1);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(time);
            osc.stop(time + 0.1);
        };

        const playSnare = (time) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(320, time);
            osc.frequency.exponentialRampToValueAtTime(180, time + 0.06);

            gain.gain.setValueAtTime(this.musicVolume * 0.23, time);
            gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(time);
            osc.stop(time + 0.08);
        };

        let barTime = now;
        let barIndex = 0;

        const scheduleBar = () => {
            const root = roots[barIndex % roots.length];
            const lead = leadPhrases[barIndex % leadPhrases.length];

            // Drum grid
            for (let step = 0; step < 16; step++) {
                const t = barTime + step * beat;
                if (step === 0 || step === 4 || step === 8 || step === 12 || step === 14) {
                    playKick(t, step === 0 || step === 8 ? 1.15 : 0.9);
                }
                if (step === 4 || step === 12) {
                    playSnare(t + 0.01);
                }
            }

            // Driving bass ostinato
            for (let i = 0; i < 8; i++) {
                const t = barTime + i * beat * 2;
                const f = i % 2 === 0 ? root : root * 1.5;
                playTone(f, t, beat * 1.7, 'square', 0.15);
            }

            // Urgent lead line
            for (let i = 0; i < lead.length; i++) {
                const t = barTime + i * beat * 2;
                const n = lead[i];
                playTone(n, t, beat * 1.55, 'sawtooth', 0.12);
                playTone(n * 0.5, t, beat * 1.55, 'triangle', 0.03);
            }

            barIndex++;
            barTime += barDuration;
            this.musicTimeout = setTimeout(scheduleBar, barDuration * 1000);
        };

        scheduleBar();
    }

    playServantsMusic() {
        // FF9 Black Mage Village inspired: whimsical, magical, melancholic charm
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const beat = 0.35; // ~86 BPM, slower and more reflective
        const barDuration = beat * 8; // 2.8 seconds per bar

        // Mix of minor and major for the bittersweet, magical quality
        // Based around C minor with some major inflections
        const progression = [
            { bass: 130.81, chord: [130.81, 155.56, 196.0] },      // Cm
            { bass: 146.83, chord: [146.83, 174.61, 220.0] },      // Dm
            { bass: 164.81, chord: [164.81, 196.0, 246.94] },      // Eb (major)
            { bass: 130.81, chord: [130.81, 155.56, 196.0] }       // Cm
        ];

        const melodies = [
            // Gentle, wandering melodic phrases
            [261.63, 293.66, 329.63, 261.63, 293.66, 329.63, 261.63, 246.94],
            [329.63, 349.23, 392.0, 349.23, 329.63, 293.66, 261.63, 293.66],
            [261.63, 293.66, 349.23, 329.63, 293.66, 261.63, 246.94, 261.63],
            [349.23, 329.63, 293.66, 261.63, 293.66, 329.63, 349.23, 329.63]
        ];

        const playNote = (freq, start, dur, type = 'sine', vol = 0.13) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.linearRampToValueAtTime(this.musicVolume * vol, start + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + dur);
        };

        let barTime = now;
        let barIndex = 0;

        const scheduleBar = () => {
            const section = progression[barIndex % progression.length];
            const melody = melodies[barIndex % melodies.length];

            // Ethereal harp-like plucked chords (sparse, magical)
            for (let i = 0; i < 2; i++) {
                const t = barTime + i * 4 * beat;
                section.chord.forEach((f, idx) => {
                    playNote(f, t + idx * 0.012, 1.4, 'sine', 0.06);
                });
            }

            // Gentle, walking bass (slower, less prominent)
            for (let i = 0; i < 4; i++) {
                const t = barTime + i * 2 * beat;
                const freq = i % 2 === 0 ? section.bass : section.bass * 1.25;
                playNote(freq, t, 0.5, 'sine', 0.05);
            }

            // Wistful, wandering melody (main voice)
            for (let i = 0; i < 8; i++) {
                const t = barTime + i * beat;
                const n = melody[i];
                const dur = i === 7 ? beat * 1.5 : beat * 0.8;
                playNote(n, t, dur, 'sine', 0.10);

                // Subtle shimmer accents on melody (glissando-like feel)
                if (i % 2 === 0) {
                    playNote(n * 1.5, t + 0.05, 0.2, 'triangle', 0.025);
                }
            }

            barIndex++;
            barTime += barDuration;
            this.musicTimeout = setTimeout(scheduleBar, barDuration * 1000);
        };

        scheduleBar();
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

    playLiminalMusic() {
        // Soft liminal ambience with a drifting pulse
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const playPad = (freq, start, dur, vol = 0.1) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.linearRampToValueAtTime(this.musicVolume * vol, start + 0.6);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + dur);
        };

        const playPulse = (freq, start) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, start);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.94, start + 0.8);

            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.linearRampToValueAtTime(this.musicVolume * 0.08, start + 0.15);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.9);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.9);
        };

        const chords = [
            [110.00, 164.81, 220.00],
            [98.00, 146.83, 196.00],
            [103.83, 155.56, 207.65],
            [87.31, 130.81, 174.61]
        ];

        let barTime = now;
        let barIndex = 0;

        const scheduleBar = () => {
            const chord = chords[barIndex % chords.length];

            chord.forEach((f, i) => {
                playPad(f, barTime + i * 0.03, 3.2, 0.09);
                playPad(f * 2, barTime + i * 0.03 + 0.1, 2.6, 0.03);
            });

            playPulse(chord[0], barTime + 0.2);
            playPulse(chord[1], barTime + 1.4);
            playPulse(chord[0], barTime + 2.3);

            barIndex++;
            barTime += 3.4;
            this.musicTimeout = setTimeout(scheduleBar, 3400);
        };

        scheduleBar();
    }

    playFlightMusic() {
        // Fast-paced danger music
        this.playSpaceCombatMusic(); // Reuse intense beat
    }

    playOceanMusic() {
        // Dreamy, nostalgic underwater waltz (JRPG-inspired mood)
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const beat = 0.36; // gentle 6/8 pulse
        const barDuration = beat * 6;

        const chords = [
            [220.00, 277.18, 329.63], // A minor-ish
            [196.00, 246.94, 329.63], // G major-ish
            [174.61, 220.00, 293.66], // F major-ish
            [196.00, 246.94, 329.63]  // G major-ish return
        ];

        const melodies = [
            [440.00, 493.88, 523.25, 587.33, 523.25, 493.88],
            [392.00, 440.00, 493.88, 523.25, 493.88, 440.00],
            [349.23, 392.00, 440.00, 493.88, 440.00, 392.00],
            [392.00, 440.00, 493.88, 523.25, 587.33, 523.25]
        ];

        const bassRoots = [110.00, 98.00, 87.31, 98.00];

        const playNote = (freq, start, dur, type = 'sine', vol = 0.1) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.linearRampToValueAtTime(this.musicVolume * vol, start + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + dur);
        };

        let barIndex = 0;
        let barTime = now;

        const scheduleBar = () => {
            const chord = chords[barIndex % chords.length];
            const melody = melodies[barIndex % melodies.length];
            const root = bassRoots[barIndex % bassRoots.length];

            // Soft pad chord (held)
            chord.forEach((f, i) => {
                playNote(f, barTime + i * 0.01, beat * 5.5, 'triangle', 0.065);
            });

            // Arpeggio pulse in 6/8 feel
            const arp = [chord[0], chord[1], chord[2], chord[1], chord[2], chord[1]];
            for (let i = 0; i < 6; i++) {
                const t = barTime + i * beat;
                playNote(arp[i], t, beat * 0.72, 'sine', 0.07);
            }

            // Warm bass anchors
            for (let i = 0; i < 3; i++) {
                const t = barTime + i * beat * 2;
                playNote(root, t, beat * 1.5, 'sine', 0.06);
            }

            // Lead melody (bell-like)
            for (let i = 0; i < 6; i++) {
                const t = barTime + i * beat;
                const n = melody[i];
                playNote(n, t + 0.015, beat * 0.78, 'triangle', 0.105);
            }

            barIndex++;
            barTime += barDuration;
            this.musicTimeout = setTimeout(scheduleBar, barDuration * 1000);
        };

        scheduleBar();
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

    playBossFF9Music() {
        // Dramatic, heroic boss groove with strong march pulse
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const beat = 0.24; // ~125 BPM
        const barDuration = beat * 8;
        const roots = [98.00, 110.00, 123.47, 110.00];
        const leads = [
            [392.00, 440.00, 493.88, 523.25, 493.88, 440.00, 392.00, 369.99],
            [415.30, 466.16, 523.25, 587.33, 523.25, 466.16, 415.30, 392.00],
            [440.00, 493.88, 523.25, 659.25, 587.33, 523.25, 493.88, 440.00],
            [392.00, 440.00, 493.88, 523.25, 493.88, 440.00, 392.00, 349.23]
        ];

        const tone = (freq, t, d, type = 'sawtooth', vol = 0.1) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.0001, t);
            gain.gain.linearRampToValueAtTime(this.musicVolume * vol, t + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + d);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + d);
        };

        let bar = now;
        let i = 0;
        const schedule = () => {
            const root = roots[i % roots.length];
            const lead = leads[i % leads.length];

            for (let s = 0; s < 8; s++) {
                const t = bar + s * beat;
                if (s === 0 || s === 3 || s === 4 || s === 6) tone(150, t, 0.11, 'sine', 0.42);
                tone(s % 2 === 0 ? root : root * 1.5, t, beat * 0.95, 'square', 0.12);
                tone(lead[s], t, beat * 0.9, 'triangle', 0.1);
            }

            i++;
            bar += barDuration;
            this.musicTimeout = setTimeout(schedule, barDuration * 1000);
        };

        schedule();
    }

    playBossFF8Music() {
        // Darker, urgent synth-orchestral final duel pulse
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const beat = 0.19; // ~158 BPM
        const barDuration = beat * 16;
        const roots = [82.41, 92.50, 98.00, 92.50];
        const lead = [
            [329.63, 392.00, 466.16, 523.25, 587.33, 523.25, 466.16, 392.00],
            [311.13, 369.99, 440.00, 493.88, 523.25, 493.88, 440.00, 369.99],
            [349.23, 415.30, 466.16, 587.33, 523.25, 466.16, 415.30, 349.23],
            [329.63, 392.00, 440.00, 523.25, 493.88, 440.00, 392.00, 329.63]
        ];

        const tone = (freq, t, d, type = 'sawtooth', vol = 0.1) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.0001, t);
            gain.gain.linearRampToValueAtTime(this.musicVolume * vol, t + 0.008);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + d);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + d);
        };

        let bar = now;
        let i = 0;
        const schedule = () => {
            const root = roots[i % roots.length];
            const phrase = lead[i % lead.length];

            for (let s = 0; s < 16; s++) {
                const t = bar + s * beat;
                if (s === 0 || s === 4 || s === 8 || s === 12 || s === 14) tone(160, t, 0.1, 'sine', 0.5);
                if (s === 4 || s === 12) tone(260, t + 0.01, 0.08, 'triangle', 0.18);
                tone(s % 2 === 0 ? root : root * 1.5, t, beat * 1.25, 'square', 0.13);
            }

            for (let n = 0; n < phrase.length; n++) {
                const t = bar + n * beat * 2;
                tone(phrase[n], t, beat * 1.45, 'sawtooth', 0.11);
                tone(phrase[n] * 0.5, t, beat * 1.45, 'triangle', 0.028);
            }

            i++;
            bar += barDuration;
            this.musicTimeout = setTimeout(schedule, barDuration * 1000);
        };

        schedule();
    }

    playEndingThemeMusic() {
        // Bright, playful end theme
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const beat = 0.24;
        const barDuration = beat * 16;
        const chords = [
            [523.25, 659.25, 783.99],
            [587.33, 739.99, 880.00],
            [659.25, 830.61, 987.77],
            [587.33, 739.99, 880.00]
        ];

        const tone = (freq, t, d, type = 'sine', vol = 0.08) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.0001, t);
            gain.gain.linearRampToValueAtTime(this.musicVolume * vol, t + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + d);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + d);
        };

        let bar = now;
        let i = 0;
        const schedule = () => {
            const chord = chords[i % chords.length];

            for (let s = 0; s < 16; s++) {
                const t = bar + s * beat;
                if (s % 4 === 0) tone(220, t, 0.18, 'triangle', 0.08);
                tone(chord[s % chord.length], t, beat * 1.4, 'sine', 0.1);
                if (s === 8 || s === 12) tone(chord[0] * 2, t + 0.02, 0.12, 'triangle', 0.04);
            }

            i++;
            bar += barDuration;
            this.musicTimeout = setTimeout(schedule, barDuration * 1000);
        };

        schedule();
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
            case 'slam':
                this.playSlam(now);
                break;
        }
    }

    playSlam(time) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(160, time);
        osc.frequency.exponentialRampToValueAtTime(45, time + 0.18);

        gain.gain.setValueAtTime(this.sfxVolume * 0.35, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.22);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.start(time);
        osc.stop(time + 0.22);
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
