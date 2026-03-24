import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore, BUILDING_COSTS, routeNextPhase } from '../state/gameStore';
import type { Building } from '../types';

function getState() {
  return useGameStore.getState();
}

function makePlacedBuilding(overrides: Partial<Building> = {}): Building {
  return {
    id: `bld_${Date.now()}`,
    type: 'library',
    position: { col: 0, row: 0 },
    agentId: 'rue',
    config: { tools: true, memory: true, autonomy: 'medium' },
    status: 'idle',
    turnsActive: 0,
    ...overrides,
  };
}

describe('BUILDING_COSTS', () => {
  it('has correct costs per spec', () => {
    expect(BUILDING_COSTS.hospital).toBe(150);
    expect(BUILDING_COSTS.library).toBe(100);
    expect(BUILDING_COSTS.transit).toBe(125);
    expect(BUILDING_COSTS.security).toBe(175);
  });
});

describe('routeNextPhase', () => {
  it('returns end when turn > 8', () => {
    const state = { ...getState(), turn: 9, budget: 500 };
    expect(routeNextPhase(state)).toBe('end');
  });

  it('returns place when budget >= 100', () => {
    const state = { ...getState(), turn: 3, budget: 100 };
    expect(routeNextPhase(state)).toBe('place');
  });

  it('returns repair_select when budget < 100 and broken buildings exist', () => {
    const broken = makePlacedBuilding({ status: 'broken' });
    const state = {
      ...getState(),
      turn: 3,
      budget: 50,
      buildings: [broken],
      consecutiveRepairs: 0,
    };
    expect(routeNextPhase(state)).toBe('repair_select');
  });

  it('returns end when budget < 100 and no broken buildings', () => {
    const success = makePlacedBuilding({ status: 'success' });
    const state = {
      ...getState(),
      turn: 3,
      budget: 50,
      buildings: [success],
      consecutiveRepairs: 0,
    };
    expect(routeNextPhase(state)).toBe('end');
  });

  it('returns end when budget < 100 and 2 consecutive repairs', () => {
    const broken = makePlacedBuilding({ status: 'broken' });
    const state = {
      ...getState(),
      turn: 3,
      budget: 50,
      buildings: [broken],
      consecutiveRepairs: 2,
    };
    expect(routeNextPhase(state)).toBe('end');
  });

  it('returns place for turn 8 (playable)', () => {
    const state = { ...getState(), turn: 8, budget: 500 };
    expect(routeNextPhase(state)).toBe('place');
  });

  it('returns end for turn 9 (after turn 8 played)', () => {
    const state = { ...getState(), turn: 9, budget: 500 };
    expect(routeNextPhase(state)).toBe('end');
  });
});

describe('gameStore actions', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  describe('startGame', () => {
    it('sets phase to place', () => {
      getState().startGame();
      expect(getState().phase).toBe('place');
    });
  });

  describe('addScore', () => {
    it('adds points', () => {
      getState().addScore(100);
      expect(getState().score).toBe(100);
    });

    it('floors score at 0', () => {
      getState().addScore(-999);
      expect(getState().score).toBe(0);
    });
  });

  describe('addBudget / deductBudget', () => {
    it('adds to budget', () => {
      getState().addBudget(50);
      expect(getState().budget).toBe(550);
    });

    it('deducts from budget', () => {
      getState().deductBudget(100);
      expect(getState().budget).toBe(400);
    });
  });

  describe('placeBuilding', () => {
    it('adds building, updates grid, deducts cost', () => {
      const building = makePlacedBuilding({ type: 'library' });
      getState().selectBuildingType('library');
      getState().placeBuilding(building);

      expect(getState().buildings).toHaveLength(1);
      expect(getState().budget).toBe(400); // 500 - 100
      expect(getState().selectedBuildingType).toBeNull();

      const tile = getState().grid.get(`${building.position.col}:${building.position.row}`);
      expect(tile?.buildingId).toBe(building.id);
    });
  });

  describe('updateBuilding', () => {
    it('updates a building by id', () => {
      const building = makePlacedBuilding();
      getState().placeBuilding(building);
      getState().updateBuilding(building.id, { status: 'broken' });
      expect(getState().buildings[0].status).toBe('broken');
    });
  });

  describe('advanceTurn', () => {
    it('increments turn and routes to place with budget', () => {
      getState().startGame();
      getState().advanceTurn();
      expect(getState().turn).toBe(2);
      expect(getState().phase).toBe('place');
    });

    it('routes to end after turn 8', () => {
      useGameStore.setState({ turn: 8, budget: 500, phase: 'feedback' });
      getState().advanceTurn();
      expect(getState().turn).toBe(9);
      expect(getState().phase).toBe('end');
    });

    it('routes to repair_select when budget low and broken buildings', () => {
      const broken = makePlacedBuilding({ status: 'broken' });
      useGameStore.setState({
        turn: 3,
        budget: 50,
        buildings: [broken],
        consecutiveRepairs: 0,
        phase: 'feedback',
      });
      getState().advanceTurn();
      expect(getState().phase).toBe('repair_select');
    });

    it('sets isEarlyEnd when ending before turn 9', () => {
      useGameStore.setState({
        turn: 4,
        budget: 50,
        buildings: [makePlacedBuilding({ status: 'success' })],
        consecutiveRepairs: 0,
        phase: 'feedback',
      });
      getState().advanceTurn();
      expect(getState().phase).toBe('end');
      expect(getState().isEarlyEnd).toBe(true);
    });
  });

  describe('consecutive repairs', () => {
    it('increments and resets', () => {
      getState().incrementConsecutiveRepairs();
      expect(getState().consecutiveRepairs).toBe(1);
      getState().incrementConsecutiveRepairs();
      expect(getState().consecutiveRepairs).toBe(2);
      getState().resetConsecutiveRepairs();
      expect(getState().consecutiveRepairs).toBe(0);
    });
  });

  describe('recordDiagnosis', () => {
    it('tracks correct and total', () => {
      getState().recordDiagnosis(true);
      getState().recordDiagnosis(false);
      getState().recordDiagnosis(true);
      expect(getState().correctDiagnoses).toBe(2);
      expect(getState().totalDiagnoses).toBe(3);
    });
  });

  describe('resetGame', () => {
    it('resets all state to initial values', () => {
      getState().addScore(500);
      getState().advanceTurn();
      getState().incrementConsecutiveRepairs();
      getState().recordDiagnosis(true);
      getState().incrementRepairs();
      getState().incrementPerfectConfigs();
      getState().incrementTurnsPlayed();

      getState().resetGame();

      expect(getState().score).toBe(0);
      expect(getState().turn).toBe(1);
      expect(getState().budget).toBe(500);
      expect(getState().phase).toBe('start');
      expect(getState().buildings).toHaveLength(0);
      expect(getState().consecutiveRepairs).toBe(0);
      expect(getState().correctDiagnoses).toBe(0);
      expect(getState().totalDiagnoses).toBe(0);
      expect(getState().repairsAttempted).toBe(0);
      expect(getState().perfectConfigs).toBe(0);
      expect(getState().turnsPlayed).toBe(0);
      expect(getState().isEarlyEnd).toBe(false);
    });
  });

  describe('grid initialization', () => {
    it('creates 64 tiles (8x8)', () => {
      expect(getState().grid.size).toBe(64);
    });

    it('all tiles start with no building', () => {
      for (const tile of getState().grid.values()) {
        expect(tile.buildingId).toBeNull();
      }
    });
  });
});
