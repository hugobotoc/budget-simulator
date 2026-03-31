<script lang="ts">
  import type { UserScenario, Budget } from '$types';

  interface Props {
    scenarios: UserScenario[];
    mockBudget: Budget;
  }

  let { scenarios, mockBudget }: Props = $props();

  interface ComparisonRow {
    name: string;
    id: string;
    original: number;
    [key: string]: unknown;
  }

  // Derive comparison data
  const comparisonRows = $derived<ComparisonRow[]>(
    mockBudget.categories.map((cat) => {
      const row: ComparisonRow = { name: cat.name, id: cat.id, original: cat.amount };

      for (const scenario of scenarios) {
        const amount = scenario.budgetAllocations[cat.id] || 0;
        row[`scenario-${scenario.id}`] = amount;
        row[`diff-${scenario.id}`] = amount - cat.amount;
      }

      return row;
    })
  );

  // Derive totals
  const totals = $derived.by(() => {
    const totalsMap: Record<string, number> = { original: mockBudget.totalBudget };

    for (const scenario of scenarios) {
      const total = Object.values(scenario.budgetAllocations).reduce((a, b) => a + b, 0);
      totalsMap[`scenario-${scenario.id}`] = total;
    }

    return totalsMap;
  });
</script>

<div class="space-y-6">
  <!-- Detailed Comparison Table -->
  <div class="overflow-x-auto">
    <table class="table table-sm table-zebra w-full text-xs md:text-sm">
      <thead>
        <tr>
          <th>Category</th>
          <th class="text-right">Original</th>
          {#each scenarios as scenario}
            <th class="text-right">{scenario.name}</th>
            <th class="text-right">vs Original</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each comparisonRows as row}
          <tr class="hover">
            <td class="font-medium">{row.name}</td>
            <td class="text-right">${row.original}B</td>
            {#each scenarios as scenario}
              {@const amount = (row[`scenario-${scenario.id}`] ?? 0) as number}
              {@const diff = (row[`diff-${scenario.id}`] ?? 0) as number}
              <td class="text-right font-semibold">${amount.toFixed(1)}B</td>
              <td class={`text-right font-bold ${diff > 0 ? 'text-error' : diff < 0 ? 'text-success' : ''}`}>
                {diff > 0 ? '+' : ''}{diff.toFixed(1)}B
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
      <tfoot>
        <tr class="font-bold bg-base-200">
          <td>TOTAL</td>
          <td class="text-right">${totals['original']}B</td>
          {#each scenarios as scenario}
            {@const total = totals[`scenario-${scenario.id}`]}
            <td class="text-right">${total.toFixed(1)}B</td>
            <td class="text-right">
              {(total - mockBudget.totalBudget > 0 ? '+' : '')}{(total - mockBudget.totalBudget).toFixed(1)}B
            </td>
          {/each}
        </tr>
      </tfoot>
    </table>
  </div>

  <!-- Visual Comparison -->
  <div>
    <h3 class="font-bold text-lg mb-4">Visual Breakdown</h3>
    <div class="space-y-4">
      {#each comparisonRows as row}
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="font-medium text-sm">{row.name}</span>
            <span class="text-xs text-base-content/60">
              Original: ${(row.original as number)}B
            </span>
          </div>
          <div class="flex gap-1 h-8">
            <!-- Original bar -->
            <div
              class="bg-base-300 rounded flex-shrink-0"
              style="width: {((row.original as number) / mockBudget.totalBudget) * 100}%"
            ></div>
            <!-- Scenario bars -->
            {#each scenarios as scenario, idx}
              {@const amount = (row[`scenario-${scenario.id}`] ?? 0) as number}
              <div
                class="rounded flex-shrink-0 opacity-70"
                style="
                  background-color: hsl({idx * (360 / scenarios.length)}, 70%, 50%);
                  width: {(amount / mockBudget.totalBudget) * 100}%;
                "
                title="{scenario.name}: ${amount.toFixed(1)}B"
              ></div>
            {/each}
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
      {#each scenarios as scenario, idx}
        <div class="flex items-center gap-2">
          <div
            class="w-4 h-4 rounded"
            style="background-color: hsl({idx * (360 / scenarios.length)}, 70%, 50%); opacity: 0.7"
          ></div>
          <span>{scenario.name}</span>
        </div>
      {/each}
    </div>
  </div>

  <!-- Key Differences -->
  <div>
    <h3 class="font-bold text-lg mb-4">Largest Differences from Original</h3>
    <div class="space-y-4">
      {#each scenarios as scenario}
        <div class="card bg-base-200 shadow-sm">
          <div class="card-body p-4">
            <h4 class="font-semibold mb-3">{scenario.name}</h4>
            <div class="space-y-2">
              {#each comparisonRows
                .map((row) => {
                  const diff = (row[`diff-${scenario.id}`] ?? 0) as number;
                  return { name: row.name, diff };
                })
                .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
                .slice(0, 5) as item}
                <div class="flex justify-between items-center text-sm">
                  <span>{item.name}</span>
                  <span class={`font-bold ${item.diff > 0 ? 'text-error' : 'text-success'}`}>
                    {item.diff > 0 ? '+' : ''}{item.diff.toFixed(1)}B
                  </span>
                </div>
              {/each}
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
