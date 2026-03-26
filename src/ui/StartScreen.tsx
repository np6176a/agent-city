import { useState } from 'react';
import type { Difficulty } from '../types';

interface StartScreenProps {
  onStart: (difficulty: Difficulty) => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--bg-dark)' }}>
      <div className="flex flex-col items-center gap-8 max-w-lg text-center px-6">
        {/* Group portrait */}
        <img
          src="/assets/group.png"
          alt="Axel, Rue, and Sentry in Agent City"
          className="w-72 h-auto object-contain drop-shadow-2xl rounded-2xl"
        />

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

        {/* Difficulty selector */}
        <div className="flex gap-3 w-full max-w-sm">
          <button
            onClick={() => setDifficulty('normal')}
            className="flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl transition-all"
            style={{
              backgroundColor: difficulty === 'normal' ? 'rgba(94, 232, 176, 0.1)' : 'rgba(255,255,255,0.03)',
              border: `2px solid ${difficulty === 'normal' ? 'var(--mint)' : 'rgba(255,255,255,0.08)'}`,
            }}
          >
            <span className="font-headline font-bold text-sm" style={{ color: difficulty === 'normal' ? 'var(--mint)' : '#888' }}>
              NORMAL
            </span>
            <span className="text-[11px] text-gray-400 leading-relaxed">
              Toggle tools and memory on or off. A great way to learn the basics.
            </span>
          </button>
          <button
            onClick={() => setDifficulty('hard')}
            className="flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl transition-all"
            style={{
              backgroundColor: difficulty === 'hard' ? 'rgba(167, 139, 250, 0.1)' : 'rgba(255,255,255,0.03)',
              border: `2px solid ${difficulty === 'hard' ? 'var(--violet)' : 'rgba(255,255,255,0.08)'}`,
            }}
          >
            <span className="font-headline font-bold text-sm" style={{ color: difficulty === 'hard' ? 'var(--violet)' : '#888' }}>
              HARD
            </span>
            <span className="text-[11px] text-gray-400 leading-relaxed">
              Choose exactly 2 tools from a pool of 6. Memory costs a tool slot.
            </span>
          </button>
        </div>

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
          onClick={() => onStart(difficulty)}
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
