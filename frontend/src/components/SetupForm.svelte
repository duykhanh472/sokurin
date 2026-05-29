<script>
  // Svelte 5 runes syntax for props and state
  let { onSubmit, isLoading = false } = $props();

  let topic = $state('');
  let errorMsg = $state('');

  function handleSubmit(e) {
    e.preventDefault();
    errorMsg = '';

    if (!topic.trim()) {
      errorMsg = 'ソクラテス的なテーマまたは質問を入力してください。';
      return;
    }

    onSubmit(topic.trim());
  }

  // Pre-fill a sample to help users get started
  function loadSample(sampleTopic) {
    topic = sampleTopic;
  }
</script>

<div class="w-full max-w-xl mx-auto my-auto p-1 animate-fade-in-up">
  <div class="glass rounded-3xl p-8 border border-white/10 shadow-2xl glow-violet flex flex-col relative overflow-hidden">
    
    <!-- Design Background Glow -->
    <div class="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-socratic-violet/10 blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-socratic-cyan/10 blur-3xl pointer-events-none"></div>
    
    <div class="flex flex-col items-center text-center mb-8 relative">
      <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-socratic-indigo to-socratic-violet flex items-center justify-center shadow-xl shadow-socratic-violet/20 mb-4 animate-bounce-slow">
        <!-- Greek Pillar or Wisdom Symbol -->
        <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <h2 class="text-3xl font-extrabold text-white tracking-tight">ソクラテス・セッションを開始する</h2>
      <p class="text-obsidian-400 text-sm mt-2 max-w-sm leading-relaxed">
        テーマまたは謎を策定してください。私たちのAIソクラテス的ガイドは、学習チェックポイントを内部で確立し、段階的に解説を発見するようにあなたを導きます。
      </p>
    </div>

    <!-- Pre-fill Samples Grid -->
    <div class="mb-6 flex flex-col gap-2">
      <label class="text-xs font-bold text-obsidian-400 uppercase tracking-wider text-left">インスピレーションが必要ですか？</label>
      <div class="grid grid-cols-2 gap-3">
        <button
          type="button"
          onclick={() => loadSample('Pythagorean Theorem')}
          class="glass-input p-3.5 rounded-xl hover:border-socratic-violet/40 hover:bg-obsidian-850 transition-all text-xs text-center cursor-pointer"
        >
          <span class="font-semibold text-socratic-purple">Pythagorean Theorem</span>
        </button>
        <button
          type="button"
          onclick={() => loadSample('Photosynthesis')}
          class="glass-input p-3.5 rounded-xl hover:border-socratic-cyan/40 hover:bg-obsidian-850 transition-all text-xs text-center cursor-pointer"
        >
          <span class="font-semibold text-socratic-cyan">Photosynthesis</span>
        </button>
      </div>
    </div>

    <!-- Setup Form -->
    <form onsubmit={handleSubmit} class="flex flex-col gap-6">
      
      <!-- Topic Input -->
      <div class="flex flex-col gap-2 text-left">
        <label for="topic" class="text-xs font-bold text-obsidian-400 uppercase tracking-wider">
          学びたいテーマ / 解決したい課題
        </label>
        <input
          id="topic"
          type="text"
          bind:value={topic}
          disabled={isLoading}
          placeholder="例： なぜ空は青いのか"
          class="glass-input w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none"
        />
      </div>

      <!-- Error Message Banner -->
      {#if errorMsg}
        <div class="text-xs text-red-400 bg-red-950/20 border border-red-900/30 rounded-xl p-3 text-left animate-shake">
          {errorMsg}
        </div>
      {/if}

      <!-- Submit Button -->
      <button
        type="submit"
        disabled={isLoading}
        class="w-full mt-2 py-3.5 rounded-xl text-sm font-bold tracking-wide uppercase transition-all duration-300 cursor-pointer
               bg-gradient-to-r from-socratic-indigo to-socratic-violet hover:from-socratic-indigo hover:to-socratic-violet/85 text-white
               shadow-lg shadow-socratic-violet/20 hover:shadow-socratic-violet/40 disabled:opacity-50 disabled:cursor-not-allowed
               active:scale-[0.99] flex items-center justify-center gap-2"
      >
        {#if isLoading}
          <!-- Spinner -->
          <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          ソクラテス・エンジンを起動中...
        {:else}
          対話を開始する
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        {/if}
      </button>

    </form>
  </div>
</div>
