/**
 * Shared background music player and procedural Web Audio sound effects.
 */
import { ASSETS } from '../content/assets';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private backgroundMusic: HTMLAudioElement | null = null;

  constructor() {}

  public startBackgroundMusic() {
    if (!this.backgroundMusic) {
      this.backgroundMusic = new Audio(ASSETS.menuMusic);
      this.backgroundMusic.loop = true;
      this.backgroundMusic.volume = 0.35;
      this.backgroundMusic.preload = 'auto';
    }
    this.backgroundMusic.muted = this.isMuted;
    if (this.backgroundMusic.paused) {
      // Autoplay may be blocked on load; App retries on the first user gesture.
      void this.backgroundMusic.play().catch(() => {});
    }
  }

  public stopBackgroundMusic() {
    this.backgroundMusic?.pause();
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.backgroundMusic) {
      this.backgroundMusic.muted = this.isMuted;
      if (!this.isMuted) this.startBackgroundMusic();
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /** Legacy screen hooks use the shared track; screen changes never stop it. */
  public startCozyAmbience() {
    this.startBackgroundMusic();
  }

  public stopCozyAmbience() {}

  /**
   * Retro 16-bit UI select blip
   */
  public playSelect() {
    this.initContext();
    if (this.isMuted || !this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.setValueAtTime(880, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.09);
  }

  /**
   * Stage Clear 16-bit Fanfare (Super Mario World style celebratory chord)
   */
  public playStageClear() {
    this.initContext();
    if (this.isMuted || !this.ctx || !this.masterGain) return;

    const notes = [
      { f: 523.25, d: 0.1, t: 0.0 },   // C5
      { f: 659.25, d: 0.1, t: 0.1 },   // E5
      { f: 783.99, d: 0.1, t: 0.2 },   // G5
      { f: 1046.50, d: 0.35, t: 0.3 }  // C6
    ];

    notes.forEach(({ f, d, t }) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, this.ctx!.currentTime + t);

      gain.gain.setValueAtTime(0.001, this.ctx!.currentTime + t);
      gain.gain.linearRampToValueAtTime(0.18, this.ctx!.currentTime + t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + t + d);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(this.ctx!.currentTime + t);
      osc.stop(this.ctx!.currentTime + t + d + 0.05);
    });
  }

  /**
   * Sound effect: Rock strike clink (Norway sorting)
   */
  public playClink() {
    this.initContext();
    if (this.isMuted || !this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.11);
  }

  /**
   * Sound effect: Chemical bubble pop (Germany distillation)
   */
  public playBubble() {
    this.initContext();
    if (this.isMuted || !this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(950, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.11);
  }

  /**
   * Sound effect: Crystal pull hum (Japan)
   */
  public playCrystalHum() {
    this.initContext();
    if (this.isMuted || !this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.36);
  }

  /**
   * Sound effect: Light exposure pulse (Taiwan)
   */
  public playExposure() {
    this.initContext();
    if (this.isMuted || !this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.26);
  }

  /**
   * Sound effect: Probe test ping
   */
  public playProbePing(pass: boolean = true) {
    this.initContext();
    if (this.isMuted || !this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = pass ? 'sine' : 'square';
    osc.frequency.setValueAtTime(pass ? 987.77 : 180, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.13);
  }

  /**
   * Sound effect: Smartphone power-on boot chime (User)
   */
  public playBootChime() {
    this.initContext();
    if (this.isMuted || !this.ctx || !this.masterGain) return;

    const chords = [523.25, 659.25, 783.99, 987.77]; // Cmaj7
    chords.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);

      gain.gain.setValueAtTime(0.001, this.ctx!.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.1, this.ctx!.currentTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + 1.8);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start();
      osc.stop(this.ctx!.currentTime + 2.0);
    });
  }

  /**
   * Sound effect: 16-bit SNES confirmation chime
   */
  public playConfirm() {
    this.initContext();
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(523.25, this.ctx.currentTime);
    osc.frequency.setValueAtTime(1046.50, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.24);
  }

  /**
   * Sound effect: 16-bit footstep hop
   */
  public playFootstep() {
    this.initContext();
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.07);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.09);
  }

  /**
   * Sound effect: 16-bit error / locked buzz
   */
  public playError() {
    this.initContext();
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.setValueAtTime(90, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  /**
   * Legacy method aliases for backward compatibility
   */
  public playClick() { this.playSelect(); }
  public playSpinCoat() { this.playBubble(); }
  public playEUVLaser() { this.playExposure(); }
  public playPlasmaEtch() { this.playBubble(); }
  public playCleanRinse() { this.playBubble(); }
  public playProbePin(pass: boolean = true) { this.playProbePing(pass); }
  public playDicingSaw() { this.playClink(); }
  public playABFLaminate() { this.playSelect(); }
  public playVictoryFanfare() { this.playStageClear(); }
}

export const sound = new SoundEngine();
