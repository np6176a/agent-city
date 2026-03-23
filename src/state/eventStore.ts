import { create } from 'zustand';
import type { GameEvent, TeachingCard } from '../types';

interface EventState {
  currentEvent: GameEvent | null;
  eventHistory: GameEvent[];
  teachingContent: TeachingCard | null;

  setCurrentEvent: (event: GameEvent | null) => void;
  addToHistory: (event: GameEvent) => void;
  setTeachingContent: (card: TeachingCard | null) => void;
  clearEvent: () => void;
}

export const useEventStore = create<EventState>((set) => ({
  currentEvent: null,
  eventHistory: [],
  teachingContent: null,

  setCurrentEvent: (event) => set({ currentEvent: event }),

  addToHistory: (event) =>
    set((state) => ({ eventHistory: [...state.eventHistory, event] })),

  setTeachingContent: (card) => set({ teachingContent: card }),

  clearEvent: () => set({ currentEvent: null, teachingContent: null }),
}));
