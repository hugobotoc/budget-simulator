<script lang="ts">
  import { onMount } from 'svelte';
  import { mockBudget } from '$data/mockBudget';
  import { scenariosStore } from '$lib/scenariosStore';
  import { customBudget } from '$lib/budgetStore';
  import { proposalsStore } from '$lib/proposalsStore';
  import type { UserScenario } from '$types';
  import ScenarioCard from './ScenarioCard.svelte';
  import ComparisonModal from './ComparisonModal.svelte';

  let budget = $state(mockBudget);
  let scenariosState = $state({
    scenarios: [] as UserScenario[],
    loaded: false
  });

  let selectedScenarios = $state<string[]>([]);
  let showDeleteConfirm = $state(false);
  let scenarioToDelete = $state<string | null>(null);
  let showComparison = $state(false);

  const unsubscribe = scenariosStore.subscribe((state) => {
    scenariosState = state;
  });

  onMount(() => {
    scenariosStore.load();
    return () => unsubscribe();
  });

  function getDifferencesFromBaseline(scenario: UserScenario) {
    const changed = budget.categories.filter((cat) => {
      const diff = Math.abs(
        (scenario.budgetAllocations[cat.id] || cat.percentage) - cat.percentage
      );
      return diff > 0.1;
    }).length;

    // Calculate net fiscal impact from applied proposals
    let netFiscalImpact = 0;
    // This would require proposal data to calculate, for now it's a placeholder

    return { changed, netFiscalImpact };
  }

  function loadScenario(scenario: UserScenario) {
    // Load budget allocations
    customBudget.reset();
    Object.entries(scenario.budgetAllocations).forEach(([categoryId, percentage]) => {
      customBudget.setAllocation(categoryId, percentage);
    });
    customBudget.save();

    // Load applied proposals
    proposalsStore.reset();
    // Note: Proposal application would need to be re-applied from proposal data
    // For now, just load the allocations

    // Navigate to customize page
    window.location.href = '/customize';
  }

  function handleDelete(id: string) {
    scenarioToDelete = id;
    showDeleteConfirm = true;
  }

  function confirmDelete() {
    if (scenarioToDelete) {
      scenariosStore.deleteScenario(scenarioToDelete);
      scenarioToDelete = null;
      showDeleteConfirm = false;
    }
  }

  function toggleScenarioSelection(id: string) {
    if (selectedScenarios.includes(id)) {
      selectedScenarios = selectedScenarios.filter((s) => s !== id);
    } else {
      selectedScenarios = [...selectedScenarios, id];
    }
  }

  function handleCompare() {
    if (selectedScenarios.length === 2) {
      showComparison = true;
    }
  }

  function getScenarioStats(scenario: UserScenario) {
    const { changed } = getDifferencesFromBaseline(scenario);
    return {
      changedCategories: changed,
      totalBudget: budget.totalBudget
    };
  }
</script>

<svelte:head>
  <title>Saved Scenarios — Budget Simulator</title>
</svelte:head>

<div class="space-y-8">
  <!-- Header -->
  <div class="card bg-gradient-to-r from-blue-500 to-cyan-600 shadow-lg text-white">
    <div class="card-body py-8">
      <h1 class="card-title text-3xl">📋 Saved Scenarios</h1>
      <p class="text-lg opacity-90">
        View, compare, and manage your budget scenarios. Load any scenario to continue editing.
      </p>
    </div>
  </div>

  <!-- Actions Bar -->
  {#if scenariosState.scenarios.length > 0}
    <div class="flex flex-wrap gap-3 items-center justify-between bg-base-200 p-4 rounded-lg">
      <div class="text-sm">
        {#if selectedScenarios.length > 0}
          <span class="font-semibold">{selectedScenarios.length} scenario(s) selected</span>
        {:else}
          <span class="text-base-content/60">Select scenarios to compare</span>
        {/if}
      </div>
      <div class="flex gap-2">
        {#if selectedScenarios.length === 2}
          <button
            onclick={handleCompare}
            class="btn btn-primary btn-sm"
          >
            🔍 Compare
          </button>
        {/if}
        {#if selectedScenarios.length > 0}
          <button
            onclick={() => (selectedScenarios = [])}
            class="btn btn-outline btn-sm"
          >
            Clear Selection
          </button>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Scenarios Grid -->
  {#if scenariosState.loaded}
    {#if scenariosState.scenarios.length === 0}
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
          /></svg>
        <div>
          <h3 class="font-bold">No scenarios yet</h3>
          <div class="text-sm">
            Create your first scenario by customizing the budget on the <a href="/customize" class="link link-primary">Customize</a> page
            and saving it as a scenario.
          </div>
        </div>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each scenariosState.scenarios as scenario (scenario.id)}
          {@const stats = getScenarioStats(scenario)}
          {@const isSelected = selectedScenarios.includes(scenario.id)}

          <ScenarioCard
            {scenario}
            {budget}
            {isSelected}
            onSelect={() => toggleScenarioSelection(scenario.id)}
            onLoad={() => loadScenario(scenario)}
            onEdit={() => {
              // Load and redirect to customize page for editing
              loadScenario(scenario);
            }}
            onDelete={() => handleDelete(scenario.id)}
          />
        {/each}
      </div>
    {/if}
  {:else}
    <div class="flex justify-center">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {/if}

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
      /></svg>
    <div>
      <h3 class="font-bold">How to save scenarios</h3>
      <div class="text-sm">
        Visit the <a href="/customize" class="link link-primary">Customize</a> or 
        <a href="/proposals" class="link link-primary">Proposals</a> pages and click 
        "Save As Scenario" to save your current budget allocation and applied policies.
      </div>
    </div>
  </div>
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteConfirm}
  <div class="modal modal-open">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Delete Scenario?</h3>
      <p class="py-4">
        Are you sure you want to delete this scenario? This action cannot be undone.
      </p>
      <div class="modal-action">
        <button
          onclick={() => (showDeleteConfirm = false)}
          class="btn btn-outline"
        >
          Cancel
        </button>
        <button
          onclick={confirmDelete}
          class="btn btn-error"
        >
          Delete
        </button>
      </div>
    </div>
    <div
      class="modal-backdrop"
      onclick={() => (showDeleteConfirm = false)}
      onkeydown={(e) => {
        if (e.key === 'Escape') {
          showDeleteConfirm = false;
        }
      }}
      role="button"
      tabindex="-1"
    ></div>
  </div>
{/if}

<!-- Comparison Modal -->
{#if showComparison && selectedScenarios.length === 2}
  {@const scenario1 = scenariosState.scenarios.find((s) => s.id === selectedScenarios[0])}
  {@const scenario2 = scenariosState.scenarios.find((s) => s.id === selectedScenarios[1])}

  {#if scenario1 && scenario2}
    <ComparisonModal
      {scenario1}
      {scenario2}
      {budget}
      onClose={() => (showComparison = false)}
    />
  {/if}
{/if}
