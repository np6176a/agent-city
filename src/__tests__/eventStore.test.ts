import { describe, it, expect, beforeEach } from 'vitest';
import { useEventStore } from '../state/eventStore';
import type { GameEvent, TeachingCard } from '../types';

function getState() {
  return useEventStore.getState();
}

const mockEvent: GameEvent = {
  id: 'evt_1',
  type: 'breakdown',
  buildingId: 'bld_1',
  agentId: 'rue',
  cause: 'no_tools',
  teachingCardId: 'tc_no_tools',
  severity: 'major',
};

const mockSuccessEvent: GameEvent = {
  id: 'evt_2',
  type: 'success',
  buildingId: 'bld_2',
  agentId: 'axel',
  cause: 'success',
  teachingCardId: 'tc_success',
  severity: 'minor',
};

const mockTeachingCard: TeachingCard = {
  id: 'tc_no_tools',
  title: 'Rue Needs Her Tools',
  concept: 'tool_use',
  explanation: 'Agents need tools.',
  whatWentWrong: 'No tools.',
  correctConfig: { tools: true, memory: false, autonomy: 'medium' },
};

describe('eventStore', () => {
  beforeEach(() => {
    getState().resetEvents();
  });

  describe('setCurrentEvent / clearEvent', () => {
    it('sets and clears current event', () => {
      getState().setCurrentEvent(mockEvent);
      expect(getState().currentEvent).toEqual(mockEvent);

      getState().clearEvent();
      expect(getState().currentEvent).toBeNull();
    });
  });

  describe('addToHistory', () => {
    it('appends events to history', () => {
      getState().addToHistory(mockEvent);
      getState().addToHistory(mockSuccessEvent);
      expect(getState().eventHistory).toHaveLength(2);
      expect(getState().eventHistory[0]).toEqual(mockEvent);
      expect(getState().eventHistory[1]).toEqual(mockSuccessEvent);
    });
  });

  describe('setTeachingContent', () => {
    it('sets and clears teaching content', () => {
      getState().setTeachingContent(mockTeachingCard);
      expect(getState().teachingContent).toEqual(mockTeachingCard);

      getState().setTeachingContent(null);
      expect(getState().teachingContent).toBeNull();
    });

    it('is cleared by clearEvent', () => {
      getState().setTeachingContent(mockTeachingCard);
      getState().clearEvent();
      expect(getState().teachingContent).toBeNull();
    });
  });

  describe('seenConcepts', () => {
    it('tracks unique concepts', () => {
      getState().addSeenConcept('tool_use');
      getState().addSeenConcept('guardrails');
      getState().addSeenConcept('tool_use'); // duplicate
      expect(getState().seenConcepts.size).toBe(2);
      expect(getState().seenConcepts.has('tool_use')).toBe(true);
      expect(getState().seenConcepts.has('guardrails')).toBe(true);
    });
  });

  describe('resetEvents', () => {
    it('resets all event state', () => {
      getState().setCurrentEvent(mockEvent);
      getState().addToHistory(mockEvent);
      getState().setTeachingContent(mockTeachingCard);
      getState().addSeenConcept('tool_use');

      getState().resetEvents();

      expect(getState().currentEvent).toBeNull();
      expect(getState().eventHistory).toHaveLength(0);
      expect(getState().teachingContent).toBeNull();
      expect(getState().seenConcepts.size).toBe(0);
    });
  });
});
