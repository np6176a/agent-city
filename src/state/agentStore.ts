import { create } from 'zustand';
import type { Agent } from '../types';
import agentsData from '../data/agents.json';

interface AgentState {
  agents: Agent[];
  assignments: Map<string, string>; // buildingId -> agentId
  selectedAgentId: string | null;

  selectAgent: (agentId: string | null) => void;
  assignAgent: (buildingId: string, agentId: string) => void;
  unassignAgent: (buildingId: string) => void;
  resetAssignments: () => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  agents: agentsData as Agent[],
  assignments: new Map(),
  selectedAgentId: null,

  selectAgent: (agentId) => set({ selectedAgentId: agentId }),

  assignAgent: (buildingId, agentId) =>
    set((state) => {
      const assignments = new Map(state.assignments);
      assignments.set(buildingId, agentId);
      return { assignments, selectedAgentId: null };
    }),

  unassignAgent: (buildingId) =>
    set((state) => {
      const assignments = new Map(state.assignments);
      assignments.delete(buildingId);
      return { assignments };
    }),

  resetAssignments: () => set({ assignments: new Map() }),
}));
