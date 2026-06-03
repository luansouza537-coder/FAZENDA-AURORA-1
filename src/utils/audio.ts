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

  public playSound(type: 'click' | 'feed' | 'collect' | 'sell' | 'levelup' | 'event' | 'error' | string) {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      
      const t = this.ctx.currentTime;
      
      switch (type) {
        case 'click': {
          // click: som curto de botão (frequência 600Hz, duração 0.08s)
          this.playTone(600, 0.08, 'sine', t);
          break;
        }
        case 'feed': {
          // feed: som de mastigação/baixo (300Hz, 0.12s, com decay rápido)
          this.playTone(300, 0.12, 'triangle', t);
          break;
        }
        case 'collect': {
          // collect: som de moeda/ding (1200Hz, 0.15s, com envelope rápido)
          this.playTone(1200, 0.15, 'sine', t);
          break;
        }
        case 'sell': {
          // sell: caixa registradora (dois tons: 800Hz e 600Hz em sequência)
          this.playTone(800, 0.08, 'sine', t);
          this.playTone(600, 0.15, 'sine', t + 0.08);
          break;
        }
        case 'levelup': {
          // levelup: fanfarra curta (três tons: 500Hz, 700Hz, 900Hz)
          this.playTone(500, 0.10, 'sine', t);
          this.playTone(700, 0.10, 'sine', t + 0.10);
          this.playTone(900, 0.25, 'sine', t + 0.20);
          break;
        }
        case 'event': {
          // event: som de notificação (chime: 1000Hz com vibrato suave)
          // Implement standard subtle vibrato using frequency modulation rate
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
          // error: som de erro (buzz: 200Hz com distorção leve)
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

  // Funcionalidade 12: Sons de animais ao coletar
  public playAnimalSound(animalType: 'vaca' | 'ovelha' | 'boi' | 'galinha') {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      if (animalType === 'vaca') {
        // Moo: onda senoidal grave ~150Hz por 0.4s com portamento descendente
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, t);
        osc.frequency.exponentialRampToValueAtTime(120, t + 0.4);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.45);
      } else if (animalType === 'ovelha') {
        // Baa: ~300Hz com vibrato por 0.3s
        const osc = this.ctx.createOscillator();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(310, t);
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(10, t);
        lfoGain.gain.setValueAtTime(20, t);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        gain.gain.setValueAtTime(0.10, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        lfo.start(t);
        lfo.stop(t + 0.35);
        osc.start(t);
        osc.stop(t + 0.35);
      } else if (animalType === 'galinha') {
        // Cluck: burst de ruído curto ~0.15s filtrado
        const bufferSize = Math.floor((this.ctx.sampleRate || 44100) * 0.15);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1800;
        filter.Q.value = 3;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        source.start(t);
      } else if (animalType === 'boi') {
        // Boi: similar à vaca mas mais grave ~100Hz
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(105, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.5);
        gain.gain.setValueAtTime(0.13, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.55);
      }
    } catch (e) {
      // Ignored
    }
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
