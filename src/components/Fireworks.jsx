// Simple canvas-based firework particles for victory celebration

import { useEffect, useRef } from 'react';

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FDCB6E', '#6C5CE7', '#FF85A2', '#55E6C1'];
const PARTICLE_COUNT = 60;
const BURST_COUNT = 5;
const DURATION = 3000;

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

export function Fireworks() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animId;
    let startTime = Date.now();

    // Resize canvas to fill screen
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create burst particles at staggered intervals
    const bursts = [];
    for (let b = 0; b < BURST_COUNT; b++) {
      const cx = randomBetween(canvas.width * 0.2, canvas.width * 0.8);
      const cy = randomBetween(canvas.height * 0.15, canvas.height * 0.5);
      const burstColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      const delay = b * 400;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + randomBetween(-0.2, 0.2);
        const speed = randomBetween(1.5, 5);
        bursts.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          size: randomBetween(2, 4),
          color: burstColor,
          delay,
        });
      }
    }

    function animate() {
      const elapsed = Date.now() - startTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = false;
      for (const p of bursts) {
        if (elapsed < p.delay) { alive = true; continue; }
        const t = elapsed - p.delay;
        if (t > DURATION) continue;

        alive = true;
        const progress = t / DURATION;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04; // gravity
        p.alpha = 1 - progress;

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - progress * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }

      if (alive) {
        animId = requestAnimationFrame(animate);
      }
    }

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fireworks-canvas"
    />
  );
}
