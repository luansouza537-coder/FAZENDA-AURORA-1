/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Synthesize authentic retro farm sound effects using Web Audio API
class SoundFXManager {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  public init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public playSound(type: 'click' | 'feed' | 'collect' | 'sell' | 'levelup' | 'event' | 'error' | 'milk' | 'shear' | 'egg' | 'sell_animal' | 'purchase' | 'coin' | string) {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;

      switch (type) {
        case 'click': {
          this.playTone(600, 0.08, 'sine', t);
          break;
        }
        case 'feed': {
          this.playTone(300, 0.12, 'triangle', t);
          break;
        }
        case 'collect': {
          this.playTone(1200, 0.15, 'sine', t);
          break;
        }
        case 'milk': {
          // Leite: som de líquido pingando (dois pulsos baixos)
          this.playTone(180, 0.10, 'sine', t);
          this.playTone(200, 0.12, 'sine', t + 0.12);
          break;
        }
        case 'shear': {
          // Tosquia: som de tesoura rápida (clicks agudos em sequência)
          this.playTone(900, 0.05, 'square', t);
          this.playTone(850, 0.05, 'square', t + 0.07);
          this.playTone(900, 0.05, 'square', t + 0.14);
          break;
        }
        case 'egg': {
          // Ovo: som de galinha clucando (tom médio-agudo curto)
          this.playTone(650, 0.08, 'sine', t);
          this.playTone(550, 0.10, 'sine', t + 0.09);
          break;
        }
        case 'sell_animal': {
          // Venda de animal: nota descendente (mercado de gado)
          this.playTone(500, 0.10, 'sine', t);
          this.playTone(400, 0.10, 'sine', t + 0.10);
          this.playTone(300, 0.20, 'sine', t + 0.20);
          break;
        }
        case 'purchase': {
          // Compra: som de sino duplo positivo
          this.playTone(700, 0.10, 'sine', t);
          this.playTone(900, 0.15, 'sine', t + 0.12);
          break;
        }
        case 'coin': {
          // Moeda: clink metálico agudo
          this.playTone(1400, 0.06, 'sine', t);
          this.playTone(1600, 0.08, 'sine', t + 0.04);
          break;
        }
        case 'sell': {
          this.playTone(800, 0.08, 'sine', t);
          this.playTone(600, 0.15, 'sine', t + 0.08);
          break;
        }
        case 'levelup': {
          this.playTone(500, 0.10, 'sine', t);
          this.playTone(700, 0.10, 'sine', t + 0.10);
          this.playTone(900, 0.25, 'sine', t + 0.20);
          break;
        }
        case 'event': {
          const osc = this.ctx.createOscillator();
          const gainNode = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1000, t);
          osc.frequency.linearRampToValueAtTime(1030, t + 0.06);
          osc.frequency.linearRampToValueAtTime(970, t + 0.12);
          osc.frequency.linearRampToValueAtTime(1010, t + 0.18);
          osc.frequency.linearRampToValueAtTime(1000, t + 0.24);
          gainNode.gain.setValueAtTime(0.08, t);
          gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
          osc.connect(gainNode);
          gainNode.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.25);
          break;
        }
        case 'error': {
          const osc = this.ctx.createOscillator();
          const gainNode = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(200, t);
          osc.frequency.linearRampToValueAtTime(170, t + 0.2);
          gainNode.gain.setValueAtTime(0.06, t);
          gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
          osc.connect(gainNode);
          gainNode.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.22);
          break;
        }
        default:
          break;
      }
    } catch (e) {
      // Ignored
    }
  }

  // Dynamic backward-compatible sound delegates
  public playFeed() {
    this.playSound('feed');
  }

  public playCollect() {
    this.playSound('collect');
  }

  public playCash() {
    this.playSound('sell');
  }

  public playNextDay() {
    this.playSound('click');
  }

  public playDeath() {
    this.playSound('error');
  }

  public playClick() {
    this.playSound('click');
  }

  // Funcionalidade 12: Sons de animais ao coletar (expandido para todas as espécies)
  public playAnimalSound(animalType: string) {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      const sounds: Record<string, { freq: number; type: OscillatorType; duration: number }> = {
        vaca:    { freq: 150, type: 'sine',     duration: 0.4 },
        ovelha:  { freq: 400, type: 'sine',     duration: 0.3 },
        boi:     { freq: 120, type: 'sawtooth', duration: 0.5 },
        galinha: { freq: 600, type: 'square',   duration: 0.15 },
        cabra:   { freq: 350, type: 'sine',     duration: 0.3 },
        lhama:   { freq: 300, type: 'sine',     duration: 0.4 },
        pato:    { freq: 500, type: 'square',   duration: 0.2 },
        ganso:   { freq: 450, type: 'sawtooth', duration: 0.3 },
        bufalo:  { freq: 130, type: 'sine',     duration: 0.5 },
        pavao:   { freq: 800, type: 'sine',     duration: 0.6 },
        codorna: { freq: 700, type: 'sine',     duration: 0.1 },
        alpaca:  { freq: 320, type: 'sine',     duration: 0.35 },
        minhoca: { freq: 200, type: 'sine',     duration: 0.2 },
        caracol: { freq: 180, type: 'sine',     duration: 0.3 },
        coelho_angora: { freq: 650, type: 'sine', duration: 0.1 },
        bicho_seda: { freq: 900, type: 'sine',  duration: 0.1 },
        ra:      { freq: 250, type: 'square',   duration: 0.2 },
        avestruz: { freq: 180, type: 'sawtooth', duration: 0.4 },
        jacare:  { freq: 100, type: 'sawtooth', duration: 0.6 },
      };

      const s = sounds[animalType] ?? { freq: 440, type: 'sine' as OscillatorType, duration: 0.2 };
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = s.type;
      osc.frequency.setValueAtTime(s.freq, t);
      osc.frequency.exponentialRampToValueAtTime(s.freq * 0.8, t + s.duration);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + s.duration);
      osc.start(t);
      osc.stop(t + s.duration);
    } catch (e) {
      // Ignored
    }
  }

  // Ambiente: pássaros ao amanhecer (3 chiados rápidos aleatórios)
  public playBirds() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const baseFreqs = [1800, 2200, 2600, 1600, 2000];
      for (let i = 0; i < 3; i++) {
        const delay = i * (0.18 + Math.random() * 0.12);
        const freq = baseFreqs[Math.floor(Math.random() * baseFreqs.length)];
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + delay);
        osc.frequency.linearRampToValueAtTime(freq * 1.15, t + delay + 0.06);
        osc.frequency.linearRampToValueAtTime(freq * 0.9, t + delay + 0.13);
        gain.gain.setValueAtTime(0, t + delay);
        gain.gain.linearRampToValueAtTime(0.04, t + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + delay);
        osc.stop(t + delay + 0.2);
      }
    } catch (e) {}
  }

  // Ambiente: grilos à noite (chirp suave duplo)
  public playCrickets() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      for (let i = 0; i < 2; i++) {
        const delay = i * 0.14;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(3200, t + delay);
        gain.gain.setValueAtTime(0.015, t + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + delay);
        osc.stop(t + delay + 0.09);
      }
    } catch (e) {}
  }

  // Som de chuva/tempestade sintético
  public playThunder() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // Ruído branco curto para simular trovão
      const bufferSize = this.ctx.sampleRate * 0.6;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, t);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      source.start(t);
    } catch (e) {}
  }

  private playTone(freq: number, duration: number, type: OscillatorType, time: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    
    gain.gain.setValueAtTime(0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(time);
    osc.stop(time + duration);
  }
}

export const sfx = new SoundFXManager();

// ─── Music Manager ────────────────────────────────────────────────────────────
class MusicManager {
  private current: HTMLAudioElement | null = null;
  private currentTrack: string | null = null;
  public muted: boolean = false;
  public volume: number = 0.18; // volume padrão baixo

  private tracks: Record<string, string> = {
    titulo:  '/audio/titulo.mp3',
    fazenda: '/audio/fazenda.mp3',
  };

  play(track: string) {
    if (this.muted) return;
    if (this.currentTrack === track && this.current && !this.current.paused) return;

    this.stop();
    const src = this.tracks[track];
    if (!src) return;

    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0;
    audio.play().then(() => {
      this.fadeVolumeTo(audio, this.volume, 1500);
    }).catch(() => {});

    this.current = audio;
    this.currentTrack = track;
  }

  stop() {
    if (!this.current) return;
    const audio = this.current;
    this.fadeVolumeTo(audio, 0, 800, () => {
      audio.pause();
      audio.src = '';
    });
    this.current = null;
    this.currentTrack = null;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) {
      if (this.current) {
        this.fadeVolumeTo(this.current, 0, 600, () => {
          this.current?.pause();
        });
      }
    } else {
      if (this.current) {
        this.current.play().catch(() => {});
        this.fadeVolumeTo(this.current, this.volume, 800);
      }
    }
  }

  setVolume(vol: number) {
    this.volume = vol;
    if (this.current && !this.muted) {
      this.current.volume = vol;
    }
  }

  private fadeVolumeTo(audio: HTMLAudioElement, target: number, durationMs: number, onDone?: () => void) {
    const steps = 20;
    const interval = durationMs / steps;
    const start = audio.volume;
    const delta = (target - start) / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      audio.volume = Math.max(0, Math.min(1, start + delta * step));
      if (step >= steps) {
        clearInterval(timer);
        audio.volume = target;
        onDone?.();
      }
    }, interval);
  }
}

export const music = new MusicManager();
