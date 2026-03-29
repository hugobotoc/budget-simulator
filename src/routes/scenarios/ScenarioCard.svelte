<script lang="ts">
  import type { UserScenario, Budget } from '$types';

  interface Props {
    scenario: UserScenario;
    budget: Budget;
    isSelected: boolean;
    onSelect: () => void;
    onLoad: () => void;
    onEdit: () => void;
    onDelete: () => void;
  }

  const { scenario, budget, isSelected, onSelect, onLoad, onEdit, onDelete }: Props = $props();

  function getChangedCategories(): number {
    return budget.categories.filter((cat) => {
      const diff = Math.abs(
        (scenario.budgetAllocations[cat.id] || cat.percentage) - cat.percentage
      );
      return diff > 0.1;
    }).length;
  }

  function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const changedCategories = $derived(getChangedCategories());
</script>

<div
  class={`card shadow-md transition-all ${isSelected ? 'ring-2 ring-primary bg-primary/5' : 'bg-base-100'}`}
  role="button"
  tabindex={0}
  onclick={onSelect}
  onkeydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onSelect();
    }
  }}
  aria-pressed={isSelected}
>
  <div class="card-body space-y-4 p-5">
    <!-- Header: Title and Selection Checkbox -->
    <div class="flex items-start gap-3">
      <input
        type="checkbox"
        class="checkbox"
        checked={isSelected}
        onchange={() => {}}
        onclick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      />
      <div class="flex-1 min-w-0">
        <h2 class="card-title text-lg truncate">{scenario.name}</h2>
        {#if scenario.description}
          <p class="text-sm text-base-content/60 line-clamp-2">
            {scenario.description}
          </p>
        {/if}
      </div>
    </div>

    <!-- Dates -->
    <div class="divider my-2"></div>
    <div class="space-y-1 text-xs text-base-content/60">
      <div class="flex justify-between">
        <span>Created:</span>
        <span>{formatDate(scenario.createdAt)}</span>
      </div>
      <div class="flex justify-between">
        <span>Modified:</span>
        <span>{formatDate(scenario.updatedAt)}</span>
      </div>
    </div>

    <!-- Stats -->
    <div class="divider my-2"></div>
    <div class="space-y-2">
      <div class="flex justify-between items-center bg-base-200 p-2 rounded">
        <span class="text-sm font-semibold">Categories Changed</span>
        <span class="badge badge-primary">{changedCategories}</span>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="divider my-2"></div>
    <div class="flex gap-2 flex-wrap">
      <button
        onclick={onLoad}
        class="btn btn-primary btn-xs flex-1"
        aria-label="Load and continue editing this scenario"
      >
        ▶ Load
      </button>
      <button
        onclick={onEdit}
        class="btn btn-outline btn-xs flex-1"
        aria-label="Edit scenario details"
      >
        ✏️ Edit
      </button>
      <button
        onclick={onDelete}
        class="btn btn-error btn-xs flex-1"
        aria-label="Delete this scenario"
      >
        🗑️ Delete
      </button>
    </div>
  </div>
</div>
