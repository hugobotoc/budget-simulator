import { writable } from 'svelte/store';
import { mockBudget } from '$data/mockBudget';

export interface AppliedProposal {
  id: string;
  title: string;
  appliedAt: Date;
  impacts: Record<string, number>; // categoryId -> percentage change
}

export interface ProposalsState {
  appliedProposals: AppliedProposal[];
  budgetAfterPolicies: Record<string, number>; // categoryId -> percentage
}

function createProposalsStore() {
  // Initialize with current budget percentages
  const initialBudget: Record<string, number> = {};
  mockBudget.categories.forEach((cat) => {
    initialBudget[cat.id] = cat.percentage;
  });

  const { subscribe, set, update } = writable<ProposalsState>({
    appliedProposals: [],
    budgetAfterPolicies: initialBudget
  });

  return {
    subscribe,
    
    applyProposal: (proposal: any) => {
      update((state) => {
        const newBudget = { ...state.budgetAfterPolicies };
        const impacts: Record<string, number> = {};

        // Apply each impact from the proposal
        proposal.impact.forEach((impact: any) => {
          const categoryId = impact.categoryId;
          const currentPercent = newBudget[categoryId] || 0;
          
          // For absolute replacements (like -100%), handle specially
          if (impact.changePercent === -100) {
            newBudget[categoryId] = 0;
          } else {
            // For percentage increases/decreases
            const change = currentPercent * (impact.changePercent / 100);
            newBudget[categoryId] = Math.max(0, currentPercent + change);
          }
          
          impacts[categoryId] = impact.changePercent;
        });

        // Normalize to ensure total is 100% (rebalance)
        const total = Object.values(newBudget).reduce((a, b) => a + b, 0);
        if (total > 0 && Math.abs(total - 100) > 0.1) {
          const scale = 100 / total;
          Object.keys(newBudget).forEach((id) => {
            newBudget[id] *= scale;
          });
        }

        const appliedProposal: AppliedProposal = {
          id: proposal.id,
          title: proposal.title,
          appliedAt: new Date(),
          impacts
        };

        return {
          appliedProposals: [...state.appliedProposals, appliedProposal],
          budgetAfterPolicies: newBudget
        };
      });
    },

    undoLast: () => {
      update((state) => {
        if (state.appliedProposals.length === 0) return state;

        const newApplied = state.appliedProposals.slice(0, -1);
        const newBudget = { ...initialBudget };

        // Reapply all remaining proposals sequentially
        newApplied.forEach((applied) => {
          // This is simplified - in production you'd want to re-fetch the original proposal
          // For now, we'll recalculate based on stored impacts
        });

        return {
          appliedProposals: newApplied,
          budgetAfterPolicies: newBudget
        };
      });
    },

    reset: () => {
      set({
        appliedProposals: [],
        budgetAfterPolicies: initialBudget
      });
    },

    getNetFiscalImpact: () => {
      // This would calculate total fiscal impact in billions
      // Placeholder for now
      return 0;
    }
  };
}

export const proposalsStore = createProposalsStore();
