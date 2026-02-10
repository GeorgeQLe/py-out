export class AudioManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.volume = 0.3;
    }

    _ensureContext() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    _playTone(freq, duration, type = 'square', vol = this.volume) {
        if (!this.enabled) return;
        this._ensureContext();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + duration);
    }

    _playNoise(duration, vol = this.volume * 0.5) {
        if (!this.enabled) return;
        this._ensureContext();

        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        source.connect(gain);
        gain.connect(this.ctx.destination);
        source.start();
    }

    playMove() {
        this._playTone(200, 0.05, 'sine', this.volume * 0.2);
    }

    playShot() {
        this._playNoise(0.15);
        this._playTone(150, 0.1, 'sawtooth', this.volume * 0.4);
    }

    playHit() {
        this._playTone(300, 0.08, 'square', this.volume * 0.3);
        this._playTone(150, 0.12, 'square', this.volume * 0.2);
    }

    playMiss() {
        this._playTone(100, 0.15, 'sine', this.volume * 0.15);
    }

    playCritical() {
        this._playTone(600, 0.05, 'square', this.volume * 0.4);
        setTimeout(() => this._playTone(800, 0.08, 'square', this.volume * 0.3), 60);
        setTimeout(() => this._playTone(1000, 0.1, 'square', this.volume * 0.2), 120);
    }

    playDeath() {
        this._playTone(400, 0.1, 'sawtooth', this.volume * 0.3);
        setTimeout(() => this._playTone(200, 0.15, 'sawtooth', this.volume * 0.3), 100);
        setTimeout(() => this._playTone(100, 0.3, 'sawtooth', this.volume * 0.2), 200);
    }

    playPickup() {
        this._playTone(400, 0.05, 'sine', this.volume * 0.3);
        setTimeout(() => this._playTone(600, 0.05, 'sine', this.volume * 0.2), 50);
    }

    playMenuSelect() {
        this._playTone(500, 0.04, 'square', this.volume * 0.2);
    }

    playMenuMove() {
        this._playTone(300, 0.03, 'sine', this.volume * 0.1);
    }

    playDoorOpen() {
        this._playTone(150, 0.08, 'triangle', this.volume * 0.2);
        setTimeout(() => this._playTone(200, 0.08, 'triangle', this.volume * 0.2), 80);
    }

    playLevelUp() {
        const notes = [400, 500, 600, 800];
        notes.forEach((freq, i) => {
            setTimeout(() => this._playTone(freq, 0.12, 'square', this.volume * 0.3), i * 100);
        });
    }

    playQuestComplete() {
        const notes = [500, 600, 700, 900, 1100];
        notes.forEach((freq, i) => {
            setTimeout(() => this._playTone(freq, 0.15, 'sine', this.volume * 0.3), i * 120);
        });
    }

    toggle() {
        this.enabled = !this.enabled;
    }
}
