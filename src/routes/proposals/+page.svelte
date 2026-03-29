<script lang="ts">
  import { onMount } from 'svelte';
  import { mockBudget, mockProposals } from '$data/mockBudget';
  import { customBudget } from '$lib/budgetStore';
  import { proposalsStore, type ProposalsState } from '$lib/proposalsStore';
  import type { Proposal } from '$types';
  import Chart from 'chart.js/auto';

  let budget = $state(mockBudget);
  let proposals = $state(mockProposals);
  
  let customBudgetState = $state({
    allocations: {} as Record<string, number>,
    total: 100
  });

  let proposalsState = $state<ProposalsState>({
    appliedProposals: [],
    budgetAfterPolicies: {} as Record<string, number>
  });

  let categoryFilter = $state<string>('all');
  let impactFilter = $state<string>('all'); // 'all', 'savings', 'costs'
  
  let showComparison = $state(false);
  let comparisonChartCanvas: HTMLCanvasElement;
  let comparisonChartInstance: Chart;
  
  let successMessage = $state('');
  let selectedProposal = $state<Proposal | null>(null);

  // Subscribe to stores
  const unsubscribeCustom = customBudget.subscribe((state) => {
    customBudgetState = state;
  });

  const unsubscribeProposals = proposalsStore.subscribe((state: ProposalsState) => {
    proposalsState = state;
    updateComparisonChart();
  });

  onMount(() => {
    return () => {
      unsubscribeCustom();
      unsubscribeProposals();
      if (comparisonChartInstance) comparisonChartInstance.destroy();
    };
  });

  // Compute unique categories from proposals
  const proposalCategories = $derived.by(() => {
    const cats = new Set<string>();
    proposals.forEach((p) => {
      p.impact.forEach((i) => {
        const cat = budget.categories.find((c) => c.id === i.categoryId);
        if (cat) cats.add(cat.name);
      });
    });
    return Array.from(cats).sort();
  });

  // Filter proposals
  const filteredProposals = $derived.by(() => {
    return proposals.filter((proposal) => {
      // Category filter
      if (categoryFilter !== 'all') {
        const hasCategory = proposal.impact.some((impact) => {
          const cat = budget.categories.find((c) => c.id === impact.categoryId);
          return cat?.name === categoryFilter;
        });
        if (!hasCategory) return false;
      }

      // Impact filter
      if (impactFilter !== 'all') {
        const netImpact = calculateNetFiscalImpact(proposal);
        if (impactFilter === 'savings' && netImpact >= 0) return false;
        if (impactFilter === 'costs' && netImpact <= 0) return false;
      }

      return true;
    });
  });

  function calculateNetFiscalImpact(proposal: Proposal): number {
    let total = 0;
    proposal.impact.forEach((impact) => {
      const cat = budget.categories.find((c) => c.id === impact.categoryId);
      if (cat && impact.estimatedCost) {
        total += impact.estimatedCost;
      }
    });
    return total;
  }

  function getImpactedCategories(proposal: Proposal): string {
    return proposal.impact
      .map((impact) => {
        const cat = budget.categories.find((c) => c.id === impact.categoryId);
        return cat?.name || 'Unknown';
      })
      .join(', ');
  }

  function applyProposal(proposal: Proposal) {
    proposalsStore.applyProposal(proposal);
    showComparison = true;
    successMessage = `Applied: ${proposal.title}`;
    setTimeout(() => {
      successMessage = '';
    }, 3000);
  }

  function undoLastProposal() {
    proposalsStore.undoLast();
    successMessage = 'Last proposal reverted';
    setTimeout(() => {
      successMessage = '';
    }, 2000);
  }

  function resetAllProposals() {
    proposalsStore.reset();
    showComparison = false;
    successMessage = 'All proposals cleared';
    setTimeout(() => {
      successMessage = '';
    }, 2000);
  }

  function getOriginalBudgetPercentage(categoryId: string): number {
    const cat = budget.categories.find((c) => c.id === categoryId);
    return cat?.percentage || 0;
  }

  function getCurrentBudgetPercentage(categoryId: string): number {
    return customBudgetState.allocations[categoryId] || 0;
  }

  function getPolicyAdjustedPercentage(categoryId: string): number {
    return proposalsState.budgetAfterPolicies[categoryId] || 0;
  }

  function updateComparisonChart() {
    if (!comparisonChartCanvas || proposalsState.appliedProposals.length === 0) {
      return;
    }

    if (comparisonChartInstance) {
      comparisonChartInstance.destroy();
    }

    const labels = budget.categories.map((c) => c.name);
    const originalData = budget.categories.map((c) => c.percentage);
    const afterPoliciesData = budget.categories.map(
      (c) => proposalsState.budgetAfterPolicies[c.id] || 0
    );

    comparisonChartInstance = new Chart(comparisonChartCanvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Current Budget',
            data: originalData,
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1
          },
          {
            label: 'After Policies',
            data: afterPoliciesData,
            backgroundColor: 'rgba(34, 197, 94, 0.5)',
            borderColor: 'rgb(34, 197, 94)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        indexAxis: 'y',
        plugins: {
          legend: {
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = (context.parsed?.x ?? 0) as number;
                return `${context.dataset.label}: ${value.toFixed(1)}%`;
              }
            }
          }
        },
        scales: {
          x: {
            max: 25,
            ticks: {
              callback: function (value) {
                return value + '%';
              }
            }
          }
        }
      }
    });
  }
</script>

<svelte:head>
  <title>Policy Proposals — Budget Simulator</title>
</svelte:head>

<div class="space-y-8">
  <!-- Header -->
  <div class="card bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg text-white">
    <div class="card-body py-8">
      <h1 class="card-title text-3xl">⚖️ Policy Proposals Explorer</h1>
      <p class="text-lg opacity-90">
        Explore realistic policy proposals and see how they would impact federal spending.
      </p>
    </div>
  </div>

  <!-- Applied Proposals Section -->
  {#if proposalsState.appliedProposals.length > 0}
    <div class="card bg-green-50 border-2 border-green-500 shadow-md">
      <div class="card-body">
        <h2 class="card-title text-green-700">
          Applied Proposals ({proposalsState.appliedProposals.length})
        </h2>

        <div class="space-y-2">
          {#each proposalsState.appliedProposals as applied (applied.id)}
            <div class="flex items-center justify-between bg-white p-3 rounded-lg border border-green-200">
              <div class="flex-1">
                <p class="font-semibold text-sm">{applied.title}</p>
                <p class="text-xs text-base-content/60">
                  Applied: {applied.appliedAt.toLocaleTimeString()}
                </p>
              </div>
              <div class="text-xs font-mono text-green-700">
                {Object.entries(applied.impacts)
                  .filter(([_, val]) => (val as number) !== 0)
                  .map(([catId, val]) => {
                    const cat = budget.categories.find((c) => c.id === catId);
                    const numVal = val as number;
                    return `${cat?.name}: ${numVal > 0 ? '+' : ''}${numVal.toFixed(0)}%`;
                  })
                  .join(', ')}
              </div>
            </div>
          {/each}
        </div>

        <div class="divider my-2" />
        <div class="flex gap-2 flex-wrap">
          <button
            on:click={undoLastProposal}
            class="btn btn-sm btn-outline btn-warning"
          >
            ↶ Undo Last
          </button>
          <button
            on:click={resetAllProposals}
            class="btn btn-sm btn-outline btn-error"
          >
            🔄 Clear All
          </button>
          {#if showComparison}
            <button
              on:click={() => (showComparison = false)}
              class="btn btn-sm btn-outline btn-primary"
            >
              Hide Comparison
            </button>
          {:else}
            <button
              on:click={() => (showComparison = true)}
              class="btn btn-sm btn-primary"
            >
              Show Comparison
            </button>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  <!-- Comparison Chart -->
  {#if showComparison && proposalsState.appliedProposals.length > 0}
    <div class="card bg-base-200 shadow-md">
      <div class="card-body">
        <h2 class="card-title mb-4">Budget Comparison: Current vs After Policies</h2>
        <div class="max-h-96 overflow-x-auto">
          <canvas bind:this={comparisonChartCanvas} />
        </div>
      </div>
    </div>
  {/if}

  <!-- Success Message -->
  {#if successMessage}
    <div class="alert alert-success shadow-lg">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="stroke-current shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{successMessage}</span>
    </div>
  {/if}

  <!-- Filters Section -->
  <div class="card bg-base-200 shadow-md">
    <div class="card-body">
      <h2 class="card-title mb-4">Filter Proposals</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-control">
          <label class="label" for="category-filter">
            <span class="label-text font-semibold">Category</span>
          </label>
          <select
            id="category-filter"
            bind:value={categoryFilter}
            class="select select-bordered"
          >
            <option value="all">All Categories</option>
            {#each proposalCategories as cat}
              <option value={cat}>{cat}</option>
            {/each}
          </select>
        </div>

        <div class="form-control">
          <label class="label" for="impact-filter">
            <span class="label-text font-semibold">Fiscal Impact</span>
          </label>
          <select
            id="impact-filter"
            bind:value={impactFilter}
            class="select select-bordered"
          >
            <option value="all">All Impacts</option>
            <option value="costs">Cost Increases</option>
            <option value="savings">Cost Savings</option>
          </select>
        </div>
      </div>
      <p class="text-sm text-base-content/60 mt-2">
        Showing {filteredProposals.length} of {proposals.length} proposals
      </p>
    </div>
  </div>

  <!-- Proposals Grid -->
  <div class="space-y-4">
    <h2 class="text-2xl font-bold">Policy Proposals ({filteredProposals.length})</h2>

    {#if filteredProposals.length === 0}
      <div class="alert alert-info">
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
          />
        </svg>
        <span>No proposals match your filters. Try adjusting them.</span>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each filteredProposals as proposal (proposal.id)}
          {@const netImpact = calculateNetFiscalImpact(proposal)}
          {@const isApplied = proposalsState.appliedProposals.some(
            (p) => p.id === proposal.id
          )}

          <div class="card bg-base-100 shadow-md hover:shadow-lg transition-all border-l-4" style="border-color: {netImpact > 0 ? '#ef4444' : '#10b981'}">
            <div class="card-body">
              <!-- Title and Badge -->
              <div class="flex items-start justify-between gap-2">
                <h3 class="card-title text-sm flex-1">{proposal.title}</h3>
                {#if isApplied}
                  <div class="badge" style="background-color: #dcfce7; color: #166534;">Applied</div>
                {/if}
              </div>

              <!-- Description -->
              <p class="text-xs text-base-content/70">{proposal.description}</p>

              <!-- Metadata -->
              <div class="text-xs space-y-1 py-2">
                <div class="flex justify-between">
                  <span class="text-base-content/60">Author:</span>
                  <span class="font-semibold">{proposal.author || 'Unknown'}</span>
                </div>
              </div>

              <!-- Fiscal Impact -->
              <div class="bg-base-200 p-3 rounded-lg my-2">
                <p class="text-xs text-base-content/60 mb-1">Fiscal Impact</p>
                <p
                  class="text-lg font-bold {netImpact > 0
                    ? 'text-error'
                    : 'text-success'}"
                >
                  {netImpact > 0 ? '+' : ''}{netImpact.toFixed(1)}B
                </p>
                <p class="text-xs text-base-content/60 mt-1">
                  {netImpact > 0 ? 'Cost increase' : 'Cost savings'}
                </p>
              </div>

              <!-- Categories Affected -->
              <div class="text-xs">
                <p class="text-base-content/60 mb-1">Categories Affected:</p>
                <div class="flex flex-wrap gap-1">
                  {#each proposal.impact as impact}
                    {@const cat = budget.categories.find((c) => c.id === impact.categoryId)}
                    {#if cat}
                      <div class="badge badge-outline badge-sm">
                        {cat.name}
                        {impact.changePercent > 0 ? '+' : ''}{impact.changePercent}%
                      </div>
                    {/if}
                  {/each}
                </div>
              </div>

              <!-- Actions -->
              <div class="card-actions justify-between mt-4">
                <button
                  on:click={() => (selectedProposal = proposal)}
                  class="btn btn-ghost btn-xs"
                >
                  Details
                </button>
                <button
                  on:click={() => applyProposal(proposal)}
                  disabled={isApplied}
                  class="btn btn-primary btn-sm"
                >
                  {isApplied ? '✓ Applied' : 'Apply'}
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Info Box -->
  <div class="alert alert-info">
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
      />
    </svg>
    <div>
      <h3 class="font-bold">How to Use</h3>
      <div class="text-sm">
        <p>
          Select proposals to apply them to the current budget. Each proposal affects multiple
          budget categories. Use filters to find proposals that interest you. The comparison chart
          shows how the budget would change after applying selected policies.
        </p>
      </div>
    </div>
  </div>
</div>

<!-- Proposal Detail Modal -->
{#if selectedProposal}
  <div class="modal modal-open">
    <div class="modal-box max-w-2xl">
      <button
        on:click={() => (selectedProposal = null)}
        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
      >
        ✕
      </button>
      <h3 class="font-bold text-lg mb-4">{selectedProposal.title}</h3>

      <div class="space-y-4">
        <!-- Description -->
        <div class="p-4 bg-base-100 rounded-lg">
          <h4 class="font-bold mb-2">Description</h4>
          <p class="text-sm">{selectedProposal.description}</p>
        </div>

        <!-- Author & Impact -->
        {#if selectedProposal}
          {@const netImpact = calculateNetFiscalImpact(selectedProposal)}
          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 bg-base-100 rounded-lg">
              <p class="text-sm text-base-content/60 mb-1">Author</p>
              <p class="font-bold">{selectedProposal.author || 'Unknown'}</p>
            </div>
            <div class="p-4 bg-base-100 rounded-lg">
              <p class="text-sm text-base-content/60 mb-1">Fiscal Impact</p>
              <p class="font-bold text-lg" style="color: {netImpact > 0 ? '#ef4444' : '#10b981'}">
                {netImpact > 0 ? '+' : ''}{netImpact.toFixed(1)}B
              </p>
            </div>
          </div>
        {/if}

        <!-- Detailed Impacts -->
        <div class="p-4 bg-base-100 rounded-lg">
          <h4 class="font-bold mb-3">Budget Category Impacts</h4>
          <div class="space-y-2">
            {#each selectedProposal.impact as impact}
              {@const cat = budget.categories.find((c) => c.id === impact.categoryId)}
              {#if cat}
                <div class="flex items-center justify-between text-sm">
                  <div class="flex-1">
                    <p class="font-semibold">{cat.name}</p>
                    {#if impact.description}
                      <p class="text-xs text-base-content/60">{impact.description}</p>
                    {/if}
                  </div>
                  <div class="text-right">
                    <div class="font-bold" style="color: {impact.changePercent > 0 ? '#ef4444' : '#10b981'}">
                      {impact.changePercent > 0 ? '+' : ''}{impact.changePercent}%
                    </div>
                    {#if impact.estimatedCost}
                      <div class="text-xs text-base-content/60">
                        {impact.estimatedCost > 0 ? '+' : ''}{impact.estimatedCost.toFixed(1)}B
                      </div>
                    {/if}
                  </div>
                </div>
              {/if}
            {/each}
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="modal-action mt-6">
        <button
          on:click={() => (selectedProposal = null)}
          class="btn btn-outline"
        >
          Close
        </button>
        <button
          on:click={() => {
            if (selectedProposal) {
              applyProposal(selectedProposal);
              selectedProposal = null;
            }
          }}
          class="btn btn-primary"
        >
          Apply This Proposal
        </button>
      </div>
    </div>
    <div on:click={() => (selectedProposal = null)} class="modal-backdrop" />
  </div>
{/if}


