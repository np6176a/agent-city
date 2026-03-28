import { create } from 'zustand';
import type { Building, BuildingType, Difficulty, GamePhase, GridTile } from '../types';

interface GameState {
  difficulty: Difficulty;
  turn: number;
  score: number;
  budget: number;
  phase: GamePhase;
  grid: Map<string, GridTile>;
  buildings: Building[];
  selectedBuildingType: BuildingType | null;
  selectedTile: { col: number; row: number } | null;
  repairBuildingId: string | null;
  consecutiveRepairs: number;
  isEarlyEnd: boolean;
  correctDiagnoses: number;
  totalDiagnoses: number;
  repairsAttempted: number;
  perfectConfigs: number;
  turnsPlayed: number;

  setDifficulty: (difficulty: Difficulty) => void;
  setPhase: (phase: GamePhase) => void;
  selectBuildingType: (type: BuildingType | null) => void;
  selectTile: (tile: { col: number; row: number } | null) => void;
  placeBuilding: (building: Building) => void;
  updateBuilding: (id: string, updates: Partial<Building>) => void;
  addScore: (points: number) => void;
  deductBudget: (amount: number) => void;
  addBudget: (amount: number) => void;
  advanceTurn: () => void;
  setRepairBuilding: (id: string | null) => void;
  incrementConsecutiveRepairs: () => void;
  resetConsecutiveRepairs: () => void;
  recordDiagnosis: (correct: boolean) => void;
  incrementRepairs: () => void;
  incrementPerfectConfigs: () => void;
  incrementTurnsPlayed: () => void;
  startGame: () => void;
  resetGame: () => void;
}

function initGrid(): Map<string, GridTile> {
  const grid = new Map<string, GridTile>();
  for (let col = 0; col < 8; col++) {
    for (let row = 0; row < 8; row++) {
      grid.set(`${col}:${row}`, { col, row, buildingId: null });
    }
  }
  return grid;
}

export const BUILDING_COSTS: Record<BuildingType, number> = {
  hospital: 150,
  library: 100,
  transit: 125,
  security: 175,
};

const MIN_BUILDING_COST = 100;

export function routeNextPhase(state: GameState): GamePhase {
  // Game over after 8 turns have been played
  if (state.turn > 8) return 'end';

  if (state.budget >= MIN_BUILDING_COST) {
    return 'place';
  }

  const hasBroken = state.buildings.some((b) => b.status === 'broken');

  if (hasBroken && state.consecutiveRepairs < 2) {
    return 'repair_select';
  }

  // Early end with grace
  return 'end';
}

export const useGameStore = create<GameState>((set) => ({
  difficulty: 'normal',
  turn: 1,
  score: 0,
  budget: 500,
  phase: 'start',
  grid: initGrid(),
  buildings: [],
  selectedBuildingType: null,
  selectedTile: null,
  repairBuildingId: null,
  consecutiveRepairs: 0,
  isEarlyEnd: false,
  correctDiagnoses: 0,
  totalDiagnoses: 0,
  repairsAttempted: 0,
  perfectConfigs: 0,
  turnsPlayed: 0,

  setDifficulty: (difficulty) => set({ difficulty }),

  setPhase: (phase) => set({ phase }),

  selectBuildingType: (type) => set({ selectedBuildingType: type }),

  selectTile: (tile) => set({ selectedTile: tile }),

  placeBuilding: (building) =>
    set((state) => {
      const grid = new Map(state.grid);
      const key = `${building.position.col}:${building.position.row}`;
      grid.set(key, { ...grid.get(key)!, buildingId: building.id });
      return {
        buildings: [...state.buildings, building],
        grid,
        budget: state.budget - BUILDING_COSTS[building.type],
        selectedBuildingType: null,
        selectedTile: null,
      };
    }),

  updateBuilding: (id, updates) =>
    set((state) => ({
      buildings: state.buildings.map((b) =>
        b.id === id ? { ...b, ...updates } : b,
      ),
    })),

  addScore: (points) =>
    set((state) => ({ score: Math.max(0, state.score + points) })),

  deductBudget: (amount) =>
    set((state) => ({ budget: state.budget - amount })),

  addBudget: (amount) => set((state) => ({ budget: state.budget + amount })),

  advanceTurn: () =>
    set((state) => {
      const nextTurn = state.turn + 1;
      const nextState = { ...state, turn: nextTurn };
      const nextPhase = routeNextPhase(nextState);
      const isEarlyEnd = nextPhase === 'end' && nextTurn <= 8;
      return {
        turn: nextTurn,
        phase: nextPhase,
        isEarlyEnd: isEarlyEnd || state.isEarlyEnd,
      };
    }),

  setRepairBuilding: (id) => set({ repairBuildingId: id }),

  incrementConsecutiveRepairs: () =>
    set((state) => ({ consecutiveRepairs: state.consecutiveRepairs + 1 })),

  resetConsecutiveRepairs: () => set({ consecutiveRepairs: 0 }),

  recordDiagnosis: (correct) =>
    set((state) => ({
      correctDiagnoses: state.correctDiagnoses + (correct ? 1 : 0),
      totalDiagnoses: state.totalDiagnoses + 1,
    })),

  incrementRepairs: () =>
    set((state) => ({ repairsAttempted: state.repairsAttempted + 1 })),

  incrementPerfectConfigs: () =>
    set((state) => ({ perfectConfigs: state.perfectConfigs + 1 })),

  incrementTurnsPlayed: () =>
    set((state) => ({ turnsPlayed: state.turnsPlayed + 1 })),

  startGame: () => set({ phase: 'place' }),

  resetGame: () =>
    set({
      difficulty: 'normal',
      turn: 1,
      score: 0,
      budget: 500,
      phase: 'start',
      grid: initGrid(),
      buildings: [],
      selectedBuildingType: null,
      selectedTile: null,
      repairBuildingId: null,
      consecutiveRepairs: 0,
      isEarlyEnd: false,
      correctDiagnoses: 0,
      totalDiagnoses: 0,
      repairsAttempted: 0,
      perfectConfigs: 0,
      turnsPlayed: 0,
    }),
}));
