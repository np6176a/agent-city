import { useState, useEffect } from 'react';
import { useGameStore } from '../state/gameStore';
import { useAgentStore } from '../state/agentStore';
import { useEventStore } from '../state/eventStore';
import type { AgentConfig, AutonomyLevel } from '../types';

interface ConfigPanelProps {
  onConfirm: (config: AgentConfig) => void;
}

export function ConfigPanel({ onConfirm }: ConfigPanelProps) {
  const phase = useGameStore((s) => s.phase);
  const buildings = useGameStore((s) => s.buildings);
  const repairBuildingId = useGameStore((s) => s.repairBuildingId);
  const agents = useAgentStore((s) => s.agents);
  const eventHistory = useEventStore((s) => s.eventHistory);
  const [tools, setTools] = useState(false);
  const [memory, setMemory] = useState(false);
  const [autonomy, setAutonomy] = useState<AutonomyLevel>('medium');

  const isVisible = phase === 'configure' || phase === 'repair_configure';

  // Reset toggle state every time the panel becomes visible
  useEffect(() => {
    if (isVisible) {
      setTools(false);
      setMemory(false);
      setAutonomy('medium');
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const isRepair = phase === 'repair_configure';

  // Find the building and agent for context
  const building = isRepair
    ? buildings.find((b) => b.id === repairBuildingId)
    : buildings[buildings.length - 1];

  const agent = building?.agentId
    ? agents.find((a) => a.id === building.agentId)
    : null;

  // Find the previous failure for this building (repair mode)
  const previousFailure = isRepair && building
    ? eventHistory
        .filter((e) => e.buildingId === building.id && e.type === 'breakdown')
        .pop()
    : null;

  const FAILURE_DESCRIPTIONS: Record<string, string> = {
    no_tools: 'had no tools and was guessing instead of looking things up',
    no_memory: 'had no memory and forgot the multi-step plan',
    high_autonomy_no_guardrails: 'had too much autonomy and overrode safety protocols',
    poor_fit: 'had a configuration that didn\'t match the task requirements',
    wrong_agent: 'wasn\'t the right fit for this type of building',
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60">
      <div
        className="border rounded-2xl p-6 w-80 flex flex-col gap-5"
        style={{
          backgroundColor: 'var(--bg-panel)',
          borderColor: isRepair
            ? 'rgba(255, 209, 102, 0.3)'
            : 'rgba(167, 139, 250, 0.3)',
          boxShadow: isRepair
            ? '0 0 40px rgba(255, 209, 102, 0.1)'
            : '0 0 40px rgba(167, 139, 250, 0.1)',
        }}
      >
        {/* Agent + Building context */}
        {agent && building && (
          <div className="flex items-center gap-3">
            <img
              src={agent.portrait}
              alt={agent.name}
              className="w-12 h-12 rounded-xl object-contain"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            />
            <div>
              <span className="font-headline font-bold text-sm" style={{ color: agent.color }}>
                {agent.name}
              </span>
              <span className="text-gray-500 text-xs block capitalize">{building.type}</span>
            </div>
          </div>
        )}

        <h3 className="font-headline text-white text-lg font-bold text-center">
          {isRepair ? 'Reconfigure Agent' : 'Configure Agent'}
        </h3>

        {/* Previous failure reminder (repair mode) */}
        {isRepair && previousFailure && (
          <div
            className="rounded-xl p-3 text-xs"
            style={{
              backgroundColor: 'rgba(255, 138, 128, 0.08)',
              border: '1px solid rgba(255, 138, 128, 0.2)',
              color: 'var(--coral)',
            }}
          >
            <strong>Last time:</strong> {agent?.name}{' '}
            {FAILURE_DESCRIPTIONS[previousFailure.cause] ?? 'failed to complete the task'}.
          </div>
        )}

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
          className="mt-2 py-2.5 rounded-2xl font-headline font-bold transition-all hover:scale-105"
          style={{
            backgroundColor: isRepair ? 'var(--yellow)' : 'var(--mint)',
            color: '#0F0F1A',
            boxShadow: isRepair
              ? '0 0 16px rgba(255, 209, 102, 0.3)'
              : '0 0 16px rgba(94, 232, 176, 0.3)',
          }}
        >
          {isRepair ? 'Repair & Run' : 'Confirm & Run'}
        </button>
      </div>
    </div>
  );
}
