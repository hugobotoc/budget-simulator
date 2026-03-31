<script lang="ts">
  import { mockBudget } from '$data/mockBudget';
  import type { Proposal } from '$types';

  interface Props {
    proposal: Proposal;
    isApplied: boolean;
    onclose: () => void;
    onapply: () => void;
  }

  let { proposal, isApplied, onclose, onapply }: Props = $props();

  // Derived: category map for lookup
  const categoryMap = $derived(
    Object.fromEntries(mockBudget.categories.map((c) => [c.id, c]))
  );

  // Derived: detailed impact calculations
  const detailedImpact = $derived(
    proposal.impact.map((impact) => {
      const category = categoryMap[impact.categoryId];
      const originalAmount = category?.amount || 0;
      const costChange = impact.estimatedCost || (originalAmount * impact.changePercent) / 100;
      const newAmount = originalAmount + costChange;

      return {
        ...impact,
        categoryName: category?.name || impact.categoryId,
        originalAmount,
        costChange,
        newAmount,
        percentageChange: ((costChange / originalAmount) * 100).toFixed(1)
      };
    })
  );

  // Derived: total impact
  const totalCostChange = $derived(detailedImpact.reduce((sum, i) => sum + i.costChange, 0));

  // Handler: close on backdrop click
  const handleBackdropClick = () => {
    onclose();
  };

  // Handler: close on escape key
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onclose();
    }
  };
</script>

<div class="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="proposal-modal-title">
  <div class="modal-box max-w-3xl max-h-[90vh] overflow-y-auto">
    <!-- Close Button -->
    <button
      onclick={onclose}
      onkeydown={handleKeydown}
      class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
      aria-label="Close proposal details"
    >
      ✕
    </button>

    <!-- Header -->
    <h3 class="font-bold text-2xl mb-2" id="proposal-modal-title">{proposal.title}</h3>
    <p class="text-base-content/70 mb-4">{proposal.description}</p>

    <!-- Metadata -->
    <div class="divider my-4"></div>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 text-sm">
      {#if proposal.source}
        <div>
          <div class="text-base-content/60 font-semibold">Source</div>
          <div class="text-base-content/80">{proposal.source}</div>
        </div>
      {/if}
      {#if proposal.author}
        <div>
          <div class="text-base-content/60 font-semibold">Author</div>
          <div class="text-base-content/80">{proposal.author}</div>
        </div>
      {/if}
      <div>
        <div class="text-base-content/60 font-semibold">Created</div>
        <div class="text-base-content/80">{new Date(proposal.createdAt).toLocaleDateString()}</div>
      </div>
    </div>

    <!-- Detailed Impact Table -->
    <div class="divider my-4"></div>
    <h4 class="font-bold text-lg mb-4">Budget Impact by Category</h4>

    <div class="overflow-x-auto mb-6">
      <table class="table table-sm table-zebra w-full text-xs md:text-sm">
        <thead>
          <tr>
            <th>Category</th>
            <th class="text-right">Current</th>
            <th class="text-right">Change</th>
            <th class="text-right">New Amount</th>
            <th class="text-right">% Change</th>
          </tr>
        </thead>
        <tbody>
          {#each detailedImpact as impact (impact.categoryId)}
            <tr class={`${impact.costChange > 0 ? 'bg-error/10' : impact.costChange < 0 ? 'bg-success/10' : ''}`}>
              <td class="font-medium">{impact.categoryName}</td>
              <td class="text-right">${impact.originalAmount.toFixed(1)}B</td>
              <td class={`text-right font-bold ${impact.costChange > 0 ? 'text-error' : impact.costChange < 0 ? 'text-success' : ''}`}>
                {impact.costChange > 0 ? '+' : ''}{impact.costChange.toFixed(1)}B
              </td>
              <td class="text-right font-bold">${impact.newAmount.toFixed(1)}B</td>
              <td class={`text-right font-bold ${impact.costChange > 0 ? 'text-error' : impact.costChange < 0 ? 'text-success' : ''}`}>
                {parseFloat(impact.percentageChange) > 0 ? '+' : ''}{impact.percentageChange}%
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Total Impact Summary -->
    <div class="alert mb-6">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        class="stroke-current shrink-0 w-6 h-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        ></path>
      </svg>
      <div>
        <div class="font-bold">Total Budget Impact</div>
        <div class={`text-lg font-bold ${totalCostChange > 0 ? 'text-error' : totalCostChange < 0 ? 'text-success' : 'text-base-content'}`}>
          {totalCostChange > 0 ? '+' : ''}{totalCostChange.toFixed(1)}B
        </div>
      </div>
    </div>

    <!-- Impact Visualization -->
    <div class="mb-6">
      <h4 class="font-bold mb-3">Impact Breakdown</h4>
      <div class="space-y-2">
        {#each detailedImpact as impact}
          <div class="flex items-center gap-3">
            <span class="text-xs font-medium w-32 truncate">{impact.categoryName}</span>
            <div class="flex-1">
              <div
                class={`h-6 rounded transition-all ${
                  impact.costChange > 0 ? 'bg-error/60' : impact.costChange < 0 ? 'bg-success/60' : 'bg-base-300'
                }`}
                style={`width: ${Math.min(Math.abs((impact.costChange / mockBudget.totalBudget) * 100), 100)}%`}
              ></div>
            </div>
            <span
              class={`text-xs font-bold w-24 text-right ${
                impact.costChange > 0 ? 'text-error' : impact.costChange < 0 ? 'text-success' : ''
              }`}
            >
              {impact.costChange > 0 ? '+' : ''}{impact.costChange.toFixed(1)}B
            </span>
          </div>
        {/each}
      </div>
    </div>

    <!-- Modal Actions -->
    <div class="modal-action gap-2">
      <button
        onclick={onclose}
        class="btn btn-outline flex-1"
        aria-label="Close proposal details"
      >
        Close
      </button>
      <button
        onclick={onapply}
        class={`btn flex-1 ${isApplied ? 'btn-error' : 'btn-primary'}`}
        aria-label="{isApplied ? 'Remove' : 'Apply'} {proposal.title} to selected proposals"
      >
        {isApplied ? 'Remove from Selection' : 'Add to Selection'}
      </button>
    </div>
  </div>

  <!-- Backdrop -->
  <div
    onclick={handleBackdropClick}
    onkeydown={handleKeydown}
    class="modal-backdrop cursor-pointer"
    role="button"
    tabindex="0"
    aria-label="Close proposal details modal"
  ></div>
</div>
