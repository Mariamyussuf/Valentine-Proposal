
class AudioService {
  private ctx: AudioContext | null = null;
  private ambientOscillators: OscillatorNode[] = [];
  private ambientGain: GainNode | null = null;
  private isMuted: boolean = false;
  private lastNoiseVal: number = 0; // For pink noise generation

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Cinematic Impact Sound (Deep Boom + Noise)
  playDramaticBoom() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    // 1. Sub-bass Drop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.exponentialRampToValueAtTime(20, t + 1.5);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

    osc.start(t);
    osc.stop(t + 1.5);

    // 2. Cinematic Impact Noise (Thud)
    const bufferSize = this.ctx.sampleRate * 1.0; 
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Simple noise generation
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(600, t);
    noiseFilter.frequency.exponentialRampToValueAtTime(50, t + 0.6);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.5, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(t);
  }

  playClick() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    // Higher pitch, cleaner UI sound
    osc.frequency.setValueAtTime(1000, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playHover() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.05);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playGlitch() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, t);
    // Random chaotic pitch jumps
    osc.frequency.linearRampToValueAtTime(800, t + 0.05);
    osc.frequency.linearRampToValueAtTime(200, t + 0.1);
    osc.frequency.linearRampToValueAtTime(50, t + 0.15);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  playSuccess() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    
    // 1. Play Impact Boom immediately
    this.playDramaticBoom();

    // 2. Majestic Chord Swell (Ethereal Pads)
    // C Major 9: C, E, G, B, D
    const notes = [261.63, 329.63, 392.00, 493.88, 587.33, 523.25]; // C4, E4, G4, B4, D5, C5

    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      // Slight detune for richness
      osc.frequency.value = freq + (Math.random() * 3 - 1.5); 
      osc.type = 'triangle'; // Softer than saw, richer than sine

      // Filter sweep for "opening up" sound
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, t);
      filter.frequency.exponentialRampToValueAtTime(8000, t + 2); // 2 second swell
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      // Slow attack, long release
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.08, t + 0.5); // Fade in
      gain.gain.exponentialRampToValueAtTime(0.001, t + 5.0); // Long tail

      osc.start(t);
      osc.stop(t + 5.0);
    });

    // 3. High Sparkling Arpeggio
    const arpNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    arpNotes.forEach((freq, i) => {
        setTimeout(() => {
            if(!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.5);
        }, i * 80); // Fast ripple
    });
  }

  startAmbient() {
    this.init();
    if (!this.ctx || this.ambientOscillators.length > 0) return;

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.connect(this.ctx.destination);
    this.ambientGain.gain.setValueAtTime(0.02, this.ctx.currentTime); 

    // Deep Drone (Binaural)
    // 55Hz = A1 (Low)
    const freqs = [55, 55.5, 110, 111]; 
    freqs.forEach((f, i) => {
      if (!this.ctx || !this.ambientGain) return;
      const osc = this.ctx.createOscillator();
      osc.type = f > 100 ? 'triangle' : 'sine'; // Highs get triangle for texture
      osc.frequency.value = f;
      // Pan alternate oscillators slightly
      const panner = this.ctx.createStereoPanner();
      panner.pan.value = i % 2 === 0 ? -0.3 : 0.3;
      
      osc.connect(panner);
      panner.connect(this.ambientGain);
      
      osc.start();
      this.ambientOscillators.push(osc);
    });
  }

  stopAmbient() {
    this.ambientOscillators.forEach(osc => {
        try {
            osc.stop();
        } catch(e) {}
    });
    this.ambientOscillators = [];
    if (this.ambientGain) {
      this.ambientGain.disconnect();
      this.ambientGain = null;
    }
  }
}

export const audio = new AudioService();
