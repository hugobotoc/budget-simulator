import { writable } from 'svelte/store';
import type { Budget } from '$types';
import { mockBudget } from '$data/mockBudget';

export interface BudgetAllocation {
  categoryId: string;
  percentage: number;
  amount: number;
}

export interface CustomBudget {
  allocations: Record<string, number>; // categoryId -> percentage
  total: number;
  savedAt?: Date;
}

// Initialize with current budget percentages
function createBudgetStore() {
  const initialAllocations: Record<string, number> = {};
  mockBudget.categories.forEach((cat) => {
    initialAllocations[cat.id] = cat.percentage;
  });

  const { subscribe, set, update } = writable<CustomBudget>({
    allocations: initialAllocations,
    total: 100
  });

  return {
    subscribe,
    setAllocation: (categoryId: string, percentage: number) => {
      update((budget) => {
        const newAllocations = { ...budget.allocations };
        const oldPercentage = newAllocations[categoryId];
        const diff = percentage - oldPercentage;

        // Adjust other categories proportionally if total exceeds 100%
        if (budget.total + diff > 100) {
          const excess = budget.total + diff - 100;
          const otherCategoryIds = Object.keys(newAllocations).filter(
            (id) => id !== categoryId
          );

          if (otherCategoryIds.length > 0) {
            const adjustmentPerCategory = excess / otherCategoryIds.length;
            otherCategoryIds.forEach((id) => {
              newAllocations[id] = Math.max(0, newAllocations[id] - adjustmentPerCategory);
            });
          } else {
            // Only one category, cap it at 100
            newAllocations[categoryId] = 100;
          }
        }

        newAllocations[categoryId] = percentage;

        return {
          allocations: newAllocations,
          total: Object.values(newAllocations).reduce((a, b) => a + b, 0)
        };
      });
    },
    reset: () => {
      const initialAllocations: Record<string, number> = {};
      mockBudget.categories.forEach((cat) => {
        initialAllocations[cat.id] = cat.percentage;
      });
      set({
        allocations: initialAllocations,
        total: 100
      });
    },
    save: () => {
      update((budget) => ({
        ...budget,
        savedAt: new Date()
      }));
    }
  };
}

export const customBudget = createBudgetStore();
