import { useGameStore } from '../state/gameStore';
import { useEventStore } from '../state/eventStore';

interface EndScreenProps {
  onRestart: () => void;
}

export function EndScreen({ onRestart }: EndScreenProps) {
  const { score, buildings } = useGameStore();
  const { eventHistory } = useEventStore();

  const successes = eventHistory.filter((e) => e.type === 'success').length;
  const failures = eventHistory.filter((e) => e.type === 'breakdown').length;

  const conceptsLearned = new Set(
    eventHistory.map((e) => e.teachingCardId),
  ).size;

  const stats = [
    { value: score, label: 'Final Score', color: 'var(--mint)' },
    { value: buildings.length, label: 'Buildings', color: 'var(--violet)' },
    { value: `${successes}/${successes + failures}`, label: 'Success Rate', color: 'var(--cyan)' },
    { value: conceptsLearned, label: 'Concepts Learned', color: 'var(--yellow)' },
  ];

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--bg-dark)' }}>
      <div className="flex flex-col items-center gap-8 max-w-md text-center px-6">
        <h1 className="font-headline text-4xl font-bold text-white">Game Over</h1>
        <p className="text-gray-500 text-sm">
          Build. Break. Learn. Repeat!
        </p>

        <div className="grid grid-cols-2 gap-4 w-full">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-4"
              style={{
                backgroundColor: 'var(--bg-panel)',
                border: `1px solid ${s.color}25`,
              }}
            >
              <p className="text-3xl font-headline font-bold" style={{ color: s.color }}>
                {s.value}
              </p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onRestart}
          className="mt-2 px-10 py-3 rounded-2xl text-white font-headline font-bold transition-all hover:scale-105"
          style={{
            backgroundColor: 'var(--violet)',
            boxShadow: '0 0 20px rgba(167, 139, 250, 0.3)',
          }}
        >
          Play Again
        </button>

        <span className="text-gray-600 text-xs">findniya &middot; 2026</span>
      </div>
    </div>
  );
}
