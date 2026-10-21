import React, { useState, useEffect } from 'react';
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
  const canAfford = coins >= activeKit.unlockCost;

  // Ensure initial 3D preview matches selected state on mount
  useEffect(() => {
    onPreviewKit(activeKit, selectedRimId, selectedSpoilerId);
  }, []);

  const handleCardSelect = (kit: BodyKitSpec) => {
    const nextRim = kit.defaultRimId;
    const nextSpoiler = kit.defaultSpoilerId;
    setSelectedKitId(kit.id);
    setSelectedRimId(nextRim);
    setSelectedSpoilerId(nextSpoiler);
    // Immediately update the 3D car preview in the center of the screen
    onPreviewKit(kit, nextRim, nextSpoiler);
    // If already unlocked, equip immediately so user doesn't have to click twice
    if (unlockedKits.includes(kit.id)) {
      onSelectKit(kit, nextRim, nextSpoiler);
    }
  };

  const handleRimSelect = (rimId: RimId) => {
    setSelectedRimId(rimId);
    onPreviewKit(activeKit, rimId, selectedSpoilerId);
    if (isUnlocked) {
      onSelectKit(activeKit, rimId, selectedSpoilerId);
    }
  };

  const handleSpoilerSelect = (spoilerId: SpoilerId) => {
    setSelectedSpoilerId(spoilerId);
    onPreviewKit(activeKit, selectedRimId, spoilerId);
    if (isUnlocked) {
      onSelectKit(activeKit, selectedRimId, spoilerId);
    }
  };

  const handlePrimaryAction = () => {
    onSelectKit(activeKit, selectedRimId, selectedSpoilerId);
  };

  return (
    <div className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between px-4 py-3 sm:px-6 sm:py-4 select-none">
      {/* Subtle Edge Vignette leaving Center 3D Car Turntable 100% Clear */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 52%, rgba(4, 7, 15, 0.0) 0%, rgba(4, 7, 15, 0.12) 44%, rgba(4, 7, 15, 0.82) 100%)',
        }}
      />

      {/* TOP BAR: Back Button (Left) | Clean Car Name Banner (Center) | Coin Balance (Right) */}
      <header className="pointer-events-auto flex items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onTouchStart={(e) => {
              e.stopPropagation();
              onBackToMenu();
            }}
            onClick={onBackToMenu}
            className="px-3.5 py-2 rounded-xl bg-slate-950/85 border border-white/25 hover:border-cyan-400 text-xs font-['Orbitron'] italic font-bold text-white tracking-wider uppercase flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95"
          >
            <span>←</span>
            <span>MENU</span>
          </button>
          <span className="font-['Orbitron'] italic font-black text-base sm:text-xl text-white uppercase tracking-wider">
            GARAGE
          </span>
        </div>

        {/* Center Clean Car Badge (Above the 3D Car, Never Overlapping It) */}
        <div className="hidden sm:flex flex-col items-center bg-slate-950/75 border border-white/15 rounded-xl px-4 py-1.5 shadow-lg">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: activeKit.primaryColor }}
            />
            <span className="font-['Orbitron'] italic font-black text-sm text-white tracking-wide uppercase">
              {activeKit.name}
            </span>
          </div>
          <span className="text-[10px] font-['Orbitron'] font-bold tracking-widest text-cyan-300 uppercase">
            {activeKit.tag}
          </span>
        </div>

        {/* Player Coin Balance */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950/85 border border-amber-400/50 shadow-lg">
          <svg
            className="w-4 h-4 text-amber-400 shrink-0"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" fill="#f59e0b" />
            <circle cx="12" cy="12" r="7.5" fill="#fbbf24" />
          </svg>
          <span className="font-mono font-bold text-sm sm:text-base text-white tabular-nums">
            {coins.toLocaleString()}
          </span>
        </div>
      </header>

      {/* MIDDLE ROW: Left Dock (Car Selector) | Open Center 3D Car Preview | Right Dock (Parts & Stats) */}
      <div className="flex items-center justify-between w-full my-auto gap-4">
        {/* LEFT DOCK: 3 Car / Body Kit Cards */}
        <div className="pointer-events-auto w-[210px] sm:w-[245px] bg-slate-950/85 border border-white/15 rounded-2xl p-2.5 sm:p-3 shadow-2xl flex flex-col gap-2">
          <div className="text-[10px] font-['Orbitron'] italic font-bold tracking-[0.15em] text-cyan-300 uppercase px-1">
            SELECT CAR / BODY KIT
          </div>

          {BODY_KITS.map((kit) => {
            const isSelected = kit.id === selectedKitId;
            const kitEquipped = kit.id === equippedKitId;
            const kitUnlocked = unlockedKits.includes(kit.id);

            return (
              <button
                key={kit.id}
                type="button"
                onTouchStart={(e) => {
                  e.stopPropagation();
                  handleCardSelect(kit);
                }}
                onClick={() => handleCardSelect(kit)}
                className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_16px_rgba(0,229,255,0.25)]'
                    : 'bg-slate-900/75 border-white/10 hover:border-white/30'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-6 h-6 rounded-lg shrink-0 border border-white/40 shadow-inner"
                    style={{ backgroundColor: kit.primaryColor }}
                  />
                  <div className="min-w-0">
                    <div className="font-['Orbitron'] italic font-bold text-xs text-white truncate">
                      {kit.name.replace('Kit 1: ', '').replace('Kit 2: ', '').replace('Kit 3: ', '')}
                    </div>
                    <div className="text-[9px] font-mono uppercase tracking-wider mt-0.5">
                      {kitEquipped ? (
                        <span className="text-emerald-400 font-bold">EQUIPPED</span>
                      ) : kitUnlocked ? (
                        <span className="text-cyan-300">UNLOCKED</span>
                      ) : (
                        <span className="text-amber-300 font-bold">
                          {kit.unlockCost} COINS
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* CENTER VIEWPORT: 100% Unobstructed 3D Rotating Showroom Car */}
        <div className="flex-1 pointer-events-none" />

        {/* RIGHT DOCK: Wheels, Spoilers & Clean Performance Bars */}
        <div className="pointer-events-auto w-[220px] sm:w-[260px] bg-slate-950/85 border border-white/15 rounded-2xl p-2.5 sm:p-3 shadow-2xl flex flex-col gap-2.5">
          {/* Rims */}
          <div>
            <div className="text-[9px] font-['Orbitron'] font-bold tracking-[0.15em] text-cyan-300 uppercase mb-1">
              WHEELS
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {RIM_OPTIONS.map((rim) => {
                const active = selectedRimId === rim.id;
                return (
                  <button
                    key={rim.id}
                    type="button"
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      handleRimSelect(rim.id);
                    }}
                    onClick={() => handleRimSelect(rim.id)}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-['Orbitron'] font-bold truncate cursor-pointer border transition-colors ${
                      active
                        ? 'bg-cyan-500/25 border-cyan-400 text-white'
                        : 'bg-slate-900/80 border-white/10 text-slate-300'
                    }`}
                  >
                    {rim.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Spoilers */}
          <div>
            <div className="text-[9px] font-['Orbitron'] font-bold tracking-[0.15em] text-amber-300 uppercase mb-1">
              REAR WING
            </div>
            <div className="grid grid-cols-3 gap-1">
              {SPOILER_OPTIONS.map((sp) => {
                const active = selectedSpoilerId === sp.id;
                return (
                  <button
                    key={sp.id}
                    type="button"
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      handleSpoilerSelect(sp.id);
                    }}
                    onClick={() => handleSpoilerSelect(sp.id)}
                    className={`px-1.5 py-1.5 rounded-lg text-[9px] font-['Orbitron'] font-bold truncate cursor-pointer border transition-colors text-center ${
                      active
                        ? 'bg-amber-500/25 border-amber-400 text-white'
                        : 'bg-slate-900/80 border-white/10 text-slate-300'
                    }`}
                  >
                    {sp.name.replace(' Wing', '').replace(' Deck', '')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Performance Bars */}
          <div className="bg-slate-900/80 border border-white/10 rounded-xl p-2.5 flex flex-col gap-1.5">
            <div>
              <div className="flex justify-between text-[10px] font-['Orbitron'] font-bold mb-0.5">
                <span className="text-slate-300">TOP SPEED</span>
                <span className="font-mono text-cyan-300">{activeKit.stats.speed}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-200 bg-cyan-400"
                  style={{ width: `${activeKit.stats.speed}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-['Orbitron'] font-bold mb-0.5">
                <span className="text-slate-300">ACCEL</span>
                <span className="font-mono text-amber-300">
                  {activeKit.stats.acceleration}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-200 bg-amber-400"
                  style={{ width: `${activeKit.stats.acceleration}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-['Orbitron'] font-bold mb-0.5">
                <span className="text-slate-300">HANDLING</span>
                <span className="font-mono text-emerald-300">
                  {activeKit.stats.handling}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-200 bg-emerald-400"
                  style={{ width: `${activeKit.stats.handling}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR: Unlock/Equip & Start Race */}
      <footer className="pointer-events-auto flex items-center justify-center gap-3 w-full">
        {!isUnlocked && (
          <button
            type="button"
            onTouchStart={(e) => {
              e.stopPropagation();
              handlePrimaryAction();
            }}
            onClick={handlePrimaryAction}
            disabled={!canAfford}
            className={`py-2.5 px-6 rounded-xl font-['Orbitron'] italic font-black text-xs sm:text-sm tracking-wider uppercase transition-all cursor-pointer border-2 shadow-xl ${
              canAfford
                ? 'bg-amber-500/35 border-amber-400 text-white active:scale-95'
                : 'bg-slate-900/80 border-white/15 text-slate-400 opacity-75'
            }`}
          >
            {canAfford
              ? `UNLOCK CAR (${activeKit.unlockCost} COINS)`
              : `NEED ${activeKit.unlockCost} COINS`}
          </button>
        )}

        <button
          type="button"
          onTouchStart={(e) => {
            e.stopPropagation();
            if (isUnlocked && !isEquipped) {
              onSelectKit(activeKit, selectedRimId, selectedSpoilerId);
            }
            onStartRace();
          }}
          onClick={() => {
            if (isUnlocked && !isEquipped) {
              onSelectKit(activeKit, selectedRimId, selectedSpoilerId);
            }
            onStartRace();
          }}
          className="py-2.5 px-8 rounded-xl bg-gradient-to-r from-cyan-500/40 to-emerald-500/40 border-2 border-cyan-300 font-['Orbitron'] italic font-black text-xs sm:text-sm text-white tracking-wider uppercase cursor-pointer shadow-xl active:scale-95"
        >
          RACE THIS CAR ▶
        </button>
      </footer>
    </div>
  );
};
