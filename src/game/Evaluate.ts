import type {
  Agent,
  Building,
  BuildingType,
  Difficulty,
  FailureCause,
  GameEvent,
  HardModeConfig,
  NormalModeConfig,
  ToolId,
} from '../types';
import buildingsData from '../data/buildings.json';
import toolsData from '../data/tools.json';

interface BuildingDef {
  type: string;
  requiredTools: string[];
  idealCombo: string[];
  memoryNeed: string;
  failureMessages: Record<string, string>;
}

interface ToolDef {
  id: string;
  memoryInteraction: {
    memoryImportance: string;
  };
}

function getBuildingDef(type: BuildingType): BuildingDef {
  return buildingsData.find((b) => b.type === type)! as unknown as BuildingDef;
}

function getToolDef(id: ToolId): ToolDef {
  return toolsData.find((t) => t.id === id)! as ToolDef;
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
  const config = building.config as NormalModeConfig;
  let score = 50;

  // Agent fit bonus/penalty
  if (agent.strengths.includes(building.type)) score += 25;
  if (agent.weakness.includes(building.type)) score -= 30;

  // Wrong agent: weakness match with a significant penalty
  if (agent.weakness.includes(building.type) && score < 30) {
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
  if (config.tools) score += 5;
  if (config.memory) score += 5;
  if (config.autonomy === 'medium') score += 5;

  // Randomized variance
  const variance = isRepair ? 5 : 15;
  score += Math.floor(Math.random() * variance * 2) - variance;

  // Turns 7-8: harder threshold
  const threshold = currentTurn >= 7 ? 60 : 50;

  return score >= threshold
    ? successEvent(building, agent, isRepair)
    : failEvent(building, agent, 'poor_fit', isRepair);
}

function determineCause(
  building: Building,
  agent: Agent,
  tools: [ToolId, ToolId],
): FailureCause {
  const def = getBuildingDef(building.type);
  if (def.requiredTools.includes('web_search') && !tools.includes('web_search'))
    return 'no_search';
  if (def.requiredTools.includes('calculator') && !tools.includes('calculator'))
    return 'no_calculator';
  if (def.requiredTools.includes('planner') && !tools.includes('planner'))
    return 'no_planner';
  if (
    def.requiredTools.includes('alert_system') &&
    !tools.includes('alert_system')
  )
    return 'no_alert';
  if (
    def.requiredTools.includes('memory_bank') &&
    !tools.includes('memory_bank')
  )
    return 'no_memory';
  if (
    def.requiredTools.includes('code_executor') &&
    !tools.includes('code_executor')
  )
    return 'no_code';
  if (agent.weakness.includes(building.type)) return 'wrong_agent';
  return 'poor_fit';
}

function evaluateHardMode(
  building: Building,
  agent: Agent,
  isRepair: boolean,
  currentTurn: number,
): GameEvent {
  const config = building.config as HardModeConfig;
  const tools = config.tools;
  const buildingDef = getBuildingDef(building.type);
  const hasMemory = tools.includes('memory_bank');
  let score = 50;

  // 1. Agent-building fit
  if (agent.strengths.includes(building.type)) score += 20;
  if (agent.weakness.includes(building.type)) score -= 25;

  // Wrong agent: weakness match with a significant penalty
  if (agent.weakness.includes(building.type) && score < 30) {
    return failEvent(building, agent, 'wrong_agent', isRepair);
  }

  // 2. Agent-tool affinity (+10 per match)
  const affinityTools = agent.affinityTools ?? [];
  for (const tool of tools) {
    if (affinityTools.includes(tool)) score += 10;
  }

  // 3. Required tool check (instant fail if NONE present)
  const hasRequired = tools.some((t) =>
    buildingDef.requiredTools.includes(t),
  );
  if (!hasRequired) {
    return failEvent(building, agent, 'no_required_tool', isRepair);
  }

  // 4. Specific tool absence penalty
  for (const reqTool of buildingDef.requiredTools) {
    if (!tools.includes(reqTool as ToolId)) score -= 15;
  }

  // 5. Memory interaction
  for (const tool of tools) {
    if (tool === 'memory_bank') continue;
    const toolDef = getToolDef(tool);
    const importance = toolDef.memoryInteraction.memoryImportance;

    if (importance === 'critical' && !hasMemory) {
      return failEvent(building, agent, 'memory_tool_mismatch', isRepair);
    }
    if (importance === 'helpful' && hasMemory) {
      score += 10;
    }
  }

  // 6. Ideal combo bonus
  const [ideal1, ideal2] = buildingDef.idealCombo;
  if (tools.includes(ideal1 as ToolId) && tools.includes(ideal2 as ToolId)) {
    score += 20;
  }

  // 7. Autonomy check
  if (config.autonomy === 'high' && building.type === 'security') {
    return failEvent(building, agent, 'high_autonomy_no_guardrails', isRepair);
  }

  // 8. Random variance
  const variance = isRepair ? 5 : 15;
  score += Math.floor(Math.random() * variance * 2) - variance;

  // 9. Turns 7-8: harder threshold
  const threshold = currentTurn >= 7 ? 60 : 50;

  // 10. Result
  if (score >= threshold) {
    return successEvent(building, agent, isRepair);
  }
  return failEvent(building, agent, determineCause(building, agent, tools), isRepair);
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
