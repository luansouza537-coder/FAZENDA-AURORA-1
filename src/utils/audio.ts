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
