import React, { useState } from 'react';
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
  onOpenMenu,
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

  const handleControlPress = (
    dir: 'left' | 'right' | 'forward' | 'backward',
    isDown: boolean
  ) => {
    setActiveControls((prev) => ({ ...prev, [dir]: isDown }));
    window.__theRaceEngine?.setTouchControl(dir, isDown);
  };

  const handleNitroPress = (isDown: boolean) => {
    setActiveControls((prev) => ({ ...prev, nitro: isDown }));
    if (isDown) {
      window.__theRaceEngine?.triggerNitro();
    }
  };

  const isBoosting = telemetry.boostActive > 0.05;

  return (
    <div className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between px-5 py-4 sm:px-8 sm:py-6 select-none touch-none">
      {/* Top Bar: Minimal Menu Button (Left) | Speedometer & Lap Counter (Center/Right) */}
      <header className="flex items-start justify-between gap-4 w-full">
        {/* Top-Left: Minimal Menu Button */}
        <div className="pointer-events-auto">
          <button
            type="button"
            onClick={onOpenMenu}
            className="px-4 py-2.5 rounded-lg bg-slate-950/85 border border-white/20 hover:border-cyan-400 font-['Orbitron'] italic font-bold text-xs text-white tracking-wider uppercase cursor-pointer transition-colors shadow-lg active:scale-95"
          >
            ← MENU
          </button>
        </div>

        {/* Top Center/Right: Clean Digital Speedometer (KM/H) & Lap Counter */}
        <div className="flex items-center gap-6 sm:gap-8">
          {/* Digital Speedometer */}
          <div className="flex flex-col items-end">
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span
                className="font-['Orbitron'] italic font-black text-3xl sm:text-5xl text-white tabular-nums leading-none tracking-tight"
                style={{
                  textShadow: isBoosting
                    ? '0 0 20px rgba(0, 240, 255, 0.95)'
                    : '0 2px 10px rgba(0, 0, 0, 0.95)',
                }}
              >
                {telemetry.speedKmh}
              </span>
              <span className="font-['Orbitron'] italic font-extrabold text-xs sm:text-sm text-cyan-300 tracking-wider">
                KM/H
              </span>
            </div>
          </div>

          {/* Lap Counter & Lap Time */}
          <div className="flex flex-col items-end border-l border-white/15 pl-5 sm:pl-6">
            <div
              className="font-['Orbitron'] italic font-black text-lg sm:text-2xl tracking-wider text-white leading-none"
              style={{
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.95)',
              }}
            >
              LAP <span className="text-cyan-400">{telemetry.lapCount}</span>/3
            </div>
            <div
              className="font-['Orbitron'] italic font-bold text-sm sm:text-base text-slate-300 tabular-nums tracking-wide mt-1"
              style={{
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.9)',
              }}
            >
              {formatRaceTime(telemetry.totalRaceTime || telemetry.currentLapTime)}
            </div>
          </div>
        </div>
      </header>

      {/* Center Grid Countdown Overlay */}
      {telemetry.countdownStep > 0 && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-30">
          <div
            className="font-['Orbitron'] italic font-black text-7xl sm:text-9xl text-white"
            style={{
              textShadow:
                '0 0 32px rgba(255, 59, 48, 0.85), 0 6px 20px rgba(0, 0, 0, 0.95)',
            }}
          >
            {telemetry.countdownStep}
          </div>
        </div>
      )}

      {/* Bottom Landscape Mobile Touch Controls */}
      <div className="pointer-events-auto flex items-end justify-between w-full pb-2">
        {/* Bottom Left: [ < ] (Steer Left) and [ > ] (Steer Right) */}
        <div
          className="flex items-center gap-3 sm:gap-4"
          role="group"
          aria-label="Steering Touch Controls"
        >
          {/* Steer Left [ < ] */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              handleControlPress('left', true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              handleControlPress('left', false);
            }}
            onPointerLeave={() => handleControlPress('left', false)}
            onPointerCancel={() => handleControlPress('left', false)}
            aria-label="Steer Left"
            className={`w-18 h-18 sm:w-22 sm:h-22 rounded-2xl flex flex-col items-center justify-center border-2 transition-all select-none touch-none cursor-pointer ${
              activeControls.left
                ? 'bg-amber-500/45 border-amber-300 text-white scale-95 shadow-[0_0_24px_rgba(251,191,36,0.7)]'
                : 'bg-slate-950/85 border-amber-400/50 text-amber-200 hover:border-amber-300 shadow-xl'
            }`}
          >
            <span className="font-['Orbitron'] font-black text-2xl sm:text-3xl leading-none">
              &lt;
            </span>
          </button>

          {/* Steer Right [ > ] */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              handleControlPress('right', true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              handleControlPress('right', false);
            }}
            onPointerLeave={() => handleControlPress('right', false)}
            onPointerCancel={() => handleControlPress('right', false)}
            aria-label="Steer Right"
            className={`w-18 h-18 sm:w-22 sm:h-22 rounded-2xl flex flex-col items-center justify-center border-2 transition-all select-none touch-none cursor-pointer ${
              activeControls.right
                ? 'bg-amber-500/45 border-amber-300 text-white scale-95 shadow-[0_0_24px_rgba(251,191,36,0.7)]'
                : 'bg-slate-950/85 border-amber-400/50 text-amber-200 hover:border-amber-300 shadow-xl'
            }`}
          >
            <span className="font-['Orbitron'] font-black text-2xl sm:text-3xl leading-none">
              &gt;
            </span>
          </button>
        </div>

        {/* Bottom Right: [ BRAKE / REVERSE ] and [ ACCEL ] (Plus Nitro Boost) */}
        <div
          className="flex items-end gap-3 sm:gap-4"
          role="group"
          aria-label="Driving Pedals"
        >
          {/* Nitro Boost Button */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              handleNitroPress(true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              handleNitroPress(false);
            }}
            onPointerLeave={() => handleNitroPress(false)}
            onPointerCancel={() => handleNitroPress(false)}
            aria-label="Nitro Boost"
            className={`h-14 sm:h-16 px-4 sm:px-5 rounded-xl font-['Orbitron'] italic font-black text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-1.5 border-2 transition-all select-none touch-none cursor-pointer ${
              activeControls.nitro || isBoosting
                ? 'bg-amber-400 border-white text-slate-950 scale-95 shadow-[0_0_24px_rgba(255,170,0,0.9)]'
                : 'bg-slate-950/85 border-amber-400/60 text-amber-300 hover:border-amber-300 shadow-xl'
            }`}
          >
            <span>⚡</span>
            <span>NITRO</span>
          </button>

          {/* Brake / Reverse Button */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              handleControlPress('backward', true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              handleControlPress('backward', false);
            }}
            onPointerLeave={() => handleControlPress('backward', false)}
            onPointerCancel={() => handleControlPress('backward', false)}
            aria-label="Brake or Reverse"
            className={`w-20 h-18 sm:w-26 sm:h-22 rounded-2xl font-['Orbitron'] italic font-black text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center border-2 transition-all select-none touch-none cursor-pointer ${
              activeControls.backward
                ? 'bg-rose-600/50 border-rose-300 text-white scale-95 shadow-[0_0_24px_rgba(244,63,94,0.7)]'
                : 'bg-slate-950/85 border-rose-500/50 text-rose-200 hover:border-rose-400 shadow-xl'
            }`}
          >
            <div className="text-center leading-tight">
              <div>BRAKE</div>
              <div className="text-[10px] text-rose-300/80">REVERSE</div>
            </div>
          </button>

          {/* Accelerate Button */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              handleControlPress('forward', true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              handleControlPress('forward', false);
            }}
            onPointerLeave={() => handleControlPress('forward', false)}
            onPointerCancel={() => handleControlPress('forward', false)}
            aria-label="Accelerate"
            className={`w-24 h-18 sm:w-30 sm:h-22 rounded-2xl font-['Orbitron'] italic font-black text-sm sm:text-base tracking-wider uppercase flex items-center justify-center border-2 transition-all select-none touch-none cursor-pointer ${
              activeControls.forward
                ? 'bg-cyan-500/50 border-cyan-200 text-white scale-95 shadow-[0_0_28px_rgba(0,240,255,0.85)]'
                : 'bg-slate-950/85 border-cyan-400/65 text-cyan-200 hover:border-cyan-300 shadow-xl'
            }`}
          >
            ACCEL
          </button>
        </div>
      </div>
    </div>
  );
};
