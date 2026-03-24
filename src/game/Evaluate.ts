import type { Agent, Building, BuildingType, FailureCause, GameEvent } from '../types';

function needsTools(_buildingType: BuildingType, agent: Agent): boolean {
  return agent.name === 'Rue' || agent.name === 'Sentry';
}

function needsMemory(_buildingType: BuildingType, agent: Agent): boolean {
  return agent.name === 'Axel';
}

function failEvent(
  building: Building,
  agent: Agent,
  cause: FailureCause,
  isRepair: boolean,
): GameEvent {
  const teachingMap: Record<FailureCause, string> = {
    no_tools: 'tc_no_tools',
    no_memory: 'tc_no_memory',
    high_autonomy_no_guardrails: 'tc_high_autonomy',
    wrong_agent: 'tc_wrong_agent',
    poor_fit: 'tc_poor_fit',
  };

  return {
    id: `evt_${Date.now()}`,
    type: 'breakdown',
    buildingId: building.id,
    agentId: agent.id,
    cause,
    teachingCardId: teachingMap[cause],
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

export function evaluateTurn(
  building: Building,
  agent: Agent,
  isRepair = false,
): GameEvent {
  let score = 50;

  // Agent fit bonus/penalty
  if (agent.strengths.includes(building.type)) score += 25;
  if (agent.weakness.includes(building.type)) score -= 30;

  const config = building.config;

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

  // Randomized variance: ±5 for repairs (more forgiving), ±15 for normal
  const variance = isRepair ? 5 : 15;
  score += Math.floor(Math.random() * variance * 2) - variance;

  // Turns 7-8: harder threshold
  const threshold = building.turnsActive >= 6 ? 60 : 50;

  return score >= threshold
    ? successEvent(building, agent, isRepair)
    : failEvent(building, agent, 'poor_fit', isRepair);
}
