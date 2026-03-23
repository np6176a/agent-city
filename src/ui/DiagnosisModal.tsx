import { useEventStore } from '../state/eventStore';
import eventsData from '../data/events.json';
import type { TeachingCard } from '../types';

interface DiagnosisModalProps {
  onContinue: () => void;
}

export function DiagnosisModal({ onContinue }: DiagnosisModalProps) {
  const { currentEvent } = useEventStore();

  if (!currentEvent) return null;

  const card = eventsData.teachingCards.find(
    (c) => c.id === currentEvent.teachingCardId,
  ) as TeachingCard | undefined;

  if (!card) return null;

  const isSuccess = currentEvent.type === 'success';

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60">
      <div
        className={`bg-gray-900 border rounded-2xl p-6 w-96 flex flex-col gap-4 ${
          isSuccess ? 'border-emerald-500' : 'border-red-400'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{isSuccess ? '✅' : '⚠️'}</span>
          <h3 className="text-white text-lg font-bold">{card.title}</h3>
        </div>

        <p className="text-gray-300 text-sm leading-relaxed">
          {card.explanation}
        </p>

        {!isSuccess && card.whatWentWrong && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-3">
            <p className="text-red-300 text-sm">
              <strong>What went wrong:</strong> {card.whatWentWrong}
            </p>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-gray-400 text-xs mb-2 font-semibold uppercase">
            Ideal Config
          </p>
          <div className="flex gap-3 text-xs text-gray-300">
            <span>Tools: {card.correctConfig.tools ? 'ON' : 'OFF'}</span>
            <span>Memory: {card.correctConfig.memory ? 'ON' : 'OFF'}</span>
            <span className="capitalize">
              Autonomy: {card.correctConfig.autonomy}
            </span>
          </div>
        </div>

        <button
          onClick={onContinue}
          className="mt-2 py-2 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-500 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
