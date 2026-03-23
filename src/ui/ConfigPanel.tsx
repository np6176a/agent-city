import { useState } from 'react';
import { useGameStore } from '../state/gameStore';
import type { AgentConfig, AutonomyLevel } from '../types';

interface ConfigPanelProps {
  onConfirm: (config: AgentConfig) => void;
}

export function ConfigPanel({ onConfirm }: ConfigPanelProps) {
  const phase = useGameStore((s) => s.phase);
  const [tools, setTools] = useState(false);
  const [memory, setMemory] = useState(false);
  const [autonomy, setAutonomy] = useState<AutonomyLevel>('medium');

  if (phase !== 'configure') return null;

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60">
      <div
        className="border rounded-2xl p-6 w-80 flex flex-col gap-5"
        style={{
          backgroundColor: 'var(--bg-panel)',
          borderColor: 'rgba(167, 139, 250, 0.3)',
          boxShadow: '0 0 40px rgba(167, 139, 250, 0.1)',
        }}
      >
        <h3 className="font-headline text-white text-lg font-bold text-center">
          Configure Agent
        </h3>

        <label className="flex items-center justify-between text-sm text-gray-300">
          <span>Tools Access</span>
          <div
            className="w-12 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors"
            style={{ backgroundColor: tools ? 'var(--mint)' : '#3d3d5c' }}
            onClick={() => setTools(!tools)}
          >
            <div
              className="w-4 h-4 rounded-full bg-white shadow transition-transform"
              style={{ transform: tools ? 'translateX(24px)' : 'translateX(0)' }}
            />
          </div>
        </label>

        <label className="flex items-center justify-between text-sm text-gray-300">
          <span>Memory</span>
          <div
            className="w-12 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors"
            style={{ backgroundColor: memory ? 'var(--cyan)' : '#3d3d5c' }}
            onClick={() => setMemory(!memory)}
          >
            <div
              className="w-4 h-4 rounded-full bg-white shadow transition-transform"
              style={{ transform: memory ? 'translateX(24px)' : 'translateX(0)' }}
            />
          </div>
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-gray-300">Autonomy Level</span>
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setAutonomy(level)}
                className="flex-1 py-2 rounded-xl text-xs font-headline font-semibold capitalize transition-all"
                style={{
                  backgroundColor: autonomy === level ? 'var(--violet)' : '#2d2d44',
                  color: autonomy === level ? '#fff' : '#888',
                  boxShadow: autonomy === level ? '0 0 12px rgba(167, 139, 250, 0.3)' : 'none',
                }}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => onConfirm({ tools, memory, autonomy })}
          className="mt-2 py-2.5 rounded-2xl text-white font-headline font-bold transition-all hover:scale-105"
          style={{
            backgroundColor: 'var(--mint)',
            color: '#0F0F1A',
            boxShadow: '0 0 16px rgba(94, 232, 176, 0.3)',
          }}
        >
          Confirm & Resolve
        </button>
      </div>
    </div>
  );
}
