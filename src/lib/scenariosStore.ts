import { writable } from 'svelte/store';
import type { UserScenario } from '$types';

export interface ScenariosState {
  scenarios: UserScenario[];
  loaded: boolean;
}

function createScenariosStore() {
  const { subscribe, set, update } = writable<ScenariosState>({
    scenarios: [],
    loaded: false
  });

  // Load scenarios from localStorage on initialization
  function loadFromLocalStorage() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('budget_scenarios');
        if (stored) {
          const scenarios = JSON.parse(stored) as UserScenario[];
          set({
            scenarios,
            loaded: true
          });
          return scenarios;
        }
      } catch (e) {
        console.error('Failed to load scenarios from localStorage:', e);
      }
    }
    set({ scenarios: [], loaded: true });
    return [];
  }

  // Save to localStorage whenever scenarios change
  function saveToLocalStorage(scenarios: UserScenario[]) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('budget_scenarios', JSON.stringify(scenarios));
      } catch (e) {
        console.error('Failed to save scenarios to localStorage:', e);
      }
    }
  }

  return {
    subscribe,

    // Create a new scenario
    createScenario: (scenario: Omit<UserScenario, 'id' | 'createdAt' | 'updatedAt'>) => {
      update((state) => {
        const now = new Date();
        const newScenario: UserScenario = {
          ...scenario,
          id: `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: now,
          updatedAt: now
        };

        const updated = [...state.scenarios, newScenario];
        saveToLocalStorage(updated);
        return { ...state, scenarios: updated };
      });
    },

    // Get a scenario by ID
    getScenario: (id: string): UserScenario | undefined => {
      let result: UserScenario | undefined;
      subscribe((state) => {
        result = state.scenarios.find((s) => s.id === id);
      })();
      return result;
    },

    // Update a scenario
    updateScenario: (id: string, updates: Partial<UserScenario>) => {
      update((state) => {
        const updated = state.scenarios.map((s) =>
          s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
        );
        saveToLocalStorage(updated);
        return { ...state, scenarios: updated };
      });
    },

    // Delete a scenario
    deleteScenario: (id: string) => {
      update((state) => {
        const updated = state.scenarios.filter((s) => s.id !== id);
        saveToLocalStorage(updated);
        return { ...state, scenarios: updated };
      });
    },

    // Load from localStorage
    load: loadFromLocalStorage,

    // Reset all scenarios
    clear: () => {
      set({ scenarios: [], loaded: true });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('budget_scenarios');
      }
    }
  };
}

export const scenariosStore = createScenariosStore();
