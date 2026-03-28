import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../state/gameStore';
import { useAgentStore } from '../state/agentStore';
import type { Building } from '../types';

function gameState() {
  return useGameStore.getState();
}

function agentState() {
  return useAgentStore.getState();
}

function makePlacedBuilding(overrides: Partial<Building> = {}): Building {
  return {
    id: `bld_${Date.now()}`,
    type: 'library',
    position: { col: 0, row: 0 },
    agentId: null,
    config: { mode: 'normal', tools: false, memory: false, autonomy: 'medium' },
    status: 'idle',
    turnsActive: 0,
    ...overrides,
  };
}

/**
 * Simulates the handleAgentConfirm callback from App.tsx.
 * Returns true if the assignment proceeded, false if it was skipped.
 */
function simulateAgentConfirm(agentId: string): boolean {
  const currentPhase = gameState().phase;

  if (currentPhase === 'assign') {
    const buildings = gameState().buildings;
    const latestBuilding = buildings[buildings.length - 1];
    if (latestBuilding && !latestBuilding.agentId) {
      agentState().assignAgent(latestBuilding.id, agentId);
      gameState().updateBuilding(latestBuilding.id, { agentId });
      gameState().setPhase('configure');
      return true;
    }
    return false;
  } else if (currentPhase === 'repair_assign') {
    const repairId = gameState().repairBuildingId;
    if (repairId) {
      agentState().assignAgent(repairId, agentId);
      gameState().updateBuilding(repairId, { agentId });
      gameState().setPhase('repair_configure');
      return true;
    }
    return false;
  }
  return false;
}

/**
 * Simulates the handleChangeAgent callback from App.tsx.
 * (3D scene operations omitted — only state changes are tested.)
 */
function simulateChangeAgent() {
  const state = gameState();
  const currentPhase = state.phase;

  const buildingId =
    currentPhase === 'repair_configure'
      ? state.repairBuildingId
      : state.buildings[state.buildings.length - 1]?.id;

  if (buildingId) {
    gameState().updateBuilding(buildingId, { agentId: null });
    agentState().unassignAgent(buildingId);
  }

  if (currentPhase === 'configure') {
    gameState().setPhase('assign');
  } else if (currentPhase === 'repair_configure') {
    gameState().setPhase('repair_assign');
  }
  agentState().selectAgent(null);
}

describe('change agent flow', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
    useAgentStore.getState().resetAssignments();
    useAgentStore.getState().selectAgent(null);
  });

  it('allows reassignment after changing agent to a different robot', () => {
    // Place a building and enter assign phase
    const building = makePlacedBuilding({ id: 'bld_1' });
    gameState().placeBuilding(building);
    gameState().setPhase('assign');

    // First assignment: pick Axel
    const firstAssigned = simulateAgentConfirm('axel');
    expect(firstAssigned).toBe(true);
    expect(gameState().phase).toBe('configure');
    expect(gameState().buildings[0].agentId).toBe('axel');

    // Click "Change Agent"
    simulateChangeAgent();
    expect(gameState().phase).toBe('assign');
    expect(gameState().buildings[0].agentId).toBeNull();
    expect(agentState().assignments.has('bld_1')).toBe(false);

    // Second assignment: pick Rue
    const secondAssigned = simulateAgentConfirm('rue');
    expect(secondAssigned).toBe(true);
    expect(gameState().phase).toBe('configure');
    expect(gameState().buildings[0].agentId).toBe('rue');
  });

  it('allows reassignment when selecting the same robot again', () => {
    const building = makePlacedBuilding({ id: 'bld_2' });
    gameState().placeBuilding(building);
    gameState().setPhase('assign');

    simulateAgentConfirm('sentry');
    expect(gameState().phase).toBe('configure');

    simulateChangeAgent();
    expect(gameState().phase).toBe('assign');

    // Re-select the same agent
    const reassigned = simulateAgentConfirm('sentry');
    expect(reassigned).toBe(true);
    expect(gameState().phase).toBe('configure');
    expect(gameState().buildings[0].agentId).toBe('sentry');
  });

  it('allows multiple change-agent cycles', () => {
    const building = makePlacedBuilding({ id: 'bld_3' });
    gameState().placeBuilding(building);
    gameState().setPhase('assign');

    // Cycle 1: Axel -> change
    simulateAgentConfirm('axel');
    simulateChangeAgent();
    expect(gameState().phase).toBe('assign');

    // Cycle 2: Rue -> change
    simulateAgentConfirm('rue');
    simulateChangeAgent();
    expect(gameState().phase).toBe('assign');

    // Cycle 3: Sentry -> keep
    const finalAssigned = simulateAgentConfirm('sentry');
    expect(finalAssigned).toBe(true);
    expect(gameState().phase).toBe('configure');
    expect(gameState().buildings[0].agentId).toBe('sentry');
    expect(agentState().assignments.get('bld_3')).toBe('sentry');
  });

  it('clears selected agent after change', () => {
    const building = makePlacedBuilding({ id: 'bld_4' });
    gameState().placeBuilding(building);
    gameState().setPhase('assign');

    agentState().selectAgent('axel');
    simulateAgentConfirm('axel');
    simulateChangeAgent();

    expect(agentState().selectedAgentId).toBeNull();
  });

  describe('repair flow', () => {
    it('allows reassignment during repair after changing agent', () => {
      const building = makePlacedBuilding({ id: 'bld_repair', status: 'broken' });
      gameState().placeBuilding(building);
      gameState().setRepairBuilding('bld_repair');
      gameState().setPhase('repair_assign');

      // First assignment
      simulateAgentConfirm('axel');
      expect(gameState().phase).toBe('repair_configure');

      // Change agent
      simulateChangeAgent();
      expect(gameState().phase).toBe('repair_assign');
      expect(gameState().buildings[0].agentId).toBeNull();

      // Reassign
      const reassigned = simulateAgentConfirm('rue');
      expect(reassigned).toBe(true);
      expect(gameState().phase).toBe('repair_configure');
      expect(gameState().buildings[0].agentId).toBe('rue');
    });
  });
});
