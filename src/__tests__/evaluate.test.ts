import { describe, it, expect, vi } from 'vitest';
import { evaluateTurn } from '../game/Evaluate';
import type { Agent, Building } from '../types';

function makeBuilding(overrides: Partial<Building> = {}): Building {
  return {
    id: 'bld_1',
    type: 'library',
    position: { col: 0, row: 0 },
    agentId: 'rue',
    config: { mode: 'normal', tools: true, memory: true, autonomy: 'medium' },
    status: 'idle',
    turnsActive: 0,
    ...overrides,
  };
}

const agentDefaults = {
  pronouns: '',
  tagline: '',
  motto: '',
  bio: '',
  personality: [],
  reactions: {},
};

function makeAgent(overrides: Partial<Agent> = {}): Agent {
  return {
    id: 'rue',
    name: 'Rue',
    role: 'The Researcher',
    teaches: 'Retrieval & Tool Use',
    color: '#67D4E8',
    portrait: '/assets/rue.png',
    strengths: ['library'],
    weakness: ['transit'],
    ...agentDefaults,
    ...overrides,
  };
}

const axel: Agent = {
  id: 'axel',
  name: 'Axel',
  role: 'The Planner',
  teaches: 'Planning & Task Decomposition',
  color: '#5EE8B0',
  portrait: '/assets/axel.png',
  strengths: ['transit'],
  weakness: ['security'],
  ...agentDefaults,
};

const sentry: Agent = {
  id: 'sentry',
  name: 'Sentry',
  role: 'The Guardian',
  teaches: 'Guardrails & Oversight',
  color: '#FF8A80',
  portrait: '/assets/sentry.png',
  strengths: ['security'],
  weakness: ['library'],
  ...agentDefaults,
};

describe('evaluateTurn', () => {
  describe('instant fail conditions', () => {
    it('fails with no_tools when Rue has tools OFF', () => {
      const building = makeBuilding({
        config: { mode: 'normal', tools: false, memory: true, autonomy: 'medium' },
      });
      const agent = makeAgent();
      const event = evaluateTurn(building, agent);
      expect(event.type).toBe('breakdown');
      expect(event.cause).toBe('no_tools');
      expect(event.teachingCardId).toBe('tc_no_tools');
    });

    it('fails with no_tools when Sentry has tools OFF on security', () => {
      const building = makeBuilding({
        type: 'security',
        agentId: 'sentry',
        config: { mode: 'normal', tools: false, memory: true, autonomy: 'low' },
      });
      const event = evaluateTurn(building, sentry);
      expect(event.type).toBe('breakdown');
      expect(event.cause).toBe('no_tools');
    });

    it('does NOT fail no_tools for Sentry on non-security buildings', () => {
      const building = makeBuilding({
        type: 'hospital',
        agentId: 'sentry',
        config: { mode: 'normal', tools: false, memory: true, autonomy: 'medium' },
      });
      // Sentry only needs tools for security; on hospital it should not instant-fail for no_tools
      const event = evaluateTurn(building, sentry);
      expect(event.cause).not.toBe('no_tools');
    });

    it('fails with no_memory when Axel has memory OFF on transit', () => {
      const building = makeBuilding({
        type: 'transit',
        agentId: 'axel',
        config: { mode: 'normal', tools: true, memory: false, autonomy: 'medium' },
      });
      const event = evaluateTurn(building, axel);
      expect(event.type).toBe('breakdown');
      expect(event.cause).toBe('no_memory');
      expect(event.teachingCardId).toBe('tc_no_memory');
    });

    it('does NOT fail no_memory for Axel on non-transit buildings', () => {
      const building = makeBuilding({
        type: 'hospital',
        agentId: 'axel',
        config: { mode: 'normal', tools: true, memory: false, autonomy: 'medium' },
      });
      const event = evaluateTurn(building, axel);
      expect(event.cause).not.toBe('no_memory');
    });

    it('fails with high_autonomy_no_guardrails on security building', () => {
      const building = makeBuilding({
        type: 'security',
        agentId: 'sentry',
        config: { mode: 'normal', tools: true, memory: true, autonomy: 'high' },
      });
      const event = evaluateTurn(building, sentry);
      expect(event.type).toBe('breakdown');
      expect(event.cause).toBe('high_autonomy_no_guardrails');
      expect(event.teachingCardId).toBe('tc_high_autonomy');
    });

    it('does NOT fail high autonomy on non-security buildings', () => {
      const building = makeBuilding({
        type: 'library',
        config: { mode: 'normal', tools: true, memory: true, autonomy: 'high' },
      });
      const agent = makeAgent();
      const event = evaluateTurn(building, agent);
      expect(event.cause).not.toBe('high_autonomy_no_guardrails');
    });
  });

  describe('wrong_agent detection', () => {
    it('returns wrong_agent when agent weakness matches building', () => {
      // Sentry weakness is library. Base 50 - 30 = 20 < 30 → wrong_agent
      const building = makeBuilding({
        type: 'library',
        agentId: 'sentry',
        config: { mode: 'normal', tools: true, memory: true, autonomy: 'medium' },
      });
      const event = evaluateTurn(building, sentry);
      expect(event.cause).toBe('wrong_agent');
      expect(event.teachingCardId).toBe('tc_wrong_agent');
    });
  });

  describe('success path', () => {
    it('succeeds with correct agent + config (seeded random)', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5); // variance = 0
      const building = makeBuilding({
        type: 'library',
        config: { mode: 'normal', tools: true, memory: true, autonomy: 'medium' },
      });
      const agent = makeAgent(); // Rue, strengths: library
      const event = evaluateTurn(building, agent);
      // score: 50 + 25 (strength) + 0 (variance) = 75 >= 50
      expect(event.type).toBe('success');
      expect(event.cause).toBe('success');
      expect(event.teachingCardId).toBe('tc_success');
      vi.restoreAllMocks();
    });
  });

  describe('poor_fit detection', () => {
    it('returns poor_fit when score is borderline with bad luck', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0); // variance = -15
      const building = makeBuilding({
        type: 'hospital',
        agentId: 'axel',
        config: { mode: 'normal', tools: false, memory: false, autonomy: 'low' },
      });
      // Axel: no strength or weakness for hospital. score: 50 + 0 (no config bonus) - 15 = 35 < 50
      const event = evaluateTurn(building, axel);
      expect(event.type).toBe('breakdown');
      expect(event.cause).toBe('poor_fit');
      vi.restoreAllMocks();
    });
  });

  describe('repair mode', () => {
    it('uses reduced variance (±5) in repair mode', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0); // variance = -5 (repair)
      const building = makeBuilding({
        type: 'hospital',
        agentId: 'axel',
        config: { mode: 'normal', tools: false, memory: false, autonomy: 'low' },
      });
      // score: 50 + 0 (no config bonus) - 5 = 45 < 50 → fail
      const repairEvent = evaluateTurn(building, axel, true);
      expect(repairEvent.isRepair).toBe(true);
      expect(repairEvent.type).toBe('breakdown');

      // With random=0.5: variance = 0 → score=50 ≥ 50 → success
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      const repairEvent2 = evaluateTurn(building, axel, true);
      expect(repairEvent2.type).toBe('success');
      expect(repairEvent2.isRepair).toBe(true);
      expect(repairEvent2.teachingCardId).toBe('tc_repair_success');
      vi.restoreAllMocks();
    });
  });

  describe('difficulty curve', () => {
    it('uses threshold 60 on turn 7+', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5); // variance = 0

      // Rue on library (strength match): score 50 + 25 = 75 ≥ 60 → success
      const libraryBuilding = makeBuilding({
        type: 'library',
        config: { mode: 'normal', tools: true, memory: true, autonomy: 'medium' },
      });
      const event7 = evaluateTurn(libraryBuilding, makeAgent(), false, 7);
      expect(event7.type).toBe('success');

      // Axel on hospital (no match, no config bonus): score 50 + 0 = 50 < 60 → fail on turn 7
      const event7fail = evaluateTurn(
        makeBuilding({ type: 'hospital', config: { mode: 'normal', tools: false, memory: false, autonomy: 'low' } }),
        axel,
        false,
        7,
      );
      expect(event7fail.type).toBe('breakdown');
      vi.restoreAllMocks();
    });

    it('uses threshold 50 on turns 1-6', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      const building = makeBuilding({
        type: 'hospital',
        config: { mode: 'normal', tools: true, memory: true, autonomy: 'medium' },
      });
      // Axel on hospital: score 50 ≥ 50 → success on turn 6
      const event6 = evaluateTurn(building, axel, false, 6);
      expect(event6.type).toBe('success');
      vi.restoreAllMocks();
    });
  });

  describe('event metadata', () => {
    it('sets severity to major for instant-fail causes', () => {
      const building = makeBuilding({
        config: { mode: 'normal', tools: false, memory: true, autonomy: 'medium' },
      });
      const event = evaluateTurn(building, makeAgent());
      expect(event.severity).toBe('major');
    });

    it('sets severity to minor for poor_fit', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0);
      const building = makeBuilding({
        type: 'hospital',
        config: { mode: 'normal', tools: false, memory: false, autonomy: 'low' },
      });
      // score: 50 + 0 (no config bonus) - 15 = 35 < 50 → poor_fit
      const event = evaluateTurn(building, axel);
      expect(event.severity).toBe('minor');
      vi.restoreAllMocks();
    });
  });
});
