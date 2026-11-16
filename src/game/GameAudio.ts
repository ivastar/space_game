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

// --- The tune: an original space-western melody, played on a flute-like sound ---
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
            case 'laser': // a blaster "pew": a quick slide from high to low
                this.tone('sawtooth', 1900, 260, 0.16, 0.22, t);
                this.tone('square', 2600, 400, 0.09, 0.1, t);
                break;
            case 'enemyLaser':
                this.tone('square', 900, 180, 0.2, 0.08, t);
                break;
            case 'sonic':
                this.tone('sine', 420, 60, 0.5, 0.5, t);
                this.tone('triangle', 840, 120, 0.4, 0.2, t);
                this.noise(0.3, 0.15, 'bandpass', 800, 200, t);
                break;
            case 'bounce':
                this.tone('triangle', 1500, 900, 0.05, 0.15, t);
                break;
            case 'explosion':
                this.noise(0.45, 0.5, 'lowpass', 1800, 90, t);
                this.tone('sine', 140, 40, 0.35, 0.5, t);
                break;
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
            case 'part':
                this.notes('triangle', [76, 83], 0.07, 0.25, t);
                break;
            case 'coin':
                this.notes('square', [83, 88], 0.08, 0.12, t);
                break;
            case 'bolt':
                this.notes('sawtooth', [64, 71, 76, 83], 0.05, 0.12, t);
                break;
            case 'token':
                this.notes('triangle', [79, 86, 91], 0.08, 0.22, t);
                break;
            case 'jumpReady':
                this.notes('triangle', [72, 76, 79, 84], 0.09, 0.25, t);
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
                this.notes('square', [81, 88], 0.07, 0.1, t + 0.05);
                break;
            case 'buy':
                this.notes('triangle', [72, 79, 84], 0.08, 0.22, t + 0.05);
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

    private playStep(step: number, at: number, stepLength: number) {
        const root = BASS[Math.floor(step / STEPS_PER_BAR)];
        const inBar = step % STEPS_PER_BAR;

        const melody = this.melodyAt.get(step);
        if (melody) this.flute(frequency(melody[0]), at, melody[1] * 2 * stepLength);

        if (inBar === 0) this.tone('triangle', frequency(root), frequency(root), stepLength * 6, 0.3, at, this.music);
        // A twangy guitar picking out the chord.
        if (inBar === 2) this.pluck(frequency(root + 12), at);
        if (inBar === 5) this.pluck(frequency(root + 19), at);
        if (inBar === 7) this.pluck(frequency(root + 12), at);

        if (this.mood === 'action') {
            if (inBar === 0 || inBar === 3 || inBar === 4) this.tone('sine', 120, 50, 0.22, 0.5, at, this.music); // drum
            if (inBar === 6) this.tone('sine', 180, 90, 0.15, 0.3, at, this.music); // higher drum
            this.noise(0.04, inBar % 2 === 0 ? 0.06 : 0.03, 'highpass', 6000, 6000, at, this.music); // shaker
        }
    }

    // A soft, breathy note with a little wobble, a bit like a wooden flute.
    private flute(freq: number, at: number, duration: number) {
        const ctx = this.ctx!;
        const end = at + duration;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.linearRampToValueAtTime(0.22, at + 0.06);
        gain.gain.setValueAtTime(0.22, Math.max(at + 0.06, end - 0.1));
        gain.gain.linearRampToValueAtTime(0.0001, end);
        gain.connect(this.music);

        const wobble = ctx.createOscillator();
        wobble.frequency.value = 5;
        const wobbleDepth = ctx.createGain();
        wobbleDepth.gain.value = freq * 0.006;
        wobble.connect(wobbleDepth);

        // The main note, plus a quiet one an octave higher.
        for (const [multiple, volume] of [[1, 1], [2, 0.12]]) {
            const osc = ctx.createOscillator();
            osc.type = multiple === 1 ? 'triangle' : 'sine';
            osc.frequency.value = freq * multiple;
            wobbleDepth.connect(osc.frequency);
            const part = ctx.createGain();
            part.gain.value = volume;
            osc.connect(part).connect(gain);
            osc.start(at);
            osc.stop(end + 0.02);
        }
        wobble.start(at);
        wobble.stop(end + 0.02);
    }

    // A plucked string: bright at first, then quickly duller and quieter.
    private pluck(freq: number, at: number) {
        const ctx = this.ctx!;
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(freq * 6, at);
        filter.frequency.exponentialRampToValueAtTime(freq * 1.5, at + 0.25);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.14, at);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.6);
        osc.connect(filter).connect(gain).connect(this.music);
        osc.start(at);
        osc.stop(at + 0.62);
    }
}

export const audio = new GameAudio();
