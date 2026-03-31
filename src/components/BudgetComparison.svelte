<script lang="ts">
  import type { Budget } from '$types';

  interface Props {
    originalBudget: Budget;
    customBudget: Record<string, number>;
  }

  let { originalBudget, customBudget }: Props = $props();

  // Derive comparison data
  const comparisonData = $derived(
    originalBudget.categories.map((cat) => {
      const original = cat.amount;
      const custom = customBudget[cat.id] ?? original;
      const diff = custom - original;
      const diffPercent = original > 0 ? ((diff / original) * 100).toFixed(1) : '0';
      return {
        id: cat.id,
        name: cat.name,
        color: cat.color || '#999',
        original,
        custom,
        diff,
        diffPercent,
        diffIsIncrease: diff > 0
      };
    })
  );

  const totalOriginal = $derived(originalBudget.totalBudget);
  const totalCustom = $derived(Object.values(customBudget).reduce((a, b) => a + b, 0));
  const totalDiff = $derived(totalCustom - totalOriginal);
</script>

<section class="card bg-base-100 shadow-lg">
  <div class="card-body">
    <h2 class="card-title text-2xl mb-6">Budget Comparison</h2>

    <!-- Summary Stats -->
    <div class="stats shadow w-full mb-8 flex-col sm:flex-row">
      <div class="stat">
        <div class="stat-title">Original Total</div>
        <div class="stat-value text-lg md:text-2xl">${totalOriginal}B</div>
      </div>
      <div class="stat">
        <div class="stat-title">Your Custom Total</div>
        <div class="stat-value text-lg md:text-2xl">${totalCustom.toFixed(1)}B</div>
      </div>
      <div class="stat">
        <div class="stat-title">Difference</div>
        <div class={`stat-value text-lg md:text-2xl ${totalDiff > 0 ? 'text-error' : totalDiff < 0 ? 'text-warning' : 'text-success'}`}>
          {totalDiff > 0 ? '+' : ''}{totalDiff.toFixed(1)}B
        </div>
      </div>
    </div>

    <!-- Comparison Table -->
    <div class="overflow-x-auto">
      <table class="table table-sm table-zebra w-full text-xs md:text-sm">
        <thead>
          <tr>
            <th>Category</th>
            <th class="text-right">Original</th>
            <th class="text-right">Your Budget</th>
            <th class="text-right">Change</th>
            <th class="text-right">% Change</th>
          </tr>
        </thead>
        <tbody>
          {#each comparisonData as item (item.id)}
            <tr class="hover">
              <td>
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full flex-shrink-0" style="background-color: {item.color}"></div>
                  <span class="font-medium">{item.name}</span>
                </div>
              </td>
              <td class="text-right">${item.original.toFixed(1)}B</td>
              <td class="text-right font-semibold">${item.custom.toFixed(1)}B</td>
              <td class={`text-right font-bold ${item.diffIsIncrease ? 'text-error' : item.diff < 0 ? 'text-warning' : 'text-success'}`}>
                {item.diff > 0 ? '+' : ''}{item.diff.toFixed(1)}B
              </td>
              <td class={`text-right font-bold ${item.diffIsIncrease ? 'text-error' : item.diff < 0 ? 'text-warning' : 'text-success'}`}>
                {item.diffPercent}%
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Comparison Charts (Simple Bar View) -->
    <div class="mt-8">
      <h3 class="text-lg font-bold mb-4">Visual Comparison</h3>
      <div class="space-y-3">
        {#each comparisonData as item (item.id)}
          <div>
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium">{item.name}</span>
              <span class="text-xs text-base-content/60">${item.original}B → ${item.custom.toFixed(1)}B</span>
            </div>
            <div class="flex gap-1">
              <!-- Original Budget Bar -->
              <div
                class="h-6 rounded-sm bg-base-300 flex-shrink-0"
                style="width: {(item.original / totalOriginal) * 100}%; min-width: 2px"
                role="presentation"
              ></div>
              <!-- Custom Budget Bar -->
              <div
                class="h-6 rounded-sm flex-shrink-0"
                style="
                  background-color: {item.color};
                  opacity: 0.7;
                  width: {(item.custom / totalOriginal) * 100}%;
                  min-width: 2px;
                "
                role="presentation"
              ></div>
            </div>
          </div>
        {/each}
      </div>

      <!-- Legend -->
      <div class="flex flex-col sm:flex-row gap-4 mt-6 pt-4 border-t text-sm">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded bg-base-300"></div>
          <span>Original Budget</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded" style="background-color: rgba(0,0,0,0.2)"></div>
          <span>Your Custom Budget</span>
        </div>
      </div>
    </div>

    <!-- Largest Changes -->
    <div class="mt-8 pt-6 border-t">
      <h3 class="text-lg font-bold mb-4">Largest Changes</h3>
      <div class="space-y-2">
        {#each comparisonData
          .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
          .slice(0, 5) as item (item.id)}
          <div class="flex items-center justify-between p-2 bg-base-200 rounded">
            <span class="font-medium">{item.name}</span>
            <span class={`font-bold ${item.diffIsIncrease ? 'text-error' : 'text-warning'}`}>
              {item.diff > 0 ? '+' : ''}{item.diff.toFixed(1)}B ({item.diffPercent}%)
            </span>
          </div>
        {/each}
      </div>
    </div>
  </div>
</section>
