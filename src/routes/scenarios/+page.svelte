<script lang="ts">
  import { mockBudget } from '$data/mockBudget';
  import ScenarioCompare from '$components/ScenarioCompare.svelte';
  import type { UserScenario } from '$types';

  // State
  let scenarios = $state<Record<string, UserScenario>>({});
  let selectedScenarioNames = $state<string[]>([]);
  let showComparison = $state(false);
  let newScenarioName = $state('');
  let newScenarioDesc = $state('');

  // Load scenarios from localStorage on mount
  const onMount = () => {
    const saved = localStorage.getItem('savedScenarios');
    if (saved) {
      try {
        const scenariosData = JSON.parse(saved);
        // Convert to proper UserScenario format
        const formatted: Record<string, UserScenario> = {};
        for (const [name, budgetAlloc] of Object.entries(scenariosData)) {
          formatted[name] = {
            id: `scenario-${Date.now()}-${Math.random()}`,
            name,
            budgetAllocations: budgetAlloc as Record<string, number>,
            appliedProposals: [],
            createdAt: new Date(),
            updatedAt: new Date()
          };
        }
        scenarios = formatted;
      } catch (e) {
        console.error('Failed to load scenarios:', e);
      }
    }
  };

  $effect.pre(() => {
    onMount();
  });

  // Derived: total budget for each scenario
  const scenarioTotals = $derived.by(() => {
    const totals: Record<string, number> = {};
    for (const [name, scenario] of Object.entries(scenarios)) {
      totals[name] = Object.values(scenario.budgetAllocations).reduce((a, b) => a + b, 0);
    }
    return totals;
  });

  // Derived: comparison data
  const comparisonData = $derived.by(() => {
    const data = selectedScenarioNames
      .map((name) => scenarios[name])
      .filter((s) => s);

    return data;
  });

  // Handler: save as new scenario from current budget
  const handleCreateScenario = () => {
    if (!newScenarioName.trim()) {
      alert('Please enter a scenario name');
      return;
    }

    if (scenarios[newScenarioName]) {
      alert('Scenario with this name already exists');
      return;
    }

    const currentBudget = localStorage.getItem('customBudget');
    if (!currentBudget) {
      alert('No custom budget to save. Build a budget first on the Customize page.');
      return;
    }

    try {
      const budgetAlloc = JSON.parse(currentBudget);
      const newScenario: UserScenario = {
        id: `scenario-${Date.now()}`,
        name: newScenarioName,
        description: newScenarioDesc || undefined,
        budgetAllocations: budgetAlloc,
        appliedProposals: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      scenarios[newScenarioName] = newScenario;
      saveScenarios();

      newScenarioName = '';
      newScenarioDesc = '';
      alert(`Scenario "${newScenarioName}" created!`);
    } catch (e) {
      console.error('Failed to create scenario:', e);
      alert('Failed to create scenario');
    }
  };

  // Handler: load scenario
  const handleLoadScenario = (name: string) => {
    const scenario = scenarios[name];
    if (scenario) {
      localStorage.setItem('customBudget', JSON.stringify(scenario.budgetAllocations));
      window.location.href = '/customize';
    }
  };

  // Handler: delete scenario
  const handleDeleteScenario = (name: string) => {
    if (confirm(`Delete scenario "${name}"?`)) {
      delete scenarios[name];
      saveScenarios();
      // Remove from comparison selection
      selectedScenarioNames = selectedScenarioNames.filter((n) => n !== name);
    }
  };

  // Handler: toggle scenario for comparison
  const handleToggleComparison = (name: string) => {
    if (selectedScenarioNames.includes(name)) {
      selectedScenarioNames = selectedScenarioNames.filter((n) => n !== name);
    } else {
      if (selectedScenarioNames.length < 3) {
        selectedScenarioNames = [...selectedScenarioNames, name];
      } else {
        alert('Compare up to 3 scenarios at a time');
      }
    }
  };

  // Handler: export scenario as JSON
  const handleExportScenario = (name: string) => {
    const scenario = scenarios[name];
    if (!scenario) return;

    const json = JSON.stringify(scenario, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scenario-${name}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handler: export all scenarios
  const handleExportAll = () => {
    const json = JSON.stringify(scenarios, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scenarios-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handler: import scenarios from JSON
  const handleImport = (e: Event) => {
    const target = e.currentTarget as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const imported = JSON.parse(content);

        // Merge imported scenarios
        const merged = { ...scenarios, ...imported };
        scenarios = merged;
        saveScenarios();
        alert('Scenarios imported successfully!');
      } catch (e) {
        console.error('Failed to import scenarios:', e);
        alert('Failed to import scenarios. Check file format.');
      }
    };
    reader.readAsText(file);
  };

  // Save scenarios to localStorage
  const saveScenarios = () => {
    const toSave: Record<string, Record<string, number>> = {};
    for (const [name, scenario] of Object.entries(scenarios)) {
      toSave[name] = scenario.budgetAllocations;
    }
    localStorage.setItem('savedScenarios', JSON.stringify(toSave));
  };
</script>

<svelte:head>
  <title>Manage Scenarios — Budget Simulator</title>
</svelte:head>

<div class="space-y-8">
  <!-- Header -->
  <section class="hero bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg shadow-lg text-white">
    <div class="hero-content text-center py-12 px-4 md:px-8">
      <div class="max-w-2xl">
        <h1 class="text-3xl md:text-4xl font-bold mb-2">Manage Scenarios</h1>
        <p class="text-base md:text-lg opacity-90">Save, compare, and share your budget scenarios</p>
      </div>
    </div>
  </section>

  <!-- Create New Scenario -->
  <section class="card bg-base-100 shadow-lg">
    <div class="card-body">
      <h2 class="card-title text-2xl mb-4">Create New Scenario</h2>

      <div class="space-y-4">
        <div class="form-control">
          <label class="label" for="scenario-name">
            <span class="label-text font-semibold">Scenario Name</span>
          </label>
          <input
            id="scenario-name"
            type="text"
            bind:value={newScenarioName}
            placeholder="e.g., Healthcare-Focused, Defense Reduction"
            class="input input-bordered"
            aria-label="New scenario name"
          />
        </div>

        <div class="form-control">
          <label class="label" for="scenario-desc">
            <span class="label-text font-semibold">Description (Optional)</span>
          </label>
          <textarea
            id="scenario-desc"
            bind:value={newScenarioDesc}
            placeholder="Describe this scenario's focus or rationale..."
            class="textarea textarea-bordered"
            rows="2"
            aria-label="New scenario description"
          ></textarea>
        </div>

        <p class="text-sm text-base-content/60">
          💡 First, build your budget on the <a href="/customize" class="link">Customize page</a>, then create a scenario here to save it.
        </p>

        <button
          onclick={handleCreateScenario}
          class="btn btn-primary btn-block"
          aria-label="Create new scenario from current budget"
        >
          Create Scenario from Current Budget
        </button>
      </div>
    </div>
  </section>

  <!-- Saved Scenarios -->
  {#if Object.keys(scenarios).length > 0}
    <section class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <h2 class="card-title text-2xl mb-6">Saved Scenarios ({Object.keys(scenarios).length})</h2>

        <!-- Scenarios Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {#each Object.entries(scenarios) as [name, scenario]}
            <div class={`card shadow-md border-2 transition-all ${selectedScenarioNames.includes(name) ? 'border-primary bg-primary/5' : 'border-base-300 bg-base-100'}`}>
              <div class="card-body">
                <!-- Header -->
                <h3 class="card-title text-lg">{scenario.name}</h3>
                {#if scenario.description}
                  <p class="text-sm text-base-content/70">{scenario.description}</p>
                {/if}

                <!-- Stats -->
                <div class="stats stats-vertical sm:stats-horizontal shadow w-full my-4">
                  <div class="stat">
                    <div class="stat-title text-xs">Total Budget</div>
                    <div class="stat-value text-sm md:text-base">${scenarioTotals[name]?.toFixed(1) || 0}B</div>
                  </div>
                  <div class="stat">
                    <div class="stat-title text-xs">Categories</div>
                    <div class="stat-value text-sm md:text-base">{Object.keys(scenario.budgetAllocations).length}</div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="card-actions gap-2 flex-wrap">
                  <button
                    onclick={() => handleLoadScenario(name)}
                    class="btn btn-sm btn-outline flex-1"
                    aria-label="Load scenario {name} to customize page"
                  >
                    Load
                  </button>
                  <button
                    onclick={() => handleToggleComparison(name)}
                    class={`btn btn-sm flex-1 ${selectedScenarioNames.includes(name) ? 'btn-primary' : 'btn-outline'}`}
                    aria-label="{selectedScenarioNames.includes(name) ? 'Remove' : 'Add'} {name} to comparison"
                  >
                    {selectedScenarioNames.includes(name) ? '✓ Compare' : 'Compare'}
                  </button>
                  <button
                    onclick={() => handleExportScenario(name)}
                    class="btn btn-sm btn-outline flex-1"
                    aria-label="Export scenario {name} as JSON"
                  >
                    Export
                  </button>
                  <button
                    onclick={() => handleDeleteScenario(name)}
                    class="btn btn-sm btn-ghost text-error flex-1"
                    aria-label="Delete scenario {name}"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </div>

        <!-- Bulk Actions -->
        <div class="divider my-4"></div>
        <div class="flex flex-col sm:flex-row gap-2">
          <button
            onclick={handleExportAll}
            class="btn btn-outline flex-1"
            aria-label="Export all scenarios as JSON backup"
          >
            📥 Export All
          </button>
          <label class="btn btn-outline flex-1">
            📤 Import JSON
            <input
              type="file"
              accept=".json"
              onchange={handleImport}
              class="hidden"
              aria-label="Import scenarios from JSON file"
            />
          </label>
        </div>
      </div>
    </section>

    <!-- Comparison Section -->
    {#if selectedScenarioNames.length > 0}
      <section class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h2 class="card-title text-2xl">Compare Scenarios</h2>
            <button
              onclick={() => (showComparison = !showComparison)}
              class="btn btn-sm btn-outline"
              aria-label="{showComparison ? 'Hide' : 'Show'} comparison details"
            >
              {showComparison ? 'Hide' : 'Show'} Details
            </button>
          </div>

          {#if showComparison && comparisonData.length > 0}
            <ScenarioCompare scenarios={comparisonData} {mockBudget} />
          {/if}

          <!-- Simple Comparison Summary -->
          {#if !showComparison}
            <div class="space-y-2">
              {#each comparisonData as scenario}
                <div class="flex items-center justify-between p-3 bg-base-200 rounded">
                  <span class="font-semibold">{scenario.name}</span>
                  <span class="text-sm text-base-content/60">
                    Total: ${Object.values(scenario.budgetAllocations).reduce((a, b) => a + b, 0).toFixed(1)}B
                  </span>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </section>
    {/if}
  {:else}
    <!-- Empty State -->
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
        ></path>
      </svg>
      <div>
        <p class="font-semibold">No scenarios saved yet</p>
        <p class="text-sm">Build a budget on the <a href="/customize" class="link">Customize page</a>, then come back here to save it as a scenario.</p>
      </div>
    </div>
  {/if}

  <!-- Navigation -->
  <div class="flex flex-col sm:flex-row gap-4 mt-8">
    <a href="/proposals" class="btn btn-outline flex-grow sm:flex-grow-0">Back to Proposals</a>
    <a href="/customize" class="btn btn-primary flex-grow sm:flex-grow-0">Customize Budget</a>
  </div>
</div>
