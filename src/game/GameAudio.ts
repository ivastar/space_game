import * as Phaser from 'phaser';
import { SFX_VOLUME, MUSIC_VOLUME, MUSIC_TEMPO, MUTE_KEY } from '../config';

export type SoundName =
    | 'laser' | 'enemyLaser' | 'sonic' | 'bounce'
    | 'explosion' | 'hit' | 'die' | 'zap'
    | 'part' | 'coin' | 'bolt' | 'token' | 'jumpReady'
    | 'jump' | 'jumpEnd' | 'noJump' | 'arrive'
    | 'click' | 'sell' | 'buy' | 'build';

// calm: menu, map and station. action: flying a level (adds drums).
export type MusicMood = 'calm' | 'action';

// --- The tune: an original space-western melody, picked out quietly on a guitar-like sound ---
// [note, beats]. Notes are MIDI numbers (60 = middle C); 0 is a rest. 8 bars of 4 beats.
const MELODY: [number, number][] = [
    [64, 1.5], [67, 0.5], [69, 2],
    [71, 1], [69, 0.5], [67, 0.5], [64, 2],
    [62, 1], [64, 1], [67, 1], [69, 0.5], [67, 0.5],
    [64, 3], [0, 1],
    [71, 1.5], [74, 0.5], [71, 2],
    [69, 1], [67, 1], [69, 1], [71, 1],
    [67, 1], [64, 1], [62, 2],
    [64, 3], [0, 1],
];
const BASS = [40, 40, 43, 40, 43, 38, 36, 40]; // one low note per bar
const STEPS_PER_BAR = 8; // the music is scheduled in half-beats
const TOTAL_STEPS = BASS.length * STEPS_PER_BAR;

const frequency = (note: number) => 440 * Math.pow(2, (note - 69) / 12);

// All the game's sounds and music. Nothing is loaded from files: every sound is
// built from simple waves and noise, like an old synthesizer.
class GameAudio {
    private ctx: AudioContext | null = null;
    private master!: GainNode; // everything goes through here; the mute button turns it to 0
    private sfx!: GainNode;
    private echo!: GainNode; // sounds sent here also bounce back a few times, like in a big empty space
    private music!: GainNode;
    private noiseBuffer!: AudioBuffer;
    private isMuted = false;

    private mood: MusicMood | null = null;
    private step = 0;
    private nextStepAt = 0;
    private melodyAt = new Map<number, [number, number]>(); // step -> [note, beats]

    // Called once when the game boots. Phaser already wakes the sound up on the
    // first tap or key press (browsers and iPads don't allow sound before that).
    init(game: Phaser.Game) {
        if (this.ctx || !(game.sound instanceof Phaser.Sound.WebAudioSoundManager)) return;
        const ctx = game.sound.context;
        this.ctx = ctx;

        this.master = ctx.createGain();
        this.master.connect(ctx.destination);
        this.sfx = ctx.createGain();
        this.sfx.gain.value = SFX_VOLUME;
        this.sfx.connect(this.master);
        // The echo: a short delay that feeds back into itself, getting quieter and duller each time.
        this.echo = ctx.createGain();
        const delay = ctx.createDelay();
        delay.delayTime.value = 0.13;
        const feedback = ctx.createGain();
        feedback.gain.value = 0.35;
        const dull = ctx.createBiquadFilter();
        dull.type = 'lowpass';
        dull.frequency.value = 2200;
        this.echo.connect(delay);
        delay.connect(dull).connect(feedback).connect(delay);
        dull.connect(this.sfx);

        this.music = ctx.createGain();
        this.music.gain.value = MUSIC_VOLUME;
        this.music.connect(this.master);

        // Two seconds of hiss, used for explosions, whooshes and drums.
        this.noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
        const samples = this.noiseBuffer.getChannelData(0);
        for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;

        let step = 0;
        for (const [note, beats] of MELODY) {
            if (note > 0) this.melodyAt.set(step, [note, beats]);
            step += beats * 2;
        }

        try {
            this.isMuted = localStorage.getItem(MUTE_KEY) === 'yes';
        } catch {
            // the browser won't let us remember; start with sound on
        }
        this.master.gain.value = this.isMuted ? 0 : 1;

        game.events.on(Phaser.Core.Events.STEP, () => this.scheduleMusic());

        // Browsers keep sound asleep until you tap or press a key. Phaser wakes it on the
        // first tap, but we also try on every tap and key press, in case that one was missed
        // or the browser put the sound back to sleep (iPads do this when you switch apps).
        const wake = () => {
            if (ctx.state !== 'running') ctx.resume().catch(() => undefined);
        };
        for (const event of ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown']) {
            window.addEventListener(event, wake, true);
        }
    }

    get muted() {
        return this.isMuted;
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.ctx) this.master.gain.value = this.isMuted ? 0 : 1;
        try {
            localStorage.setItem(MUTE_KEY, this.isMuted ? 'yes' : 'no');
        } catch {
            // can't remember it, never mind
        }
    }

    playMusic(mood: MusicMood) {
        this.mood = mood;
    }

    play(name: SoundName) {
        if (!this.ctx || this.isMuted) return;
        const t = this.ctx.currentTime;
        switch (name) {
            case 'laser':
                this.blaster(t, 1, 0.2);
                break;
            case 'enemyLaser':
                this.blaster(t, 0.55, 0.09);
                break;
            case 'sonic':
                this.tone('sine', 420, 60, 0.5, 0.5, t);
                this.tone('triangle', 840, 120, 0.4, 0.2, t);
                this.noise(0.3, 0.15, 'bandpass', 800, 200, t);
                break;
            case 'bounce':
                this.tone('triangle', 1500, 900, 0.05, 0.15, t);
                break;
            case 'explosion': { // a short, soft "poof" (a little different each time)
                const pitch = 0.8 + Math.random() * 0.4;
                this.noise(0.28, 0.3, 'lowpass', 1400 * pitch, 120, t);
                this.tone('sine', 110 * pitch, 45, 0.22, 0.3, t);
                break;
            }
            case 'hit':
                this.noise(0.25, 0.4, 'lowpass', 2500, 300, t);
                this.tone('square', 320, 80, 0.3, 0.2, t);
                break;
            case 'die':
                this.noise(1.1, 0.6, 'lowpass', 2200, 50, t);
                this.tone('sine', 180, 30, 0.9, 0.6, t);
                this.tone('sawtooth', 500, 50, 0.8, 0.15, t);
                break;
            case 'zap':
                this.noise(0.4, 0.3, 'highpass', 3000, 800, t);
                this.tone('sawtooth', 1200, 100, 0.4, 0.15, t);
                break;
            // Pickups are all soft, bright chimes, so they sound nothing like the crashes.
            case 'part':
                this.chime([84, 91], 0.06, 0.2, t);
                break;
            case 'coin':
                this.chime([83, 88], 0.08, 0.22, t);
                break;
            case 'bolt':
                this.chime([76, 80, 83, 88], 0.05, 0.18, t);
                break;
            case 'token':
                this.chime([79, 86], 0.09, 0.22, t);
                break;
            case 'jumpReady':
                this.chime([72, 76, 79, 84], 0.1, 0.24, t);
                break;
            case 'jump': // the hyperdrive winding up
                this.noise(1.6, 0.4, 'bandpass', 150, 5000, t);
                this.tone('sawtooth', 60, 900, 1.3, 0.15, t);
                break;
            case 'jumpEnd':
                this.noise(0.5, 0.3, 'lowpass', 3000, 200, t);
                this.tone('sine', 200, 40, 0.5, 0.5, t);
                break;
            case 'noJump':
                this.tone('square', 160, 120, 0.15, 0.15, t);
                break;
            case 'arrive':
                this.notes('triangle', [64, 67, 71, 76], 0.16, 0.3, t);
                this.notes('square', [52, 55, 59, 64], 0.16, 0.08, t);
                break;
            case 'click':
                this.tone('triangle', 500, 350, 0.05, 0.2, t);
                break;
            case 'sell':
                this.chime([81, 88], 0.07, 0.18, t + 0.05);
                break;
            case 'buy':
                this.chime([72, 79, 84], 0.08, 0.2, t + 0.05);
                break;
            case 'build':
                this.noise(0.12, 0.25, 'highpass', 2500, 2500, t);
                this.notes('square', [60, 64, 67, 72, 76], 0.09, 0.1, t + 0.1);
                break;
        }
    }

    // --- Building blocks ---

    // One beep that slides from one pitch to another and fades out.
    private tone(wave: OscillatorType, from: number, to: number, duration: number, volume: number, at: number, out = this.sfx) {
        const ctx = this.ctx!;
        const osc = ctx.createOscillator();
        osc.type = wave;
        osc.frequency.setValueAtTime(from, at);
        osc.frequency.exponentialRampToValueAtTime(to, at + duration);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.exponentialRampToValueAtTime(volume, at + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
        osc.connect(gain).connect(out);
        osc.start(at);
        osc.stop(at + duration + 0.02);
    }

    // A laser blaster: a hard "crack" at the start, then a buzzy note that dives from high
    // to low through a ringing filter, with an echo. pitch 1 is yours; lower is deeper.
    // Every shot is tuned slightly differently, so holding fire doesn't sound like a machine.
    private blaster(at: number, pitch: number, volume: number) {
        const ctx = this.ctx!;
        const p = pitch * (0.94 + Math.random() * 0.12);
        const length = 0.24;

        const out = ctx.createGain();
        out.gain.setValueAtTime(volume, at);
        out.gain.exponentialRampToValueAtTime(0.0001, at + length);
        out.connect(this.sfx);
        const send = ctx.createGain();
        send.gain.value = 0.5;
        out.connect(send).connect(this.echo);

        // The ringing filter follows the note down, which gives the "pyew" shape.
        const ring = ctx.createBiquadFilter();
        ring.type = 'bandpass';
        ring.Q.value = 5;
        ring.frequency.setValueAtTime(3200 * p, at);
        ring.frequency.exponentialRampToValueAtTime(350 * p, at + length);
        ring.connect(out);

        // A fast wobble on the pitch makes it growl instead of whistle.
        const growl = ctx.createOscillator();
        growl.frequency.value = 85;
        const growlDepth = ctx.createGain();
        growlDepth.gain.setValueAtTime(260 * p, at);
        growlDepth.gain.exponentialRampToValueAtTime(20, at + length);
        growl.connect(growlDepth);

        // Two buzzy notes a fifth apart, diving together.
        for (const [wave, top] of [['sawtooth', 1500], ['square', 2250]] as const) {
            const osc = ctx.createOscillator();
            osc.type = wave;
            osc.frequency.setValueAtTime(top * p, at);
            osc.frequency.exponentialRampToValueAtTime(top * p * 0.12, at + length * 0.8);
            growlDepth.connect(osc.frequency);
            osc.connect(ring);
            osc.connect(out); // a little unfiltered, for body
            osc.start(at);
            osc.stop(at + length + 0.02);
        }
        growl.start(at);
        growl.stop(at + length + 0.02);

        this.noise(0.03, volume * 1.2, 'highpass', 3500, 3500, at); // the "crack"
    }

    // Bell-like notes that ring into each other: used for everything you pick up.
    private chime(midi: number[], each: number, volume: number, at: number) {
        const ctx = this.ctx!;
        midi.forEach((note, i) => {
            const start = at + i * each;
            const ringFor = i === midi.length - 1 ? 0.5 : 0.3;
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.linearRampToValueAtTime(volume, start + 0.006);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + ringFor);
            gain.connect(this.sfx);
            // The note itself plus two quieter, higher ones give it a bell's shine.
            for (const [multiple, level] of [[1, 1], [2, 0.35], [3, 0.12]]) {
                const osc = ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.value = frequency(note) * multiple;
                const part = ctx.createGain();
                part.gain.value = level;
                osc.connect(part).connect(gain);
                osc.start(start);
                osc.stop(start + ringFor + 0.02);
            }
        });
    }

    // A quick run of notes, one after another (a jingle).
    private notes(wave: OscillatorType, midi: number[], each: number, volume: number, at: number) {
        midi.forEach((note, i) => {
            const f = frequency(note);
            // The last note rings a little longer.
            this.tone(wave, f, f, i === midi.length - 1 ? each * 2.5 : each, volume, at + i * each);
        });
    }

    // A burst of hiss through a filter that sweeps from one frequency to another.
    private noise(duration: number, volume: number, type: BiquadFilterType, from: number, to: number, at: number, out = this.sfx) {
        const ctx = this.ctx!;
        const source = ctx.createBufferSource();
        source.buffer = this.noiseBuffer;
        source.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = type;
        filter.frequency.setValueAtTime(from, at);
        filter.frequency.exponentialRampToValueAtTime(to, at + duration);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(volume, at);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
        source.connect(filter).connect(gain).connect(out);
        source.start(at, Math.random());
        source.stop(at + duration + 0.02);
    }

    // --- Music ---

    // Called every frame. Lines up the next quarter of a second of music, so the
    // rhythm stays steady even if the game stutters.
    private scheduleMusic() {
        if (!this.ctx || !this.mood) return;
        const now = this.ctx.currentTime;
        const stepLength = 60 / MUSIC_TEMPO / 2;
        if (this.nextStepAt < now) this.nextStepAt = now + 0.05; // we fell behind (e.g. the tab was hidden)
        while (this.nextStepAt < now + 0.25) {
            this.playStep(this.step, this.nextStepAt, stepLength);
            this.step = (this.step + 1) % TOTAL_STEPS;
            this.nextStepAt += stepLength;
        }
    }

    // The music stays in the background: a low pulse, a soft held chord, and a guitar that
    // picks out the tune for the first half of every loop and then rests.
    private playStep(step: number, at: number, stepLength: number) {
        const bar = Math.floor(step / STEPS_PER_BAR);
        const root = BASS[bar];
        const inBar = step % STEPS_PER_BAR;

        if (inBar === 0) {
            this.tone('triangle', frequency(root), frequency(root), stepLength * 3, 0.28, at, this.music);
            this.pad(frequency(root + 12), at, stepLength * STEPS_PER_BAR);
            this.pad(frequency(root + 19), at, stepLength * STEPS_PER_BAR);
        }
        if (inBar === 5) this.tone('triangle', frequency(root), frequency(root), stepLength * 2, 0.16, at, this.music);

        // The tune, an octave down, for the first four bars only.
        const melody = this.melodyAt.get(step);
        if (melody && bar < 4) this.pluck(frequency(melody[0] - 12), at, 0.12, 0.9);
        // In the other four bars, just a quiet twang now and then.
        if (bar >= 4 && inBar === 3) this.pluck(frequency(root + 19), at, 0.07, 0.6);
        if (bar >= 4 && inBar === 6) this.pluck(frequency(root + 24), at, 0.07, 0.6);

        if (this.mood === 'action') {
            if (inBar === 0 || inBar === 3 || inBar === 4) this.tone('sine', 110, 48, 0.22, 0.45, at, this.music); // low drum
            if (inBar % 2 === 0) this.noise(0.03, 0.025, 'highpass', 7000, 7000, at, this.music); // shaker
        }
    }

    // A soft, steady hum that fades in and out slowly.
    private pad(freq: number, at: number, duration: number) {
        const ctx = this.ctx!;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.linearRampToValueAtTime(0.05, at + duration * 0.4);
        gain.gain.linearRampToValueAtTime(0.0001, at + duration);
        osc.connect(gain).connect(this.music);
        osc.start(at);
        osc.stop(at + duration + 0.02);
    }

    // A plucked string: bright at first, then quickly duller and quieter.
    private pluck(freq: number, at: number, volume: number, ringFor: number) {
        const ctx = this.ctx!;
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(freq * 6, at);
        filter.frequency.exponentialRampToValueAtTime(freq * 1.5, at + 0.25);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(volume, at);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + ringFor);
        osc.connect(filter).connect(gain).connect(this.music);
        osc.start(at);
        osc.stop(at + ringFor + 0.02);
    }
}

export const audio = new GameAudio();
