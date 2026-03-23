import { useGameStore, BUILDING_COSTS } from '../state/gameStore';
import type { BuildingType } from '../types';
import buildingsData from '../data/buildings.json';

const BUILDING_COLORS: Record<string, string> = {
  hospital: 'bg-emerald-400',
  library: 'bg-cyan-400',
  transit: 'bg-violet-400',
  security: 'bg-red-300',
};

export function BuildPanel() {
  const { phase, budget, selectedBuildingType, selectBuildingType } =
    useGameStore();

  if (phase !== 'place') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-4 p-4 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700">
      {buildingsData.map((b) => {
        const type = b.type as BuildingType;
        const cost = BUILDING_COSTS[type];
        const canAfford = budget >= cost;
        const isSelected = selectedBuildingType === type;

        return (
          <button
            key={type}
            onClick={() => canAfford && selectBuildingType(isSelected ? null : type)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all w-36
              ${isSelected ? 'border-white bg-gray-700' : 'border-gray-600 bg-gray-800 hover:border-gray-400'}
              ${!canAfford ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className={`w-10 h-10 rounded-lg ${BUILDING_COLORS[type]}`} />
            <span className="text-white text-sm font-medium">{b.name}</span>
            <span className="text-amber-400 text-xs">${cost}</span>
          </button>
        );
      })}
    </div>
  );
}
