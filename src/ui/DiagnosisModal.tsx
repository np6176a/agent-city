import { useState } from 'react';
import { useEventStore } from '../state/eventStore';
import { useAgentStore } from '../state/agentStore';
import eventsData from '../data/events.json';
import type { TeachingCard, DiagnosisOption } from '../types';

interface DiagnosisModalProps {
  onContinue: (diagnosedCorrectly: boolean) => void;
}

export function DiagnosisModal({ onContinue }: DiagnosisModalProps) {
  const { currentEvent } = useEventStore();
  const agents = useAgentStore((s) => s.agents);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  if (!currentEvent) return null;

  const card = eventsData.teachingCards.find(
    (c) => c.id === currentEvent.teachingCardId,
  ) as TeachingCard | undefined;

  if (!card) return null;

  const isSuccess = currentEvent.type === 'success';
  const agent = agents.find((a) => a.id === currentEvent.agentId);
  const options = (card.diagnosisOptions ?? []) as DiagnosisOption[];
  const hasOptions = !isSuccess && options.length > 0;

  const handleOptionSelect = (optionId: string) => {
    if (hasAnswered) return;
    setSelectedOption(optionId);
    setHasAnswered(true);
  };

  const isCorrect = selectedOption
    ? options.find((o) => o.id === selectedOption)?.correct ?? false
    : false;

  // Show teaching content when: success, no options to answer, or already answered
  const showTeaching = isSuccess || !hasOptions || hasAnswered;

  const handleContinue = () => {
    setSelectedOption(null);
    setHasAnswered(false);
    onContinue(isSuccess || isCorrect);
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60">
      <div
        className="border rounded-2xl p-6 w-[420px] flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--bg-panel)',
          borderColor: isSuccess ? 'var(--mint)' : 'var(--coral)',
          boxShadow: `0 0 30px ${isSuccess ? 'rgba(94, 232, 176, 0.15)' : 'rgba(255, 138, 128, 0.15)'}`,
        }}
      >
        {/* Header with agent */}
        <div className="flex items-center gap-3">
          {agent && (
            <img
              src={agent.portrait}
              alt={agent.name}
              className="w-12 h-12 rounded-xl object-contain"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            />
          )}
          <div>
            <h3 className="text-white text-lg font-headline font-bold">
              {isSuccess ? card.title : 'Something went wrong!'}
            </h3>
            {!isSuccess && (
              <p className="text-gray-500 text-xs">{card.title}</p>
            )}
          </div>
        </div>

        {/* Agent reaction line */}
        {agent && (
          <p
            className="text-sm italic leading-relaxed"
            style={{ color: agent.color }}
          >
            "{agent.reactions[currentEvent.cause] ?? agent.reactions['poor_fit']}"
          </p>
        )}

        {/* Explanation */}
        <p className="text-gray-300 text-sm leading-relaxed">
          {isSuccess ? card.explanation : card.whatWentWrong}
        </p>

        {/* Diagnosis multiple choice (failure with options, not yet answered) */}
        {hasOptions && !hasAnswered && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-headline font-bold uppercase tracking-wider" style={{ color: 'var(--yellow)' }}>
              What should we fix?
            </p>
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleOptionSelect(opt.id)}
                className="text-left p-3 rounded-xl text-sm transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#ccc',
                }}
              >
                {opt.text}
              </button>
            ))}
          </div>
        )}

        {/* Diagnosis result (after answering) */}
        {hasOptions && hasAnswered && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-headline font-bold uppercase tracking-wider" style={{ color: 'var(--yellow)' }}>
              What should we fix?
            </p>
            {options.map((opt) => {
              let borderColor = 'rgba(255,255,255,0.08)';
              let bg = 'rgba(255,255,255,0.04)';

              if (opt.id === selectedOption && opt.correct) {
                borderColor = 'var(--mint)';
                bg = 'rgba(94, 232, 176, 0.1)';
              } else if (opt.id === selectedOption && !opt.correct) {
                borderColor = 'var(--coral)';
                bg = 'rgba(255, 138, 128, 0.1)';
              } else if (opt.correct) {
                borderColor = 'var(--mint)';
                bg = 'rgba(94, 232, 176, 0.06)';
              }

              return (
                <div
                  key={opt.id}
                  className="p-3 rounded-xl text-sm"
                  style={{
                    backgroundColor: bg,
                    border: `1px solid ${borderColor}`,
                    color: opt.correct ? 'var(--mint)' : opt.id === selectedOption ? 'var(--coral)' : '#666',
                  }}
                >
                  {opt.text}
                  {opt.id === selectedOption && opt.correct && <span className="ml-2">+50</span>}
                </div>
              );
            })}

            {isCorrect ? (
              <p className="text-xs mt-1" style={{ color: 'var(--mint)' }}>
                Correct! You earned a diagnosis bonus.
              </p>
            ) : (
              <p className="text-xs mt-1" style={{ color: 'var(--coral)' }}>
                Not quite — the correct answer is highlighted above.
              </p>
            )}
          </div>
        )}

        {/* Teaching explanation + Continue button */}
        {showTeaching && (
          <>
            <div className="rounded-xl p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)' }}>
              <p className="text-xs mb-2 font-headline font-bold uppercase tracking-wider" style={{ color: 'var(--violet)' }}>
                {isSuccess ? 'Why it worked' : 'The concept'}
              </p>
              <p className="text-gray-300 text-sm leading-relaxed">
                {card.explanation}
              </p>
            </div>

            {!isSuccess && (
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
            )}

            <button
              onClick={handleContinue}
              className="mt-2 py-2.5 rounded-2xl text-white font-headline font-bold transition-all hover:scale-105"
              style={{
                backgroundColor: 'var(--violet)',
                boxShadow: '0 0 16px rgba(167, 139, 250, 0.3)',
              }}
            >
              Continue
            </button>
          </>
        )}
      </div>
    </div>
  );
}
