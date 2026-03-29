<script lang="ts">
  import { scenariosStore } from '$lib/scenariosStore';
  import type { UserScenario } from '$types';

  interface Props {
    currentBudgetAllocations: Record<string, number>;
    appliedProposalIds?: string[];
    onClose: () => void;
    onSaved?: (scenario: UserScenario) => void;
  }

  const { currentBudgetAllocations, appliedProposalIds = [], onClose, onSaved }: Props = $props();

  let name = $state('');
  let description = $state('');
  let error = $state('');
  let isSaving = $state(false);

  function handleSave() {
    // Validate input
    if (!name.trim()) {
      error = 'Please enter a scenario name';
      return;
    }

    isSaving = true;
    error = '';

    try {
      const now = new Date();
      const newScenario: Omit<UserScenario, 'id' | 'createdAt' | 'updatedAt'> = {
        name: name.trim(),
        description: description.trim() || undefined,
        budgetAllocations: currentBudgetAllocations,
        appliedProposals: appliedProposalIds
      };

      scenariosStore.createScenario(newScenario);

      // Call optional callback
      if (onSaved) {
        // Get the created scenario from the store
        let savedScenario: UserScenario | undefined;
        const unsubscribe = scenariosStore.subscribe((state) => {
          savedScenario = state.scenarios[state.scenarios.length - 1];
        });
        unsubscribe();

        if (savedScenario) {
          onSaved(savedScenario);
        }
      }

      onClose();
    } catch (e) {
      error = `Failed to save scenario: ${(e as Error).message}`;
    } finally {
      isSaving = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !isSaving) {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }
</script>

<div class="modal modal-open">
  <div class="modal-box w-full max-w-sm">
    <h3 class="font-bold text-lg mb-4">💾 Save As Scenario</h3>

    <!-- Form -->
    <div class="space-y-4">
      <!-- Name Input -->
      <div class="form-control">
        <label class="label" for="scenario-name">
          <span class="label-text font-semibold">Scenario Name *</span>
        </label>
        <input
          id="scenario-name"
          type="text"
          placeholder="e.g., 'Healthcare Focus 2024'"
          class="input input-bordered"
          bind:value={name}
          onkeydown={handleKeydown}
          disabled={isSaving}
          aria-required="true"
        />
      </div>

      <!-- Description Input -->
      <div class="form-control">
        <label class="label" for="scenario-description">
          <span class="label-text font-semibold">Description (optional)</span>
        </label>
        <textarea
          id="scenario-description"
          placeholder="Add notes about this scenario..."
          class="textarea textarea-bordered resize-none"
          rows="3"
          bind:value={description}
          onkeydown={handleKeydown}
          disabled={isSaving}
        ></textarea>
      </div>

      <!-- Error Message -->
      {#if error}
        <div class="alert alert-error alert-sm">
          <span>{error}</span>
        </div>
      {/if}
    </div>

    <!-- Actions -->
    <div class="modal-action mt-6">
      <button
        onclick={onClose}
        class="btn btn-outline"
        disabled={isSaving}
      >
        Cancel
      </button>
      <button
        onclick={handleSave}
        class="btn btn-primary"
        disabled={isSaving || !name.trim()}
      >
        {#if isSaving}
          <span class="loading loading-spinner loading-sm"></span>
          Saving...
        {:else}
          Save Scenario
        {/if}
      </button>
    </div>
  </div>
  <div
    class="modal-backdrop"
    onclick={onClose}
    role="button"
    tabindex="-1"
  ></div>
</div>
