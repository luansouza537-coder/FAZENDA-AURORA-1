import React, { useEffect, useRef } from 'react';

interface ParticlesProps {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
}

export default function SeasonalParticles({ season }: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
    let height = canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle structure
    interface Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      spin: number;
      spinSpeed: number;
      color: string;
      emoji?: string;
    }

    let particles: Particle[] = [];
    const maxParticles = 20;

    const createParticle = (initBottom = false): Particle => {
      const size = season === 'spring' ? 14 + Math.random() * 8 : season === 'summer' ? 2 + Math.random() * 3 : season === 'autumn' ? 14 + Math.random() * 8 : 3 + Math.random() * 4;
      
      const speedY = season === 'summer' ? -(0.4 + Math.random() * 0.8) : (0.5 + Math.random() * 0.8);
      
      const speedX = season === 'autumn' ? (Math.random() * 1.0 - 0.5) : (Math.random() * 0.6 - 0.3);

      let x = Math.random() * width;
      let y = initBottom 
        ? (season === 'summer' ? height + 10 : 0) 
        : (season === 'summer' ? Math.random() * height : Math.random() * height - 20);

      const color = season === 'spring' 
        ? `rgba(244, 114, 182, ${0.4 + Math.random() * 0.4})` // Pink blossom 
        : season === 'summer' 
        ? `rgba(253, 224, 71, ${0.6 + Math.random() * 0.4})` // Yellow sparks
        : season === 'autumn' 
        ? `rgba(${200 + Math.floor(Math.random() * 55)}, ${100 + Math.floor(Math.random() * 60)}, 34, ${0.5 + Math.random() * 0.3})` // Orange/light brown leaves
        : `rgba(255, 255, 255, ${0.5 + Math.random() * 0.5})`; // White snow

      const emojis = season === 'spring' ? ['🌸'] : season === 'autumn' ? ['🍂', '🍁'] : [];
      const emoji = emojis.length > 0 ? emojis[Math.floor(Math.random() * emojis.length)] : undefined;

      return {
        x,
        y,
        size,
        speedY,
        speedX,
        spin: Math.random() * Math.PI,
        spinSpeed: Math.random() * 0.02 - 0.01,
        color,
        emoji
      };
    };

    // Populate initially
    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle());
      particles[i].y = Math.random() * height;
    }

    const updateAndDraw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // update position
        p.y += p.speedY;
        if (season === 'autumn') {
          // zigzag effect using sine wave
          p.x += p.speedX + Math.sin(p.y / 25) * 0.6;
        } else {
          p.x += p.speedX;
        }
        p.spin += p.spinSpeed;

        // render
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.spin);

        if (p.emoji) {
          ctx.font = `${p.size}px Arial`;
          ctx.fillText(p.emoji, -p.size / 2, p.size / 2);
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          if (season === 'winter' || season === 'summer') {
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          } else {
            // Leaf fallback
            ctx.ellipse?.(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
          }
          ctx.fill();
        }
        ctx.restore();

        // reuse/wrapping
        if (season === 'summer') {
          if (p.y < -20 || p.x < -20 || p.x > width + 20) {
            particles[i] = createParticle(true);
            particles[i].y = height + 10;
          }
        } else {
          if (p.y > height + 20 || p.x < -20 || p.x > width + 20) {
            particles[i] = createParticle(false);
            particles[i].y = -20;
          }
        }
      }

      animationId = requestAnimationFrame(updateAndDraw);
    };

    animationId = requestAnimationFrame(updateAndDraw);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [season]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-[1] opacity-60" 
    />
  );
}
