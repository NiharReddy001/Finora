'use client';

import React, { useEffect, useRef } from 'react';

export default function FinancialOrb() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    const size = 140;
    canvas.width = size * 2;
    canvas.height = size * 2;
    ctx.scale(2, 2);

    const centerX = size / 2;
    const centerY = size / 2;
    const sphereRadius = 38;

    const render = () => {
      ctx.clearRect(0, 0, size, size);
      angle += 0.012;

      // 1. Outer ambient halo (very faint lime glow)
      const haloGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        sphereRadius * 0.8,
        centerX,
        centerY,
        sphereRadius * 1.5
      );
      haloGrad.addColorStop(0, 'rgba(200, 255, 77, 0.05)');
      haloGrad.addColorStop(1, 'rgba(200, 255, 77, 0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, sphereRadius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // 2. Translucent dark graphite sphere body
      const sphereGrad = ctx.createRadialGradient(
        centerX - sphereRadius * 0.35,
        centerY - sphereRadius * 0.35,
        2,
        centerX,
        centerY,
        sphereRadius
      );
      sphereGrad.addColorStop(0, 'rgba(27, 36, 30, 0.9)');
      sphereGrad.addColorStop(0.5, 'rgba(13, 17, 15, 0.85)');
      sphereGrad.addColorStop(1, 'rgba(8, 10, 9, 0.95)');

      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, sphereRadius, 0, Math.PI * 2);
      ctx.fill();

      // 3. Subtle sphere contour border
      ctx.strokeStyle = 'rgba(200, 255, 77, 0.18)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 4. Latitude wireframe curves (3D depth curvature)
      const latitudes = [-0.6, -0.2, 0.2, 0.6];
      latitudes.forEach((lat) => {
        const r = Math.sqrt(1 - lat * lat) * sphereRadius;
        const y = centerY + lat * sphereRadius;
        ctx.beginPath();
        ctx.ellipse(
          centerX,
          y,
          r,
          r * 0.25 * Math.cos(angle * 0.5),
          0,
          0,
          Math.PI * 2
        );
        ctx.strokeStyle = 'rgba(200, 255, 77, 0.07)';
        ctx.lineWidth = 0.75;
        ctx.stroke();
      });

      // 5. Inclined orbital rings with 3D projection
      const rings = [
        { radiusX: 52, radiusY: 18, tilt: -0.45, speed: 1.0, color: 'rgba(200, 255, 77, 0.28)' },
        { radiusX: 62, radiusY: 24, tilt: 0.55, speed: -0.8, color: 'rgba(140, 190, 80, 0.18)' },
      ];

      rings.forEach((ring) => {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(ring.tilt);

        // Elliptical ring
        ctx.beginPath();
        ctx.ellipse(0, 0, ring.radiusX, ring.radiusY, 0, 0, Math.PI * 2);
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 0.85;
        ctx.stroke();

        // Orbiting tiny data point
        const nodeAngle = angle * ring.speed;
        const nodeX = Math.cos(nodeAngle) * ring.radiusX;
        const nodeY = Math.sin(nodeAngle) * ring.radiusY;

        // Data point glow
        ctx.fillStyle = '#C8FF4D';
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, 1.75, 0, Math.PI * 2);
        ctx.fill();

        // Subtle specular highlight on node
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(nodeX - 0.5, nodeY - 0.5, 0.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      // 6. Delicate specular crest on sphere
      const specGrad = ctx.createRadialGradient(
        centerX - sphereRadius * 0.4,
        centerY - sphereRadius * 0.4,
        0,
        centerX - sphereRadius * 0.4,
        centerY - sphereRadius * 0.4,
        sphereRadius * 0.5
      );
      specGrad.addColorStop(0, 'rgba(200, 255, 77, 0.22)');
      specGrad.addColorStop(0.5, 'rgba(200, 255, 77, 0.04)');
      specGrad.addColorStop(1, 'rgba(200, 255, 77, 0)');

      ctx.fillStyle = specGrad;
      ctx.beginPath();
      ctx.arc(centerX - sphereRadius * 0.4, centerY - sphereRadius * 0.4, sphereRadius * 0.5, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div
      className="relative flex items-center justify-center select-none pointer-events-none"
      title="Financial Telemetry Core"
    >
      <canvas
        ref={canvasRef}
        style={{ width: '140px', height: '140px' }}
        className="shrink-0"
      />
      <div className="absolute bottom-1 right-2 font-mono text-[9px] text-[#5C6A60] tracking-widest uppercase">
        CORE // ACTIVE
      </div>
    </div>
  );
}
