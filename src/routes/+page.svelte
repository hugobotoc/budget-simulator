<script lang="ts">
  import { mockBudget } from '$data/mockBudget';
  import type { Category } from '$types';

  let selectedYear = $state(mockBudget.year);
  let selectedCategory = $state<Category | null>(null);

  const categories = $derived(mockBudget.categories);
  const totalBudget = $derived(mockBudget.totalBudget);
</script>

<svelte:head>
  <title>Budget Simulator — Explore Government Spending</title>
</svelte:head>

<div class="space-y-8">
  <!-- Hero -->
  <div class="hero bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg text-white">
    <div class="hero-content text-center py-12">
      <div>
        <h1 class="text-4xl font-bold mb-4">Explore Your Government's Budget</h1>
        <p class="text-lg opacity-90 mb-6">
          Understand spending priorities. Customize allocations. Simulate policy impact.
        </p>
        <div class="flex gap-4 justify-center">
          <a href="/customize" class="btn btn-primary">Build Your Budget</a>
          <a href="/proposals" class="btn btn-outline btn-white">Explore Proposals</a>
        </div>
      </div>
    </div>
  </div>

  <!-- Current Budget Overview -->
  <div class="card bg-base-200 shadow-lg">
    <div class="card-body">
      <div class="card-title flex items-center justify-between">
        <h2>Current Budget: {selectedYear}</h2>
        <select
          bind:value={selectedYear}
          class="select select-bordered select-sm max-w-xs"
        >
          <option value={2024}>2024</option>
          <option value={2023}>2023</option>
          <option value={2022}>2022</option>
        </select>
      </div>

      <div class="divider my-2"></div>

      <!-- Budget Summary -->
      <div class="stats shadow w-full mb-6">
        <div class="stat">
          <div class="stat-title">Total Budget</div>
          <div class="stat-value text-2xl">${totalBudget.toLocaleString()}B</div>
          <div class="stat-desc">{mockBudget.currency}</div>
        </div>
        <div class="stat">
          <div class="stat-title">Categories</div>
          <div class="stat-value text-2xl">{categories.length}</div>
          <div class="stat-desc">spending areas</div>
        </div>
      </div>

      <!-- Categories Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each categories as category (category.id)}
          <button
            on:click={() => (selectedCategory = category)}
            class="card bg-base-100 hover:shadow-md cursor-pointer transition-all"
          >
            <div class="card-body p-4">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="card-title text-sm font-bold">{category.name}</h3>
                  <p class="text-2xl font-bold text-primary">${category.amount}B</p>
                  <p class="text-xs text-base-content/60">{category.percentage}% of budget</p>
                </div>
                <div
                  class="w-12 h-12 rounded-full"
                  style="background-color: {category.color || '#999'}"
                />
              </div>
            </div>
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Category Detail Modal -->
  {#if selectedCategory}
    <div class="modal modal-open">
      <div class="modal-box max-w-2xl">
        <button
          on:click={() => (selectedCategory = null)}
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          ✕
        </button>
        <h3 class="font-bold text-lg mb-4">{selectedCategory.name}</h3>

        <div class="space-y-4">
          <div class="stats shadow w-full">
            <div class="stat">
              <div class="stat-title">Amount</div>
              <div class="stat-value">${selectedCategory.amount}B</div>
            </div>
            <div class="stat">
              <div class="stat-title">Percentage</div>
              <div class="stat-value">{selectedCategory.percentage}%</div>
            </div>
          </div>

          {#if selectedCategory.trend}
            <div class="p-4 bg-base-100 rounded-lg">
              <h4 class="font-bold mb-3">5-Year Trend</h4>
              <div class="space-y-2">
                {#each selectedCategory.trend as point}
                  <div class="flex items-center gap-2">
                    <span class="w-12 text-sm">{point.year}</span>
                    <div class="flex-1 bg-base-200 rounded h-4 overflow-hidden">
                      <div
                        class="bg-primary h-full"
                        style="width: {(point.amount / selectedCategory.amount) * 100}%"
                      />
                    </div>
                    <span class="w-16 text-right text-sm">${point.amount}B</span>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          {#if selectedCategory.subcategories}
            <div class="p-4 bg-base-100 rounded-lg">
              <h4 class="font-bold mb-3">Breakdown</h4>
              <div class="space-y-2">
                {#each selectedCategory.subcategories as sub}
                  <div class="flex justify-between items-center text-sm">
                    <span>{sub.name}</span>
                    <span class="font-bold">${sub.amount}B</span>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>

        <div class="modal-action mt-6">
          <button
            on:click={() => (selectedCategory = null)}
            class="btn btn-outline"
          >
            Close
          </button>
        </div>
      </div>
      <div on:click={() => (selectedCategory = null)} class="modal-backdrop" />
    </div>
  {/if}

  <!-- Info Cards -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="card bg-base-200 shadow-md">
      <div class="card-body">
        <h3 class="card-title text-lg">Start Customizing</h3>
        <p class="text-sm text-base-content/70">
          Create your own budget allocation. See how different spending priorities would affect
          the economy.
        </p>
        <div class="card-actions">
          <a href="/customize" class="btn btn-primary btn-sm">Build Budget</a>
        </div>
      </div>
    </div>
    <div class="card bg-base-200 shadow-md">
      <div class="card-body">
        <h3 class="card-title text-lg">Explore Proposals</h3>
        <p class="text-sm text-base-content/70">
          See how policy proposals would reshape government spending.
        </p>
        <div class="card-actions">
          <a href="/proposals" class="btn btn-primary btn-sm">View Proposals</a>
        </div>
      </div>
    </div>
  </div>
</div>
