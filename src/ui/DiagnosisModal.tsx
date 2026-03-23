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
        className="border rounded-2xl p-6 w-96 flex flex-col gap-4"
        style={{
          backgroundColor: 'var(--bg-panel)',
          borderColor: isSuccess ? 'var(--mint)' : 'var(--coral)',
          boxShadow: `0 0 30px ${isSuccess ? 'rgba(94, 232, 176, 0.15)' : 'rgba(255, 138, 128, 0.15)'}`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{
              backgroundColor: isSuccess ? 'rgba(94, 232, 176, 0.15)' : 'rgba(255, 138, 128, 0.15)',
            }}
          >
            {isSuccess ? '✅' : '⚠️'}
          </div>
          <h3 className="text-white text-lg font-headline font-bold">{card.title}</h3>
        </div>

        <p className="text-gray-300 text-sm leading-relaxed">
          {card.explanation}
        </p>

        {!isSuccess && card.whatWentWrong && (
          <div
            className="rounded-xl p-3"
            style={{
              backgroundColor: 'rgba(255, 138, 128, 0.08)',
              border: '1px solid rgba(255, 138, 128, 0.2)',
            }}
          >
            <p className="text-sm" style={{ color: 'var(--coral)' }}>
              <strong>What went wrong:</strong> {card.whatWentWrong}
            </p>
          </div>
        )}

        <div className="rounded-xl p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)' }}>
          <p className="text-xs mb-2 font-headline font-bold uppercase tracking-wider" style={{ color: 'var(--violet)' }}>
            Ideal Config
          </p>
          <div className="flex gap-4 text-xs text-gray-300">
            <span>Tools: <strong style={{ color: card.correctConfig.tools ? 'var(--mint)' : 'var(--coral)' }}>{card.correctConfig.tools ? 'ON' : 'OFF'}</strong></span>
            <span>Memory: <strong style={{ color: card.correctConfig.memory ? 'var(--mint)' : 'var(--coral)' }}>{card.correctConfig.memory ? 'ON' : 'OFF'}</strong></span>
            <span>Autonomy: <strong style={{ color: 'var(--cyan)' }}>{card.correctConfig.autonomy}</strong></span>
          </div>
        </div>

        <button
          onClick={onContinue}
          className="mt-2 py-2.5 rounded-2xl text-white font-headline font-bold transition-all hover:scale-105"
          style={{
            backgroundColor: 'var(--violet)',
            boxShadow: '0 0 16px rgba(167, 139, 250, 0.3)',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
