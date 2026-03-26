import type { ToolId } from '../types';
import toolsData from '../data/tools.json';

interface CompatPreviewProps {
  selectedTools: ToolId[];
  agentAffinityTools: ToolId[];
  requiredTools: string[];
}

export function CompatPreview({
  selectedTools,
  agentAffinityTools,
  requiredTools,
}: CompatPreviewProps) {
  if (selectedTools.length === 0) return null;

  const affinityCount = selectedTools.filter((t) =>
    agentAffinityTools.includes(t),
  ).length;

  const hasRequired = selectedTools.some((t) => requiredTools.includes(t));

  const hasMemory = selectedTools.includes('memory_bank');
  const needsMemory = selectedTools.some((t) => {
    if (t === 'memory_bank') return false;
    const def = toolsData.find((d) => d.id === t);
    return def?.memoryInteraction.memoryImportance === 'critical';
  });

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-headline font-bold uppercase tracking-wider text-gray-500">
        Compatibility
      </span>
      <div className="flex gap-2">
        <Indicator
          label="Affinity"
          value={`${affinityCount}/2`}
          status={affinityCount >= 2 ? 'good' : affinityCount === 1 ? 'ok' : 'bad'}
        />
        <Indicator
          label="Required"
          value={hasRequired ? 'Yes' : 'No'}
          status={hasRequired ? 'good' : 'bad'}
        />
        <Indicator
          label="Memory"
          value={needsMemory ? (hasMemory ? 'OK' : '⚠️') : '—'}
          status={needsMemory ? (hasMemory ? 'good' : 'bad') : 'neutral'}
        />
      </div>
    </div>
  );
}

function Indicator({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: 'good' | 'ok' | 'bad' | 'neutral';
}) {
  const colors = {
    good: 'var(--mint)',
    ok: 'var(--yellow)',
    bad: 'var(--coral)',
    neutral: '#666',
  };

  return (
    <div
      className="flex-1 rounded-lg p-1.5 text-center"
      style={{
        backgroundColor: 'rgba(255,255,255,0.03)',
        border: `1px solid ${colors[status]}30`,
      }}
    >
      <p className="text-xs font-bold" style={{ color: colors[status] }}>
        {value}
      </p>
      <p className="text-[9px] text-gray-500">{label}</p>
    </div>
  );
}
