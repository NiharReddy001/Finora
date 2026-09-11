'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { scrollTracker } from '@/lib/scrollTracker';

interface AnimatedNode {
  fragmentId: number;
  t: number; // 0 to 1 progress along path
  speed: number;
  radius: number;
  color: string;
  glowColor: string;
  pulsePhaseOffset: number;
}

interface GridZone {
  getCenter: (w: number, h: number) => { x: number; y: number };
  radius: number;
  hasSecondaryGrid?: boolean;
}

interface TelemetryMark {
  label: string;
  getPos: (w: number, h: number) => { x: number; y: number };
}

export default function FinancialCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Mouse coordinates with smooth easing
    const mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    // 1. Grid Zones: 4 localized, fading atmospheric regions (~25% texture, ~75% calm empty space)
    const gridZones: GridZone[] = [
      // Zone 1: Upper-Right sector (harmonizes with signature globe)
      {
        getCenter: (w, h) => ({ x: w * 0.84, y: Math.max(140, h * 0.16) }),
        radius: 260,
        hasSecondaryGrid: true,
      },
      // Zone 2: Mid-Left Financial Pulse sector (clearing the sidebar)
      {
        getCenter: (w, h) => ({ x: Math.max(340, w * 0.24), y: h * 0.48 }),
        radius: 260,
        hasSecondaryGrid: true,
      },
      // Zone 3: Transverse center sector (underneath metric cards & chart stack)
      {
        getCenter: (w, h) => ({ x: w * 0.52, y: h * 0.36 }),
        radius: 280,
        hasSecondaryGrid: true,
      },
      // Zone 4: Lower-Right sector
      {
        getCenter: (w, h) => ({ x: w * 0.82, y: h * 0.78 }),
        radius: 230,
        hasSecondaryGrid: false,
      },
    ];

    // 2. Fragment point evaluators: 5 independent, realistically bounded micro-curves with continuous organic deformation
    // Fragment 0: Upper-right rising micro-trend
    const getFragment0Point = (t: number, w: number, h: number, time: number, scrollY: number, scrollVel: number) => {
      const startX = w * 0.72;
      const endX = w * 0.93;
      const x = startX + t * (endX - startX);
      const baseY = Math.max(90, h * 0.13) - scrollY * 0.020;
      const velShift = Math.max(-8, Math.min(8, scrollVel * 0.003));
      const climb = -t * 30;
      const wave = Math.sin(t * 7.5 + time * 0.0014) * 5.5 + Math.cos(t * 14 - time * 0.001) * 2.5;
      const y = baseY + climb + wave + velShift;
      return { x, y };
    };

    // Fragment 1: Mid-left Financial Pulse curve (enters from sidebar edge, dips and recovers)
    const getFragment1Point = (t: number, w: number, h: number, time: number, scrollY: number, scrollVel: number) => {
      const startX = Math.max(260, w * 0.16);
      const endX = Math.min(w * 0.36, startX + 260);
      const x = startX + t * (endX - startX);
      const baseY = h * 0.49 - scrollY * 0.034;
      const velShift = Math.max(-8, Math.min(8, scrollVel * 0.003));
      const dip = Math.sin((t - 0.25) * Math.PI) * 14;
      const wave = Math.sin(t * 9 + time * 0.0011) * 3.5;
      const y = baseY + dip + wave + velShift;
      return { x, y };
    };

    // Fragment 2: Transverse Path (passes directly behind KPI cards & Spending Overview)
    const getFragment2Point = (t: number, w: number, h: number, time: number, scrollY: number, scrollVel: number) => {
      const startX = Math.max(280, w * 0.22);
      const endX = w * 0.76;
      const x = startX + t * (endX - startX);
      const baseY = h * 0.31 - scrollY * 0.025;
      const velShift = Math.max(-8, Math.min(8, scrollVel * 0.003));
      const wave1 = Math.sin(t * Math.PI * 2.8 + time * 0.0012) * 16;
      const wave2 = Math.cos(t * Math.PI * 5.2 - time * 0.0008) * 4.5;
      const y = baseY + wave1 + wave2 + velShift;
      return { x, y };
    };

    // Fragment 3: Lower-right stepped micro-trend
    const getFragment3Point = (t: number, w: number, h: number, time: number, scrollY: number, scrollVel: number) => {
      const startX = w * 0.73;
      const endX = w * 0.92;
      const x = startX + t * (endX - startX);
      const baseY = h * 0.77 - scrollY * 0.040;
      const velShift = Math.max(-8, Math.min(8, scrollVel * 0.003));
      const trend = -t * 18;
      const step = Math.sin(t * 12 + time * 0.0015) > 0 ? 3 : -3;
      const y = baseY + trend + step + velShift;
      return { x, y };
    };

    // Fragment 4: Far-left subtle lower anchor curve
    const getFragment4Point = (t: number, w: number, h: number, time: number, scrollY: number, scrollVel: number) => {
      const startX = Math.max(260, w * 0.15);
      const endX = Math.min(w * 0.28, startX + 170);
      const x = startX + t * (endX - startX);
      const baseY = h * 0.83 - scrollY * 0.030;
      const velShift = Math.max(-8, Math.min(8, scrollVel * 0.003));
      const wave = Math.sin(t * Math.PI * 1.6 + time * 0.0009) * 10;
      const y = baseY + wave + velShift;
      return { x, y };
    };

    const getPointOnFragment = (
      fragmentId: number,
      t: number,
      w: number,
      h: number,
      time: number,
      scrollY: number,
      scrollVel: number
    ) => {
      switch (fragmentId) {
        case 0: return getFragment0Point(t, w, h, time, scrollY, scrollVel);
        case 1: return getFragment1Point(t, w, h, time, scrollY, scrollVel);
        case 2: return getFragment2Point(t, w, h, time, scrollY, scrollVel);
        case 3: return getFragment3Point(t, w, h, time, scrollY, scrollVel);
        case 4: default: return getFragment4Point(t, w, h, time, scrollY, scrollVel);
      }
    };

    // 3. Animated Data Nodes (Sparse: 5 nodes total with staggered breathing phases)
    const dataNodes: AnimatedNode[] = [
      { fragmentId: 0, t: 0.65, speed: 0.00032, radius: 3.0, color: 'rgba(5, 150, 105, 0.85)', glowColor: 'rgba(16, 185, 129, 0.35)', pulsePhaseOffset: 0.0 },
      { fragmentId: 1, t: 0.35, speed: 0.00025, radius: 2.8, color: 'rgba(71, 85, 105, 0.75)', glowColor: 'rgba(100, 116, 139, 0.25)', pulsePhaseOffset: 1.2 },
      { fragmentId: 2, t: 0.48, speed: 0.00020, radius: 2.8, color: 'rgba(100, 116, 139, 0.70)', glowColor: 'rgba(100, 116, 139, 0.20)', pulsePhaseOffset: 2.4 },
      { fragmentId: 3, t: 0.80, speed: 0.00028, radius: 3.0, color: 'rgba(5, 150, 105, 0.80)', glowColor: 'rgba(16, 185, 129, 0.30)', pulsePhaseOffset: 3.6 },
      { fragmentId: 4, t: 0.40, speed: 0.00018, radius: 2.5, color: 'rgba(100, 116, 139, 0.65)', glowColor: 'rgba(100, 116, 139, 0.20)', pulsePhaseOffset: 4.8 },
    ];

    // 4. Sparse Ambient Telemetry Marks (Institutional background coordinates)
    const telemetryMarks: TelemetryMark[] = [
      {
        label: 'SYS.PULSE // 0.84',
        getPos: (w, h) => ({ x: w * 0.88, y: Math.max(120, h * 0.14) }),
      },
      {
        label: 'ECB.REF // EUR/USD',
        getPos: (w, h) => ({ x: Math.max(260, w * 0.15), y: h * 0.42 }),
      },
    ];

    let time = 0;

    const render = () => {
      if (!prefersReducedMotion) {
        time += 1;
      }

      // Smooth mouse lerp
      if (mouse.targetX > -500) {
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;
      } else {
        mouse.x = -1000;
        mouse.y = -1000;
      }

      ctx.clearRect(0, 0, width, height);

      const currentScrollY = scrollTracker.scrollY || 0;
      const currentScrollVel = scrollTracker.scrollVelocity || 0;

      // ==========================================
      // LAYER B: DUAL-HIERARCHY LOCALIZED GRID (With subtle living drift)
      // ==========================================
      const primaryGridSize = 80;
      const secondaryGridSize = 40;

      // Continuous subtle drift offset
      const driftX = (time * 0.08) % primaryGridSize;
      const driftY = (time * 0.05 + currentScrollY * 0.015) % primaryGridSize;

      gridZones.forEach((zone) => {
        const center = zone.getCenter(width, height);
        const minX = Math.max(0, center.x - zone.radius);
        const maxX = Math.min(width, center.x + zone.radius);
        const minY = Math.max(0, center.y - zone.radius);
        const maxY = Math.min(height, center.y + zone.radius);

        // Secondary subtle grid (4–6% opacity) within zone core
        if (zone.hasSecondaryGrid) {
          const secRadius = zone.radius * 0.65;
          const secMinX = Math.max(0, center.x - secRadius);
          const secMaxX = Math.min(width, center.x + secRadius);
          const secMinY = Math.max(0, center.y - secRadius);
          const secMaxY = Math.min(height, center.y + secRadius);

          const startSecX = Math.floor((secMinX - driftX) / secondaryGridSize) * secondaryGridSize + driftX;
          const startSecY = Math.floor((secMinY - driftY) / secondaryGridSize) * secondaryGridSize + driftY;

          for (let gx = startSecX; gx <= secMaxX; gx += secondaryGridSize) {
            if ((gx - driftX) % primaryGridSize === 0) continue;
            const dx = gx - center.x;
            if (Math.abs(dx) > secRadius) continue;
            const halfSpan = Math.sqrt(Math.max(0, secRadius * secRadius - dx * dx));
            const lineY1 = Math.max(0, center.y - halfSpan);
            const lineY2 = Math.min(height, center.y + halfSpan);

            const grad = ctx.createLinearGradient(gx, lineY1, gx, lineY2);
            const maxAlpha = 0.055 * (1 - Math.abs(dx) / secRadius);
            grad.addColorStop(0, 'rgba(148, 163, 184, 0)');
            grad.addColorStop(0.5, `rgba(148, 163, 184, ${maxAlpha.toFixed(3)})`);
            grad.addColorStop(1, 'rgba(148, 163, 184, 0)');

            ctx.strokeStyle = grad;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(gx, lineY1);
            ctx.lineTo(gx, lineY2);
            ctx.stroke();
          }

          for (let gy = startSecY; gy <= secMaxY; gy += secondaryGridSize) {
            if ((gy - driftY) % primaryGridSize === 0) continue;
            const dy = gy - center.y;
            if (Math.abs(dy) > secRadius) continue;
            const halfSpan = Math.sqrt(Math.max(0, secRadius * secRadius - dy * dy));
            const lineX1 = Math.max(0, center.x - halfSpan);
            const lineX2 = Math.min(width, center.x + halfSpan);

            const grad = ctx.createLinearGradient(lineX1, gy, lineX2, gy);
            const maxAlpha = 0.055 * (1 - Math.abs(dy) / secRadius);
            grad.addColorStop(0, 'rgba(148, 163, 184, 0)');
            grad.addColorStop(0.5, `rgba(148, 163, 184, ${maxAlpha.toFixed(3)})`);
            grad.addColorStop(1, 'rgba(148, 163, 184, 0)');

            ctx.strokeStyle = grad;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(lineX1, gy);
            ctx.lineTo(lineX2, gy);
            ctx.stroke();
          }
        }

        // Primary grid lines (10–12% opacity)
        const startGridX = Math.floor((minX - driftX) / primaryGridSize) * primaryGridSize + driftX;
        const startGridY = Math.floor((minY - driftY) / primaryGridSize) * primaryGridSize + driftY;

        for (let gx = startGridX; gx <= maxX; gx += primaryGridSize) {
          const dx = gx - center.x;
          if (Math.abs(dx) > zone.radius) continue;
          const halfSpan = Math.sqrt(Math.max(0, zone.radius * zone.radius - dx * dx));
          const lineY1 = Math.max(0, center.y - halfSpan);
          const lineY2 = Math.min(height, center.y + halfSpan);

          const grad = ctx.createLinearGradient(gx, lineY1, gx, lineY2);
          const maxAlpha = 0.11 * (1 - Math.abs(dx) / zone.radius);
          grad.addColorStop(0, 'rgba(100, 116, 139, 0)');
          grad.addColorStop(0.5, `rgba(100, 116, 139, ${maxAlpha.toFixed(3)})`);
          grad.addColorStop(1, 'rgba(100, 116, 139, 0)');

          ctx.strokeStyle = grad;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(gx, lineY1);
          ctx.lineTo(gx, lineY2);
          ctx.stroke();
        }

        for (let gy = startGridY; gy <= maxY; gy += primaryGridSize) {
          const dy = gy - center.y;
          if (Math.abs(dy) > zone.radius) continue;
          const halfSpan = Math.sqrt(Math.max(0, zone.radius * zone.radius - dy * dy));
          const lineX1 = Math.max(0, center.x - halfSpan);
          const lineX2 = Math.min(width, center.x + halfSpan);

          const grad = ctx.createLinearGradient(lineX1, gy, lineX2, gy);
          const maxAlpha = 0.11 * (1 - Math.abs(dy) / zone.radius);
          grad.addColorStop(0, 'rgba(100, 116, 139, 0)');
          grad.addColorStop(0.5, `rgba(100, 116, 139, ${maxAlpha.toFixed(3)})`);
          grad.addColorStop(1, 'rgba(100, 116, 139, 0)');

          ctx.strokeStyle = grad;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(lineX1, gy);
          ctx.lineTo(lineX2, gy);
          ctx.stroke();
        }

        // Small crosshairs '+' at zone intersections
        const crossX = Math.round((center.x - driftX) / primaryGridSize) * primaryGridSize + driftX;
        const crossY = Math.round((center.y - driftY) / primaryGridSize) * primaryGridSize + driftY;
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.30)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const arm = 3.5;
        ctx.moveTo(crossX - arm, crossY);
        ctx.lineTo(crossX + arm, crossY);
        ctx.moveTo(crossX, crossY - arm);
        ctx.lineTo(crossX, crossY + arm);
        ctx.stroke();
      });

      // ==========================================
      // LAYER A: SMALL INDEPENDENT GRAPH FRAGMENTS
      // ==========================================
      const samples = 48;

      // --- Fragment 0: Upper-Right Rising Micro-Chart ---
      ctx.beginPath();
      for (let i = 0; i <= samples; i++) {
        const pt = getFragment0Point(i / samples, width, height, time, currentScrollY, currentScrollVel);
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = 'rgba(5, 150, 105, 0.42)';
      ctx.lineWidth = 1.35;
      ctx.stroke();

      // Baseline under Fragment 0 with ticks
      const f0Start = getFragment0Point(0, width, height, time, currentScrollY, currentScrollVel);
      const f0End = getFragment0Point(1, width, height, time, currentScrollY, currentScrollVel);
      const f0BaseY = Math.max(90, height * 0.13) - currentScrollY * 0.020 + 12;
      ctx.beginPath();
      ctx.setLineDash([2, 4]);
      ctx.moveTo(f0Start.x, f0BaseY);
      ctx.lineTo(f0End.x, f0BaseY);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.28)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      for (let tx = f0Start.x; tx <= f0End.x; tx += 35) {
        ctx.moveTo(tx, f0BaseY - 2);
        ctx.lineTo(tx, f0BaseY + 2);
      }
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
      ctx.stroke();

      // --- Fragment 1: Mid-Left Financial Pulse Recovery ---
      ctx.beginPath();
      for (let i = 0; i <= samples; i++) {
        const pt = getFragment1Point(i / samples, width, height, time, currentScrollY, currentScrollVel);
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.36)';
      ctx.lineWidth = 1.25;
      ctx.stroke();

      const f1Start = getFragment1Point(0, width, height, time, currentScrollY, currentScrollVel);
      const f1Mid = getFragment1Point(0.5, width, height, time, currentScrollY, currentScrollVel);
      const f1End = getFragment1Point(1, width, height, time, currentScrollY, currentScrollVel);
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.30)';
      ctx.beginPath();
      [f1Start, f1Mid, f1End].forEach((pt) => {
        ctx.moveTo(pt.x, pt.y + 6);
        ctx.lineTo(pt.x, pt.y + 11);
      });
      ctx.stroke();

      // --- Fragment 2: Transverse Path (Underneath and between cards) ---
      ctx.beginPath();
      for (let i = 0; i <= samples; i++) {
        const pt = getFragment2Point(i / samples, width, height, time, currentScrollY, currentScrollVel);
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.30)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // --- Fragment 3: Lower-Right Stepped Micro-Trend ---
      ctx.beginPath();
      for (let i = 0; i <= samples; i++) {
        const pt = getFragment3Point(i / samples, width, height, time, currentScrollY, currentScrollVel);
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = 'rgba(5, 150, 105, 0.38)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // --- Fragment 4: Far-Left Lower Anchor ---
      ctx.beginPath();
      for (let i = 0; i <= samples; i++) {
        const pt = getFragment4Point(i / samples, width, height, time, currentScrollY, currentScrollVel);
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.30)';
      ctx.lineWidth = 1.1;
      ctx.stroke();

      // ==========================================
      // LAYER C: AMBIENT FINANCIAL PULSE & TELEMETRY
      // ==========================================
      const pulseShiftY = currentScrollY * 0.026;

      ctx.font = '9px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
      ctx.textBaseline = 'middle';

      telemetryMarks.forEach((mark, idx) => {
        const basePos = mark.getPos(width, height);
        const posX = basePos.x;
        const posY = basePos.y - pulseShiftY;

        // Faint telemetry beacon dot
        const beaconPulse = Math.sin(time * 0.04 + idx * 1.5);
        ctx.beginPath();
        ctx.arc(posX - 8, posY, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(5, 150, 105, 0.65)';
        ctx.fill();

        if (beaconPulse > 0.4 && !prefersReducedMotion) {
          ctx.beginPath();
          ctx.arc(posX - 8, posY, 1.8 + (beaconPulse - 0.4) * 3, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(5, 150, 105, 0.22)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        // Subdued institutional telemetry label
        ctx.fillStyle = 'rgba(100, 116, 139, 0.45)';
        ctx.fillText(mark.label, posX, posY);
      });

      // ==========================================
      // LAYER D: 5 CALM ANIMATED DATA NODES
      // ==========================================
      dataNodes.forEach((node, nodeIdx) => {
        if (!prefersReducedMotion) {
          node.t += node.speed;
          if (node.t > 1) node.t = 0;
        }

        const pt = getPointOnFragment(node.fragmentId, node.t, width, height, time, currentScrollY, currentScrollVel);

        // Mouse proximity reaction (110px halo)
        let proximityScale = 1.0;
        let proximityGlow = 0;
        if (mouse.x > -500) {
          const dist = Math.hypot(pt.x - mouse.x, pt.y - mouse.y);
          if (dist < 110) {
            const proximity = 1 - dist / 110;
            proximityScale = 1 + proximity * 0.35;
            proximityGlow = proximity * 0.45;
          }
        }

        const effectiveRadius = node.radius * proximityScale;

        // Asynchronous breathing pulse
        if (!prefersReducedMotion) {
          const pulseWave = Math.sin(time * 0.035 + node.pulsePhaseOffset);
          if (pulseWave > 0.3) {
            const pulseR = effectiveRadius + (pulseWave - 0.3) * 5.5;
            const pulseAlpha = (0.35 - (pulseR - effectiveRadius) / 7.0);
            if (pulseAlpha > 0) {
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, pulseR, 0, Math.PI * 2);
              ctx.strokeStyle = `rgba(5, 150, 105, ${pulseAlpha.toFixed(3)})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }

        // Halo
        if (proximityGlow > 0) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, effectiveRadius * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(16, 185, 129, ${proximityGlow.toFixed(3)})`;
          ctx.fill();
        }

        // Node circle
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, effectiveRadius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        // White core dot
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 1.0, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Route-aware density adjustment
  const getRouteDensity = () => {
    switch (pathname) {
      case '/':
        return 'opacity-100';
      case '/transactions':
        return 'opacity-70';
      case '/analytics':
        return 'opacity-90';
      case '/settings':
        return 'opacity-60';
      default:
        return 'opacity-85';
    }
  };

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-opacity duration-700 ease-out ${getRouteDensity()}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
