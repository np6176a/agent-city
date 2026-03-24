import { describe, it, expect, beforeEach } from 'vitest';
import { useAgentStore } from '../state/agentStore';

function getState() {
  return useAgentStore.getState();
}

describe('agentStore', () => {
  beforeEach(() => {
    getState().resetAssignments();
    getState().selectAgent(null);
  });

  describe('initial state', () => {
    it('has 3 agents loaded from data', () => {
      expect(getState().agents).toHaveLength(3);
    });

    it('has Axel, Rue, and Sentry', () => {
      const names = getState().agents.map((a) => a.name);
      expect(names).toContain('Axel');
      expect(names).toContain('Rue');
      expect(names).toContain('Sentry');
    });

    it('each agent has strengths and weakness', () => {
      for (const agent of getState().agents) {
        expect(agent.strengths.length).toBeGreaterThan(0);
        expect(agent.weakness.length).toBeGreaterThan(0);
      }
    });
  });

  describe('selectAgent', () => {
    it('selects and deselects an agent', () => {
      getState().selectAgent('axel');
      expect(getState().selectedAgentId).toBe('axel');

      getState().selectAgent(null);
      expect(getState().selectedAgentId).toBeNull();
    });
  });

  describe('assignAgent', () => {
    it('maps building to agent', () => {
      getState().assignAgent('bld_1', 'rue');
      expect(getState().assignments.get('bld_1')).toBe('rue');
    });

    it('clears selectedAgentId after assignment', () => {
      getState().selectAgent('rue');
      getState().assignAgent('bld_1', 'rue');
      expect(getState().selectedAgentId).toBeNull();
    });

    it('supports multiple assignments', () => {
      getState().assignAgent('bld_1', 'axel');
      getState().assignAgent('bld_2', 'rue');
      getState().assignAgent('bld_3', 'sentry');
      expect(getState().assignments.size).toBe(3);
    });
  });

  describe('resetAssignments', () => {
    it('clears all assignments', () => {
      getState().assignAgent('bld_1', 'axel');
      getState().assignAgent('bld_2', 'rue');
      getState().resetAssignments();
      expect(getState().assignments.size).toBe(0);
    });
  });
});
