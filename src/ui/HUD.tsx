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
    <div
      className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-3 backdrop-blur-sm border-b border-gray-700/50"
      style={{ backgroundColor: 'rgba(15, 15, 26, 0.85)' }}
    >
      <div className="flex items-center gap-6 text-sm font-headline">
        <span className="text-gray-400">
          Turn <span className="font-bold" style={{ color: 'var(--cyan)' }}>{turn}</span>/8
        </span>
        <span className="text-gray-400">
          Score <span className="font-bold" style={{ color: 'var(--mint)' }}>{score}</span>
        </span>
        <span className="text-gray-400">
          Budget <span className="font-bold" style={{ color: 'var(--yellow)' }}>${budget}</span>
        </span>
      </div>
      <div className="text-sm font-headline font-semibold" style={{ color: 'var(--violet)' }}>
        {PHASE_LABELS[phase] ?? ''}
      </div>
    </div>
  );
}
