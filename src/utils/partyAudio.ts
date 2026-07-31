// Web Audio API Synthesizer for 6B Party Music Loops

class PartyAudioSynth {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentTrackIndex: number = 0;
  private timerId: number | null = null;
  private volume: number = 0.3;
  private step: number = 0;

  private tracks = [
    {
      name: "电音狂欢 (Cyber Beats)",
      bpm: 124,
      bassNotes: [110, 110, 146.83, 146.83, 130.81, 130.81, 164.81, 164.81],
      melodyNotes: [440, 523.25, 659.25, 523.25, 587.33, 659.25, 783.99, 659.25],
    },
    {
      name: "阳光海滩 (Tropical Party)",
      bpm: 110,
      bassNotes: [130.81, 164.81, 196.00, 164.81, 146.83, 174.61, 220.00, 174.61],
      melodyNotes: [523.25, 587.33, 659.25, 783.99, 880.00, 783.99, 659.25, 587.33],
    },
    {
      name: "星空舞会 (Disco Night)",
      bpm: 128,
      bassNotes: [97.99, 97.99, 130.81, 130.81, 110.00, 110.00, 146.83, 146.83],
      melodyNotes: [659.25, 783.99, 880.00, 1046.50, 880.00, 783.99, 659.25, 523.25],
    },
  ];

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public startTrack(trackIndex: number = 0) {
    const ctx = this.getContext();
    if (!ctx) return;

    this.stopTrack();
    this.currentTrackIndex = trackIndex % this.tracks.length;
    this.isPlaying = true;
    this.step = 0;

    const track = this.tracks[this.currentTrackIndex];
    const intervalMs = (60 / track.bpm / 2) * 1000;

    this.timerId = window.setInterval(() => {
      this.playStep(track);
      this.step = (this.step + 1) % 16;
    }, intervalMs);
  }

  private playStep(track: typeof this.tracks[0]) {
    const ctx = this.ctx;
    if (!ctx || !this.isPlaying) return;

    const now = ctx.currentTime;

    // 1. Kick Drum on beats 0, 4, 8, 12
    if (this.step % 4 === 0) {
      const kickOsc = ctx.createOscillator();
      const kickGain = ctx.createGain();
      kickOsc.frequency.setValueAtTime(150, now);
      kickOsc.frequency.exponentialRampToValueAtTime(0.01, now + 0.15);
      kickGain.gain.setValueAtTime(this.volume * 1.2, now);
      kickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      kickOsc.connect(kickGain);
      kickGain.connect(ctx.destination);
      kickOsc.start(now);
      kickOsc.stop(now + 0.15);
    }

    // 2. Snare / Clapp on beats 2, 6, 10, 14
    if (this.step % 4 === 2) {
      const snareOsc = ctx.createOscillator();
      const snareGain = ctx.createGain();
      snareOsc.type = 'triangle';
      snareOsc.frequency.setValueAtTime(220, now);
      snareGain.gain.setValueAtTime(this.volume * 0.5, now);
      snareGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

      snareOsc.connect(snareGain);
      snareGain.connect(ctx.destination);
      snareOsc.start(now);
      snareOsc.stop(now + 0.1);
    }

    // 3. Hi-Hat on odd steps
    if (this.step % 2 === 1) {
      const hatOsc = ctx.createOscillator();
      const hatGain = ctx.createGain();
      hatOsc.type = 'square';
      hatOsc.frequency.setValueAtTime(3000, now);
      hatGain.gain.setValueAtTime(this.volume * 0.15, now);
      hatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      hatOsc.connect(hatGain);
      hatGain.connect(ctx.destination);
      hatOsc.start(now);
      hatOsc.stop(now + 0.05);
    }

    // 4. Bass synth
    const bassFreq = track.bassNotes[Math.floor(this.step / 2) % track.bassNotes.length];
    if (bassFreq && this.step % 2 === 0) {
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(bassFreq, now);
      bassGain.gain.setValueAtTime(this.volume * 0.4, now);
      bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      bassOsc.connect(bassGain);
      bassGain.connect(ctx.destination);
      bassOsc.start(now);
      bassOsc.stop(now + 0.2);
    }

    // 5. Arpeggiated Melody
    const melodyFreq = track.melodyNotes[this.step % track.melodyNotes.length];
    if (melodyFreq) {
      const melOsc = ctx.createOscillator();
      const melGain = ctx.createGain();
      melOsc.type = 'sine';
      melOsc.frequency.setValueAtTime(melodyFreq, now);
      melGain.gain.setValueAtTime(this.volume * 0.3, now);
      melGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      melOsc.connect(melGain);
      melGain.connect(ctx.destination);
      melOsc.start(now);
      melOsc.stop(now + 0.18);
    }
  }

  public stopTrack() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getTracks() {
    return this.tracks;
  }

  public getCurrentTrackIndex() {
    return this.currentTrackIndex;
  }
}

export const partyAudio = new PartyAudioSynth();
