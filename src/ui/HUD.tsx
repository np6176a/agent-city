import { useGameStore } from '../state/gameStore';

const PHASE_LABELS: Record<string, string> = {
  place: 'Place a Building',
  assign: 'Assign an Agent',
  configure: 'Configure Agent',
  resolve: 'Resolving...',
  feedback: 'Review Results',
  repair_select: 'Select a Building to Repair',
  repair_configure: 'Reconfigure Agent',
};

interface HUDProps {
  onReset?: () => void;
}

export function HUD({ onReset }: HUDProps) {
  const { turn, score, budget, phase } = useGameStore();

  if (phase === 'start' || phase === 'end') return null;

  const isRepair = phase === 'repair_select' || phase === 'repair_configure';

  return (
    <>
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
            Budget{' '}
            <span
              className="font-bold"
              style={{ color: budget < 100 ? 'var(--coral)' : 'var(--yellow)' }}
            >
              ${budget}
            </span>
            {budget < 100 && (
              <span className="text-gray-500 text-xs ml-1">Not enough to build</span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm font-headline font-semibold" style={{ color: 'var(--violet)' }}>
            {PHASE_LABELS[phase] ?? ''}
          </div>
          {onReset && (
            <button
              onClick={onReset}
              className="px-3 py-1 rounded-lg text-xs font-headline font-semibold transition-all hover:scale-105"
              style={{
                backgroundColor: 'rgba(255, 138, 128, 0.15)',
                border: '1px solid rgba(255, 138, 128, 0.3)',
                color: 'var(--coral)',
              }}
            >
              Reset Game
            </button>
          )}
        </div>
      </div>

      {isRepair && (
        <div
          className="fixed top-12 left-0 right-0 z-10 flex items-center justify-center py-2 text-sm font-headline font-semibold"
          style={{
            backgroundColor: 'rgba(255, 209, 102, 0.1)',
            borderBottom: '1px solid rgba(255, 209, 102, 0.2)',
            color: 'var(--yellow)',
          }}
        >
          Repair Turn — Fix a broken building for free!
        </div>
      )}
    </>
  );
}
