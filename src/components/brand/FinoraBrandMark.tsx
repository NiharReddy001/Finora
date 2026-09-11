import React from 'react';

interface FinoraBrandMarkProps {
  size?: number;
  className?: string;
  variant?: 'glyph' | 'badge-emerald' | 'badge-light' | 'badge-dark';
  monochrome?: boolean;
}

/**
 * FinoraBrandMark
 * 
 * The official Finora brand mark: A minimalist, geometric symbol communicating
 * financial intelligence, movement, flow, precision, and continuous data streams.
 * 
 * Implemented with pure geometry and solid vector fills to guarantee zero SVG defs/ID
 * collision bugs across responsive DOM breakpoints (hidden / desktop / mobile).
 */
export function FinoraBrandMark({
  size = 32,
  className = '',
  variant = 'badge-emerald',
  monochrome = false,
}: FinoraBrandMarkProps) {
  if (variant === 'badge-emerald') {
    return (
      <div
        style={{
          width: size,
          height: size,
          background: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
        }}
        className={`rounded-[22%] flex items-center justify-center shrink-0 shadow-xs border border-emerald-400/20 select-none ${className}`}
        role="img"
        aria-label="Finora"
      >
        <svg
          width={Math.round(size * 0.72)}
          height={Math.round(size * 0.72)}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Top Horizon Blade */}
          <path
            d="M6 7.5C6 5.84315 7.34315 4.5 9 4.5H21.5C22.6935 4.5 23.838 4.97411 24.682 5.81802L26.682 7.81802C27.5724 8.70845 26.9416 10.25 25.682 10.25H9C7.34315 10.25 6 8.90685 6 7.25V7.5Z"
            fill="#ffffff"
          />
          {/* Lower Wing & Stability Spine */}
          <path
            d="M6 14C6 12.6193 7.11929 11.5 8.5 11.5H17.5C18.6935 11.5 19.838 11.9741 20.682 12.818L22.182 14.318C23.0724 15.2085 22.4416 16.75 21.182 16.75H11.5V25.5C11.5 26.8807 10.3807 28 9 28C7.61929 28 6 26.8807 6 25.5V14Z"
            fill="#ffffff"
            fillOpacity="0.9"
          />
        </svg>
      </div>
    );
  }

  if (variant === 'badge-light') {
    return (
      <div
        style={{ width: size, height: size }}
        className={`rounded-[22%] bg-emerald-50 border border-emerald-200/80 flex items-center justify-center shrink-0 select-none ${className}`}
        role="img"
        aria-label="Finora"
      >
        <svg
          width={Math.round(size * 0.72)}
          height={Math.round(size * 0.72)}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 7.5C6 5.84315 7.34315 4.5 9 4.5H21.5C22.6935 4.5 23.838 4.97411 24.682 5.81802L26.682 7.81802C27.5724 8.70845 26.9416 10.25 25.682 10.25H9C7.34315 10.25 6 8.90685 6 7.25V7.5Z"
            fill="#059669"
          />
          <path
            d="M6 14C6 12.6193 7.11929 11.5 8.5 11.5H17.5C18.6935 11.5 19.838 11.9741 20.682 12.818L22.182 14.318C23.0724 15.2085 22.4416 16.75 21.182 16.75H11.5V25.5C11.5 26.8807 10.3807 28 9 28C7.61929 28 6 26.8807 6 25.5V14Z"
            fill="#047857"
          />
        </svg>
      </div>
    );
  }

  if (variant === 'badge-dark') {
    return (
      <div
        style={{ width: size, height: size }}
        className={`rounded-[22%] bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 shadow-xs select-none ${className}`}
        role="img"
        aria-label="Finora"
      >
        <svg
          width={Math.round(size * 0.72)}
          height={Math.round(size * 0.72)}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 7.5C6 5.84315 7.34315 4.5 9 4.5H21.5C22.6935 4.5 23.838 4.97411 24.682 5.81802L26.682 7.81802C27.5724 8.70845 26.9416 10.25 25.682 10.25H9C7.34315 10.25 6 8.90685 6 7.25V7.5Z"
            fill="#ffffff"
          />
          <path
            d="M6 14C6 12.6193 7.11929 11.5 8.5 11.5H17.5C18.6935 11.5 19.838 11.9741 20.682 12.818L22.182 14.318C23.0724 15.2085 22.4416 16.75 21.182 16.75H11.5V25.5C11.5 26.8807 10.3807 28 9 28C7.61929 28 6 26.8807 6 25.5V14Z"
            fill="#34d399"
          />
        </svg>
      </div>
    );
  }

  // Pure standalone vector glyph (no container)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      role="img"
      aria-label="Finora"
    >
      <path
        d="M6 7.5C6 5.84315 7.34315 4.5 9 4.5H21.5C22.6935 4.5 23.838 4.97411 24.682 5.81802L26.682 7.81802C27.5724 8.70845 26.9416 10.25 25.682 10.25H9C7.34315 10.25 6 8.90685 6 7.25V7.5Z"
        fill={monochrome ? 'currentColor' : '#059669'}
      />
      <path
        d="M6 14C6 12.6193 7.11929 11.5 8.5 11.5H17.5C18.6935 11.5 19.838 11.9741 20.682 12.818L22.182 14.318C23.0724 15.2085 22.4416 16.75 21.182 16.75H11.5V25.5C11.5 26.8807 10.3807 28 9 28C7.61929 28 6 26.8807 6 25.5V14Z"
        fill={monochrome ? 'currentColor' : '#047857'}
      />
    </svg>
  );
}

/**
 * FinoraLockup
 * 
 * Full official brand lockup: Brand mark badge + high-precision typography.
 */
export function FinoraLockup({
  size = 32,
  variant = 'badge-emerald',
  className = '',
}: {
  size?: number;
  variant?: 'badge-emerald' | 'badge-light' | 'badge-dark' | 'glyph';
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <FinoraBrandMark size={size} variant={variant} />
      <div className="flex flex-col">
        <span className="font-bold tracking-tight text-slate-950 text-[15px] leading-none">
          Finora
        </span>
        <span className="text-[9.5px] uppercase tracking-[0.14em] text-emerald-700 font-semibold mt-1 leading-none">
          Finance Intelligence
        </span>
      </div>
    </div>
  );
}
