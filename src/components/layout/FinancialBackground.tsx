'use client';

import React, { useEffect, useRef } from 'react';

export default function FinancialBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Subtle horizontal financial market scan lines & micro ticks
    const dataStreams = [
      { y: height * 0.18, speed: 0.25, offset: 0, length: 320, alpha: 0.06 },
      { y: height * 0.42, speed: -0.2, offset: 150, length: 440, alpha: 0.04 },
      { y: height * 0.72, speed: 0.3, offset: 300, length: 280, alpha: 0.05 },
    ];

    // Micro grid data nodes
    const dataNodes = Array.from({ length: 18 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      pulse: Math.random() * Math.PI * 2,
      speed: 0.015 + Math.random() * 0.02,
      radius: 1 + Math.random() * 1.5,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw subtle moving telemetry lines
      dataStreams.forEach((stream) => {
        stream.offset = (stream.offset + stream.speed) % (width + stream.length);
        const startX = stream.offset - stream.length;

        const grad = ctx.createLinearGradient(
          startX,
          stream.y,
          startX + stream.length,
          stream.y
        );
        grad.addColorStop(0, 'rgba(200, 255, 77, 0)');
        grad.addColorStop(0.5, `rgba(200, 255, 77, ${stream.alpha})`);
        grad.addColorStop(1, 'rgba(200, 255, 77, 0)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(startX, stream.y);
        ctx.lineTo(startX + stream.length, stream.y);
        ctx.stroke();
      });

      // 2. Draw subtle stationary micro data nodes with slow ambient breathe
      dataNodes.forEach((node) => {
        node.pulse += node.speed;
        const alpha = 0.03 + Math.sin(node.pulse) * 0.025;
        ctx.fillStyle = `rgba(200, 255, 77, ${alpha})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#080A09]"
      aria-hidden="true"
    >
      {/* 1. Ultra-subtle financial grid: 72px grid with barely visible green/gray lines */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #C8FF4D 1px, transparent 1px),
            linear-gradient(to bottom, #C8FF4D 1px, transparent 1px)
          `,
          backgroundSize: '72px 72px',
        }}
      />

      {/* 2. Micro financial telemetry canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-70"
      />

      {/* 3. Extremely restrained ambient lighting gradients */}
      {/* Top right subtle lime sheen */}
      <div
        className="absolute -top-40 right-0 w-[600px] h-[500px] rounded-full opacity-[0.03] blur-[120px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #C8FF4D 0%, transparent 70%)' }}
      />
      {/* Bottom left deep shadow glow */}
      <div
        className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.02] blur-[140px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #22c55e 0%, transparent 70%)' }}
      />
    </div>
  );
}
