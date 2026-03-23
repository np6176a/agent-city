import { useGameStore, BUILDING_COSTS } from '../state/gameStore';
import type { BuildingType } from '../types';
import buildingsData from '../data/buildings.json';

const BUILDING_COLORS: Record<string, string> = {
  hospital: '#5EE8B0',
  library: '#67D4E8',
  transit: '#A78BFA',
  security: '#FF8A80',
};

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
        const color = BUILDING_COLORS[type];

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
            <div
              className="w-10 h-10 rounded-xl"
              style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}50` }}
            />
            <span className="text-white text-sm font-headline font-semibold">{b.name}</span>
            <span className="text-xs font-semibold" style={{ color: 'var(--yellow)' }}>${cost}</span>
          </button>
        );
      })}
    </div>
  );
}
