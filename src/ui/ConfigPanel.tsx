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
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-80 flex flex-col gap-5">
        <h3 className="text-white text-lg font-bold text-center">
          Configure Agent
        </h3>

        <label className="flex items-center justify-between text-sm text-gray-300">
          <span>Tools Access</span>
          <input
            type="checkbox"
            checked={tools}
            onChange={(e) => setTools(e.target.checked)}
            className="w-5 h-5 accent-violet-500"
          />
        </label>

        <label className="flex items-center justify-between text-sm text-gray-300">
          <span>Memory</span>
          <input
            type="checkbox"
            checked={memory}
            onChange={(e) => setMemory(e.target.checked)}
            className="w-5 h-5 accent-violet-500"
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-gray-300">Autonomy Level</span>
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setAutonomy(level)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all
                  ${autonomy === level ? 'bg-violet-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => onConfirm({ tools, memory, autonomy })}
          className="mt-2 py-2 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-400 transition-colors"
        >
          Confirm & Resolve
        </button>
      </div>
    </div>
  );
}
