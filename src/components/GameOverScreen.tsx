import React from 'react';
import { BodyKitSpec, RaceFinishResult, formatRaceTime } from '../types/game';

interface GameOverScreenProps {
  result: RaceFinishResult;
  coins: number;
  equippedKit: BodyKitSpec;
  onRetryRace: () => void;
  onOpenGarage: () => void;
  onMainMenu: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  result,
  coins,
  equippedKit,
  onRetryRace,
  onOpenGarage,
  onMainMenu,
}) => {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center px-6 py-5 select-none"
      style={{
        background:
          'radial-gradient(ellipse 75% 70% at 50% 50%, rgba(6, 12, 26, 0.78) 0%, rgba(2, 4, 10, 0.94) 100%)',
      }}
    >
      <div className="w-full max-w-xl bg-slate-950/95 border-2 border-cyan-400/60 rounded-2xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background:
              'linear-gradient(90deg, #ffaa44 0%, #ffffff 50%, #00f0ff 100%)',
          }}
        />

        <h1
          className="font-['Orbitron'] italic font-black text-3xl sm:text-5xl uppercase tracking-wider mt-2"
          style={{
            background: 'linear-gradient(95deg, #ffffff 0%, #ffe3a8 55%, #ffaa44 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          RACE RESULTS
        </h1>

        {/* Total Time & Best Lap Readout */}
        <div className="grid grid-cols-2 gap-4 my-5 bg-slate-900/85 border border-white/10 rounded-xl p-4">
          <div>
            <div className="text-[10px] font-['Orbitron'] tracking-[0.18em] text-slate-400 uppercase">
              TOTAL RACE TIME
            </div>
            <div className="font-['Orbitron'] italic font-black text-2xl sm:text-4xl text-white tabular-nums mt-1">
              {formatRaceTime(result.totalTime)}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-['Orbitron'] tracking-[0.18em] text-cyan-300 uppercase">
              BEST LAP TIME
            </div>
            <div className="font-['Orbitron'] italic font-black text-2xl sm:text-4xl text-cyan-300 tabular-nums mt-1">
              {formatRaceTime(result.bestLap)}
            </div>
          </div>
        </div>

        {/* Individual Lap Splits & Coins Rewarded */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-left">
          <div className="bg-slate-900/75 border border-white/10 rounded-xl p-3.5">
            <div className="text-[10px] font-['Orbitron'] tracking-[0.16em] text-slate-400 uppercase mb-2">
              LAP SPLITS ({equippedKit.name})
            </div>
            <div className="flex flex-col gap-1.5 text-xs font-mono tabular-nums">
              {[0, 1, 2].map((idx) => {
                const lapVal = result.lapTimes[idx] ?? result.totalTime / 3;
                return (
                  <div key={idx} className="flex justify-between text-slate-200">
                    <span>LAP {idx + 1}</span>
                    <span className="font-bold text-white">{formatRaceTime(lapVal)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-400/40 rounded-xl p-3.5 flex flex-col justify-between">
            <div className="text-[10px] font-['Orbitron'] tracking-[0.16em] text-amber-300 uppercase">
              RACE REWARD EARNED
            </div>
            <div className="font-['Orbitron'] italic font-black text-2xl sm:text-3xl text-amber-300 tabular-nums my-1">
              +{result.coinsEarned} COINS
            </div>
            <div className="text-xs font-mono text-slate-300 tabular-nums">
              TOTAL BALANCE: <span className="text-white font-bold">{coins.toLocaleString()}</span> COINS
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onRetryRace}
            className="flex-1 min-w-[140px] py-3.5 px-5 rounded-lg bg-gradient-to-r from-cyan-500/35 to-amber-500/35 border-2 border-cyan-400 hover:border-white font-['Orbitron'] italic font-black text-sm text-white tracking-wider uppercase cursor-pointer transition-transform active:scale-95"
          >
            RACE AGAIN ↻
          </button>

          <button
            type="button"
            onClick={onOpenGarage}
            className="py-3.5 px-5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-400/60 font-['Orbitron'] italic font-bold text-sm text-amber-300 tracking-wider uppercase cursor-pointer transition-transform active:scale-95"
          >
            GARAGE
          </button>

          <button
            type="button"
            onClick={onMainMenu}
            className="py-3.5 px-5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/25 font-['Orbitron'] italic font-bold text-sm text-slate-200 tracking-wider uppercase cursor-pointer transition-transform active:scale-95"
          >
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};
