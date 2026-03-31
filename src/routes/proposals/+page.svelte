<script lang="ts">
  import { mockProposals } from '$data/mockProposals';
  import { mockBudget } from '$data/mockBudget';
  import ProposalCard from '$components/ProposalCard.svelte';
  import ProposalDetail from '$components/ProposalDetail.svelte';
  import type { Proposal } from '$types';

  let selectedProposal = $state<Proposal | null>(null);
  let appliedProposals = $state<Set<string>>(new Set());
  let searchQuery = $state('');
  let filterImpactType = $state('all'); // all, positive, negative
  let filterCategory = $state('all');

  // Load applied proposals from localStorage on mount
  const onMount = () => {
    const saved = localStorage.getItem('appliedProposals');
    if (saved) {
      try {
        const ids = JSON.parse(saved);
        appliedProposals = new Set(ids);
      } catch (e) {
        console.error('Failed to load applied proposals:', e);
      }
    }
  };

  $effect.pre(() => {
    onMount();
  });

  // Derived: filtered proposals
  const filteredProposals = $derived(
    mockProposals.filter((proposal) => {
      // Search filter
      const matchesSearch =
        proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proposal.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Impact type filter
      if (filterImpactType !== 'all') {
        const hasPositive = proposal.impact.some((i) => i.changePercent > 0);
        const hasNegative = proposal.impact.some((i) => i.changePercent < 0);

        if (filterImpactType === 'positive' && !hasPositive) return false;
        if (filterImpactType === 'negative' && !hasNegative) return false;
      }

      // Category filter
      if (filterCategory !== 'all') {
        const matchesCategory = proposal.impact.some((i) => i.categoryId === filterCategory);
        if (!matchesCategory) return false;
      }

      return true;
    })
  );

  // Derived: calculate total impact of applied proposals
  const totalImpactByCategory = $derived.by(() => {
    const impact: Record<string, number> = {};

    for (const cat of mockBudget.categories) {
      impact[cat.id] = 0;
    }

    for (const proposalId of appliedProposals) {
      const proposal = mockProposals.find((p) => p.id === proposalId);
      if (proposal) {
        for (const imp of proposal.impact) {
          const originalAmount = mockBudget.categories.find((c) => c.id === imp.categoryId)?.amount || 0;
          impact[imp.categoryId] += (originalAmount * imp.changePercent) / 100;
        }
      }
    }

    return impact;
  });

  // Handler: apply proposal
  const handleApplyProposal = (proposalId: string) => {
    const newSet = new Set(appliedProposals);
    if (newSet.has(proposalId)) {
      newSet.delete(proposalId);
    } else {
      newSet.add(proposalId);
    }
    appliedProposals = newSet;
    saveAppliedProposals();
  };

  // Handler: clear all applied proposals
  const handleClearAll = () => {
    if (confirm('Clear all applied proposals?')) {
      appliedProposals = new Set();
      saveAppliedProposals();
    }
  };

  // Handler: apply to custom budget
  const handleApplyToBudget = () => {
    if (appliedProposals.size === 0) {
      alert('No proposals selected');
      return;
    }

    // Build new budget based on original + impacts
    const newBudget: Record<string, number> = {};
    for (const cat of mockBudget.categories) {
      newBudget[cat.id] = cat.amount + (totalImpactByCategory[cat.id] || 0);
    }

    // Save and redirect to customize
    localStorage.setItem('customBudget', JSON.stringify(newBudget));
    window.location.href = '/customize';
  };

  // Save to localStorage
  const saveAppliedProposals = () => {
    localStorage.setItem('appliedProposals', JSON.stringify(Array.from(appliedProposals)));
  };

  // Helper: get impact badge color
  const getImpactColor = (changePercent: number) => {
    if (changePercent > 0) return 'badge-error';
    if (changePercent < 0) return 'badge-success';
    return 'badge-neutral';
  };

  // Helper: get impact text
  const getImpactText = (changePercent: number) => {
    if (changePercent > 0) return `+${changePercent}% increase`;
    if (changePercent < 0) return `${changePercent}% decrease`;
    return 'No change';
  };
</script>

<svelte:head>
  <title>Explore Policy Proposals — Budget Simulator</title>
</svelte:head>

<div class="space-y-8">
  <!-- Header -->
  <section class="hero bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg shadow-lg text-white">
    <div class="hero-content text-center py-12 px-4 md:px-8">
      <div class="max-w-2xl">
        <h1 class="text-3xl md:text-4xl font-bold mb-2">Policy Proposals</h1>
        <p class="text-base md:text-lg opacity-90">Explore policy ideas and see their budget impact</p>
      </div>
    </div>
  </section>

  <!-- Summary of Applied Proposals -->
  {#if appliedProposals.size > 0}
    <div class="card bg-blue-50 border-2 border-blue-400 shadow-md">
      <div class="card-body">
        <h2 class="card-title text-lg md:text-2xl">Applied Proposals ({appliedProposals.size})</h2>

        <!-- Applied Proposals List -->
        <div class="space-y-2 mb-4">
          {#each Array.from(appliedProposals) as proposalId}
            {@const proposal = mockProposals.find((p) => p.id === proposalId)}
            {#if proposal}
              <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                <div class="flex-1">
                  <div class="font-semibold">{proposal.title}</div>
                  <div class="text-sm text-base-content/70">
                    {#each proposal.impact as impact}
                      <span class="badge badge-sm {getImpactColor(impact.changePercent)} mr-2">
                        {getImpactText(impact.changePercent)}
                      </span>
                    {/each}
                  </div>
                </div>
                <button
                  onclick={() => handleApplyProposal(proposalId)}
                  class="btn btn-sm btn-ghost text-error"
                  aria-label="Remove {proposal.title} from applied proposals"
                >
                  ✕
                </button>
              </div>
            {/if}
          {/each}
        </div>

        <!-- Impact Summary -->
        <div class="bg-white p-4 rounded-lg border border-blue-200 mb-4">
          <h3 class="font-semibold mb-3">Total Budget Impact</h3>
          <div class="space-y-1 text-sm">
            {#each mockBudget.categories as cat}
              {@const impact = totalImpactByCategory[cat.id]}
              {#if impact && impact !== 0}
                <div class="flex justify-between items-center">
                  <span>{cat.name}</span>
                  <span class={`font-bold ${impact > 0 ? 'text-error' : 'text-success'}`}>
                    {impact > 0 ? '+' : ''}{impact.toFixed(1)}B
                  </span>
                </div>
              {/if}
            {/each}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-2">
          <button
            onclick={handleApplyToBudget}
            class="btn btn-primary flex-grow sm:flex-grow-0"
            aria-label="Apply selected proposals to your custom budget"
          >
            Apply to Budget
          </button>
          <button
            onclick={handleClearAll}
            class="btn btn-outline flex-grow sm:flex-grow-0"
            aria-label="Clear all applied proposals"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Filters -->
  <section class="card bg-base-200 shadow-lg">
    <div class="card-body">
      <h2 class="card-title text-lg mb-4">Filter Proposals</h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Search -->
        <div class="form-control">
          <label class="label" for="search-proposals">
            <span class="label-text">Search</span>
          </label>
          <input
            id="search-proposals"
            type="text"
            bind:value={searchQuery}
            placeholder="Healthcare, Defense..."
            class="input input-bordered input-sm"
            aria-label="Search proposals by title or description"
          />
        </div>

        <!-- Impact Type Filter -->
        <div class="form-control">
          <label class="label" for="impact-filter">
            <span class="label-text">Impact Type</span>
          </label>
          <select id="impact-filter" bind:value={filterImpactType} class="select select-bordered select-sm">
            <option value="all">All Impact Types</option>
            <option value="positive">Increase Spending</option>
            <option value="negative">Decrease Spending</option>
          </select>
        </div>

        <!-- Category Filter -->
        <div class="form-control">
          <label class="label" for="category-filter">
            <span class="label-text">Category</span>
          </label>
          <select id="category-filter" bind:value={filterCategory} class="select select-bordered select-sm">
            <option value="all">All Categories</option>
            {#each mockBudget.categories as cat}
              <option value={cat.id}>{cat.name}</option>
            {/each}
          </select>
        </div>
      </div>
    </div>
  </section>

  <!-- Proposals Grid -->
  <section>
    <h2 class="text-2xl font-bold mb-6">
      Proposals <span class="text-base-content/60">({filteredProposals.length})</span>
    </h2>

    {#if filteredProposals.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        {#each filteredProposals as proposal (proposal.id)}
          <ProposalCard
            {proposal}
            isApplied={appliedProposals.has(proposal.id)}
            onselect={() => (selectedProposal = proposal)}
            onapply={() => handleApplyProposal(proposal.id)}
          />
        {/each}
      </div>
    {:else}
      <div class="alert alert-info">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          class="stroke-current shrink-0 w-6 h-6"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>No proposals match your filters. Try adjusting your search.</span>
      </div>
    {/if}
  </section>

  <!-- Navigation -->
  <div class="flex flex-col sm:flex-row gap-4 mt-8">
    <a href="/customize" class="btn btn-outline flex-grow sm:flex-grow-0">Back to Customize</a>
    <a href="/scenarios" class="btn btn-primary flex-grow sm:flex-grow-0">View Scenarios</a>
  </div>
</div>

<!-- Proposal Detail Modal -->
{#if selectedProposal}
  <ProposalDetail
    proposal={selectedProposal}
    isApplied={appliedProposals.has(selectedProposal.id)}
    onclose={() => (selectedProposal = null)}
    onapply={() => {
      handleApplyProposal(selectedProposal!.id);
      selectedProposal = null;
    }}
  />
{/if}
