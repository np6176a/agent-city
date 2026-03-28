import type {
  Agent,
  Building,
  BuildingType,
  Difficulty,
  FailureCause,
  GameEvent,
  HardModeConfig,
  NormalModeConfig,
  Tool,
  ToolId,
} from '../types';
import buildingsData from '../data/buildings.json';
import toolsData from '../data/tools.json';

interface BuildingDef {
  type: BuildingType;
  requiredTools: ToolId[];
  idealCombo: ToolId[];
  memoryNeed: string;
  failureMessages: Partial<Record<FailureCause, string>>;
}

// JSON imports are typed loosely by TS; these casts align them with our strict
// interfaces. The shapes are validated by the JSON files themselves.
const buildingDefs = buildingsData as ReadonlyArray<BuildingDef>;
const toolDefs = toolsData as ReadonlyArray<Tool>;

function getBuildingDef(type: BuildingType): BuildingDef {
  const def = buildingDefs.find((b) => b.type === type);
  if (!def) throw new Error(`No building definition for type: ${type}`);
  return def;
}

function getToolDef(id: ToolId): Tool {
  const def = toolDefs.find((t) => t.id === id);
  if (!def) throw new Error(`No tool definition for id: ${id}`);
  return def;
}

function needsTools(buildingType: BuildingType, agent: Agent): boolean {
  if (agent.name === 'Rue') return true;
  if (agent.name === 'Sentry' && buildingType === 'security') return true;
  return false;
}

function needsMemory(buildingType: BuildingType, agent: Agent): boolean {
  if (agent.name === 'Axel' && buildingType === 'transit') return true;
  return false;
}

const teachingMap: Record<string, string> = {
  no_tools: 'tc_no_tools',
  no_memory: 'tc_no_memory',
  high_autonomy_no_guardrails: 'tc_high_autonomy',
  wrong_agent: 'tc_wrong_agent',
  poor_fit: 'tc_poor_fit',
  no_required_tool: 'tc_no_required_tool',
  no_search: 'tc_no_search',
  no_calculator: 'tc_no_calculator',
  no_planner: 'tc_no_planner',
  no_alert: 'tc_no_alert',
  no_code: 'tc_poor_fit',
  memory_tool_mismatch: 'tc_memory_tool_mismatch',
};

function failEvent(
  building: Building,
  agent: Agent,
  cause: FailureCause,
  isRepair: boolean,
): GameEvent {
  return {
    id: `evt_${Date.now()}`,
    type: 'breakdown',
    buildingId: building.id,
    agentId: agent.id,
    cause,
    teachingCardId: teachingMap[cause] ?? 'tc_poor_fit',
    severity: cause === 'poor_fit' ? 'minor' : 'major',
    isRepair,
  };
}

function successEvent(
  building: Building,
  agent: Agent,
  isRepair: boolean,
): GameEvent {
  return {
    id: `evt_${Date.now()}`,
    type: 'success',
    buildingId: building.id,
    agentId: agent.id,
    cause: 'success',
    teachingCardId: isRepair ? 'tc_repair_success' : 'tc_success',
    severity: 'minor',
    isRepair,
  };
}

function evaluateNormalMode(
  building: Building,
  agent: Agent,
  isRepair: boolean,
  currentTurn: number,
): GameEvent {
  const config = building.config as NormalModeConfig; // narrowing: caller guarantees normal mode
  const baseScore = 50;

  // Agent fit bonus/penalty
  const fitScore = agent.strengths.includes(building.type)
    ? 25
    : agent.weakness.includes(building.type)
      ? -30
      : 0;

  // Wrong agent: weakness match with a significant penalty
  if (agent.weakness.includes(building.type) && baseScore + fitScore < 30) {
    return failEvent(building, agent, 'wrong_agent', isRepair);
  }

  // Tool dependency
  if (!config.tools && needsTools(building.type, agent)) {
    return failEvent(building, agent, 'no_tools', isRepair);
  }

  // Memory dependency
  if (!config.memory && needsMemory(building.type, agent)) {
    return failEvent(building, agent, 'no_memory', isRepair);
  }

  // Autonomy guardrail check
  if (config.autonomy === 'high' && building.type === 'security') {
    return failEvent(building, agent, 'high_autonomy_no_guardrails', isRepair);
  }

  // Configuration bonuses
  const configScore = [
    config.tools ? 5 : 0,
    config.memory ? 5 : 0,
    config.autonomy === 'medium' ? 5 : 0,
  ].reduce((sum, v) => sum + v, 0);

  // Randomized variance
  const variance = isRepair ? 5 : 15;
  const randomOffset = Math.floor(Math.random() * variance * 2) - variance;

  const score = baseScore + fitScore + configScore + randomOffset;

  // Turns 7-8: harder threshold
  const threshold = currentTurn >= 7 ? 60 : 50;

  return score >= threshold
    ? successEvent(building, agent, isRepair)
    : failEvent(building, agent, 'poor_fit', isRepair);
}

// Maps required tool IDs to their specific failure causes
const toolFailureCauseMap: Record<string, FailureCause> = {
  web_search: 'no_search',
  calculator: 'no_calculator',
  planner: 'no_planner',
  alert_system: 'no_alert',
  memory_bank: 'no_memory',
  code_executor: 'no_code',
};

function determineCause(
  building: Building,
  agent: Agent,
  tools: [ToolId, ToolId],
): FailureCause {
  const def = getBuildingDef(building.type);

  // Find the first required tool that is missing and has a specific failure cause
  const missingToolCause = def.requiredTools
    .filter((reqTool) => !tools.includes(reqTool))
    .map((reqTool) => toolFailureCauseMap[reqTool])
    .find((cause) => cause !== undefined);

  if (missingToolCause) return missingToolCause;
  if (agent.weakness.includes(building.type)) return 'wrong_agent';
  return 'poor_fit';
}

function evaluateHardMode(
  building: Building,
  agent: Agent,
  isRepair: boolean,
  currentTurn: number,
): GameEvent {
  const config = building.config as HardModeConfig; // narrowing: caller guarantees hard mode
  const tools = config.tools;
  const buildingDef = getBuildingDef(building.type);
  const hasMemory = tools.includes('memory_bank');
  const baseScore = 50;

  // 1. Agent-building fit
  const fitScore = agent.strengths.includes(building.type)
    ? 20
    : agent.weakness.includes(building.type)
      ? -25
      : 0;

  // Wrong agent: weakness match with a significant penalty
  if (agent.weakness.includes(building.type) && baseScore + fitScore < 30) {
    return failEvent(building, agent, 'wrong_agent', isRepair);
  }

  // 2. Agent-tool affinity (+10 per match)
  const affinityTools = agent.affinityTools ?? [];
  const affinityScore = tools.filter((tool) => affinityTools.includes(tool)).length * 10;

  // 3. Required tool check (instant fail if NONE present)
  const hasRequired = tools.some((t) =>
    buildingDef.requiredTools.includes(t),
  );
  if (!hasRequired) {
    return failEvent(building, agent, 'no_required_tool', isRepair);
  }

  // 4. Specific tool absence penalty
  const missingToolPenalty = buildingDef.requiredTools
    .filter((reqTool) => !tools.includes(reqTool))
    .length * -15;

  // 5. Memory interaction
  const memoryResult = tools
    .filter((tool) => tool !== 'memory_bank')
    .reduce<{ score: number; fail: FailureCause | null }>((acc, tool) => {
      if (acc.fail) return acc;
      const importance = getToolDef(tool).memoryInteraction.memoryImportance;
      if (importance === 'critical' && !hasMemory) {
        return { score: acc.score, fail: 'memory_tool_mismatch' };
      }
      if (importance === 'helpful' && hasMemory) {
        return { score: acc.score + 10, fail: null };
      }
      return acc;
    }, { score: 0, fail: null });

  if (memoryResult.fail) {
    return failEvent(building, agent, memoryResult.fail, isRepair);
  }

  // 6. Ideal combo bonus
  const [ideal1, ideal2] = buildingDef.idealCombo;
  const idealComboScore = (tools.includes(ideal1) && tools.includes(ideal2)) ? 20 : 0;

  // 7. Autonomy check
  if (config.autonomy === 'high' && building.type === 'security') {
    return failEvent(building, agent, 'high_autonomy_no_guardrails', isRepair);
  }

  // 8. Random variance
  const variance = isRepair ? 5 : 15;
  const randomOffset = Math.floor(Math.random() * variance * 2) - variance;

  // 9. Turns 7-8: harder threshold
  const threshold = currentTurn >= 7 ? 60 : 50;

  // 10. Result
  const score = baseScore + fitScore + affinityScore + missingToolPenalty +
    memoryResult.score + idealComboScore + randomOffset;

  return score >= threshold
    ? successEvent(building, agent, isRepair)
    : failEvent(building, agent, determineCause(building, agent, tools), isRepair);
}

export function evaluateTurn(
  building: Building,
  agent: Agent,
  isRepair = false,
  currentTurn = 1,
  difficulty: Difficulty = 'normal',
): GameEvent {
  if (difficulty === 'hard') {
    return evaluateHardMode(building, agent, isRepair, currentTurn);
  }
  return evaluateNormalMode(building, agent, isRepair, currentTurn);
}
