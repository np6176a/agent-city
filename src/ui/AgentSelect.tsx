import { useAgentStore } from '../state/agentStore';
import { useGameStore } from '../state/gameStore';

export function AgentSelect() {
  const phase = useGameStore((s) => s.phase);
  const { agents, selectedAgentId, selectAgent } = useAgentStore();

  if (phase !== 'assign') return null;

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-3 p-4 bg-gray-900/90 backdrop-blur-sm rounded-2xl border border-gray-700">
      <h3 className="text-white text-sm font-semibold text-center mb-1">
        Choose Agent
      </h3>
      {agents.map((agent) => {
        const isSelected = selectedAgentId === agent.id;
        return (
          <button
            key={agent.id}
            onClick={() => selectAgent(isSelected ? null : agent.id)}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all w-40
              ${isSelected ? 'border-white bg-gray-700' : 'border-gray-600 bg-gray-800 hover:border-gray-400'}`}
          >
            <div
              className="w-12 h-12 rounded-full"
              style={{ backgroundColor: agent.color }}
            />
            <span className="text-white text-sm font-medium">{agent.name}</span>
            <span className="text-gray-400 text-xs">{agent.role}</span>
            <div className="text-xs text-gray-500">
              Best: {agent.strengths.join(', ')}
            </div>
          </button>
        );
      })}
    </div>
  );
}
