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

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-gray-950">
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        <h1 className="text-4xl font-bold text-white">Game Over</h1>

        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-2xl font-bold text-emerald-400">{score}</p>
            <p className="text-xs text-gray-400">Final Score</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-2xl font-bold text-violet-400">
              {buildings.length}
            </p>
            <p className="text-xs text-gray-400">Buildings</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-2xl font-bold text-green-400">
              {successes}/{successes + failures}
            </p>
            <p className="text-xs text-gray-400">Success Rate</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-2xl font-bold text-cyan-400">
              {conceptsLearned}
            </p>
            <p className="text-xs text-gray-400">Concepts Learned</p>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="mt-4 px-8 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-500 transition-colors"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
