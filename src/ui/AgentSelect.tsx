import { useAgentStore } from '../state/agentStore';
import { useGameStore } from '../state/gameStore';

export function AgentSelect() {
  const phase = useGameStore((s) => s.phase);
  const { agents, selectedAgentId, selectAgent } = useAgentStore();

  if (phase !== 'assign') return null;

  return (
    <div
      className="fixed right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-3 p-4 backdrop-blur-sm rounded-2xl border border-gray-700/50"
      style={{ backgroundColor: 'rgba(15, 15, 26, 0.92)' }}
    >
      <h3 className="text-white text-sm font-headline font-bold text-center mb-1">
        Choose Agent
      </h3>
      {agents.map((agent) => {
        const isSelected = selectedAgentId === agent.id;
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
            <img
              src={agent.portrait}
              alt={agent.name}
              className="w-16 h-16 object-contain drop-shadow-md"
            />
            <span className="font-headline font-bold text-sm" style={{ color: agent.color }}>
              {agent.name}
            </span>
            <span className="text-gray-400 text-xs">{agent.role}</span>
            <span className="text-gray-500 text-[10px]">
              Best: {agent.strengths.join(', ')}
            </span>
          </button>
        );
      })}
    </div>
  );
}
