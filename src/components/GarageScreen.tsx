import React, { useState } from 'react';
import {
  BODY_KITS,
  BodyKitId,
  BodyKitSpec,
  RIM_OPTIONS,
  RimId,
  SPOILER_OPTIONS,
  SpoilerId,
} from '../types/game';

interface GarageScreenProps {
  coins: number;
  equippedKitId: BodyKitId;
  equippedRimId: RimId;
  equippedSpoilerId: SpoilerId;
  unlockedKits: BodyKitId[];
  onSelectKit: (kit: BodyKitSpec, rimId: RimId, spoilerId: SpoilerId) => void;
  onPreviewKit: (kit: BodyKitSpec, rimId: RimId, spoilerId: SpoilerId) => void;
  onBackToMenu: () => void;
  onStartRace: () => void;
}

export const GarageScreen: React.FC<GarageScreenProps> = ({
  coins,
  equippedKitId,
  equippedRimId,
  equippedSpoilerId,
  unlockedKits,
  onSelectKit,
  onPreviewKit,
  onBackToMenu,
  onStartRace,
}) => {
  const [selectedKitId, setSelectedKitId] = useState<BodyKitId>(equippedKitId);
  const [selectedRimId, setSelectedRimId] = useState<RimId>(equippedRimId);
  const [selectedSpoilerId, setSelectedSpoilerId] =
    useState<SpoilerId>(equippedSpoilerId);

  const activeKit =
    BODY_KITS.find((k) => k.id === selectedKitId) || BODY_KITS[0];
  const isEquipped =
    equippedKitId === activeKit.id &&
    equippedRimId === selectedRimId &&
    equippedSpoilerId === selectedSpoilerId;
  const isUnlocked = unlockedKits.includes(activeKit.id);

  const handleCardClick = (kit: BodyKitSpec) => {
    setSelectedKitId(kit.id);
    setSelectedRimId(kit.defaultRimId);
    setSelectedSpoilerId(kit.defaultSpoilerId);
    onPreviewKit(kit, kit.defaultRimId, kit.defaultSpoilerId);
  };

  const handleRimClick = (rimId: RimId) => {
    setSelectedRimId(rimId);
    onPreviewKit(activeKit, rimId, selectedSpoilerId);
  };

  const handleSpoilerClick = (spoilerId: SpoilerId) => {
    setSelectedSpoilerId(spoilerId);
    onPreviewKit(activeKit, selectedRimId, spoilerId);
  };

  const handleEquipClick = () => {
    onSelectKit(activeKit, selectedRimId, selectedSpoilerId);
  };

  return (
    <div className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between px-5 py-3 sm:px-8 sm:py-5 select-none">
      {/* Subtle Right-Side Panel Scrim keeping 3D Turntable unobstructed on the left */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, rgba(4, 7, 15, 0.25) 0%, rgba(4, 7, 15, 0.08) 38%, rgba(4, 7, 15, 0.88) 78%, rgba(4, 7, 15, 0.95) 100%)',
        }}
      />

      {/* Top Bar: Back Button, Main Title & Coin Balance */}
      <header className="pointer-events-auto flex items-center justify-between gap-4 w-full">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBackToMenu}
            className="px-4 py-2 rounded-lg bg-slate-950/85 border border-white/25 hover:border-cyan-400 text-xs font-['Orbitron'] italic font-bold text-white tracking-wider uppercase flex items-center gap-2 cursor-pointer transition-colors"
          >
            <span>←</span>
            <span>BACK</span>
          </button>
          <h1 className="font-['Orbitron'] italic font-black text-xl sm:text-2xl text-white uppercase tracking-wider">
            GARAGE
          </h1>
        </div>

        {/* Player Coin Balance */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-slate-950/85 border border-amber-400/50 shadow-lg">
          <svg
            className="w-5 h-5 text-amber-400 shrink-0"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" fill="#f59e0b" />
            <circle cx="12" cy="12" r="7.5" fill="#fbbf24" />
          </svg>
          <div className="flex flex-col leading-none">
            <span className="text-[9px] font-['Orbitron'] tracking-widest text-amber-300/80 uppercase">
              COINS
            </span>
            <span className="font-mono font-bold text-base text-white tabular-nums">
              {coins.toLocaleString()}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content: Clean 3D Turntable View (Left) | Body Kits, Rims, Spoilers & Car Stats (Right) */}
      <div className="flex items-center justify-end w-full my-auto">
        <div className="pointer-events-auto w-full max-w-[430px] bg-slate-950/90 border border-cyan-500/40 rounded-xl p-3.5 sm:p-4 shadow-2xl flex flex-col gap-3">
          {/* 1. Body Kit Selector Cards (3 FBX Bodies) */}
          <div>
            <div className="text-[10px] font-['Orbitron'] italic font-bold tracking-[0.16em] text-slate-300 uppercase mb-1.5">
              BODY KITS (3 FBX)
            </div>
            <div className="flex flex-col gap-1.5">
              {BODY_KITS.map((kit) => {
                const isSelected = kit.id === selectedKitId;
                const kitEquipped = kit.id === equippedKitId;
                const kitUnlocked = unlockedKits.includes(kit.id);

                return (
                  <button
                    key={kit.id}
                    type="button"
                    onClick={() => handleCardClick(kit)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-400 shadow-md'
                        : 'bg-slate-900/75 border-white/15 hover:border-white/35'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-7 h-7 rounded-md shrink-0 border border-white/30"
                        style={{
                          background: `linear-gradient(135deg, ${kit.primaryColor} 0%, ${kit.primaryColor} 52%, ${kit.accentColor} 52%, ${kit.accentColor} 100%)`,
                        }}
                      />
                      <div className="min-w-0">
                        <div className="font-['Orbitron'] italic font-bold text-xs text-white truncate">
                          {kit.name}
                        </div>
                        <div className="text-[10px] text-slate-300 truncate">
                          {kit.subtitle}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right font-mono text-[10px]">
                      {kitEquipped ? (
                        <span className="text-emerald-400 font-bold uppercase tracking-wider">
                          EQUIPPED
                        </span>
                      ) : kitUnlocked ? (
                        <span className="text-cyan-300 uppercase">READY</span>
                      ) : (
                        <span className="text-amber-300 font-bold">
                          {kit.unlockCost} COINS
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Modular FBX Rims (4 Sets) & Spoilers (3 Options) */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Rims */}
            <div className="bg-slate-900/75 border border-white/10 rounded-lg p-2">
              <div className="text-[9px] font-['Orbitron'] tracking-[0.14em] text-cyan-300 uppercase mb-1.5">
                WHEELS (4 FBX)
              </div>
              <div className="grid grid-cols-2 gap-1">
                {RIM_OPTIONS.map((rim) => {
                  const active = selectedRimId === rim.id;
                  return (
                    <button
                      key={rim.id}
                      type="button"
                      onClick={() => handleRimClick(rim.id)}
                      className={`px-1.5 py-1 rounded text-[10px] font-['Orbitron'] font-bold truncate cursor-pointer border transition-colors ${
                        active
                          ? 'bg-cyan-500/25 border-cyan-400 text-white'
                          : 'bg-slate-950/70 border-white/10 text-slate-300 hover:border-white/30'
                      }`}
                    >
                      {rim.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Spoilers */}
            <div className="bg-slate-900/75 border border-white/10 rounded-lg p-2">
              <div className="text-[9px] font-['Orbitron'] tracking-[0.14em] text-amber-300 uppercase mb-1.5">
                SPOILER (2 FBX)
              </div>
              <div className="flex flex-col gap-1">
                {SPOILER_OPTIONS.map((sp) => {
                  const active = selectedSpoilerId === sp.id;
                  return (
                    <button
                      key={sp.id}
                      type="button"
                      onClick={() => handleSpoilerClick(sp.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-['Orbitron'] font-bold truncate cursor-pointer border transition-colors text-left ${
                        active
                          ? 'bg-amber-500/25 border-amber-400 text-white'
                          : 'bg-slate-950/70 border-white/10 text-slate-300 hover:border-white/30'
                      }`}
                    >
                      {sp.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Dynamic Car Stats Bars: Speed, Acceleration, Handling */}
          <div className="bg-slate-900/80 border border-white/10 rounded-lg p-3 flex flex-col gap-2">
            <div className="text-[10px] font-['Orbitron'] tracking-[0.18em] text-cyan-300 uppercase">
              CAR STATS
            </div>

            {/* Speed */}
            <div>
              <div className="flex justify-between text-[11px] font-['Orbitron'] italic font-bold mb-0.5">
                <span className="text-slate-200">SPEED</span>
                <span className="font-mono tabular-nums text-cyan-300">
                  {activeKit.stats.speed}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-sm overflow-hidden border border-white/10">
                <div
                  className="h-full transition-all duration-200"
                  style={{
                    width: `${activeKit.stats.speed}%`,
                    background: 'linear-gradient(90deg, #00e5ff, #38bdf8)',
                  }}
                />
              </div>
            </div>

            {/* Acceleration */}
            <div>
              <div className="flex justify-between text-[11px] font-['Orbitron'] italic font-bold mb-0.5">
                <span className="text-slate-200">ACCELERATION</span>
                <span className="font-mono tabular-nums text-amber-300">
                  {activeKit.stats.acceleration}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-sm overflow-hidden border border-white/10">
                <div
                  className="h-full transition-all duration-200"
                  style={{
                    width: `${activeKit.stats.acceleration}%`,
                    background: 'linear-gradient(90deg, #f59e0b, #fde047)',
                  }}
                />
              </div>
            </div>

            {/* Handling */}
            <div>
              <div className="flex justify-between text-[11px] font-['Orbitron'] italic font-bold mb-0.5">
                <span className="text-slate-200">HANDLING</span>
                <span className="font-mono tabular-nums text-emerald-300">
                  {activeKit.stats.handling}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-sm overflow-hidden border border-white/10">
                <div
                  className="h-full transition-all duration-200"
                  style={{
                    width: `${activeKit.stats.handling}%`,
                    background: 'linear-gradient(90deg, #10b981, #34d399)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons: Select & Start Race */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleEquipClick}
              className={`flex-1 py-2.5 px-4 rounded-lg font-['Orbitron'] italic font-black text-xs sm:text-sm tracking-wider uppercase transition-all cursor-pointer border-2 ${
                isEquipped
                  ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                  : 'bg-gradient-to-r from-amber-500/35 to-cyan-500/35 border-amber-400 hover:border-white text-white shadow-lg'
              }`}
            >
              {isEquipped
                ? 'EQUIPPED ✓'
                : isUnlocked
                  ? 'SELECT'
                  : `UNLOCK (${activeKit.unlockCost} COINS)`}
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectKit(activeKit, selectedRimId, selectedSpoilerId);
                onStartRace();
              }}
              className="py-2.5 px-5 rounded-lg bg-cyan-500/25 hover:bg-cyan-500/40 border-2 border-cyan-400 font-['Orbitron'] italic font-black text-xs sm:text-sm text-white tracking-wider uppercase cursor-pointer transition-all shrink-0"
            >
              START RACE →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
