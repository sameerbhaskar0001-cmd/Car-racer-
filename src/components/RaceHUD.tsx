import React, { useState, useEffect, useCallback } from 'react';
import { BodyKitSpec, RaceTelemetry, formatRaceTime } from '../types/game';

interface RaceHUDProps {
  telemetry: RaceTelemetry;
  equippedKit: BodyKitSpec;
  onOpenMenu: () => void;
  onOpenSettings: () => void;
  onTriggerFinishDemo: () => void;
}

export const RaceHUD: React.FC<RaceHUDProps> = ({
  telemetry,
  equippedKit,
  onOpenMenu,
  onOpenSettings,
}) => {
  const [activeControls, setActiveControls] = useState<{
    left: boolean;
    right: boolean;
    forward: boolean;
    backward: boolean;
    nitro: boolean;
  }>({
    left: false,
    right: false,
    forward: false,
    backward: false,
    nitro: false,
  });

  // Clear all touch controls when unmounting RaceHUD
  useEffect(() => {
    return () => {
      window.__theRaceEngine?.clearTouchControls();
    };
  }, []);

  const setDirectionState = useCallback(
    (dir: 'left' | 'right' | 'forward' | 'backward', isDown: boolean) => {
      setActiveControls((prev) => {
        if (prev[dir] === isDown) return prev;
        return { ...prev, [dir]: isDown };
      });
      window.__theRaceEngine?.setTouchControl(dir, isDown);
    },
    []
  );

  const handleNitroTrigger = useCallback((isDown: boolean) => {
    setActiveControls((prev) => ({ ...prev, nitro: isDown }));
    if (isDown) {
      window.__theRaceEngine?.triggerNitro();
    }
  }, []);

  const isBoosting = telemetry.boostActive > 0.05;
  const nitroPercent = Math.round(Math.min(1, Math.max(0, telemetry.boostCharge)) * 100);

  return (
    <div className="fixed inset-0 z-30 pointer-events-none flex flex-col justify-between px-4 py-3 sm:px-7 sm:py-5 select-none touch-none">
      {/* TOP BAR: Navigation (Left) | Live Telemetry, Lap & Speedometer (Right) */}
      <header className="flex items-start justify-between gap-3 w-full">
        {/* Top-Left: Menu & Settings */}
        <div className="pointer-events-auto flex items-center gap-2.5">
          <button
            type="button"
            onTouchStart={(e) => {
              e.stopPropagation();
              window.__theRaceEngine?.clearTouchControls();
              onOpenMenu();
            }}
            onClick={(e) => {
              e.stopPropagation();
              window.__theRaceEngine?.clearTouchControls();
              onOpenMenu();
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-white/25 active:border-cyan-400 font-['Orbitron'] italic font-bold text-xs text-white tracking-wider uppercase cursor-pointer shadow-lg active:scale-95"
          >
            ← MENU
          </button>

          <button
            type="button"
            onTouchStart={(e) => {
              e.stopPropagation();
              onOpenSettings();
            }}
            onClick={(e) => {
              e.stopPropagation();
              onOpenSettings();
            }}
            aria-label="Settings"
            className="w-9 h-9 rounded-xl bg-slate-950/80 border border-white/20 active:border-cyan-400 text-slate-200 flex items-center justify-center cursor-pointer shadow-lg active:scale-95"
          >
            ⚙
          </button>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-white/10">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: equippedKit.primaryColor }}
            />
            <span className="font-['Orbitron'] italic font-bold text-[11px] text-slate-200 tracking-wide">
              {equippedKit.name}
            </span>
          </div>
        </div>

        {/* Top-Right: Speedometer, Nitro Bar & Lap Counter */}
        <div className="flex items-center gap-4 sm:gap-6 bg-slate-950/75 border border-white/15 rounded-2xl px-4 py-2 shadow-xl">
          {/* Speedometer */}
          <div className="flex items-baseline gap-1.5">
            <span
              className="font-['Orbitron'] italic font-black text-3xl sm:text-4xl text-white tabular-nums leading-none"
              style={{
                textShadow: isBoosting
                  ? '0 0 18px rgba(0, 240, 255, 0.95)'
                  : '0 2px 8px rgba(0, 0, 0, 0.95)',
              }}
            >
              {telemetry.speedKmh}
            </span>
            <span className="font-['Orbitron'] italic font-extrabold text-[11px] text-cyan-300 tracking-wider">
              KM/H
            </span>
          </div>

          {/* Lap Counter & Timer */}
          <div className="flex flex-col items-end border-l border-white/15 pl-4">
            <div className="font-['Orbitron'] italic font-black text-base sm:text-lg tracking-wider text-white leading-none">
              LAP <span className="text-cyan-400">{telemetry.lapCount}</span>/3
            </div>
            <div className="font-mono font-bold text-xs sm:text-sm text-amber-300 tabular-nums tracking-tight mt-0.5">
              {formatRaceTime(telemetry.totalRaceTime || telemetry.currentLapTime)}
            </div>
          </div>
        </div>
      </header>

      {/* CENTER COUNTDOWN OVERLAY */}
      {telemetry.countdownStep > 0 && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-30">
          <div
            className="font-['Orbitron'] italic font-black text-7xl sm:text-8xl text-white"
            style={{
              textShadow:
                '0 0 32px rgba(255, 59, 48, 0.9), 0 6px 20px rgba(0, 0, 0, 0.95)',
            }}
          >
            {telemetry.countdownStep}
          </div>
        </div>
      )}

      {/* ERGONOMIC MOBILE DUAL-THUMB CONTROLS:
          BOTTOM-LEFT: Large Translucent Left / Right Steering Pads
          BOTTOM-RIGHT: Ergonomic Cluster with Brake/Reverse, Giant Accelerate Pedal, and Nitro Above */}
      <div className="w-full flex items-end justify-between pb-1 sm:pb-2 pointer-events-none">
        {/* BOTTOM-LEFT: STEERING (LEFT & RIGHT THUMB PADS) */}
        <div
          className="pointer-events-auto flex items-center gap-3 sm:gap-4"
          role="group"
          aria-label="Steering Controls"
        >
          {/* STEER LEFT */}
          <button
            type="button"
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDirectionState('left', true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDirectionState('left', false);
            }}
            onTouchCancel={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDirectionState('left', false);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              setDirectionState('left', true);
            }}
            onMouseUp={() => setDirectionState('left', false)}
            onMouseLeave={() => setDirectionState('left', false)}
            aria-label="Steer Left"
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex flex-col items-center justify-center border-2 transition-transform select-none touch-none cursor-pointer ${
              activeControls.left
                ? 'bg-cyan-400/40 border-cyan-200 text-white scale-95 shadow-[0_0_24px_rgba(0,240,255,0.75)]'
                : 'bg-slate-950/55 border-white/30 text-white/90 shadow-lg'
            }`}
          >
            <svg
              className="w-9 h-9 sm:w-11 sm:h-11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span className="font-['Orbitron'] font-bold text-[9px] tracking-widest uppercase mt-0.5 opacity-80">
              LEFT
            </span>
          </button>

          {/* STEER RIGHT */}
          <button
            type="button"
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDirectionState('right', true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDirectionState('right', false);
            }}
            onTouchCancel={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDirectionState('right', false);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              setDirectionState('right', true);
            }}
            onMouseUp={() => setDirectionState('right', false)}
            onMouseLeave={() => setDirectionState('right', false)}
            aria-label="Steer Right"
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex flex-col items-center justify-center border-2 transition-transform select-none touch-none cursor-pointer ${
              activeControls.right
                ? 'bg-cyan-400/40 border-cyan-200 text-white scale-95 shadow-[0_0_24px_rgba(0,240,255,0.75)]'
                : 'bg-slate-950/55 border-white/30 text-white/90 shadow-lg'
            }`}
          >
            <svg
              className="w-9 h-9 sm:w-11 sm:h-11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
            <span className="font-['Orbitron'] font-bold text-[9px] tracking-widest uppercase mt-0.5 opacity-80">
              RIGHT
            </span>
          </button>
        </div>

        {/* BOTTOM-RIGHT: ERGONOMIC PEDAL CLUSTER (NITRO ABOVE + BRAKE/REVERSE & ACCEL BELOW) */}
        <div
          className="pointer-events-auto flex flex-col items-end gap-2.5 sm:gap-3"
          role="group"
          aria-label="Throttle, Brake and Nitro Controls"
        >
          {/* Upper-Right Thumb Arc: NITRO BOOST BUTTON with Charge Fill */}
          <button
            type="button"
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleNitroTrigger(true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleNitroTrigger(false);
            }}
            onTouchCancel={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleNitroTrigger(false);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              handleNitroTrigger(true);
            }}
            onMouseUp={() => handleNitroTrigger(false)}
            onMouseLeave={() => handleNitroTrigger(false)}
            aria-label="Nitro Boost"
            className={`relative overflow-hidden h-12 sm:h-14 px-5 sm:px-6 rounded-2xl font-['Orbitron'] italic font-black text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 border-2 transition-transform select-none touch-none cursor-pointer ${
              activeControls.nitro || isBoosting
                ? 'bg-amber-400/80 border-white text-slate-950 scale-95 shadow-[0_0_25px_rgba(251,191,36,0.95)]'
                : 'bg-slate-950/60 border-amber-400/70 text-amber-300 shadow-lg'
            }`}
          >
            <div
              className="absolute inset-y-0 left-0 bg-amber-400/25 pointer-events-none transition-all duration-150"
              style={{ width: `${nitroPercent}%` }}
            />
            <span className="relative z-10 text-base leading-none">⚡</span>
            <span className="relative z-10">NITRO</span>
            <span className="relative z-10 font-mono text-[10px] opacity-90">
              {nitroPercent}%
            </span>
          </button>

          {/* Lower-Right Pedals Row: BRAKE/REVERSE (Left) + LARGE ACCELERATE PEDAL (Right) */}
          <div className="flex items-end gap-3 sm:gap-4">
            {/* BRAKE / SMOOTH REVERSE */}
            <button
              type="button"
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDirectionState('backward', true);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDirectionState('backward', false);
              }}
              onTouchCancel={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDirectionState('backward', false);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                setDirectionState('backward', true);
              }}
              onMouseUp={() => setDirectionState('backward', false)}
              onMouseLeave={() => setDirectionState('backward', false)}
              aria-label="Brake and Reverse"
              className={`w-20 h-18 sm:w-24 sm:h-20 rounded-2xl font-['Orbitron'] italic font-black text-xs tracking-wider uppercase flex flex-col items-center justify-center border-2 transition-transform select-none touch-none cursor-pointer ${
                activeControls.backward
                  ? 'bg-rose-500/50 border-rose-200 text-white scale-95 shadow-[0_0_24px_rgba(244,63,94,0.8)]'
                  : 'bg-slate-950/55 border-rose-400/60 text-rose-200 shadow-lg'
              }`}
            >
              <span className="text-xs sm:text-sm font-black">BRAKE</span>
              <span className="text-[9px] font-bold text-rose-300/85 tracking-widest mt-0.5">
                REV
              </span>
            </button>

            {/* LARGE PRIMARY ACCELERATE PEDAL */}
            <button
              type="button"
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDirectionState('forward', true);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDirectionState('forward', false);
              }}
              onTouchCancel={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDirectionState('forward', false);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                setDirectionState('forward', true);
              }}
              onMouseUp={() => setDirectionState('forward', false)}
              onMouseLeave={() => setDirectionState('forward', false)}
              aria-label="Accelerate"
              className={`w-24 h-22 sm:w-28 sm:h-26 rounded-3xl font-['Orbitron'] italic font-black text-sm sm:text-base tracking-wider uppercase flex flex-col items-center justify-center border-2 transition-transform select-none touch-none cursor-pointer ${
                activeControls.forward
                  ? 'bg-emerald-400/45 border-emerald-200 text-white scale-95 shadow-[0_0_28px_rgba(16,185,129,0.85)]'
                  : 'bg-slate-950/55 border-emerald-400/75 text-emerald-200 shadow-xl'
              }`}
            >
              <svg
                className="w-7 h-7 sm:w-8 sm:h-8 mb-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 15l-6-6-6 6" />
              </svg>
              <span>ACCEL</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
