class SoundEffects {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private isSoundEnabled(): boolean {
    const saved = localStorage.getItem('numsenseParentSettings');
    if (!saved) return true;
    try {
      const parsed = JSON.parse(saved);
      return parsed.soundEnabled !== false;
    } catch {
      return true;
    }
  }

  playClick() {
    if (!this.isSoundEnabled()) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);
      
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.warn('Web Audio PlayClick failed:', e);
    }
  }

  playSuccess() {
    if (!this.isSoundEnabled()) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      
      // Chime: 3 notes rising (C5 -> E5 -> G5)
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.06);
        
        const startTime = now + index * 0.06;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.1, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + 0.2);
      });
    } catch (e) {
      console.warn('Web Audio PlaySuccess failed:', e);
    }
  }

  playWrong() {
    if (!this.isSoundEnabled()) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      
      // Low buzzer sound falling
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.22);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, now);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(now + 0.22);
    } catch (e) {
      console.warn('Web Audio PlayWrong failed:', e);
    }
  }

  playComplete() {
    if (!this.isSoundEnabled()) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      
      // Triumphant arpeggio
      const melody = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      melody.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);
        
        const startTime = now + index * 0.08;
        const duration = index === melody.length - 1 ? 0.5 : 0.15;
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch (e) {
      console.warn('Web Audio PlayComplete failed:', e);
    }
  }
}

export const sounds = new SoundEffects();
export default sounds;
