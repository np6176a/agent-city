import { useGameStore } from '../state/gameStore';

const PHASE_LABELS: Record<string, string> = {
  place: 'Place a Building',
  assign: 'Assign an Agent',
  configure: 'Configure Agent',
  resolve: 'Resolving...',
  feedback: 'Review Results',
};

export function HUD() {
  const { turn, score, budget, phase } = useGameStore();

  if (phase === 'start' || phase === 'end') return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-3 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700">
      <div className="flex items-center gap-6 text-sm">
        <span className="text-gray-400">
          Turn <span className="text-white font-bold">{turn}</span>/8
        </span>
        <span className="text-gray-400">
          Score <span className="text-emerald-400 font-bold">{score}</span>
        </span>
        <span className="text-gray-400">
          Budget <span className="text-amber-400 font-bold">${budget}</span>
        </span>
      </div>
      <div className="text-sm font-medium text-violet-300">
        {PHASE_LABELS[phase] ?? ''}
      </div>
    </div>
  );
}
