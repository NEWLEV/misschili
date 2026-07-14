'use client';

import React, { useEffect, useRef } from 'react';

class Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  life: number;
  maxLife: number;
  color: string;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.x = Math.random() * canvasWidth;
    // Start slightly below the canvas to rise up
    this.y = canvasHeight + Math.random() * 50; 
    
    // Varying sizes for realism
    this.size = Math.random() * 40 + 10;
    
    // Drift slightly left or right
    this.speedX = Math.random() * 1.5 - 0.75;
    
    // Rise upwards
    this.speedY = Math.random() * -3 - 2;
    
    this.life = 0;
    this.maxLife = Math.random() * 100 + 50;

    // Pick a starting color (brightest at the bottom)
    const hue = Math.random() * 15 + 10; // Yellow-orange to orange
    this.color = `hsl(${hue}, 100%, 60%)`;
  }

  update(canvasHeight: number) {
    this.x += this.speedX;
    this.y += this.speedY;
    
    // Shrink as it rises
    if (this.size > 0.2) this.size -= 0.15;
    
    this.life++;
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Fade out as it gets older
    const opacity = 1 - (this.life / this.maxLife);
    
    // Color transitions from yellow -> orange -> red -> dark red
    let hue = 30 - (this.life / this.maxLife) * 30;
    if (hue < 0) hue = 0;
    
    ctx.globalCompositeOperation = 'lighter';
    ctx.beginPath();
    
    // Radial gradient for soft edges
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
    gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, ${opacity})`);
    gradient.addColorStop(0.4, `hsla(${hue}, 100%, 40%, ${opacity * 0.6})`);
    gradient.addColorStop(1, `hsla(${hue}, 100%, 20%, 0)`);
    
    ctx.fillStyle = gradient;
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function FlameBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;

    const resize = () => {
      // Set actual size in memory (scaled to account for pixel ratio).
      const dpr = window.devicePixelRatio || 1;
      // We render at lower resolution for a softer, blurrier flame look and better performance
      canvas.width = window.innerWidth / 2;
      canvas.height = window.innerHeight / 2;
    };

    window.addEventListener('resize', resize);
    resize();

    // Create initial particles
    const initParticles = () => {
      particles = [];
      const particleCount = Math.floor(canvas.width / 5); // Adjust density based on width
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
    };
    
    initParticles();

    const animate = () => {
      // Clear canvas with a very dark translucent black to create motion blur trails
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(20, 2, 2, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update(canvas.height);
        particles[i].draw(ctx);

        // Reset particle if it dies or goes too high/small
        if (particles[i].life >= particles[i].maxLife || particles[i].size <= 0.2) {
          particles[i] = new Particle(canvas.width, canvas.height);
          // When resetting, we can spawn them at the bottom again
          particles[i].y = canvas.height + Math.random() * 20;
        }
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[oklch(0.08_0.02_20)]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-70 mix-blend-screen"
        style={{ filter: 'blur(4px)' }}
      />
      {/* Dark overlay at the bottom so it fades into the next section */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-transparent to-transparent z-10" />
      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[rgba(10,0,0,0.4)] to-[rgba(10,0,0,0.8)] z-10" />
    </div>
  );
}
