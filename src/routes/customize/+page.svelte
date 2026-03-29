<script lang="ts">
  import { onMount } from 'svelte';
  import { mockBudget } from '$data/mockBudget';
  import { customBudget } from '$lib/budgetStore';
  import type { Category } from '$types';
  import Chart from 'chart.js/auto';

  let budget = $state(mockBudget);
  let customBudgetState = $state({
    allocations: {} as Record<string, number>,
    total: 100
  });

  // Subscribe to store
  const unsubscribe = customBudget.subscribe((state) => {
    customBudgetState = state;
  });

  let chartCanvas: HTMLCanvasElement;
  let chartInstance: Chart;
  let comparisonChartCanvas: HTMLCanvasElement;
  let comparisonChartInstance: Chart;
  let saveMessage = $state('');

  onMount(() => {
    // Initialize chart
    updateChart();
    updateComparisonChart();

    return () => {
      unsubscribe();
      if (chartInstance) chartInstance.destroy();
      if (comparisonChartInstance) comparisonChartInstance.destroy();
    };
  });

  // Calculate dollar amounts
  function getDollarAmount(categoryId: string): number {
    const percentage = customBudgetState.allocations[categoryId] || 0;
    return (percentage / 100) * budget.totalBudget;
  }

  function getCurrentDollarAmount(categoryId: string): number {
    const cat = budget.categories.find((c) => c.id === categoryId);
    return cat?.amount || 0;
  }

  function updateChart() {
    if (!chartCanvas) return;

    if (chartInstance) {
      chartInstance.destroy();
    }

    const labels = budget.categories.map((c) => c.name);
    const data = budget.categories.map(
      (c) => customBudgetState.allocations[c.id] || 0
    );
    const colors = budget.categories.map((c) => c.color || '#999');

    chartInstance = new Chart(chartCanvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors,
            borderColor: '#fff',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.parsed ?? 0;
                return `${context.label}: ${value.toFixed(1)}%`;
              }
            }
          }
        }
      }
    });
  }

  function updateComparisonChart() {
    if (!comparisonChartCanvas) return;

    if (comparisonChartInstance) {
      comparisonChartInstance.destroy();
    }

    const labels = budget.categories.map((c) => c.name);
    const currentData = budget.categories.map((c) => c.percentage);
    const customData = budget.categories.map(
      (c) => customBudgetState.allocations[c.id] || 0
    );

    comparisonChartInstance = new Chart(comparisonChartCanvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Current Allocation',
            data: currentData,
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1
          },
          {
            label: 'Your Custom Budget',
            data: customData,
            backgroundColor: 'rgba(16, 185, 129, 0.5)',
            borderColor: 'rgb(16, 185, 129)',
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

  function handleSliderChange(categoryId: string, value: number) {
    customBudget.setAllocation(categoryId, value);
    updateChart();
    updateComparisonChart();
  }

  function handleReset() {
    customBudget.reset();
    updateChart();
    updateComparisonChart();
    saveMessage = '';
  }

  function handleSave() {
    customBudget.save();
    saveMessage = 'Budget saved successfully!';
    setTimeout(() => {
      saveMessage = '';
    }, 3000);
  }

  function getDifference(categoryId: string): number {
    const current = budget.categories.find((c) => c.id === categoryId)?.percentage || 0;
    const custom = customBudgetState.allocations[categoryId] || 0;
    return custom - current;
  }

  function getDifferenceDollars(categoryId: string): number {
    return getDollarAmount(categoryId) - getCurrentDollarAmount(categoryId);
  }
</script>

<svelte:head>
  <title>Budget Customizer — Create Your Budget</title>
</svelte:head>

<div class="space-y-8">
  <!-- Header -->
  <div class="card bg-gradient-to-r from-green-500 to-teal-600 shadow-lg text-white">
    <div class="card-body py-8">
      <h1 class="card-title text-3xl">✏️ Budget Customizer</h1>
      <p class="text-lg opacity-90">
        Adjust spending allocations and see the impact. Your total must equal 100%.
      </p>
    </div>
  </div>

  <!-- Main Content Grid -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Sliders Section -->
    <div class="lg:col-span-2 space-y-4">
      <div class="card bg-base-200 shadow-md">
        <div class="card-body">
          <h2 class="card-title mb-6">Adjust Allocations</h2>

          <!-- Progress Bar -->
          <div class="mb-6 p-4 bg-base-100 rounded-lg">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-semibold">Total Allocation</span>
              <span class="text-lg font-bold"
                >{customBudgetState.total.toFixed(1)}%</span
              >
            </div>
            <progress
              class="progress progress-primary w-full"
              value={customBudgetState.total}
              max="100"
            />
            {#if Math.abs(customBudgetState.total - 100) > 0.1}
              <p class="text-xs text-warning mt-1">
                {customBudgetState.total > 100
                  ? `Over by ${(customBudgetState.total - 100).toFixed(1)}%`
                  : `Under by ${(100 - customBudgetState.total).toFixed(1)}%`}
              </p>
            {/if}
          </div>

          <!-- Category Sliders -->
          <div class="space-y-6">
            {#each budget.categories as category (category.id)}
              {@const customPercent = customBudgetState.allocations[category.id] || 0}
              {@const currentAmount = getCurrentDollarAmount(category.id)}
              {@const customAmount = getDollarAmount(category.id)}
              {@const diff = getDifference(category.id)}
              {@const diffDollars = getDifferenceDollars(category.id)}
              {@const isDifferent = Math.abs(diff) > 0.1}

              <div class="p-4 bg-base-100 rounded-lg border-l-4" style="border-color: {category.color || '#999'}">
                <!-- Category Header -->
                <div class="flex items-start justify-between mb-3">
                  <div class="flex-1">
                    <h3 class="font-bold text-base">{category.name}</h3>
                    <p class="text-xs text-base-content/60">Current: {category.percentage}%</p>
                  </div>
                  <div class="text-right">
                    <div class="text-lg font-bold">{customPercent.toFixed(1)}%</div>
                    <div class="text-xs text-base-content/60">${customAmount.toFixed(0)}B</div>
                    {#if isDifferent}
                      <div
                        class={`text-xs font-semibold mt-1 ${
                          diff > 0 ? 'text-success' : 'text-error'
                        }`}
                      >
                        {diff > 0 ? '+' : ''}{diff.toFixed(1)}% ({diffDollars > 0 ? '+' : ''}${diffDollars.toFixed(0)}B)
                      </div>
                    {/if}
                  </div>
                </div>

                <!-- Slider -->
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="0.1"
                  value={customPercent}
                  on:input={(e) => {
                    const value = parseFloat(e.currentTarget.value);
                    handleSliderChange(category.id, value);
                  }}
                  aria-label="Adjust {category.name} allocation"
                  class="range range-sm w-full"
                />

                <!-- Amount Display -->
                <div class="flex justify-between text-xs text-base-content/60 mt-2">
                  <span>0%</span>
                  <span>30%</span>
                </div>
              </div>
            {/each}
          </div>

          <!-- Action Buttons -->
          <div class="divider my-4" />
          <div class="flex gap-3 flex-wrap">
            <button
              on:click={handleReset}
              class="btn btn-outline btn-sm"
            >
              ↻ Reset to Current
            </button>
            <button
              on:click={handleSave}
              class="btn btn-primary btn-sm"
            >
              💾 Save This Budget
            </button>
            {#if saveMessage}
              <div class="alert alert-success alert-sm flex-1">
                <span>{saveMessage}</span>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="space-y-4">
      <!-- Custom Budget Pie Chart -->
      <div class="card bg-base-200 shadow-md">
        <div class="card-body">
          <h3 class="card-title text-base">Your Budget Allocation</h3>
          <canvas bind:this={chartCanvas} />
        </div>
      </div>

      <!-- Comparison Stats -->
      <div class="card bg-base-200 shadow-md">
        <div class="card-body">
          <h3 class="card-title text-base">Quick Stats</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span>Total Budget</span>
              <span class="font-bold">${budget.totalBudget}B</span>
            </div>
            <div class="divider my-1" />
            <div class="flex justify-between">
              <span>Categories Changed</span>
              <span class="font-bold">
                {budget.categories.filter((c) =>
                  Math.abs(getDifference(c.id)) > 0.1
                ).length}
              </span>
            </div>
            <div class="flex justify-between">
              <span>Largest Increase</span>
              <span class="font-bold text-success">
                {(() => {
                  const diffs = budget.categories.map((c) => ({
                    name: c.name,
                    diff: getDifference(c.id)
                  }));
                  const largest = diffs.reduce((a, b) =>
                    a.diff > b.diff ? a : b
                  );
                  return largest.diff > 0
                    ? `+${largest.diff.toFixed(1)}%`
                    : 'None';
                })()}
              </span>
            </div>
            <div class="flex justify-between">
              <span>Largest Decrease</span>
              <span class="font-bold text-error">
                {(() => {
                  const diffs = budget.categories.map((c) => ({
                    name: c.name,
                    diff: getDifference(c.id)
                  }));
                  const largest = diffs.reduce((a, b) =>
                    a.diff < b.diff ? a : b
                  );
                  return largest.diff < 0
                    ? `${largest.diff.toFixed(1)}%`
                    : 'None';
                })()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Comparison Chart -->
  <div class="card bg-base-200 shadow-md">
    <div class="card-body">
      <h2 class="card-title mb-4">Current vs Your Custom Budget</h2>
      <div class="max-h-96 overflow-x-auto">
        <canvas bind:this={comparisonChartCanvas} />
      </div>
    </div>
  </div>

  <!-- Detailed Comparison Table -->
  <div class="card bg-base-200 shadow-md">
    <div class="card-body">
      <h2 class="card-title mb-4">Detailed Breakdown</h2>
      <div class="overflow-x-auto">
        <table class="table table-zebra w-full text-sm">
          <thead>
            <tr>
              <th>Category</th>
              <th class="text-right">Current %</th>
              <th class="text-right">Your %</th>
              <th class="text-right">Change</th>
              <th class="text-right">Current ($B)</th>
              <th class="text-right">Your ($B)</th>
              <th class="text-right">Difference</th>
            </tr>
          </thead>
          <tbody>
            {#each budget.categories as category (category.id)}
              {@const customPercent = customBudgetState.allocations[category.id] || 0}
              {@const currentAmount = getCurrentDollarAmount(category.id)}
              {@const customAmount = getDollarAmount(category.id)}
              {@const diff = getDifference(category.id)}
              {@const diffDollars = getDifferenceDollars(category.id)}
              {@const isDifferent = Math.abs(diff) > 0.1}

              <tr class={isDifferent ? 'bg-base-100' : ''}>
                <td class="font-semibold">{category.name}</td>
                <td class="text-right">{category.percentage.toFixed(1)}%</td>
                <td class="text-right font-bold">{customPercent.toFixed(1)}%</td>
                <td class="text-right">
                  {#if isDifferent}
                    <span class={diff > 0 ? 'text-success' : 'text-error'}>
                      {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
                    </span>
                  {:else}
                    <span class="text-base-content/50">—</span>
                  {/if}
                </td>
                <td class="text-right">${currentAmount.toFixed(1)}B</td>
                <td class="text-right font-bold">${customAmount.toFixed(1)}B</td>
                <td class="text-right">
                  {#if isDifferent}
                    <span class={diffDollars > 0 ? 'text-success' : 'text-error'}>
                      {diffDollars > 0 ? '+' : ''}{diffDollars.toFixed(1)}B
                    </span>
                  {:else}
                    <span class="text-base-content/50">—</span>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
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
      /></svg>
    <div>
      <h3 class="font-bold">How it works</h3>
      <div class="text-sm">
        Adjust the sliders to change spending allocations. Your total allocation must equal 100%.
        The system will automatically rebalance other categories if needed. Click "Save This Budget"
        to store your scenario locally.
      </div>
    </div>
  </div>
</div>

<style>
  :global(.progress.progress-primary::-webkit-progress-value) {
    background-color: hsl(var(--p) / var(--tw-text-opacity, 1));
  }
</style>
