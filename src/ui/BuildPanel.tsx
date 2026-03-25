import { useGameStore, BUILDING_COSTS } from '../state/gameStore';
import type { BuildingType } from '../types';
import buildingsData from '../data/buildings.json';

function BuildingIcon({ type, color }: { type: BuildingType; color: string }) {
  const w = 48;
  const h = 56;

  if (type === 'hospital') {
    return (
      <svg width={w} height={h} viewBox="0 0 48 56" fill="none">
        {/* Main body — tall */}
        <rect x="8" y="12" width="32" height="38" rx="3" fill={color} />
        {/* Cross on top */}
        <rect x="20" y="4" width="8" height="16" rx="1" fill="#fff" opacity="0.9" />
        <rect x="16" y="8" width="16" height="8" rx="1" fill="#fff" opacity="0.9" />
        {/* Glowing windows */}
        <rect x="14" y="22" width="7" height="7" rx="1" fill="#ffc8e8" opacity="0.8" />
        <rect x="27" y="22" width="7" height="7" rx="1" fill="#ffc8e8" opacity="0.8" />
        <rect x="14" y="35" width="7" height="7" rx="1" fill="#ffc8e8" opacity="0.6" />
        <rect x="27" y="35" width="7" height="7" rx="1" fill="#ffc8e8" opacity="0.6" />
        {/* Door glow */}
        <rect x="19" y="40" width="10" height="10" rx="2" fill="#e8b4f8" opacity="0.4" />
      </svg>
    );
  }

  if (type === 'library') {
    return (
      <svg width={w} height={h} viewBox="0 0 48 56" fill="none">
        {/* Main body — shorter */}
        <rect x="6" y="20" width="36" height="30" rx="3" fill={color} />
        {/* Glowing sphere beacon */}
        <circle cx="24" cy="14" r="6" fill="#88ddff" opacity="0.8" />
        <circle cx="24" cy="14" r="3" fill="#bbf0ff" opacity="0.9" />
        {/* Glowing windows */}
        <rect x="12" y="28" width="7" height="7" rx="1" fill="#88d0f0" opacity="0.8" />
        <rect x="29" y="28" width="7" height="7" rx="1" fill="#88d0f0" opacity="0.8" />
        <rect x="12" y="39" width="7" height="7" rx="1" fill="#88d0f0" opacity="0.6" />
        <rect x="29" y="39" width="7" height="7" rx="1" fill="#88d0f0" opacity="0.6" />
      </svg>
    );
  }

  if (type === 'transit') {
    return (
      <svg width={w} height={h} viewBox="0 0 48 56" fill="none">
        {/* Main body — squat */}
        <rect x="6" y="24" width="36" height="26" rx="3" fill={color} />
        {/* Corner pillars */}
        <rect x="8" y="16" width="4" height="12" rx="1" fill="#c0a8f0" />
        <rect x="36" y="16" width="4" height="12" rx="1" fill="#c0a8f0" />
        {/* Flat roof */}
        <rect x="4" y="12" width="40" height="5" rx="2" fill="#c0a8f0" />
        {/* Glowing lines on body */}
        <rect x="12" y="32" width="24" height="2" rx="1" fill="#b49afa" opacity="0.6" />
        <rect x="12" y="38" width="24" height="2" rx="1" fill="#b49afa" opacity="0.5" />
        <rect x="12" y="44" width="24" height="2" rx="1" fill="#b49afa" opacity="0.4" />
      </svg>
    );
  }

  // security
  return (
    <svg width={w} height={h} viewBox="0 0 48 56" fill="none">
      {/* Narrow tall tower */}
      <rect x="14" y="8" width="20" height="42" rx="3" fill={color} />
      {/* Beacon cone on top */}
      <polygon points="24,0 30,10 18,10" fill="#ff5544" opacity="0.9" />
      {/* Beacon glow */}
      <circle cx="24" cy="6" r="4" fill="#ff6655" opacity="0.6" />
      <circle cx="24" cy="6" r="2" fill="#ffaa88" opacity="0.8" />
      {/* Glowing windows */}
      <rect x="18" y="18" width="5" height="5" rx="1" fill="#f07060" opacity="0.7" />
      <rect x="25" y="18" width="5" height="5" rx="1" fill="#f07060" opacity="0.7" />
      <rect x="18" y="30" width="5" height="5" rx="1" fill="#f07060" opacity="0.5" />
      <rect x="25" y="30" width="5" height="5" rx="1" fill="#f07060" opacity="0.5" />
    </svg>
  );
}

export function BuildPanel() {
  const { phase, budget, selectedBuildingType, selectBuildingType } =
    useGameStore();

  if (phase !== 'place') return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-4 p-4 backdrop-blur-sm border-t border-gray-700/50"
      style={{ backgroundColor: 'rgba(15, 15, 26, 0.85)' }}
    >
      {buildingsData.map((b) => {
        const type = b.type as BuildingType;
        const cost = BUILDING_COSTS[type];
        const canAfford = budget >= cost;
        const isSelected = selectedBuildingType === type;
        const color = b.color;

        return (
          <button
            key={type}
            onClick={() => canAfford && selectBuildingType(isSelected ? null : type)}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all w-36
              ${!canAfford ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
            style={{
              borderColor: isSelected ? color : 'rgba(255,255,255,0.1)',
              backgroundColor: isSelected ? 'rgba(255,255,255,0.08)' : 'rgba(26, 26, 46, 0.9)',
              boxShadow: isSelected ? `0 0 16px ${color}40` : 'none',
            }}
          >
            <BuildingIcon type={type} color={color} />
            <span className="text-white text-sm font-headline font-semibold">{b.name}</span>
            <span className="text-xs font-semibold" style={{ color: 'var(--yellow)' }}>${cost}</span>
          </button>
        );
      })}
    </div>
  );
}
