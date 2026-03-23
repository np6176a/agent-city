interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-gray-950">
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        <h1 className="text-5xl font-bold text-white tracking-tight">
          Agent<span className="text-violet-400">City</span>
        </h1>
        <p className="text-gray-400 text-sm leading-relaxed">
          Build a city powered by AI agents. Place buildings, assign the right
          agent, configure their capabilities, and learn why AI agents succeed
          or fail.
        </p>
        <div className="flex flex-col gap-2 text-xs text-gray-500">
          <span>8 turns &middot; 4 buildings &middot; 3 agents</span>
          <span>Learn: Tool Use &middot; Memory &middot; Guardrails &middot; Specialization</span>
        </div>
        <button
          onClick={onStart}
          className="mt-4 px-8 py-3 rounded-xl bg-violet-600 text-white font-semibold text-lg hover:bg-violet-500 transition-colors"
        >
          Play
        </button>
      </div>
    </div>
  );
}
