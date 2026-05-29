<script>
  import { toastStore } from '../lib/toastStore.svelte.js';

  // Svelte 5 runes for props
  let { onSubmit, disabled = false } = $props();

  let message = $state('');
  
  // Derived character count from message state
  let charCount = $derived(message.length);

  function submitMessage() {
    if (disabled || !message.trim()) return;
    
    // Hard limit validation just in case
    if (message.length > 500) {
      toastStore.show('メッセージが500文字の制限を超えています！', 'error');
      return;
    }
    
    onSubmit(message.trim());
    message = ''; // Reset input
  }

  // Handle Enter key submission (and Shift+Enter for new lines)
  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitMessage();
    }
  }

  // Allow paste functionality
  function handlePaste(e) {
    // Paste is now allowed - no prevention
  }
</script>

<div class="p-4 bg-gradient-to-t from-obsidian-950 to-transparent border-t border-obsidian-900 flex-shrink-0">
  <div class="max-w-3xl mx-auto flex flex-col gap-2 relative">
    
    <!-- Input Box Wrapper -->
    <div class="glass focus-within:border-socratic-violet/40 focus-within:ring-1 focus-within:ring-socratic-violet/30 rounded-2xl flex items-end p-2 px-3 transition-all duration-200 glow-cyan">
      
      <!-- Socratic Text Area -->
      <textarea
        bind:value={message}
        onkeydown={handleKeyDown}
        onpaste={handlePaste}
        maxlength="500"
        rows="2"
        disabled={disabled}
        placeholder="ここにあなたの考えや質問を入力してください..."
        class="flex-1 bg-transparent text-white border-0 text-sm focus:ring-0 focus:outline-none resize-none placeholder-obsidian-500 py-1.5 px-2 font-medium leading-relaxed max-h-32 scrollbar-thin"
      ></textarea>

      <!-- Submitter Actions -->
      <div class="flex items-center gap-3 ml-2 flex-shrink-0">
        
        <!-- Interactive Live Character Counter -->
        <span 
          class="text-xs font-bold font-mono transition-colors duration-200 select-none
                 {charCount >= 450 
                   ? 'text-rose-500 animate-pulse' 
                   : charCount >= 350 
                     ? 'text-amber-500' 
                     : 'text-obsidian-500'}"
        >
          {charCount}/500
        </span>

        <!-- Submit Button -->
        <button
          onclick={submitMessage}
          disabled={disabled || !message.trim()}
          class="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200
                 bg-gradient-to-r from-socratic-indigo to-socratic-violet hover:from-socratic-indigo hover:to-socratic-violet/90 text-white
                 shadow-md shadow-socratic-violet/10 hover:shadow-socratic-violet/30 hover:scale-105 active:scale-95 disabled:scale-100
                 disabled:opacity-20 disabled:cursor-not-allowed"
          title="回答を送信"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>

      </div>
    </div>

  </div>
</div>
