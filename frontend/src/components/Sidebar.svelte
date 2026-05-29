<script>
  // Svelte 5 reactive props syntax
  let { 
    sessions = [], 
    activeSessionId = null, 
    onSelectSession, 
    onNewChat,
    onDeleteSession 
  } = $props();

  // Search filter local state
  let searchQuery = $state('');

  // Filtered sessions list derived from search query
  let filteredSessions = $derived(
    searchQuery.trim() === '' 
      ? sessions 
      : sessions.filter(s => s.topic.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Format date helper
  function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
</script>

<aside class="w-72 h-screen flex flex-col bg-obsidian-900 border-r border-obsidian-800 text-obsidian-200">
  
  <!-- Sidebar Header & New Chat Button -->
  <div class="p-4 flex flex-col gap-3">
    <div class="flex items-center gap-2 px-2 py-1">
      <!-- Socratic Owl Logo -->
      <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-socratic-indigo to-socratic-violet flex items-center justify-center shadow-lg shadow-socratic-violet/20">
        <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/>
        </svg>
      </div>
      <div>
        <h1 class="text-md font-bold tracking-tight text-white leading-none">SocratesLink</h1>
        <span class="text-xs text-obsidian-400 font-medium">徳のある学習</span>
      </div>
    </div>

    <!-- "New Chat" Button -->
    <button
      onclick={onNewChat}
      class="w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-200
             bg-gradient-to-r from-socratic-indigo/10 to-socratic-violet/10 border border-socratic-violet/30 hover:border-socratic-violet/60 text-socratic-purple
             hover:bg-gradient-to-r hover:from-socratic-indigo/20 hover:to-socratic-violet/20 hover:shadow-lg hover:shadow-socratic-violet/5 active:scale-[0.98]"
    >
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      新しいソクラテス対話
    </button>
    
    <!-- Local Session Search Bar -->
    <div class="relative mt-1">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="セッションを検索..."
        class="w-full text-xs py-2 pl-8 pr-4 rounded-lg bg-obsidian-850 border border-obsidian-800 text-obsidian-200 placeholder-obsidian-500 focus:outline-none focus:border-socratic-violet/40 focus:bg-obsidian-950 transition-all"
      />
      <svg class="w-3.5 h-3.5 text-obsidian-500 absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
  </div>

  <!-- Session List Area -->
  <div class="flex-1 overflow-y-auto px-3 py-1 flex flex-col gap-1.5 scrollbar-thin">
    <div class="text-[10px] uppercase font-bold tracking-wider text-obsidian-500 px-3 mb-1">
      ソクラテス・ヒストリー
    </div>
    
    {#if filteredSessions.length === 0}
      <div class="text-xs text-obsidian-500 px-3 py-4 italic text-center">
        {searchQuery ? '一致するセッションはありません' : '過去のセッションはありません'}
      </div>
    {:else}
      {#each filteredSessions as session (session.sessionId)}
        <div 
          class="group relative flex items-center justify-between rounded-xl p-3 border text-left cursor-pointer transition-all duration-200
                 {session.sessionId === activeSessionId 
                   ? 'glass bg-gradient-to-r from-socratic-violet/10 to-transparent border-socratic-violet/30 text-white' 
                   : 'border-transparent hover:bg-obsidian-850 hover:text-obsidian-100 text-obsidian-300'}"
          onclick={() => onSelectSession(session.sessionId)}
        >
          <!-- Session Left Content (Icon & Text) -->
          <div class="flex items-start gap-2.5 overflow-hidden w-full pr-6">
            <div class="flex-shrink-0 mt-0.5">
              <svg class="w-4 h-4 {session.sessionId === activeSessionId ? 'text-socratic-purple' : 'text-obsidian-500'}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div class="overflow-hidden">
              <h4 class="text-xs font-semibold truncate leading-tight">{session.topic}</h4>
              <p class="text-[10px] text-obsidian-500 font-medium truncate mt-0.5">
                {formatDate(session.createdAt)}
              </p>
            </div>
          </div>

          <!-- Quick Action: Delete Session -->
          <button
            onclick={(e) => {
              e.stopPropagation();
              onDeleteSession(session.sessionId);
            }}
            class="absolute right-2 opacity-0 group-hover:opacity-100 text-obsidian-500 hover:text-red-400 p-1 rounded hover:bg-obsidian-750 transition-all focus:outline-none"
            title="セッションを削除"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      {/each}
    {/if}
  </div>

  <!-- User Profile Section at Bottom -->
  <div class="p-4 border-t border-obsidian-800 bg-obsidian-950/40">
    <div class="glass flex items-center gap-3 p-3 rounded-2xl border border-white/5 shadow-inner">
      <div class="w-9 h-9 rounded-xl bg-obsidian-800 border border-obsidian-700 flex items-center justify-center relative overflow-hidden flex-shrink-0">
        <!-- Student Avatar Emoji / Icon -->
        <span class="text-lg">🧑‍🎓</span>
        <div class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-obsidian-900"></div>
      </div>
      <div class="overflow-hidden">
        <h4 class="text-xs font-bold text-white leading-none">ソクラテス学生</h4>
        <span class="text-[10px] text-socratic-cyan font-bold tracking-wide uppercase mt-1 inline-block">批判的思考中</span>
      </div>
    </div>
  </div>
  
</aside>
