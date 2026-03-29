<script lang="ts">
  import '../app.css';

  let mobileMenuOpen = $state(false);
</script>

<div class="min-h-screen flex flex-col bg-base-100">
  <!-- Semantic Header -->
  <header class="bg-base-200 shadow-md sticky top-0 z-40">
    <div class="navbar max-w-7xl mx-auto px-4">
      <div class="flex-1">
        <a href="/" class="btn btn-ghost text-lg md:text-xl font-bold" aria-label="Budget Simulator Home">
          📊 Budget Simulator
        </a>
      </div>
      
      <!-- Desktop Navigation -->
      <div class="flex-none gap-2 hidden md:flex">
        <nav class="flex gap-2" aria-label="Main Navigation">
          <a href="/customize" class="btn btn-ghost btn-sm" aria-label="Customize Budget">
            Customize
          </a>
          <a href="/proposals" class="btn btn-ghost btn-sm" aria-label="View Policy Proposals">
            Proposals
          </a>
          <a href="/scenarios" class="btn btn-ghost btn-sm" aria-label="View Saved Scenarios">
            Scenarios
          </a>
        </nav>
      </div>

      <!-- Mobile Menu Button -->
      <div class="flex-none md:hidden">
        <button
          class="btn btn-ghost btn-circle"
          aria-label="Toggle Mobile Menu"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            class="inline-block w-5 h-5 stroke-current"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Navigation Menu -->
    {#if mobileMenuOpen}
      <nav
        id="mobile-menu"
        class="md:hidden bg-base-100 border-t border-base-300 px-4 py-2 flex flex-col gap-2"
        aria-label="Mobile Navigation"
      >
        <a href="/customize" class="btn btn-ghost btn-block btn-sm" onclick={() => (mobileMenuOpen = false)}>
          Customize
        </a>
        <a href="/proposals" class="btn btn-ghost btn-block btn-sm" onclick={() => (mobileMenuOpen = false)}>
          Proposals
        </a>
        <a href="/scenarios" class="btn btn-ghost btn-block btn-sm" onclick={() => (mobileMenuOpen = false)}>
          Scenarios
        </a>
      </nav>
    {/if}
  </header>

  <!-- Main Content -->
  <main class="flex-1 w-full px-4 py-8">
    <div class="max-w-7xl mx-auto">
      <slot />
    </div>
  </main>

  <!-- Semantic Footer -->
  <footer class="bg-base-200 text-center py-6 mt-12 border-t border-base-300">
    <div class="max-w-7xl mx-auto px-4">
      <p class="text-sm text-base-content/60">
        Budget Simulator © 2024 — An interactive civic tool for election year
      </p>
    </div>
  </footer>
</div>

<style global>
  /* Enhanced focus indicators for accessibility */
  :focus-visible {
    outline: 2px solid hsl(var(--p));
    outline-offset: 2px;
  }

  button:focus-visible,
  a:focus-visible,
  input:focus-visible,
  select:focus-visible {
    outline: 2px solid hsl(var(--p));
    outline-offset: 2px;
  }
</style>
