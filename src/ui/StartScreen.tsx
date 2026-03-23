interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--bg-dark)' }}>
      <div className="flex flex-col items-center gap-8 max-w-lg text-center px-6">
        {/* Agent portraits row */}
        <div className="flex items-end gap-4 mb-2">
          <img src="/assets/rue.png" alt="Rue" className="w-20 h-20 object-contain drop-shadow-lg" />
          <img src="/assets/axel.png" alt="Axel" className="w-24 h-24 object-contain drop-shadow-lg" />
          <img src="/assets/sentry.png" alt="Sentry" className="w-20 h-20 object-contain drop-shadow-lg" />
        </div>

        <div>
          <h1 className="font-headline text-6xl font-bold tracking-tight">
            <span style={{ color: 'var(--mint)' }}>AGENT</span>{' '}
            <span style={{ color: 'var(--violet)' }}>CITY</span>
          </h1>
          <p className="mt-3 text-lg font-headline font-semibold" style={{ color: 'var(--yellow)' }}>
            Build. Break. Learn. Repeat!
          </p>
        </div>

        <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
          A cute city-builder that teaches how AI agents actually work.
          Place buildings, assign robot agents, configure their capabilities,
          and learn from every success and failure.
        </p>

        <div className="flex gap-6 text-xs" style={{ color: 'var(--cyan)' }}>
          <span className="flex flex-col items-center gap-1">
            <span className="text-lg font-bold font-headline">8</span>
            Turns
          </span>
          <span className="flex flex-col items-center gap-1">
            <span className="text-lg font-bold font-headline">4</span>
            Buildings
          </span>
          <span className="flex flex-col items-center gap-1">
            <span className="text-lg font-bold font-headline">3</span>
            Agents
          </span>
        </div>

        <button
          onClick={onStart}
          className="mt-2 px-10 py-3.5 rounded-2xl text-white font-headline font-bold text-lg transition-all hover:scale-105 hover:shadow-lg"
          style={{
            backgroundColor: 'var(--violet)',
            boxShadow: '0 0 20px rgba(167, 139, 250, 0.3)',
          }}
        >
          Play
        </button>

        <span className="text-gray-600 text-xs">findniya &middot; 2026</span>
      </div>
    </div>
  );
}
