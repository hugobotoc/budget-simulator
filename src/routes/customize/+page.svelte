<script lang="ts">
  import { mockBudget } from '$data/mockBudget';
  import BudgetSlider from '$components/BudgetSlider.svelte';
  import BudgetComparison from '$components/BudgetComparison.svelte';
  import type { Category } from '$types';

  // State: custom budget allocations (categoryId -> amount in billions)
  let customBudget = $state<Record<string, number>>({});
  let scenarioName = $state('Default');
  let savedScenarios = $state<Record<string, Record<string, number>>>({});

  // Load from localStorage on mount
  const onMount = () => {
    const saved = localStorage.getItem('customBudget');
    const scenarios = localStorage.getItem('savedScenarios');
    const name = localStorage.getItem('scenarioName');

    if (saved) {
      try {
        customBudget = JSON.parse(saved);
        if (name) scenarioName = name;
      } catch (e) {
        console.error('Failed to load custom budget:', e);
      }
    }

    if (scenarios) {
      try {
        savedScenarios = JSON.parse(scenarios);
      } catch (e) {
        console.error('Failed to load scenarios:', e);
      }
    }

    // Initialize with current budget if empty
    if (Object.keys(customBudget).length === 0) {
      for (const cat of mockBudget.categories) {
        customBudget[cat.id] = cat.amount;
      }
    }
  };

  // Call mount on component init
  $effect.pre(() => {
    onMount();
  });

  // Derived: total custom budget
  const totalCustom = $derived(Object.values(customBudget).reduce((a, b) => a + b, 0));

  // Derived: total original budget
  const totalOriginal = $derived(mockBudget.totalBudget);

  // Helper: get budget status
  const getBudgetStatus = (custom: number, original: number) => {
    const diff = Math.abs(custom - original);
    const tolerance = 0.1; // 0.1B tolerance
    if (diff <= tolerance) return 'balanced';
    if (custom > original) return 'over';
    return 'under';
  };

  // Derived: enforcement status
  const budgetStatus = $derived(getBudgetStatus(totalCustom, totalOriginal));

  // Derived: color for status badge
  const statusColor = $derived(
    budgetStatus === 'balanced' ? 'text-success' : budgetStatus === 'over' ? 'text-error' : 'text-warning'
  );

  // Helper: get status message
  const getStatusMessage = (status: string, custom: number, original: number) => {
    const diff = custom - original;
    if (status === 'balanced') return `✓ Balanced (±$${Math.abs(diff).toFixed(1)}B)`;
    if (status === 'over') return `⚠ Over by $${diff.toFixed(1)}B`;
    return `⚠ Under by $${Math.abs(diff).toFixed(1)}B`;
  };

  // Derived: status message
  const statusMessage = $derived(getStatusMessage(budgetStatus, totalCustom, totalOriginal));

  // Handler: update slider
  const handleCategoryChange = (categoryId: string, newAmount: number) => {
    customBudget[categoryId] = newAmount;
    saveToLocalStorage();
  };

  // Handler: reset to defaults
  const handleReset = () => {
    for (const cat of mockBudget.categories) {
      customBudget[cat.id] = cat.amount;
    }
    saveToLocalStorage();
  };

  // Handler: save scenario
  const handleSaveScenario = () => {
    if (!scenarioName.trim()) {
      alert('Please enter a scenario name');
      return;
    }
    savedScenarios[scenarioName] = { ...customBudget };
    localStorage.setItem('savedScenarios', JSON.stringify(savedScenarios));
    alert(`Scenario "${scenarioName}" saved!`);
  };

  // Handler: load scenario
  const handleLoadScenario = (name: string) => {
    const scenario = savedScenarios[name];
    if (scenario) {
      customBudget = { ...scenario };
      scenarioName = name;
      saveToLocalStorage();
    }
  };

  // Handler: delete scenario
  const handleDeleteScenario = (name: string) => {
    if (confirm(`Delete scenario "${name}"?`)) {
      delete savedScenarios[name];
      localStorage.setItem('savedScenarios', JSON.stringify(savedScenarios));
    }
  };

  // Save to localStorage
  const saveToLocalStorage = () => {
    localStorage.setItem('customBudget', JSON.stringify(customBudget));
    localStorage.setItem('scenarioName', scenarioName);
  };
</script>

<svelte:head>
  <title>Budget Customizer — Build Your Budget</title>
</svelte:head>

<div class="space-y-8">
  <!-- Header -->
  <section class="hero bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg shadow-lg text-white">
    <div class="hero-content text-center py-12 px-4 md:px-8">
      <div class="max-w-2xl">
        <h1 class="text-3xl md:text-4xl font-bold mb-2">Build Your Budget</h1>
        <p class="text-base md:text-lg opacity-90">Customize government spending allocations. See impact in real-time.</p>
      </div>
    </div>
  </section>

  <!-- Budget Status Card -->
  <div class="card bg-base-200 shadow-lg">
    <div class="card-body">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 class="card-title text-lg md:text-2xl mb-2">Budget Enforcement</h2>
          <div class={`text-lg font-bold ${statusColor}`}>{statusMessage}</div>
        </div>
        <div class="stats shadow flex-col sm:flex-row">
          <div class="stat">
            <div class="stat-title text-sm">Total Budget</div>
            <div class="stat-value text-xl">${totalCustom.toFixed(1)}B</div>
            <div class="stat-desc">Current allocation</div>
          </div>
          <div class="stat">
            <div class="stat-title text-sm">Original</div>
            <div class="stat-value text-xl">${totalOriginal}B</div>
            <div class="stat-desc">Baseline</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Category Sliders -->
  <section class="card bg-base-100 shadow-lg">
    <div class="card-body">
      <h2 class="card-title text-2xl mb-6">Category Allocations</h2>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {#each mockBudget.categories as category (category.id)}
          <BudgetSlider
            category={category}
            currentAmount={customBudget[category.id]}
            totalBudget={totalOriginal}
            onchange={(amount) => handleCategoryChange(category.id, amount)}
          />
        {/each}
      </div>
    </div>
  </section>

  <!-- Scenario Management -->
  <section class="card bg-base-100 shadow-lg">
    <div class="card-body">
      <h2 class="card-title text-2xl mb-4">Manage Scenarios</h2>

      <div class="space-y-4">
        <!-- Save New Scenario -->
        <div class="form-control">
          <label class="label" for="scenario-name">
            <span class="label-text font-semibold">Scenario Name</span>
          </label>
          <div class="flex flex-col sm:flex-row gap-2">
            <input
              id="scenario-name"
              type="text"
              bind:value={scenarioName}
              placeholder="Enter scenario name"
              class="input input-bordered flex-grow"
              aria-label="Scenario name input"
            />
            <button onclick={handleSaveScenario} class="btn btn-primary whitespace-nowrap" aria-label="Save current scenario">
              Save Scenario
            </button>
          </div>
        </div>

        <!-- Saved Scenarios List -->
        {#if Object.keys(savedScenarios).length > 0}
          <div>
            <h3 class="font-semibold mb-3">Saved Scenarios</h3>
            <div class="space-y-2">
              {#each Object.keys(savedScenarios) as name (name)}
                <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 bg-base-200 rounded-lg">
                  <span class="font-medium flex-grow">{name}</span>
                  <div class="flex gap-2 w-full sm:w-auto">
                    <button
                      onclick={() => handleLoadScenario(name)}
                      class="btn btn-sm btn-outline flex-grow sm:flex-grow-0"
                      aria-label="Load scenario {name}"
                    >
                      Load
                    </button>
                    <button
                      onclick={() => handleDeleteScenario(name)}
                      class="btn btn-sm btn-ghost text-error flex-grow sm:flex-grow-0"
                      aria-label="Delete scenario {name}"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>

      <!-- Reset Button -->
      <div class="mt-6 pt-6 border-t">
        <button onclick={handleReset} class="btn btn-outline btn-block" aria-label="Reset budget to original allocations">
          Reset to Original Budget
        </button>
      </div>
    </div>
  </section>

  <!-- Comparison View -->
  {#if Object.keys(customBudget).length > 0}
    <BudgetComparison originalBudget={mockBudget} customBudget={customBudget} />
  {/if}

  <!-- Navigation -->
  <div class="flex flex-col sm:flex-row gap-4 mt-8">
    <a href="/" class="btn btn-outline flex-grow sm:flex-grow-0" aria-label="Return to home">Back to Home</a>
    <a href="/proposals" class="btn btn-primary flex-grow sm:flex-grow-0" aria-label="Explore policy proposals">Next: Explore Proposals</a>
  </div>
</div>
