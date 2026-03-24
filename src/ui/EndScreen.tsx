import { useGameStore } from '../state/gameStore';
import { useEventStore } from '../state/eventStore';

interface EndScreenProps {
  onRestart: () => void;
}

const RATINGS = [
  { min: 0, max: 300, title: 'Intern', message: "Every agent starts somewhere. Try again!" },
  { min: 301, max: 600, title: 'Junior Agent Architect', message: "You're getting the hang of this." },
  { min: 601, max: 900, title: 'Senior Agent Architect', message: 'Impressive! You really understand agents.' },
  { min: 901, max: Infinity, title: 'Chief Agent Officer', message: 'You could build agent systems for a living.' },
];

const CONCEPT_LABELS: Record<string, { label: string; color: string }> = {
  tool_use: { label: 'Tool Use', color: 'var(--cyan)' },
  context_memory: { label: 'Memory', color: 'var(--mint)' },
  guardrails: { label: 'Guardrails', color: 'var(--coral)' },
  task_specialization: { label: 'Specialization', color: 'var(--violet)' },
  agent_architecture: { label: 'Architecture', color: 'var(--yellow)' },
  reinforcement: { label: 'Reinforcement', color: 'var(--mint)' },
  iteration: { label: 'Iteration', color: 'var(--yellow)' },
};

export function EndScreen({ onRestart }: EndScreenProps) {
  const {
    score,
    buildings,
    turnsPlayed,
    isEarlyEnd,
    correctDiagnoses,
    totalDiagnoses,
    repairsAttempted,
    perfectConfigs,
  } = useGameStore();
  const { eventHistory, seenConcepts } = useEventStore();

  const successes = eventHistory.filter((e) => e.type === 'success').length;
  const failures = eventHistory.filter((e) => e.type === 'breakdown').length;
  const rating = RATINGS.find((r) => score >= r.min && score <= r.max) ?? RATINGS[0];
  const hadRepair = eventHistory.some((e) => e.isRepair && e.type === 'success');

  // Build positive message for early end
  const conceptsList = [...seenConcepts]
    .filter((c) => c in CONCEPT_LABELS)
    .map((c) => CONCEPT_LABELS[c].label);

  let earlyEndMessage: string;
  if (conceptsList.length >= 3) {
    earlyEndMessage = `You learned about ${conceptsList.slice(0, 3).join(', ')}. That's real knowledge!`;
  } else if (hadRepair) {
    earlyEndMessage = "You even went back and fixed a broken building — that's what real engineers do.";
  } else {
    earlyEndMessage = "Every city starts small. You'll build bigger next time.";
  }

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center overflow-y-auto py-8"
      style={{ backgroundColor: isEarlyEnd ? '#12111D' : 'var(--bg-dark)' }}
    >
      <div className="flex flex-col items-center gap-6 max-w-md text-center px-6 w-full">
        {/* Group art */}
        <img
          src="/assets/group.png"
          alt="Axel, Rue, and Sentry"
          className="w-48 h-auto object-contain drop-shadow-2xl rounded-2xl"
        />

        {/* Header */}
        <div>
          <h1 className="font-headline text-3xl font-bold text-white">
            {isEarlyEnd ? 'The city ran out of funding!' : 'Game Complete!'}
          </h1>
          {isEarlyEnd && (
            <p className="text-gray-400 text-sm mt-2">
              But look at what you built in {turnsPlayed} turn{turnsPlayed !== 1 ? 's' : ''}.
            </p>
          )}
        </div>

        {/* Rating */}
        <div
          className="rounded-2xl px-6 py-4 w-full"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(167, 139, 250, 0.2)',
          }}
        >
          <p className="text-xs font-headline uppercase tracking-widest text-gray-500 mb-1">
            Rating
          </p>
          <p className="text-2xl font-headline font-bold" style={{ color: 'var(--violet)' }}>
            {rating.title}
          </p>
          <p className="text-gray-400 text-sm mt-1">{rating.message}</p>
        </div>

        {/* Score summary */}
        <div className="grid grid-cols-3 gap-3 w-full">
          <StatCard value={score} label="Final Score" color="var(--mint)" />
          <StatCard value={`${buildings.length}`} label="Buildings" color="var(--violet)" />
          <StatCard value={`${successes}/${successes + failures}`} label="Success Rate" color="var(--cyan)" />
          <StatCard value={`${correctDiagnoses}/${totalDiagnoses}`} label="Diagnoses" color="var(--yellow)" />
          <StatCard value={repairsAttempted} label="Repairs" color="var(--coral)" />
          <StatCard value={perfectConfigs} label="Perfect Configs" color="var(--mint)" />
        </div>

        {/* Concepts learned */}
        {seenConcepts.size > 0 && (
          <div className="w-full">
            <p className="text-xs font-headline uppercase tracking-widest text-gray-500 mb-3">
              Concepts Learned
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[...seenConcepts]
                .filter((c) => c in CONCEPT_LABELS)
                .map((conceptId) => {
                  const concept = CONCEPT_LABELS[conceptId];
                  return (
                    <span
                      key={conceptId}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: `${concept.color}15`,
                        border: `1px solid ${concept.color}30`,
                        color: concept.color,
                      }}
                    >
                      {concept.label}
                    </span>
                  );
                })}
            </div>
          </div>
        )}

        {/* Positive message for early end */}
        {isEarlyEnd && (
          <p className="text-gray-400 text-sm leading-relaxed italic">
            {earlyEndMessage}
          </p>
        )}

        {/* Play again */}
        <button
          onClick={onRestart}
          className="mt-2 px-10 py-3 rounded-2xl text-white font-headline font-bold text-lg transition-all hover:scale-105"
          style={{
            backgroundColor: 'var(--violet)',
            boxShadow: '0 0 20px rgba(167, 139, 250, 0.3)',
          }}
        >
          Play Again
        </button>

        <p className="text-gray-700 text-xs">
          Build. Break. Learn. Repeat!
        </p>

        <span className="text-gray-600 text-xs">findniya &middot; 2026</span>
      </div>
    </div>
  );
}

function StatCard({
  value,
  label,
  color,
}: {
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <div
      className="rounded-2xl p-3"
      style={{
        backgroundColor: 'var(--bg-panel)',
        border: `1px solid ${color}20`,
      }}
    >
      <p className="text-2xl font-headline font-bold" style={{ color }}>
        {value}
      </p>
      <p className="text-[10px] text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
