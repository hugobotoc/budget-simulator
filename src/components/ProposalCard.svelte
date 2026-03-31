<script lang="ts">
  import type { Proposal } from '$types';

  interface Props {
    proposal: Proposal;
    isApplied: boolean;
    onselect: () => void;
    onapply: () => void;
  }

  let { proposal, isApplied, onselect, onapply }: Props = $props();

  // Derive proposal statistics
  const positiveImpact = $derived(proposal.impact.filter((i) => i.changePercent > 0));
  const negativeImpact = $derived(proposal.impact.filter((i) => i.changePercent < 0));
  const totalCost = $derived(proposal.impact.reduce((sum, i) => sum + (i.estimatedCost || 0), 0));
</script>

<div class={`card shadow-lg transition-all border-2 ${isApplied ? 'border-primary bg-primary/5' : 'border-base-300 bg-base-100'}`}>
  <div class="card-body">
    <!-- Header -->
    <div class="flex items-start justify-between gap-4 mb-4">
      <div class="flex-1 min-w-0">
        <h3 class="card-title text-lg break-words">{proposal.title}</h3>
        <p class="text-sm text-base-content/60 mt-2">{proposal.description}</p>
      </div>
      {#if isApplied}
        <div class="badge badge-primary text-white flex-shrink-0">Applied</div>
      {/if}
    </div>

    <!-- Metadata -->
    <div class="divider my-2"></div>
    <div class="space-y-2 text-sm">
      {#if proposal.source}
        <div>
          <span class="font-semibold text-base-content/70">Source:</span>
          <span class="text-base-content/80">{proposal.source}</span>
        </div>
      {/if}
      {#if proposal.author}
        <div>
          <span class="font-semibold text-base-content/70">Author:</span>
          <span class="text-base-content/80">{proposal.author}</span>
        </div>
      {/if}
    </div>

    <!-- Impact Summary -->
    <div class="divider my-2"></div>
    <div class="space-y-3">
      {#if positiveImpact.length > 0}
        <div>
          <p class="text-sm font-semibold text-error mb-2">Increase ({positiveImpact.length})</p>
          <div class="space-y-1">
            {#each positiveImpact as impact}
              <div class="flex items-center justify-between text-xs">
                <span class="text-base-content/70">{impact.description || impact.categoryId}</span>
                <span class="badge badge-error">+{impact.changePercent}%</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      {#if negativeImpact.length > 0}
        <div>
          <p class="text-sm font-semibold text-success mb-2">Decrease ({negativeImpact.length})</p>
          <div class="space-y-1">
            {#each negativeImpact as impact}
              <div class="flex items-center justify-between text-xs">
                <span class="text-base-content/70">{impact.description || impact.categoryId}</span>
                <span class="badge badge-success">{impact.changePercent}%</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <!-- Total Cost -->
    {#if totalCost !== 0}
      <div class="alert alert-info py-2 px-3 gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          class="stroke-current shrink-0 w-4 h-4"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <span class="text-sm">
          Total Cost: <span class={`font-bold ${totalCost > 0 ? 'text-error' : 'text-success'}`}>
            {totalCost > 0 ? '+' : ''}{totalCost.toFixed(1)}B
          </span>
        </span>
      </div>
    {/if}

    <!-- Actions -->
    <div class="card-actions mt-4 gap-2">
      <button
        onclick={onselect}
        class="btn btn-sm btn-outline flex-1"
        aria-label="View details for {proposal.title}"
      >
        Details
      </button>
      <button
        onclick={onapply}
        class={`btn btn-sm flex-1 ${isApplied ? 'btn-error' : 'btn-primary'}`}
        aria-label="{isApplied ? 'Remove' : 'Apply'} {proposal.title}"
      >
        {isApplied ? 'Remove' : 'Apply'}
      </button>
    </div>
  </div>
</div>
