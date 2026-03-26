import toolsData from '../data/tools.json';
import type { ToolId } from '../types';

interface ToolPickerProps {
  selectedTools: ToolId[];
  agentAffinityTools: ToolId[];
  onToggle: (toolId: ToolId) => void;
}

const TOOL_ICONS: Record<string, string> = {
  web_search: '🔍',
  calculator: '🧮',
  memory_bank: '🧠',
  planner: '📋',
  code_executor: '⌨️',
  alert_system: '🛡️',
};

export function ToolPicker({ selectedTools, agentAffinityTools, onToggle }: ToolPickerProps) {
  const isFull = selectedTools.length >= 2;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-headline font-bold uppercase tracking-wider text-gray-400">
          Pick 2 Tools
        </span>
        <span
          className="text-xs font-headline font-bold"
          style={{ color: isFull ? 'var(--mint)' : 'var(--yellow)' }}
        >
          {selectedTools.length}/2
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {toolsData.map((tool) => {
          const id = tool.id as ToolId;
          const isSelected = selectedTools.includes(id);
          const isLocked = isFull && !isSelected;
          const isAffinity = agentAffinityTools.includes(id);

          return (
            <button
              key={id}
              onClick={() => !isLocked && onToggle(id)}
              disabled={isLocked}
              className="relative flex flex-col items-start gap-1 p-2.5 rounded-xl text-left transition-all"
              style={{
                backgroundColor: isSelected
                  ? 'rgba(94, 232, 176, 0.12)'
                  : isLocked
                    ? 'rgba(255,255,255,0.02)'
                    : 'rgba(255,255,255,0.04)',
                border: `1px solid ${
                  isSelected
                    ? 'var(--mint)'
                    : isLocked
                      ? 'rgba(255,255,255,0.04)'
                      : 'rgba(255,255,255,0.08)'
                }`,
                opacity: isLocked ? 0.4 : 1,
                cursor: isLocked ? 'not-allowed' : 'pointer',
              }}
            >
              {isAffinity && (
                <span
                  className="absolute top-1 right-1 text-[10px]"
                  title="Agent affinity"
                >
                  ⭐
                </span>
              )}
              <span className="text-base">{TOOL_ICONS[id] ?? '🔧'}</span>
              <span
                className="text-xs font-headline font-semibold"
                style={{ color: isSelected ? 'var(--mint)' : '#ccc' }}
              >
                {tool.name}
              </span>
              <span className="text-[10px] text-gray-500 leading-tight">
                {tool.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
