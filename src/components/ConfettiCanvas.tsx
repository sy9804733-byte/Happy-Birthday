import React, { useEffect, useRef } from 'react';
import { ConfettiConfig } from '../types';

interface ConfettiCanvasProps {
  config: ConfettiConfig;
  burstCount: number;
}

class Particle {
  x: number = 0;
  y: number = 0;
  size: number = 0;
  color: string = '';
  emoji: string = '';
  speedX: number = 0;
  speedY: number = 0;
  angle: number = 0;
  spin: number = 0;
  isStar: boolean = false;
  opacity: number = 1;

  constructor(
    canvasWidth: number,
    canvasHeight: number,
    configType: ConfettiConfig['type'],
    isBurst: boolean = false
  ) {
    this.reset(canvasWidth, canvasHeight, configType, isBurst);
    if (isBurst) {
      // Start in center-bottom or scattered around the center of the screen
      this.x = canvasWidth / 2 + (Math.random() * 60 - 30);
      this.y = canvasHeight * 0.6 + (Math.random() * 40 - 20);
      
      // Blast outward
      const angle = Math.random() * Math.PI * 2;
      const speed = 5 + Math.random() * 12;
      this.speedX = Math.cos(angle) * speed;
      this.speedY = Math.sin(angle) * speed - 2; // Upward bias
    }
  }

  reset(
    canvasWidth: number,
    canvasHeight: number,
    configType: ConfettiConfig['type'],
    isBurst: boolean = false
  ) {
    this.x = Math.random() * canvasWidth;
    this.y = isBurst ? canvasHeight : -20 - Math.random() * 100;
    this.size = 4 + Math.random() * 10;
    this.angle = Math.random() * Math.PI * 2;
    this.spin = (Math.random() - 0.5) * 0.1;
    this.opacity = 1;

    // Fall speeds
    this.speedY = 1.5 + Math.random() * 3.5;
    this.speedX = (Math.random() - 0.5) * 1.5;

    // Type styling
    this.isStar = configType === 'stars';
    this.emoji = '';

    const colors = {
      colorful: ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF8AAE', '#B983FF'],
      gold: ['#FFE17D', '#FFCE45', '#E2A925', '#C59114', '#9D7308', '#FFFFFF'],
      neon: ['#39FF14', '#FF007F', '#00FFFF', '#FF00FF', '#FFFF00', '#B026FF']
    };

    if (configType === 'emojis') {
      const emojis = ['🎉', '🎂', '🎈', '✨', '💖', '🥳', '🧁', '🎁'];
      this.emoji = emojis[Math.floor(Math.random() * emojis.length)];
      this.size = 14 + Math.random() * 14;
    } else if (configType === 'stars') {
      const starColors = colors.gold.concat(colors.colorful);
      this.color = starColors[Math.floor(Math.random() * starColors.length)];
    } else {
      const currentColors = colors[configType] || colors.colorful;
      this.color = currentColors[Math.floor(Math.random() * currentColors.length)];
    }
  }

  update(
    canvasWidth: number,
    canvasHeight: number,
    configType: ConfettiConfig['type'],
    mouseX: number,
    mouseY: number
  ) {
    this.x += this.speedX;
    this.y += this.speedY;
    this.angle += this.spin;

    // Gravity / Drag friction for blast particles
    this.speedY += 0.08; // subtle gravity
    this.speedX *= 0.98; // horizontal friction

    // Gentle wind or wander
    this.speedX += (Math.random() - 0.5) * 0.05;

    // Interact with mouse cursor (blow away when mouse gets close)
    const dx = this.x - mouseX;
    const dy = this.y - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 100) {
      const force = (100 - distance) / 100;
      const angle = Math.atan2(dy, dx);
      this.speedX += Math.cos(angle) * force * 5;
      this.speedY += Math.sin(angle) * force * 3;
    }

    // Reset if goes off borders
    if (this.y > canvasHeight + 20) {
      this.reset(canvasWidth, canvasHeight, configType, false);
    }
    if (this.x < -20 || this.x > canvasWidth + 20) {
      this.x = Math.random() * canvasWidth;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    if (this.emoji) {
      ctx.font = `${this.size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.emoji, 0, 0);
    } else if (this.isStar) {
      // Draw standard starry particles
      ctx.fillStyle = this.color;
      ctx.beginPath();
      // Draw 5 point star
      const spikes = 5;
      const outerRadius = this.size;
      const innerRadius = this.size / 2;
      let rot = (Math.PI / 2) * 3;
      let x = 0;
      let y = 0;
      const step = Math.PI / spikes;

      ctx.moveTo(0, -outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = Math.cos(rot) * outerRadius;
        y = Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = Math.cos(rot) * innerRadius;
        y = Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(0, -outerRadius);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = this.color;
      // Draw rectangles or ellipses for ribbon look
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

export const ConfettiCanvas: React.FC<ConfettiCanvasProps> = ({ config, burstCount }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Populate initial particles
    const particleCount = config.density === 1 ? 50 : config.density === 2 ? 110 : 200;
    particlesRef.current = Array.from(
      { length: particleCount },
      () => new Particle(canvas.width, canvas.height, config.type, false)
    );

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const count = particlesRef.current.length;
      // sync length if density config changes
      const targetCount = config.density === 1 ? 55 : config.density === 2 ? 115 : 220;
      if (count < targetCount) {
        for (let i = count; i < targetCount; i++) {
          particlesRef.current.push(new Particle(canvas.width, canvas.height, config.type, false));
        }
      } else if (count > targetCount) {
        particlesRef.current.splice(targetCount);
      }

      particlesRef.current.forEach((p) => {
        p.update(
          canvas.width,
          canvas.height,
          config.type,
          mouseRef.current.x,
          mouseRef.current.y
        );
        p.draw(ctx);
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    // Track mouse
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [config.type, config.density]);

  // Handle Burst requests
  useEffect(() => {
    if (burstCount === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Generate burst particles
    const burstAmount = 70;
    const burstPack = Array.from(
      { length: burstAmount },
      () => new Particle(canvas.width, canvas.height, config.type, true)
    );

    // Add to pool and evict excess stale falling particles to keep performance pristine
    particlesRef.current = [...particlesRef.current, ...burstPack];
    if (particlesRef.current.length > 350) {
      particlesRef.current.splice(0, particlesRef.current.length - 350);
    }
  }, [burstCount]);

  return (
    <canvas
      ref={canvasRef}
      id="confetti-canvas"
      className="fixed inset-0 pointer-events-none z-40 transition-colors duration-1000"
    />
  );
};
