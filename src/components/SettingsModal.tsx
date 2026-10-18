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
    bloomStrength: 0.06,
    dofStrength: 0.35,
    lampIntensity: 1.15,
  };

  const [bloom, setBloom] = useState(initialGfx.bloomStrength);
  const [dof, setDof] = useState(initialGfx.dofStrength);
  const [lamp, setLamp] = useState(initialGfx.lampIntensity);

  const handleBloomChange = (val: number) => {
    setBloom(val);
    window.__theRaceEngine?.setGraphicsSettings({ bloomStrength: val });
  };

  const handleDofChange = (val: number) => {
    setDof(val);
    window.__theRaceEngine?.setGraphicsSettings({ dofStrength: val });
  };

  const handleLampChange = (val: number) => {
    setLamp(val);
    window.__theRaceEngine?.setGraphicsSettings({ lampIntensity: val });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6 py-4 select-none"
      style={{
        background: 'rgba(2, 4, 10, 0.82)',
      }}
    >
      <div className="w-full max-w-md bg-slate-950 border border-cyan-400/50 rounded-2xl p-6 shadow-2xl text-left">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-['Orbitron'] italic font-black text-2xl text-white uppercase">
            SETTINGS
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-slate-900 border border-white/20 hover:border-cyan-400 text-white font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Audio Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/90 border border-white/10">
            <span className="font-['Orbitron'] italic font-bold text-sm text-white">
              AUDIO
            </span>
            <button
              type="button"
              onClick={onToggleAudio}
              className={`px-4 py-2 rounded-lg font-['Orbitron'] italic font-bold text-xs uppercase cursor-pointer border ${
                audioEnabled
                  ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                  : 'bg-slate-800 border-white/20 text-slate-300'
              }`}
            >
              {audioEnabled ? 'ON' : 'MUTED'}
            </button>
          </div>

          {/* Bloom Slider */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 flex flex-col gap-2">
            <div className="flex justify-between text-xs font-['Orbitron'] italic font-bold text-slate-200">
              <span>BLOOM</span>
              <span className="font-mono text-cyan-300">{bloom.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={0.25}
              step={0.01}
              value={bloom}
              onChange={(e) => handleBloomChange(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Depth of Field Slider */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 flex flex-col gap-2">
            <div className="flex justify-between text-xs font-['Orbitron'] italic font-bold text-slate-200">
              <span>DEPTH OF FIELD</span>
              <span className="font-mono text-cyan-300">{dof.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min={0}
              max={1.0}
              step={0.05}
              value={dof}
              onChange={(e) => handleDofChange(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Lighting Slider */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 flex flex-col gap-2">
            <div className="flex justify-between text-xs font-['Orbitron'] italic font-bold text-slate-200">
              <span>LIGHTING</span>
              <span className="font-mono text-amber-300">{lamp.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min={0.6}
              max={1.8}
              step={0.05}
              value={lamp}
              onChange={(e) => handleLampChange(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Bonus Coins & Close */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={onResetCoins}
              className="px-3.5 py-2 rounded-lg bg-amber-500/15 border border-amber-400/50 hover:border-amber-300 text-xs font-mono text-amber-300 cursor-pointer"
            >
              +500 COINS
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg bg-cyan-500/30 border border-cyan-400 hover:border-white font-['Orbitron'] italic font-black text-xs text-white uppercase tracking-wider cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
