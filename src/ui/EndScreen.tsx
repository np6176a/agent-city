import { useGameStore } from '../state/gameStore';
import { useEventStore } from '../state/eventStore';
import type { FailureCause } from '../types';

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

/** Maps failure causes to short, player-facing takeaways. */
const LESSON_TAKEAWAYS: Partial<Record<FailureCause, { lesson: string; concept: string }>> = {
  wrong_agent: {
    lesson: 'Each agent has strengths and weaknesses — match the agent to the task.',
    concept: 'task_specialization',
  },
  no_tools: {
    lesson: 'Agents without tools are just guessing. Tools let them look things up and act on real data.',
    concept: 'tool_use',
  },
  no_memory: {
    lesson: 'Multi-step tasks need memory. Without it, agents forget their own plan halfway through.',
    concept: 'context_memory',
  },
  high_autonomy_no_guardrails: {
    lesson: 'High autonomy on critical tasks is risky. Guardrails and human oversight keep agents safe.',
    concept: 'guardrails',
  },
  no_search: {
    lesson: "Without search, agents rely on stale training data. RAG keeps answers current.",
    concept: 'tool_use',
  },
  no_calculator: {
    lesson: "LLMs can't do precise math alone. A calculator tool turns estimates into exact answers.",
    concept: 'tool_use',
  },
  no_planner: {
    lesson: "Planning breaks work into steps. Without it, agents do everything at once — badly.",
    concept: 'agent_architecture',
  },
  no_alert: {
    lesson: "Safety-critical tasks need an alert system to flag threats and escalate to humans.",
    concept: 'guardrails',
  },
  no_required_tool: {
    lesson: 'Some buildings need specific tools to function. Check requirements before configuring.',
    concept: 'tool_use',
  },
  memory_tool_mismatch: {
    lesson: "Some tools need memory to be effective. Planner without Memory Bank forgets its own steps.",
    concept: 'context_memory',
  },
  poor_fit: {
    lesson: 'A well-configured agent needs the right tools, memory, and autonomy working together.',
    concept: 'agent_architecture',
  },
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
    difficulty,
  } = useGameStore();
  const { eventHistory, seenConcepts } = useEventStore();

  const successes = eventHistory.filter((e) => e.type === 'success').length;
  const failures = eventHistory.filter((e) => e.type === 'breakdown').length;
  const rating = RATINGS.find((r) => score >= r.min && score <= r.max) ?? RATINGS[0];
  const hadRepair = eventHistory.some((e) => e.isRepair && e.type === 'success');

  // Deduplicate lessons from failures — one per unique cause
  const failureCauses = eventHistory
    .filter((e): e is typeof e & { cause: FailureCause } =>
      e.type === 'breakdown' && e.cause !== 'success',
    )
    .reduce<FailureCause[]>(
      (acc, e) => (acc.includes(e.cause) ? acc : [...acc, e.cause]),
      [],
    );

  const lessons = failureCauses
    .map((cause) => LESSON_TAKEAWAYS[cause])
    .filter((l): l is NonNullable<typeof l> => l !== undefined);

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
          {difficulty === 'hard' && (
            <span
              className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-headline font-bold uppercase"
              style={{
                backgroundColor: 'rgba(167, 139, 250, 0.15)',
                border: '1px solid rgba(167, 139, 250, 0.3)',
                color: 'var(--violet)',
              }}
            >
              Hard Mode
            </span>
          )}
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

        {/* Recap — what you learned */}
        <div className="w-full">
          <p className="text-xs font-headline uppercase tracking-widest text-gray-500 mb-3">
            What You Learned
          </p>
          <div
            className="rounded-2xl p-4 text-left"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <p className="text-sm text-gray-300 leading-relaxed mb-3">
              You succeeded <span className="font-bold" style={{ color: 'var(--mint)' }}>{successes} time{successes !== 1 ? 's' : ''}</span>
              {failures > 0
                ? <>{' '}and hit <span className="font-bold" style={{ color: 'var(--coral)' }}>{failures} breakdown{failures !== 1 ? 's' : ''}</span>. Here's what you learned about agents:</>
                : <>. Flawless! Here's what you proved about agents:</>
              }
            </p>

            {lessons.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {lessons.map((l) => {
                  const conceptMeta = CONCEPT_LABELS[l.concept];
                  return (
                    <div key={l.lesson} className="flex items-start gap-2.5">
                      {conceptMeta && (
                        <span
                          className="shrink-0 mt-0.5 w-2 h-2 rounded-full"
                          style={{ backgroundColor: conceptMeta.color }}
                        />
                      )}
                      <p className="text-xs text-gray-400 leading-relaxed">
                        {l.lesson}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-400 leading-relaxed italic">
                No breakdowns — you matched every agent to the right task with the right config. That's real agent engineering.
              </p>
            )}

            {hadRepair && (
              <p className="text-xs text-gray-500 leading-relaxed mt-3 italic">
                You also went back and repaired a broken building — real engineers debug and iterate.
              </p>
            )}
          </div>
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
