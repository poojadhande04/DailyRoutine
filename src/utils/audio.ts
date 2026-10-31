/**
 * Native Web Audio synthesizer for tactile kinetic feedback.
 * No external files required.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private noiseNode: AudioNode | null = null;
  private binauralOscs: OscillatorNode[] = [];
  private ambientGain: GainNode | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  // Tactile micro-click for card toggles
  public playClick() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // Ignore audio context autoplay warnings
    }
  }

  // Harmonic chord chime for habit completion (dopamine surge)
  public playSuccessChime() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Synthesize clean pentatonic arpeggio (C5, E5, G5, B5, D6)
      const freqs = [523.25, 659.25, 783.99, 987.77, 1174.66];
      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        gain.gain.setValueAtTime(0, now);
        gain.gain.setValueAtTime(0.14, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.55);
      });
    } catch {
      // Ignore
    }
  }

  // Grand triumph sound when completing all habits in a day (100% Orbit)
  public playOrbitComplete() {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);

        gain.gain.setValueAtTime(0.18, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.85);
      });
    } catch {
      // Ignore
    }
  }

  // Deep breath tick for guided breathwork
  public playBreathGuide(isInhale: boolean) {
    if (!this.soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      if (isInhale) {
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 1.2);
      } else {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 1.2);
      }

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.2);
    } catch {
      // Ignore
    }
  }

  // Synthesize Gamma 40Hz binaural beats for focus sessions
  public startAmbientFocus(type: 'binaural' | 'darknoise') {
    try {
      this.initCtx();
      if (!this.ctx) return;
      this.stopAmbientFocus();

      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      masterGain.connect(this.ctx.destination);
      this.ambientGain = masterGain;

      if (type === 'binaural') {
        // Base carrier 200Hz, left ear 200Hz, right ear 240Hz (40Hz Gamma wave difference)
        const oscL = this.ctx.createOscillator();
        const oscR = this.ctx.createOscillator();
        const merger = this.ctx.createChannelMerger(2);

        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(200, this.ctx.currentTime);
        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(240, this.ctx.currentTime);

        oscL.connect(merger, 0, 0); // left channel
        oscR.connect(merger, 0, 1); // right channel
        merger.connect(masterGain);

        oscL.start();
        oscR.start();
        this.binauralOscs = [oscL, oscR];
      } else {
        // Synthesize brown/pink noise for deep immersion
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5; // Gain compensation
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        // Lowpass filter for smooth deep rumble
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, this.ctx.currentTime);

        noise.connect(filter);
        filter.connect(masterGain);
        noise.start();
        this.noiseNode = noise;
      }
    } catch {
      // Ignore
    }
  }

  public stopAmbientFocus() {
    try {
      this.binauralOscs.forEach(o => {
        try { o.stop(); o.disconnect(); } catch {}
      });
      this.binauralOscs = [];
      if (this.noiseNode) {
        try { (this.noiseNode as AudioScheduledSourceNode).stop(); this.noiseNode.disconnect(); } catch {}
        this.noiseNode = null;
      }
      if (this.ambientGain) {
        try { this.ambientGain.disconnect(); } catch {}
        this.ambientGain = null;
      }
    } catch {
      // Ignore
    }
  }
}

export const sound = new SoundEngine();
