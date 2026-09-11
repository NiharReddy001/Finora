'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Radio } from 'lucide-react';
import { FOREX_QUOTES } from '@/data/forexData';

export default function ForexTicker() {
  return (
    <div className="h-8 bg-[#090D0B] border-b border-[#141C16] flex items-center px-4 overflow-hidden select-none text-[11px] tracking-tight">
      {/* Ticker System Badge */}
      <div className="flex items-center gap-2 pr-3 sm:pr-4 border-r border-[#141C16] shrink-0 font-medium text-[#5C6A60]">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C8FF4D] opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#C8FF4D]" />
        </span>
        <span className="hidden sm:inline uppercase text-[9px] tracking-widest text-[#7D8C81]">
          FX Telemetry
        </span>
      </div>

      {/* Sliding marquee track */}
      <div className="flex-1 overflow-hidden flex items-center relative pl-3 sm:pl-4">
        {/* Left and right soft fade mask */}
        <div className="absolute left-0 inset-y-0 w-4 bg-gradient-to-r from-[#090D0B] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 inset-y-0 w-8 bg-gradient-to-l from-[#090D0B] to-transparent z-10 pointer-events-none" />

        <div className="flex items-center gap-6 sm:gap-8 whitespace-nowrap animate-ticker overflow-x-auto scrollbar-none py-1">
          {/* Double list for smooth seamless continuity */}
          {[...FOREX_QUOTES, ...FOREX_QUOTES].map((item, idx) => {
            const isUp = item.trend === 'up';
            return (
              <div
                key={`${item.symbol}-${idx}`}
                className="inline-flex items-center gap-2 font-mono text-[11px]"
              >
                <span className="font-semibold text-[#CBD5CE]">
                  {item.symbol}
                </span>
                <span className="text-[#8E9B91]">{item.price}</span>
                <span
                  className={`inline-flex items-center gap-0.5 font-medium ${
                    isUp ? 'text-[#C8FF4D]' : 'text-[#F46A6A]'
                  }`}
                >
                  {isUp ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {item.percent}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
