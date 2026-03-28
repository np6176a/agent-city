import { useAgentStore } from '../state/agentStore';
import { useGameStore } from '../state/gameStore';
import { RobotFace } from './RobotFace';
import type { BuildingType } from '../types';

const BUILDING_LABELS: Record<BuildingType, string> = {
  hospital: 'Hospital',
  library: 'Library',
  transit: 'Transit Hub',
  security: 'Security Tower',
};

interface AgentSelectProps {
  onConfirm: (agentId: string) => void;
}

export function AgentSelect({ onConfirm }: AgentSelectProps) {
  const phase = useGameStore((s) => s.phase);
  const buildings = useGameStore((s) => s.buildings);
  const repairBuildingId = useGameStore((s) => s.repairBuildingId);
  const { agents, selectedAgentId, selectAgent } = useAgentStore();

  if (phase !== 'assign' && phase !== 'repair_assign') return null;

  const selectedAgent = agents.find((a) => a.id === selectedAgentId);

  // Determine the building type being assigned
  const currentBuildingId = phase === 'repair_assign'
    ? repairBuildingId
    : buildings[buildings.length - 1]?.id;
  const currentBuildingType = buildings.find((b) => b.id === currentBuildingId)?.type ?? null;

  const isWeakness = (agentWeakness: BuildingType[]) =>
    currentBuildingType !== null && agentWeakness.includes(currentBuildingType);

  const selectedIsMismatch = selectedAgent !== undefined
    && currentBuildingType !== null
    && isWeakness(selectedAgent.weakness);

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-10 flex gap-3">
      {/* Bio panel — shown when an agent is selected */}
      {selectedAgent && (
        <div
          className="w-64 rounded-2xl border p-4 flex flex-col gap-3 backdrop-blur-sm"
          style={{
            backgroundColor: 'rgba(15, 15, 26, 0.95)',
            borderColor: `${selectedAgent.color}40`,
            boxShadow: `0 0 24px ${selectedAgent.color}15`,
          }}
        >
          <p
            className="text-sm italic leading-relaxed"
            style={{ color: selectedAgent.color }}
          >
            "{selectedAgent.motto}"
          </p>
          <p className="text-gray-400 text-xs leading-relaxed">
            {selectedAgent.bio}
          </p>
          <div className="flex flex-col gap-1.5 mt-1">
            {selectedAgent.personality.map((trait, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px] text-gray-500">
                <span style={{ color: selectedAgent.color }}>-</span>
                <span>{trait}</span>
              </div>
            ))}
          </div>
          <span className="text-gray-600 text-[10px] mt-1">
            {selectedAgent.pronouns}
          </span>

          {/* Mismatch warning */}
          {selectedIsMismatch && currentBuildingType && (
            <div
              className="mt-2 rounded-xl border px-3 py-2.5 text-xs leading-relaxed"
              style={{
                borderColor: 'rgba(255, 138, 128, 0.4)',
                backgroundColor: 'rgba(255, 138, 128, 0.08)',
                color: '#FF8A80',
              }}
            >
              <span className="font-bold">Heads up:</span>{' '}
              {selectedAgent.name} struggles with {BUILDING_LABELS[currentBuildingType]} tasks.
              {' '}This isn't their strength — consider a different agent.
            </div>
          )}
        </div>
      )}

      {/* Agent cards */}
      <div
        className="flex flex-col gap-3 p-4 backdrop-blur-sm rounded-2xl border border-gray-700/50"
        style={{ backgroundColor: 'rgba(15, 15, 26, 0.92)' }}
      >
        <h3 className="text-white text-sm font-headline font-bold text-center mb-1">
          Choose Agent
        </h3>
        {agents.map((agent) => {
          const isSelected = selectedAgentId === agent.id;
          const agentKey = agent.id as 'axel' | 'rue' | 'sentry';
          const weakForBuilding = isWeakness(agent.weakness);
          return (
            <button
              key={agent.id}
              onClick={() => selectAgent(isSelected ? null : agent.id)}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all w-44 ${
                !isSelected ? 'hover:scale-105' : ''
              }`}
              style={{
                borderColor: isSelected ? agent.color : 'rgba(255,255,255,0.08)',
                backgroundColor: isSelected ? 'rgba(255,255,255,0.06)' : 'transparent',
                boxShadow: isSelected ? `0 0 16px ${agent.color}40` : 'none',
              }}
            >
              <RobotFace agent={agentKey} expression="idle" size={80} />
              <span className="font-headline font-bold text-sm" style={{ color: agent.color }}>
                {agent.name}
              </span>
              <span className="text-gray-400 text-xs">{agent.role}</span>
              <span className="text-gray-500 text-[10px] italic">
                {agent.tagline}
              </span>
              {/* Weakness tag when this agent is weak for the current building */}
              {weakForBuilding && currentBuildingType && (
                <span
                  className="text-[10px] font-bold rounded-full px-2 py-0.5 mt-0.5"
                  style={{
                    color: '#FF8A80',
                    backgroundColor: 'rgba(255, 138, 128, 0.12)',
                  }}
                >
                  Weak vs {BUILDING_LABELS[currentBuildingType]}
                </span>
              )}
            </button>
          );
        })}
        <button
          onClick={() => {
            if (selectedAgentId) onConfirm(selectedAgentId);
          }}
          disabled={!selectedAgentId}
          className="mt-2 py-2 px-4 rounded-xl text-sm font-headline font-bold transition-all"
          style={{
            backgroundColor: selectedAgentId ? 'var(--mint)' : 'rgba(255,255,255,0.05)',
            color: selectedAgentId ? '#0F0F1A' : 'rgba(255,255,255,0.3)',
            cursor: selectedAgentId ? 'pointer' : 'not-allowed',
          }}
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
