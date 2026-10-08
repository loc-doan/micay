// src/systems/AudioSystem.js
// Manages all audio (sound effects + music) using Phaser's audio system

export class AudioSystem {
  constructor(scene) {
    this.scene = scene;
    this.sounds = {};
    this.musicTrack = null;
    this.soundEnabled = true;
    this.musicEnabled = true;
  }

  init(soundEnabled = true, musicEnabled = true) {
    this.soundEnabled = soundEnabled;
    this.musicEnabled = musicEnabled;
    this._registerSounds();
  }

  _registerSounds() {
    // Register all sound keys (will use Web Audio API tones if no files)
    const soundKeys = [
      'click', 'pickup', 'drop', 'cook_start', 'cook_done',
      'serve', 'money', 'customer_leave', 'level_complete', 'level_fail',
      'customer_arrive', 'wrong_dish'
    ];

    soundKeys.forEach(key => {
      if (this.scene.cache.audio.exists(key)) {
        this.sounds[key] = this.scene.sound.add(key, { volume: 0.5 });
      }
    });
  }

  play(key, config = {}) {
    if (!this.soundEnabled) return;
    if (this.sounds[key]) {
      this.sounds[key].play(config);
    } else {
      // Synthesize a tone using Web Audio API as fallback
      this._playTone(key);
    }
  }

  _playTone(key) {
    try {
      const ctx = this.scene.sound.context;
      if (!ctx) return;

      const toneMap = {
        click: { freq: 800, duration: 0.05, type: 'sine' },
        pickup: { freq: 600, duration: 0.08, type: 'sine' },
        drop: { freq: 300, duration: 0.1, type: 'sine' },
        cook_start: { freq: 400, duration: 0.15, type: 'sawtooth' },
        cook_done: { freq: [523, 659, 784], duration: 0.1, type: 'sine' },
        serve: { freq: [659, 784], duration: 0.12, type: 'sine' },
        money: { freq: [784, 1047], duration: 0.1, type: 'sine' },
        customer_leave: { freq: [400, 300, 250], duration: 0.15, type: 'sine' },
        level_complete: { freq: [523, 659, 784, 1047], duration: 0.12, type: 'sine' },
        level_fail: { freq: [400, 300, 200], duration: 0.2, type: 'sawtooth' },
        customer_arrive: { freq: 500, duration: 0.06, type: 'sine' },
        wrong_dish: { freq: [300, 250], duration: 0.15, type: 'square' }
      };

      const config = toneMap[key];
      if (!config) return;

      const freqs = Array.isArray(config.freq) ? config.freq : [config.freq];
      freqs.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.type = config.type;
        oscillator.frequency.value = freq;
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime + i * config.duration);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (i + 1) * config.duration);
        oscillator.start(ctx.currentTime + i * config.duration);
        oscillator.stop(ctx.currentTime + (i + 1) * config.duration);
      });
    } catch (e) {
      // Silently fail if Web Audio API is not available
    }
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
  }

  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    if (this.musicTrack) {
      if (enabled) {
        this.musicTrack.resume();
      } else {
        this.musicTrack.pause();
      }
    }
  }

  destroy() {
    Object.values(this.sounds).forEach(s => s.destroy());
    if (this.musicTrack) this.musicTrack.destroy();
  }
}

export default AudioSystem;

