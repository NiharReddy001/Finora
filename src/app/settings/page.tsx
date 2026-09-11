'use client';

import React, { useState } from 'react';
import { User, Globe, Moon, Sun, Check } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';

export default function SettingsPage() {
  const {
    user,
    updateUser,
    currency,
    setCurrency,
    dateFormat,
    setDateFormat,
    theme,
    setTheme,
  } = useFinance();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name, email });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 motion-header">
          Settings
        </h1>
        <p className="text-sm text-slate-600 mt-1 motion-supporting font-medium">
          Configure workspace identity, regional currency, and interface appearance.
        </p>
      </div>

      {/* Profile Section */}
      <div className="surface-l3 rounded-xl p-6 motion-primary">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <User className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-semibold text-slate-900">
            Workspace Profile
          </h2>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Workspace Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Workspace Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="tactile-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-xs"
            >
              <Check className="w-4 h-4" /> Save Workspace
            </button>
            {savedSuccess && (
              <span className="text-xs text-emerald-600 font-medium">
                Workspace updated successfully!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Preferences Section */}
      <div className="surface-l3 rounded-xl p-6 motion-main">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <Globe className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-semibold text-slate-900">
            Localization & Currency
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Default Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="INR">₹ INR (Indian Rupee)</option>
              <option value="USD">$ USD (US Dollar)</option>
              <option value="EUR">€ EUR (Euro)</option>
              <option value="GBP">£ GBP (British Pound)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Date Format
            </label>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY (11/09/2026)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (09/11/2026)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (2026-09-11)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="surface-l3 rounded-xl p-6 motion-secondary">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <Sun className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-semibold text-slate-900">
            Interface Theme
          </h2>
        </div>

        <p className="text-xs text-slate-500 mb-4">
          Select your visual preference for the Finora interface.
        </p>

        <div className="grid grid-cols-2 gap-3 max-w-sm">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`tactile-btn flex items-center justify-center gap-2 p-3 rounded-lg border text-xs font-medium ${
              theme === 'light'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold shadow-xs'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Sun className="w-4 h-4" /> Light (Default)
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`tactile-btn flex items-center justify-center gap-2 p-3 rounded-lg border text-xs font-medium ${
              theme === 'dark'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold shadow-xs'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Moon className="w-4 h-4" /> Dark Mode
          </button>
        </div>
      </div>
    </div>
  );
}
