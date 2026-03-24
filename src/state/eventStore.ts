import { create } from 'zustand';
import type { GameEvent, TeachingCard } from '../types';

interface EventState {
  currentEvent: GameEvent | null;
  eventHistory: GameEvent[];
  teachingContent: TeachingCard | null;
  seenConcepts: Set<string>;

  setCurrentEvent: (event: GameEvent | null) => void;
  addToHistory: (event: GameEvent) => void;
  setTeachingContent: (card: TeachingCard | null) => void;
  addSeenConcept: (conceptId: string) => void;
  clearEvent: () => void;
  resetEvents: () => void;
}

export const useEventStore = create<EventState>((set) => ({
  currentEvent: null,
  eventHistory: [],
  teachingContent: null,
  seenConcepts: new Set(),

  setCurrentEvent: (event) => set({ currentEvent: event }),

  addToHistory: (event) =>
    set((state) => ({ eventHistory: [...state.eventHistory, event] })),

  setTeachingContent: (card) => set({ teachingContent: card }),

  addSeenConcept: (conceptId) =>
    set((state) => ({
      seenConcepts: new Set([...state.seenConcepts, conceptId]),
    })),

  clearEvent: () => set({ currentEvent: null, teachingContent: null }),

  resetEvents: () =>
    set({
      currentEvent: null,
      eventHistory: [],
      teachingContent: null,
      seenConcepts: new Set(),
    }),
}));
