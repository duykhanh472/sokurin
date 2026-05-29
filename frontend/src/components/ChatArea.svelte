<script>
  // Svelte 5 runes for props
  let { messages = [], topic = '', isGenerating = false } = $props();

  let chatContainer = $state(null);

  // Custom Socratic markdown-to-html renderer
  function formatMessageContent(text) {
    if (!text) return '';
    
    // Escape standard characters for XSS prevention
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // 1. Math formulas standard superscript replacement: a^2 + b^2 = c^2
    html = html.replace(/([a-zA-Z0-9\)])\^([a-zA-Z0-9\+\-\=]+)/g, '$1<sup class="text-[10px] text-socratic-cyan font-bold font-sans">$2</sup>');
    
    // 2. Bold tags: **bold**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white glow-text-violet">$1</strong>');
    
    // 3. Inline code blocks: `code`
    html = html.replace(/`(.*?)`/g, '<code class="bg-obsidian-900 text-socratic-cyan px-1.5 py-0.5 rounded border border-white/5 font-mono text-[11px] font-semibold">$1</code>');
    
    // 4. Line list items: "- text"
    html = html.replace(/^\s*[-*]\s+(.*?)$/gm, '<li class="ml-4 list-disc text-obsidian-200 mt-1">$1</li>');

    // 5. Line breaks
    html = html.replace(/\n/g, '<br/>');

    return html;
  }

  // Svelte 5 automatic scrolling effect using $effect
  $effect(() => {
    // Whenever messages change or generative states trigger, scroll to bottom
    if (messages.length || isGenerating) {
      setTimeout(() => {
        if (chatContainer) {
          chatContainer.scrollTo({
            top: chatContainer.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 50);
    }
  });
</script>

<div class="flex-1 flex flex-col min-h-0 bg-obsidian-950/30">
  
  <!-- Topic Header Bar -->
  <header class="h-16 border-b border-obsidian-850 px-6 flex items-center justify-between bg-obsidian-900/60 backdrop-blur-md z-10 flex-shrink-0">
    <div class="flex items-center gap-3 overflow-hidden">
      <div class="w-2.5 h-2.5 rounded-full bg-socratic-violet animate-pulse shadow-md shadow-socratic-violet/50 flex-shrink-0"></div>
      <div class="overflow-hidden">
        <h3 class="text-sm font-bold text-white truncate leading-none">{topic}</h3>
        <span class="text-[10px] text-obsidian-400 font-medium mt-1 inline-block">ソクラテス的対話</span>
      </div>
    </div>
    
    <div class="flex items-center gap-2">
      <!-- Session Meta Info -->
      <span class="text-[10px] font-bold text-socratic-cyan border border-socratic-cyan/20 bg-socratic-cyan/5 px-2 py-0.5 rounded-full">
        アクティブなソクラテス的ループ
      </span>
    </div>
  </header>

  <!-- Message Stream -->
  <div 
    bind:this={chatContainer}
    class="flex-grow overflow-y-auto px-6 py-8 flex flex-col gap-6 scrollbar-thin"
  >
    {#each messages as msg}
      <div class="flex w-full {msg.role === 'user' ? 'justify-end' : 'justify-start'}">
        
        <div class="flex items-start gap-3.5 max-w-[80%] {msg.role === 'user' ? 'flex-row-reverse' : ''}">
          
          <!-- Avatar -->
          <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-md
                      {msg.role === 'user' 
                        ? 'bg-obsidian-850 border-obsidian-700' 
                        : 'bg-gradient-to-br from-socratic-indigo to-socratic-violet border-socratic-violet/40'}"
          >
            {#if msg.role === 'user'}
              <span class="text-sm">🧑‍🎓</span>
            {:else}
              <!-- Philosopher Owl Avatar Emoji -->
              <span class="text-sm">🦉</span>
            {/if}
          </div>

          <!-- Message bubble and content -->
          <div class="flex flex-col gap-1">
            
            <!-- Message Info -->
            <span class="text-[10px] text-obsidian-500 font-semibold uppercase tracking-wider px-1 {msg.role === 'user' ? 'text-right' : 'text-left'}">
              {msg.role === 'user' ? '学生' : 'ソクラテス的ガイド'}
            </span>

            <div 
              class="rounded-2xl px-5 py-3.5 text-sm leading-relaxed border shadow-sm
                     {msg.role === 'user'
                       ? 'bg-obsidian-800/80 border-obsidian-750 text-obsidian-100 rounded-tr-none'
                       : 'glass border-socratic-violet/20 text-obsidian-100 rounded-tl-none glow-violet'}"
            >
              <div class="break-words select-text">
                <!-- Render formatted HTML -->
                {@html formatMessageContent(msg.content)}
              </div>
            </div>
            
          </div>
          
        </div>
      </div>
    {/each}

    <!-- Generating/Typing State -->
    {#if isGenerating}
      <div class="flex w-full justify-start">
        <div class="flex items-start gap-3.5 max-w-[80%]">
          
          <!-- Avatar -->
          <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border border-socratic-violet/40 bg-gradient-to-br from-socratic-indigo to-socratic-violet shadow-md">
            <span class="text-sm">🦉</span>
          </div>

          <div class="flex flex-col gap-1">
            <span class="text-[10px] text-obsidian-500 font-semibold uppercase tracking-wider px-1">
              ソクラテス的ガイド
            </span>
            
            <!-- Typing Indicator Bubble -->
            <div class="glass border-socratic-violet/20 rounded-2xl rounded-tl-none px-5 py-4 flex items-center justify-center gap-1.5 glow-violet">
              <div class="w-2 h-2 rounded-full bg-socratic-purple animate-bounce" style="animation-delay: 0ms"></div>
              <div class="w-2 h-2 rounded-full bg-socratic-indigo animate-bounce" style="animation-delay: 150ms"></div>
              <div class="w-2 h-2 rounded-full bg-socratic-cyan animate-bounce" style="animation-delay: 300ms"></div>
            </div>
          </div>
          
        </div>
      </div>
    {/if}
  </div>
  
</div>
