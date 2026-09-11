'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { scrollTracker } from '@/lib/scrollTracker';

interface NetworkNode3D {
  lat: number; // radians (-PI/2 to PI/2)
  lon: number; // radians (0 to 2*PI)
  label?: string;
  pulsePhaseOffset: number; // Staggered breathing phase
}

interface DataPacket {
  connectionIdx: number;
  t: number; // 0 to 1
  speed: number;
  color: string;
}

export default function FinancialGlobe() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let rotationAngle = 0;
    let orbitAngle1 = 0;
    let orbitAngle2 = 0;
    let orbitAngle3 = 0;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Parallax tracking with smooth spring-like easing
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      // Small normalized offset from center of viewport (max 6px)
      mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 6;
      mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 6;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Fixed physical canvas dimensions with high DPI
    const size = 440;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = 135; // Sphere radius in logical px

    // 14 Global Financial Hub Coordinates (Spherical: lat, lon)
    const hubNodes: NetworkNode3D[] = [
      { lat: 0.62, lon: 0.1, label: 'LON', pulsePhaseOffset: 0.0 },   // London
      { lat: 0.71, lon: 4.8, label: 'NYC', pulsePhaseOffset: 0.9 },   // New York
      { lat: 0.62, lon: 2.4, label: 'TYO', pulsePhaseOffset: 1.8 },   // Tokyo
      { lat: 0.22, lon: 1.8, label: 'SIN', pulsePhaseOffset: 2.7 },   // Singapore
      { lat: 0.88, lon: 0.2, label: 'FRA', pulsePhaseOffset: 3.6 },   // Frankfurt
      { lat: 0.44, lon: 1.3, label: 'DXB', pulsePhaseOffset: 4.5 },   // Dubai
      { lat: 0.33, lon: 1.25, label: 'BOM', pulsePhaseOffset: 0.5 },  // Mumbai
      { lat: -0.59, lon: 2.6, label: 'SYD', pulsePhaseOffset: 1.4 },  // Sydney
      { lat: 0.79, lon: 0.15, label: 'ZUR', pulsePhaseOffset: 2.3 },  // Zurich
      { lat: 0.39, lon: 2.0, label: 'HKG', pulsePhaseOffset: 3.2 },   // Hong Kong
      { lat: -0.40, lon: 5.4, label: 'SAO', pulsePhaseOffset: 4.1 },  // Sao Paulo
      { lat: 0.52, lon: 4.2, label: 'SFO', pulsePhaseOffset: 5.0 },  // San Francisco
      { lat: 0.15, lon: 0.05, label: 'ACC', pulsePhaseOffset: 1.1 },  // Accra
      { lat: -0.45, lon: 0.32, label: 'JNB', pulsePhaseOffset: 2.0 }, // Johannesburg
    ];

    // Node connection pairs (indices in hubNodes)
    const connections: [number, number][] = [
      [0, 1], // LON - NYC
      [0, 4], // LON - FRA
      [0, 5], // LON - DXB
      [1, 11],// NYC - SFO
      [2, 3], // TYO - SIN
      [2, 9], // TYO - HKG
      [3, 6], // SIN - BOM
      [3, 7], // SIN - SYD
      [5, 6], // DXB - BOM
      [4, 8], // FRA - ZUR
    ];

    // Data transmission packets traveling along geodesic arcs
    const dataPackets: DataPacket[] = [
      { connectionIdx: 0, t: 0.15, speed: 0.0032, color: '#10B981' },
      { connectionIdx: 2, t: 0.55, speed: 0.0028, color: '#10B981' },
      { connectionIdx: 4, t: 0.85, speed: 0.0035, color: '#059669' },
      { connectionIdx: 7, t: 0.35, speed: 0.0025, color: '#10B981' },
      { connectionIdx: 8, t: 0.65, speed: 0.0030, color: '#10B981' },
    ];

    let time = 0;
    let smoothedVelocityTilt = 0;

    const render = () => {
      time += 1;

      // Smooth mouse parallax interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.045;
      mouse.y += (mouse.targetY - mouse.y) * 0.045;

      // Scroll velocity reactive tilt with spring damping
      const targetVelocityTilt = Math.max(-0.06, Math.min(0.06, (scrollTracker.scrollVelocity || 0) * 0.00003));
      smoothedVelocityTilt += (targetVelocityTilt - smoothedVelocityTilt) * 0.08;

      if (!prefersReducedMotion) {
        rotationAngle += 0.0018; // ~52s per full 3D rotation cycle
        orbitAngle1 += 0.00227;  // ~46s cycle for orbital ring 1
        orbitAngle2 -= 0.00180;  // ~58s cycle for orbital ring 2
        orbitAngle3 += 0.00145;  // ~72s cycle for orbital ring 3
      }

      ctx.clearRect(0, 0, size, size);

      // Scroll depth response & Parallax-shifted sphere center
      const scrollShift = Math.min(18, (scrollTracker.scrollY || 0) * 0.025);
      const currentCenterX = centerX + mouse.x;
      const currentCenterY = centerY + mouse.y - scrollShift;

      // ==========================================
      // 1. OUTER ATMOSPHERIC HALO
      // ==========================================
      const haloGrad = ctx.createRadialGradient(
        currentCenterX,
        currentCenterY,
        radius * 0.7,
        currentCenterX,
        currentCenterY,
        radius * 1.35
      );
      haloGrad.addColorStop(0, 'rgba(5, 150, 105, 0.040)');
      haloGrad.addColorStop(0.5, 'rgba(100, 116, 139, 0.022)');
      haloGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(currentCenterX, currentCenterY, radius * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // ==========================================
      // 2. SUBTLE TRANSLUCENT SPHERE BODY
      // ==========================================
      const bodyGrad = ctx.createRadialGradient(
        currentCenterX - radius * 0.3,
        currentCenterY - radius * 0.35,
        radius * 0.1,
        currentCenterX,
        currentCenterY,
        radius
      );
      bodyGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
      bodyGrad.addColorStop(0.5, 'rgba(241, 245, 249, 0.50)');
      bodyGrad.addColorStop(0.85, 'rgba(226, 232, 240, 0.35)');
      bodyGrad.addColorStop(1, 'rgba(203, 213, 225, 0.20)');

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.arc(currentCenterX, currentCenterY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Sphere contour perimeter
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.22)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Inner subtle rim highlight
      ctx.beginPath();
      ctx.arc(currentCenterX, currentCenterY, radius - 1, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(5, 150, 105, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // ==========================================
      // 3. LATITUDE RINGS (With scroll velocity tilt)
      // ==========================================
      const latitudes = [-0.65, -0.32, 0, 0.32, 0.65];
      const baseTiltRatio = 0.22 + smoothedVelocityTilt;
      latitudes.forEach((lat) => {
        const ringRadius = Math.sqrt(Math.max(0, 1 - lat * lat)) * radius;
        const ringY = currentCenterY + lat * radius;

        ctx.beginPath();
        ctx.ellipse(currentCenterX, ringY, ringRadius, ringRadius * Math.max(0.12, baseTiltRatio), 0, 0, Math.PI * 2);
        ctx.strokeStyle = lat === 0 ? 'rgba(5, 150, 105, 0.16)' : 'rgba(148, 163, 184, 0.14)';
        ctx.lineWidth = 0.85;
        ctx.stroke();
      });

      // ==========================================
      // 4. LONGITUDE MERIDIANS (3D Rotation)
      // ==========================================
      const meridianAngles = [0, Math.PI / 3, (2 * Math.PI) / 3];
      meridianAngles.forEach((mAngle) => {
        const currentMAngle = mAngle + rotationAngle;
        const cosAngle = Math.cos(currentMAngle);

        ctx.beginPath();
        ctx.ellipse(
          currentCenterX,
          currentCenterY,
          Math.abs(cosAngle) * radius,
          radius,
          0,
          0,
          Math.PI * 2
        );
        const alpha = Math.abs(cosAngle) * 0.12 + 0.05;
        ctx.strokeStyle = `rgba(100, 116, 139, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 0.75;
        ctx.stroke();
      });

      // ==========================================
      // 5. 3 INCLINED ORBITAL RINGS & SATELLITES
      // ==========================================
      const orbits = [
        { rx: radius * 1.28, ry: radius * 0.40, tilt: -0.38 + smoothedVelocityTilt * 0.5, angle: orbitAngle1, color: 'rgba(5, 150, 105, 0.35)', dotColor: '#059669' },
        { rx: radius * 1.42, ry: radius * 0.46, tilt: 0.52 - smoothedVelocityTilt * 0.5, angle: orbitAngle2, color: 'rgba(100, 116, 139, 0.26)', dotColor: '#64748B' },
        { rx: radius * 1.56, ry: radius * 0.36, tilt: 0.12 + smoothedVelocityTilt * 0.3, angle: orbitAngle3, color: 'rgba(16, 185, 129, 0.22)', dotColor: '#10B981' },
      ];

      orbits.forEach((orb) => {
        ctx.save();
        ctx.translate(currentCenterX, currentCenterY);
        ctx.rotate(orb.tilt);

        // Elliptical ring
        ctx.beginPath();
        ctx.ellipse(0, 0, orb.rx, orb.ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = orb.color;
        ctx.lineWidth = 0.85;
        ctx.stroke();

        // Orbiting particle with micro-glow
        const px = Math.cos(orb.angle) * orb.rx;
        const py = Math.sin(orb.angle) * orb.ry;

        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = orb.dotColor;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, 1, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        ctx.restore();
      });

      // ==========================================
      // 6. 3D NETWORK NODES & GEODESIC CONNECTIONS
      // ==========================================
      // Compute 3D positions for all nodes
      const projectedNodes = hubNodes.map((node, i) => {
        const currentLon = node.lon + rotationAngle;
        const cosLat = Math.cos(node.lat);
        const sinLat = Math.sin(node.lat);
        const cosLon = Math.cos(currentLon);
        const sinLon = Math.sin(currentLon);

        const x = currentCenterX + radius * cosLat * sinLon;
        const y = currentCenterY - radius * sinLat;
        const z = radius * cosLat * cosLon; // Depth: >0 is front-facing

        return { x, y, z, node, index: i };
      });

      // Draw connection lines between front-facing nodes
      ctx.lineWidth = 0.85;
      connections.forEach(([i1, i2]) => {
        const p1 = projectedNodes[i1];
        const p2 = projectedNodes[i2];
        if (!p1 || !p2) return;

        // Draw connection if at least one node is partially front-facing
        if (p1.z > -25 || p2.z > -25) {
          const avgZ = (p1.z + p2.z) / (2 * radius);
          const lineAlpha = Math.max(0, 0.18 + avgZ * 0.15);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(5, 150, 105, ${lineAlpha.toFixed(3)})`;
          ctx.stroke();
        }
      });

      // ==========================================
      // 7. TRAVELING DATA TRANSMISSION PACKETS
      // ==========================================
      if (!prefersReducedMotion) {
        dataPackets.forEach((packet) => {
          packet.t += packet.speed;
          if (packet.t > 1) packet.t = 0;

          const [i1, i2] = connections[packet.connectionIdx] || [];
          const p1 = projectedNodes[i1];
          const p2 = projectedNodes[i2];
          if (!p1 || !p2) return;

          // Interpolate 3D position along the connection line
          const tx = p1.x + (p2.x - p1.x) * packet.t;
          const ty = p1.y + (p2.y - p1.y) * packet.t;
          const tz = p1.z + (p2.z - p1.z) * packet.t;

          if (tz > -15) {
            const depthRatio = Math.max(0, (tz + radius) / (2 * radius));
            const packetAlpha = 0.35 + depthRatio * 0.60;

            // Micro packet glow
            ctx.beginPath();
            ctx.arc(tx, ty, 2.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(16, 185, 129, ${(packetAlpha * 0.6).toFixed(3)})`;
            ctx.fill();

            // Luminous core
            ctx.beginPath();
            ctx.arc(tx, ty, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${(packetAlpha * 0.95).toFixed(3)})`;
            ctx.fill();
          }
        });
      }

      // ==========================================
      // 8. 3D NODES & ASYNCHRONOUS BREATHING PULSES
      // ==========================================
      projectedNodes.forEach(({ x, y, z, node, index }) => {
        const isFront = z > 0;
        const depthRatio = Math.max(0, (z + radius) / (2 * radius)); // 0 (back) to 1 (front)
        const nodeAlpha = isFront ? 0.40 + depthRatio * 0.55 : 0.12;
        const currentRadius = 1.8 + depthRatio * 1.8;

        // Individual asynchronous breathing pulse (1.5s–2.8s frequency offset)
        if (isFront && !prefersReducedMotion) {
          const breathingWave = Math.sin(time * 0.035 + node.pulsePhaseOffset);
          if (breathingWave > 0.25) {
            const pulseRadius = currentRadius + (breathingWave - 0.25) * 5.0;
            const pulseAlpha = Math.max(0, (0.35 - (pulseRadius - currentRadius) / 6) * depthRatio);

            ctx.beginPath();
            ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(5, 150, 105, ${pulseAlpha.toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Node base
        ctx.beginPath();
        ctx.arc(x, y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(5, 150, 105, ${nodeAlpha.toFixed(3)})`;
        ctx.fill();

        // White core on front nodes
        if (isFront) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${(nodeAlpha * 0.9).toFixed(3)})`;
          ctx.fill();

          // Technical Hub Code Label (very subtle, monospace)
          if (node.label && depthRatio > 0.65) {
            ctx.font = '8px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
            ctx.fillStyle = `rgba(100, 116, 139, ${(depthRatio * 0.45).toFixed(3)})`;
            ctx.fillText(node.label, x + 5, y - 4);
          }
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Route-specific environmental prominence
  const getRouteOpacity = () => {
    switch (pathname) {
      case '/':
        return 'opacity-95'; // Full richness on Overview
      case '/analytics':
        return 'opacity-80'; // Strong presence on Analytics
      case '/budgets':
      case '/goals':
      case '/recurring':
        return 'opacity-65'; // Calmer on planning pages
      case '/transactions':
        return 'opacity-40'; // Restrained behind dense ledger table
      case '/settings':
        return 'opacity-30'; // Quietest on Settings
      default:
        return 'opacity-75';
    }
  };

  return (
    <div
      className={`fixed right-[-30px] sm:right-[10px] lg:right-[40px] xl:right-[70px] top-[75px] sm:top-[80px] pointer-events-none z-[1] select-none transition-opacity duration-700 ease-out ${getRouteOpacity()}`}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] lg:w-[440px] lg:h-[440px] block"
      />
    </div>
  );
}
