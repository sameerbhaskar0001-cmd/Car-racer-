import React, { useState } from 'react';

interface SettingsModalProps {
  audioEnabled: boolean;
  onToggleAudio: () => void;
  onResetCoins: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  audioEnabled,
  onToggleAudio,
  onResetCoins,
  onClose,
}) => {
  const initialGfx = window.__theRaceEngine?.getGraphicsSettings() || {
    bloomStrength: 0.04,
    dofStrength: 0.0,
    lampIntensity: 1.15,
  };

  // Convert internal engine floats to simple, understandable 0..100% values
  const [brightnessPct, setBrightnessPct] = useState<number>(() =>
    Math.round(
      Math.min(100, Math.max(0, ((initialGfx.lampIntensity - 0.6) / 1.2) * 100))
    )
  );
  const [glowPct, setGlowPct] = useState<number>(() =>
    Math.round(Math.min(100, Math.max(0, (initialGfx.bloomStrength / 0.16) * 100)))
  );
  const [blurPct, setBlurPct] = useState<number>(() =>
    Math.round(Math.min(100, Math.max(0, initialGfx.dofStrength * 100)))
  );

  const handleBrightnessChange = (pct: number) => {
    setBrightnessPct(pct);
    const lampVal = 0.6 + (pct / 100) * 1.2;
    window.__theRaceEngine?.setGraphicsSettings({ lampIntensity: lampVal });
  };

  const handleGlowChange = (pct: number) => {
    setGlowPct(pct);
    const bloomVal = (pct / 100) * 0.16;
    window.__theRaceEngine?.setGraphicsSettings({ bloomStrength: bloomVal });
  };

  const handleBlurChange = (pct: number) => {
    setBlurPct(pct);
    const dofVal = pct / 100;
    window.__theRaceEngine?.setGraphicsSettings({ dofStrength: dofVal });
  };

  const handleCloseModal = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div
      onClick={handleCloseModal}
      className="fixed inset-0 flex items-center justify-center px-4 py-3 select-none pointer-events-auto"
      style={{
        zIndex: 99999,
        backgroundColor: 'rgba(2, 4, 10, 0.85)',
        pointerEvents: 'auto',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-slate-950 border-2 border-cyan-400/60 rounded-2xl p-4 sm:p-5 shadow-2xl text-left pointer-events-auto relative"
        style={{ zIndex: 100000, pointerEvents: 'auto' }}
      >
        {/* Header with Responsive Close / X Button */}
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h2 className="font-['Orbitron'] italic font-black text-xl sm:text-2xl text-white uppercase leading-none">
              SETTINGS
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">
              Customize audio and mobile 60 FPS graphics
            </p>
          </div>

          <button
            type="button"
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close Settings"
            style={{ zIndex: 100001, pointerEvents: 'auto' }}
            className="w-11 h-11 rounded-xl bg-rose-500/20 border-2 border-rose-400/70 active:bg-rose-500/50 text-white font-black text-lg flex items-center justify-center cursor-pointer shadow-lg active:scale-95"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {/* 1. Sound Effects & Engine Audio */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/95 border border-white/10">
            <div>
              <div className="font-['Orbitron'] italic font-bold text-xs sm:text-sm text-white">
                ENGINE &amp; UI SOUND
              </div>
              <div className="text-[11px] text-slate-400">
                Synthesized engine roar, drift &amp; nitro audio
              </div>
            </div>
            <button
              type="button"
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleAudio();
              }}
              onClick={onToggleAudio}
              className={`px-4 py-2 rounded-xl font-['Orbitron'] italic font-bold text-xs uppercase cursor-pointer border-2 transition-colors ${
                audioEnabled
                  ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                  : 'bg-slate-800 border-white/25 text-slate-300'
              }`}
            >
              {audioEnabled ? 'SOUND ON' : 'MUTED'}
            </button>
          </div>

          {/* 2. Track & Scene Brightness */}
          <div className="p-3 rounded-xl bg-slate-900/95 border border-white/10 flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs font-['Orbitron'] italic font-bold text-slate-200">
              <span>TRACK BRIGHTNESS</span>
              <span className="font-mono text-amber-300">{brightnessPct}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={brightnessPct}
              onChange={(e) =>
                handleBrightnessChange(parseInt(e.target.value, 10))
              }
              className="w-full h-2 accent-amber-400 cursor-pointer"
            />
          </div>

          {/* 3. Neon Glow (Bloom) */}
          <div className="p-3 rounded-xl bg-slate-900/95 border border-white/10 flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs font-['Orbitron'] italic font-bold text-slate-200">
              <span>NEON GLOW EFFECT</span>
              <span className="font-mono text-cyan-300">{glowPct}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={glowPct}
              onChange={(e) => handleGlowChange(parseInt(e.target.value, 10))}
              className="w-full h-2 accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* 4. Background Blur (Depth of Field) */}
          <div className="p-3 rounded-xl bg-slate-900/95 border border-white/10 flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs font-['Orbitron'] italic font-bold text-slate-200">
              <span>BACKGROUND BLUR (0% = MAX FPS)</span>
              <span className="font-mono text-emerald-300">
                {blurPct === 0 ? 'OFF (60 FPS)' : `${blurPct}%`}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={10}
              value={blurPct}
              onChange={(e) => handleBlurChange(parseInt(e.target.value, 10))}
              className="w-full h-2 accent-emerald-400 cursor-pointer"
            />
          </div>

          {/* Footer: Free Coins & Done Button */}
          <div className="flex items-center justify-between pt-1.5 gap-3">
            <button
              type="button"
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onResetCoins();
              }}
              onClick={onResetCoins}
              className="px-3.5 py-2.5 rounded-xl bg-amber-500/20 border border-amber-400/60 active:bg-amber-500/40 text-xs font-mono font-bold text-amber-300 cursor-pointer"
            >
              +500 FREE COINS
            </button>

            <button
              type="button"
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              style={{ zIndex: 100001, pointerEvents: 'auto' }}
              className="flex-1 py-2.5 px-6 rounded-xl bg-cyan-500/35 border-2 border-cyan-400 active:bg-cyan-500/60 font-['Orbitron'] italic font-black text-xs sm:text-sm text-white uppercase tracking-wider cursor-pointer shadow-lg"
            >
              DONE ✓
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
