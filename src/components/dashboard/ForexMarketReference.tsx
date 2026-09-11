'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Globe,
  TrendingUp,
  TrendingDown,
  Info,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  ForexPair,
  ForexTimeframe,
  ForexRateItem,
  ForexPairSummary,
  FOREX_PAIRS_CONFIG,
  fetchForexHistory,
  fetchLatestForexSummaries,
} from '@/services/forexService';

const AVAILABLE_PAIRS: ForexPair[] = [
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'USD/CHF',
  'AUD/USD',
  'USD/CAD',
];

const TIMEFRAMES: ForexTimeframe[] = ['1M', '3M', '6M', '1Y'];

export default function ForexMarketReference() {
  const [selectedPair, setSelectedPair] = useState<ForexPair>('EUR/USD');
  const [selectedTimeframe, setSelectedTimeframe] = useState<ForexTimeframe>('3M');
  const [history, setHistory] = useState<ForexRateItem[]>([]);
  const [summaries, setSummaries] = useState<ForexPairSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load latest reference rates for all pairs on mount
  useEffect(() => {
    let isMounted = true;
    fetchLatestForexSummaries().then((data) => {
      if (isMounted) setSummaries(data);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Load history whenever selectedPair or selectedTimeframe changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchForexHistory(selectedPair, selectedTimeframe).then((data) => {
      if (isMounted) {
        setHistory(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [selectedPair, selectedTimeframe]);

  const cfg = FOREX_PAIRS_CONFIG[selectedPair];
  const currentSummary = summaries.find((s) => s.pair === selectedPair);
  const currentRate = currentSummary?.currentRate ?? (history[history.length - 1]?.rate || 1.16);

  // Calculate period statistics
  const firstRate = history[0]?.rate || currentRate;
  const periodChange = firstRate > 0 ? ((currentRate - firstRate) / firstRate) * 100 : 0;
  const ratesArray = history.map((h) => h.rate);
  const minRate = ratesArray.length ? Math.min(...ratesArray) : currentRate;
  const maxRate = ratesArray.length ? Math.max(...ratesArray) : currentRate;
  const isPositive = periodChange >= 0;

  return (
    <div className="surface-l2 rounded-xl p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-600" />
            <h3 className="text-base font-semibold text-slate-900">
              Currency & FX Reference
            </h3>
            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
              ECB Daily Reference
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Official European Central Bank benchmark exchange rates via Frankfurter. Updated once daily.
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 self-start sm:self-auto">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setSelectedTimeframe(tf)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                selectedTimeframe === tf
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Pair Pills Grid */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {AVAILABLE_PAIRS.map((pair) => {
          const sum = summaries.find((s) => s.pair === pair);
          const isSelected = selectedPair === pair;

          return (
            <button
              key={pair}
              onClick={() => setSelectedPair(pair)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all shrink-0 flex items-center gap-2 ${
                isSelected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{pair}</span>
              {sum && (
                <span
                  className={`text-[11px] ${
                    isSelected ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                >
                  {sum.currentRate.toFixed(FOREX_PAIRS_CONFIG[pair].decimals)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Chart and Metrics Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
        {/* Metric Summary Column */}
        <div className="lg:col-span-1 bg-slate-50/75 border border-slate-200/80 rounded-xl p-4 space-y-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">
              {cfg.name}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {currentRate.toFixed(cfg.decimals)}
              </span>
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                  isPositive ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {isPositive ? '+' : ''}
                {periodChange.toFixed(2)}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Over trailing {selectedTimeframe} period
            </p>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-200/80 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Period High</span>
              <span className="font-semibold text-slate-900">
                {maxRate.toFixed(cfg.decimals)}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Period Low</span>
              <span className="font-semibold text-slate-900">
                {minRate.toFixed(cfg.decimals)}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" /> Reference Date
              </span>
              <span className="text-slate-700 font-medium">
                {currentSummary?.referenceDate || '10 Sep 2026'}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-500 leading-relaxed flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Daily reference rates are based on regular daily concertation between central banks across Europe.
            </span>
          </div>
        </div>

        {/* Historical Line Chart Column */}
        <div className="lg:col-span-3">
          <div className="h-56 w-full">
            {loading ? (
              <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">
                Loading reference data...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={history}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="forexAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#F1F5F9"
                  />
                  <XAxis
                    dataKey="displayDate"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: '#94A3B8' }}
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: '#94A3B8' }}
                    tickFormatter={(val) => Number(val).toFixed(cfg.decimals <= 2 ? 2 : 3)}
                  />
                  <Tooltip
                    formatter={(val: any) => [
                      `${Number(val).toFixed(cfg.decimals)} ${cfg.quote}`,
                      `1 ${cfg.base}`,
                    ]}
                    labelFormatter={(label) => `Reference Date: ${label}`}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      fontSize: '11px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
                      color: '#0F172A',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#059669"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#059669' }}
                    fillOpacity={1}
                    fill="url(#forexAreaGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
