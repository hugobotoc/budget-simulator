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
  <!-- Header Section -->
  <section class="card bg-gradient-to-r from-blue-500 to-cyan-600 shadow-lg text-white">
    <div class="card-body py-8 px-4 md:px-8">
      <h1 class="card-title text-2xl md:text-3xl lg:text-4xl">📋 Saved Scenarios</h1>
      <p class="text-base md:text-lg opacity-90">
        View, compare, and manage your budget scenarios. Load any scenario to continue editing.
      </p>
    </div>
  </section>

  <!-- Actions Bar -->
  {#if scenariosState.scenarios.length > 0}
    <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-base-200 p-4 rounded-lg" role="region" aria-label="Scenario selection controls">
      <div class="text-sm">
        {#if selectedScenarios.length > 0}
          <span class="font-semibold" role="status" aria-live="polite">
            {selectedScenarios.length} scenario{selectedScenarios.length === 1 ? '' : 's'} selected
          </span>
        {:else}
          <span class="text-base-content/60">Select scenarios to compare</span>
        {/if}
      </div>
      <div class="flex gap-2 flex-col sm:flex-row w-full sm:w-auto">
        {#if selectedScenarios.length === 2}
          <button
            onclick={handleCompare}
            class="btn btn-primary btn-sm transition-all hover:scale-105 active:scale-95"
            aria-label="Compare the two selected scenarios"
          >
            🔍 Compare
          </button>
        {/if}
        {#if selectedScenarios.length > 0}
          <button
            onclick={() => (selectedScenarios = [])}
            class="btn btn-outline btn-sm transition-all hover:scale-105 active:scale-95"
            aria-label="Clear selection of scenarios"
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
      <section class="space-y-4">
        <h2 class="text-2xl md:text-3xl font-bold">Your Scenarios</h2>
        <div class="alert alert-info" role="status">
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
      </section>
    {:else}
      <section class="space-y-4">
        <h2 class="text-2xl md:text-3xl font-bold">Your Scenarios</h2>
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
      </section>
    {/if}
  {:else}
    <section class="flex justify-center py-12">
      <div class="text-center">
        <span class="loading loading-spinner loading-lg mb-4"></span>
        <p class="text-base-content/60">Loading scenarios...</p>
      </div>
    </section>
  {/if}

  <!-- Info Box -->
  <section class="alert alert-info" role="region" aria-label="How to save scenarios">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      class="stroke-current shrink-0 w-6 h-6"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    <div>
      <h3 class="font-bold">How to save scenarios</h3>
      <div class="text-sm">
        Visit the <a href="/customize" class="link link-primary">Customize</a> or 
        <a href="/proposals" class="link link-primary">Proposals</a> pages and click 
        "Save As Scenario" to save your current budget allocation and applied policies.
      </div>
    </div>
  </section>
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteConfirm}
  <div class="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
    <div class="modal-box">
      <h3 class="font-bold text-lg" id="delete-modal-title">Delete Scenario?</h3>
      <p class="py-4">
        Are you sure you want to delete this scenario? This action cannot be undone.
      </p>
      <div class="modal-action flex-col sm:flex-row gap-2">
        <button
          onclick={() => (showDeleteConfirm = false)}
          class="btn btn-outline transition-all hover:scale-105 active:scale-95"
          aria-label="Cancel deletion"
        >
          Cancel
        </button>
        <button
          onclick={confirmDelete}
          class="btn btn-error transition-all hover:scale-105 active:scale-95"
          aria-label="Permanently delete this scenario"
        >
          Delete
        </button>
      </div>
    </div>
    <div
      class="modal-backdrop cursor-pointer"
      onclick={() => (showDeleteConfirm = false)}
      onkeydown={(e) => {
        if (e.key === 'Escape') {
          showDeleteConfirm = false;
        }
      }}
      role="button"
      tabindex="0"
      aria-label="Close modal"
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
