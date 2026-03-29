<script lang="ts">
  import '../app.css';
</script>

<div class="min-h-screen flex flex-col bg-base-100">
  <!-- Header -->
  <header class="bg-base-200 shadow-md">
    <div class="navbar max-w-7xl mx-auto px-4">
      <div class="flex-1">
        <a href="/" class="btn btn-ghost text-xl">📊 Budget Simulator</a>
      </div>
      <div class="flex-none gap-4">
        <nav class="hidden md:flex gap-4">
          <a href="/customize" class="btn btn-ghost btn-sm">Customize</a>
          <a href="/proposals" class="btn btn-ghost btn-sm">Proposals</a>
          <a href="/scenarios" class="btn btn-ghost btn-sm">Scenarios</a>
          <a href="/about" class="btn btn-ghost btn-sm">About</a>
        </nav>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
    <slot />
  </main>

  <!-- Footer -->
  <footer class="bg-base-200 text-center py-6 mt-12">
    <p class="text-sm text-base-content/60">
      Budget Simulator © 2024 — An interactive civic tool for election year
    </p>
  </footer>
</div>

<style global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>
