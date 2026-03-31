<script lang="ts">
  import type { Category } from '$types';

  interface Props {
    category: Category;
    currentAmount: number;
    totalBudget: number;
    onchange: (amount: number) => void;
  }

  let { category, currentAmount, totalBudget, onchange }: Props = $props();

  const percentage = $derived((currentAmount / totalBudget) * 100);
  const change = $derived(currentAmount - category.amount);
  const changePercent = $derived(((change / category.amount) * 100).toFixed(1));
  const changeColor = $derived(change > 0 ? 'text-error' : change < 0 ? 'text-warning' : 'text-base-content');

  const handleSliderChange = (e: Event) => {
    const target = e.currentTarget as HTMLInputElement;
    onchange(parseFloat(target.value));
  };

  const handleInputChange = (e: Event) => {
    const target = e.currentTarget as HTMLInputElement;
    const value = parseFloat(target.value);
    if (!isNaN(value) && value >= 0) {
      onchange(value);
    }
  };
</script>

<div class="card bg-base-200 shadow-sm border border-base-300">
  <div class="card-body p-4 md:p-6">
    <!-- Category Header -->
    <div class="flex items-start justify-between gap-4 mb-4">
      <div class="flex-1 min-w-0">
        <h3 class="card-title text-sm md:text-base break-words">{category.name}</h3>
        <p class="text-xs text-base-content/60 mt-1">Current: ${category.amount}B</p>
      </div>
      <div
        class="w-8 h-8 rounded-full flex-shrink-0"
        style="background-color: {category.color || '#999'}"
        role="img"
        aria-label="{category.name} category color"
      ></div>
    </div>

    <!-- Amount Display & Input -->
    <div class="flex items-center gap-2 mb-4">
      <label class="label p-0" for="amount-{category.id}">
        <span class="label-text text-sm sr-only">Amount in billions</span>
      </label>
      <input
        id="amount-{category.id}"
        type="number"
        value={currentAmount}
        onchange={handleInputChange}
        class="input input-sm input-bordered w-24"
        step="0.1"
        min="0"
        aria-label="Amount for {category.name} in billions"
      />
      <span class="text-sm font-semibold">B</span>
      <span class={`text-sm font-bold ml-auto ${changeColor}`}>
        {change > 0 ? '+' : ''}{change.toFixed(1)}B ({changePercent}%)
      </span>
    </div>

    <!-- Slider -->
    <div class="flex items-center gap-4">
      <input
        type="range"
        class="range range-xs flex-grow"
        min="0"
        max={Math.max(totalBudget * 0.3, category.amount * 2)}
        step="0.1"
        value={currentAmount}
        onchange={handleSliderChange}
        aria-label="Adjust {category.name} allocation"
      />
    </div>

    <!-- Percentage Bar -->
    <div class="mt-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-semibold">Percentage of Total</span>
        <span class="text-xs font-bold text-primary">{percentage.toFixed(1)}%</span>
      </div>
      <progress
        class="progress progress-primary w-full"
        value={percentage}
        max="100"
        aria-label="{percentage.toFixed(1)}% of budget"
      ></progress>
    </div>
  </div>
</div>
