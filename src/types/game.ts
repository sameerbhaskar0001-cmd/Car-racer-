export type GameState = 'SPLASH' | 'MENU' | 'GARAGE' | 'RACE' | 'GAMEOVER';

export type BodyKitId = 'kit1' | 'kit2' | 'kit3';
export type RimId = 'rim0' | 'rim1' | 'rim2' | 'rim3';
export type SpoilerId = 'spoiler0' | 'spoiler1' | 'spoiler2';

export interface RimSpec {
  id: RimId;
  name: string;
}

export interface SpoilerSpec {
  id: SpoilerId;
  name: string;
}

export const RIM_OPTIONS: RimSpec[] = [
  { id: 'rim0', name: 'Stock Alloy' },
  { id: 'rim1', name: 'Stealth 5-Spoke' },
  { id: 'rim2', name: 'Deep Dish Gold' },
  { id: 'rim3', name: 'GT Forged' },
];

export const SPOILER_OPTIONS: SpoilerSpec[] = [
  { id: 'spoiler0', name: 'Clean Deck' },
  { id: 'spoiler1', name: 'Street Wing' },
  { id: 'spoiler2', name: 'GT Pro Wing' },
];

export interface BodyKitSpec {
  id: BodyKitId;
  name: string;
  subtitle: string;
  fullLabel: string;
  tag: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  badgeColor: string;
  defaultRimId: RimId;
  defaultSpoilerId: SpoilerId;
  stats: {
    speed: number;
    acceleration: number;
    handling: number;
  };
  physics: {
    topSpeedMultiplier: number;
    accelMultiplier: number;
    handlingMultiplier: number;
  };
  unlockCost: number;
}

export const BODY_KITS: BodyKitSpec[] = [
  {
    id: 'kit1',
    name: 'Kit 1: S64 Street Tuner',
    subtitle: 'S64Compact Body 1 · Crimson Street Spec',
    fullLabel: 'Kit 1: S64 Street Tuner (Body 1)',
    tag: 'STREET SPEC · BALANCED',
    description:
      'S64 Compact Body 1 coupe with crimson finish, clean rear deck, and balanced cornering grip.',
    primaryColor: '#ff1e26',
    accentColor: '#161922',
    badgeColor: '#ff3b30',
    defaultRimId: 'rim0',
    defaultSpoilerId: 'spoiler0',
    stats: {
      speed: 78,
      acceleration: 82,
      handling: 86,
    },
    physics: {
      topSpeedMultiplier: 1.0,
      accelMultiplier: 1.0,
      handlingMultiplier: 1.0,
    },
    unlockCost: 0,
  },
  {
    id: 'kit2',
    name: 'Kit 2: S64 Aero Beast',
    subtitle: 'S64Compact Body 2 · Widebody + Street Wing',
    fullLabel: 'Kit 2: S64 Aero Beast (Body 2)',
    tag: 'WIDEBODY AERO · HIGH DOWNFORCE',
    description:
      'S64 Compact Body 2 widebody aero kit with electric neon cyan paint, Stealth 5-Spoke rims, and rear Street Wing.',
    primaryColor: '#00e5ff',
    accentColor: '#0b1528',
    badgeColor: '#00e5ff',
    defaultRimId: 'rim1',
    defaultSpoilerId: 'spoiler1',
    stats: {
      speed: 88,
      acceleration: 89,
      handling: 95,
    },
    physics: {
      topSpeedMultiplier: 1.07,
      accelMultiplier: 1.12,
      handlingMultiplier: 1.16,
    },
    unlockCost: 150,
  },
  {
    id: 'kit3',
    name: 'Kit 3: S64 Cyber Phantom',
    subtitle: 'S64Compact Body 3 · Deep Dish + GT Pro Wing',
    fullLabel: 'Kit 3: S64 Cyber Phantom (Body 3)',
    tag: 'HYPER TUNER · TOP SPEED',
    description:
      'S64 Compact Body 3 hyper-tuner bodywork in stealth obsidian & matte gold with Deep Dish rims and GT Pro Wing.',
    primaryColor: '#ffc72c',
    accentColor: '#161820',
    badgeColor: '#fbbf24',
    defaultRimId: 'rim2',
    defaultSpoilerId: 'spoiler2',
    stats: {
      speed: 97,
      acceleration: 94,
      handling: 91,
    },
    physics: {
      topSpeedMultiplier: 1.14,
      accelMultiplier: 1.18,
      handlingMultiplier: 1.1,
    },
    unlockCost: 250,
  },
];

export interface RaceTelemetry {
  speedKmh: number;
  lapCount: number;
  currentLapTime: number;
  totalRaceTime: number;
  bestLapTime: number | null;
  boostCharge: number;
  boostActive: number;
  isDrifting: boolean;
  countdownStep: number;
  cameraMode: number;
  autopilot: boolean;
  audioEnabled: boolean;
}

export interface RaceFinishResult {
  totalTime: number;
  bestLap: number;
  lapTimes: number[];
  coinsEarned: number;
}

export interface TheRaceEngineBridge {
  setScreen: (screen: GameState) => void;
  getScreen: () => GameState;
  startRace: () => void;
  setBodyKit: (
    kitId: BodyKitId,
    stats?: {
      topSpeedMultiplier: number;
      accelMultiplier: number;
      handlingMultiplier: number;
    },
    customOverrides?: {
      rimId?: RimId;
      spoilerId?: SpoilerId;
    }
  ) => void;
  setCustomParts: (parts: {
    bodyId?: BodyKitId;
    rimId?: RimId;
    spoilerId?: SpoilerId;
  }) => void;
  setTouchControl: (
    dir: 'left' | 'right' | 'forward' | 'backward',
    isDown: boolean
  ) => void;
  clearTouchControls: () => void;
  triggerNitro: () => boolean;
  setCameraMode: (mode: number) => void;
  getCameraMode: () => number;
  setAutopilot: (val: boolean) => void;
  toggleAudio: () => boolean;
  setAudioEnabled: (val: boolean) => boolean;
  isAudioEnabled: () => boolean;
  playSplashImpact: () => void;
  playUiClick: (variant?: 'click' | 'equip') => void;
  setGraphicsSettings: (settings: {
    bloomStrength?: number;
    dofStrength?: number;
    lampIntensity?: number;
  }) => void;
  getGraphicsSettings: () => {
    bloomStrength: number;
    dofStrength: number;
    lampIntensity: number;
  };
  completeRaceDemo: () => void;
  onTelemetry: (cb: (data: RaceTelemetry) => void) => () => void;
  onRaceFinish: (
    cb: (res: { totalTime: number; bestLap: number; lapTimes: number[] }) => void
  ) => () => void;
}

declare global {
  interface Window {
    __theRaceEngine?: TheRaceEngineBridge;
  }
}

export function formatRaceTime(seconds: number | null | undefined): string {
  const safeSecs = Math.max(0, Number(seconds) || 0);
  const totalCentis = Math.floor(safeSecs * 100);
  const mins = Math.floor(totalCentis / 6000);
  const secs = Math.floor((totalCentis % 6000) / 100);
  const centis = totalCentis % 100;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(
    centis
  ).padStart(2, '0')}`;
}
