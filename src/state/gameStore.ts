import { create } from 'zustand';
import type { Building, BuildingType, GamePhase, GridTile } from '../types';

interface GameState {
  turn: number;
  score: number;
  budget: number;
  phase: GamePhase;
  grid: Map<string, GridTile>;
  buildings: Building[];
  selectedBuildingType: BuildingType | null;
  selectedTile: { col: number; row: number } | null;

  setPhase: (phase: GamePhase) => void;
  selectBuildingType: (type: BuildingType | null) => void;
  selectTile: (tile: { col: number; row: number } | null) => void;
  placeBuilding: (building: Building) => void;
  updateBuilding: (id: string, updates: Partial<Building>) => void;
  addScore: (points: number) => void;
  deductBudget: (amount: number) => void;
  addBudget: (amount: number) => void;
  nextTurn: () => void;
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

export const useGameStore = create<GameState>((set) => ({
  turn: 1,
  score: 0,
  budget: 500,
  phase: 'start',
  grid: initGrid(),
  buildings: [],
  selectedBuildingType: null,
  selectedTile: null,

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

  addScore: (points) => set((state) => ({ score: state.score + points })),

  deductBudget: (amount) =>
    set((state) => ({ budget: state.budget - amount })),

  addBudget: (amount) => set((state) => ({ budget: state.budget + amount })),

  nextTurn: () =>
    set((state) => ({
      turn: state.turn + 1,
      phase: state.turn >= 8 ? 'end' : 'place',
    })),

  startGame: () => set({ phase: 'place' }),

  resetGame: () =>
    set({
      turn: 1,
      score: 0,
      budget: 500,
      phase: 'start',
      grid: initGrid(),
      buildings: [],
      selectedBuildingType: null,
      selectedTile: null,
    }),
}));
