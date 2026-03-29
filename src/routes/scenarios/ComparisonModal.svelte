<script lang="ts">
  import { onMount } from 'svelte';
  import type { UserScenario, Budget } from '$types';
  import Chart from 'chart.js/auto';

  interface Props {
    scenario1: UserScenario;
    scenario2: UserScenario;
    budget: Budget;
    onClose: () => void;
  }

  const { scenario1, scenario2, budget, onClose }: Props = $props();

  let chartCanvas: HTMLCanvasElement;
  let chartInstance: Chart;

  onMount(() => {
    updateComparisonChart();

    return () => {
      if (chartInstance) chartInstance.destroy();
    };
  });

  function updateComparisonChart() {
    if (!chartCanvas) return;

    if (chartInstance) {
      chartInstance.destroy();
    }

    const labels = budget.categories.map((c) => c.name);
    const data1 = budget.categories.map(
      (c) => scenario1.budgetAllocations[c.id] || c.percentage
    );
    const data2 = budget.categories.map(
      (c) => scenario2.budgetAllocations[c.id] || c.percentage
    );

    chartInstance = new Chart(chartCanvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: scenario1.name,
            data: data1,
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1
          },
          {
            label: scenario2.name,
            data: data2,
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

  function getDifference(categoryId: string): number {
    const val1 = scenario1.budgetAllocations[categoryId] || 0;
    const val2 = scenario2.budgetAllocations[categoryId] || 0;
    return val2 - val1;
  }

  function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
</script>

<div class="modal modal-open">
  <div class="modal-box modal-lg max-w-4xl">
    <!-- Header -->
    <h3 class="font-bold text-xl mb-4">Scenario Comparison</h3>

    <!-- Scenario Info -->
    <div class="grid grid-cols-2 gap-4 mb-6 p-4 bg-base-200 rounded-lg">
      <div>
        <h4 class="font-semibold text-sm mb-2">{scenario1.name}</h4>
        <p class="text-xs text-base-content/60">
          Created: {formatDate(scenario1.createdAt)}
        </p>
      </div>
      <div>
        <h4 class="font-semibold text-sm mb-2">{scenario2.name}</h4>
        <p class="text-xs text-base-content/60">
          Created: {formatDate(scenario2.createdAt)}
        </p>
      </div>
    </div>

    <!-- Chart -->
    <div class="mb-6 p-4 bg-base-100 rounded-lg">
      <h4 class="font-semibold text-sm mb-3">Budget Allocation Comparison</h4>
      <canvas bind:this={chartCanvas} />
    </div>

    <!-- Detailed Comparison Table -->
    <div class="mb-6 overflow-x-auto">
      <h4 class="font-semibold text-sm mb-3">Category Differences</h4>
      <table class="table table-sm table-zebra w-full">
        <thead>
          <tr class="text-xs">
            <th>Category</th>
            <th class="text-right">{scenario1.name}</th>
            <th class="text-right">{scenario2.name}</th>
            <th class="text-right">Difference</th>
          </tr>
        </thead>
        <tbody>
          {#each budget.categories as category (category.id)}
            {@const val1 = scenario1.budgetAllocations[category.id] || category.percentage}
            {@const val2 = scenario2.budgetAllocations[category.id] || category.percentage}
            {@const diff = getDifference(category.id)}
            {@const isDifferent = Math.abs(diff) > 0.1}

            <tr class={isDifferent ? 'bg-base-100' : ''}>
              <td class="font-semibold text-xs">{category.name}</td>
              <td class="text-right text-xs">{val1.toFixed(1)}%</td>
              <td class="text-right text-xs">{val2.toFixed(1)}%</td>
              <td class="text-right text-xs">
                {#if isDifferent}
                  <span class={diff > 0 ? 'text-success' : 'text-error'}>
                    {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
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

    <!-- Close Button -->
    <div class="modal-action">
      <button onclick={onClose} class="btn btn-primary">Close</button>
    </div>
  </div>
  <div
    class="modal-backdrop"
    onclick={onClose}
    role="button"
    tabindex="-1"
  ></div>
</div>
