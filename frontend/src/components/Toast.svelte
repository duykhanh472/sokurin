<script>
  import { toastStore } from '../lib/toastStore.svelte.js';
</script>

<!-- Toast Container (Top Right Corner) -->
<div class="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
  {#each toastStore.list as toast (toast.id)}
    <div
      class="glass flex items-start p-4 rounded-xl shadow-2xl border-l-4 pointer-events-auto transition-all duration-300 transform
             {toast.isLeaving ? 'translate-x-full opacity-0 scale-95' : 'translate-x-0 opacity-100 scale-100 animate-fade-in-up'}
             {toast.type === 'warning' ? 'border-amber-500 shadow-amber-950/20 bg-obsidian-850/90' : ''}
             {toast.type === 'error' ? 'border-red-500 shadow-red-950/20 bg-obsidian-850/90' : ''}
             {toast.type === 'success' ? 'border-emerald-500 shadow-emerald-950/20 bg-obsidian-850/90' : ''}"
      role="alert"
    >
      <!-- Icon depending on type -->
      <div class="flex-shrink-0 mr-3 mt-0.5">
        {#if toast.type === 'warning'}
          <svg class="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        {:else if toast.type === 'error'}
          <svg class="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        {:else}
          <svg class="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        {/if}
      </div>

      <!-- Message Text -->
      <div class="flex-1 text-sm font-medium text-obsidian-100">
        <p class="leading-relaxed">{toast.message}</p>
      </div>

      <!-- Close Button -->
      <button
        onclick={() => toastStore.dismiss(toast.id)}
        class="ml-4 flex-shrink-0 text-obsidian-400 hover:text-obsidian-200 transition-colors focus:outline-none"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  {/each}
</div>
