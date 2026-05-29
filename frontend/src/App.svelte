<script>
  import { onMount } from 'svelte';
  import Sidebar from './components/Sidebar.svelte';
  import SetupForm from './components/SetupForm.svelte';
  import ChatArea from './components/ChatArea.svelte';
  import ControlBar from './components/ControlBar.svelte';
  import Toast from './components/Toast.svelte';
  import { toastStore } from './lib/toastStore.svelte.js';

  // Express API Backend Base URL
  const API_BASE = 'http://localhost:3000/api/chat';

  // Svelte 5 Reactive Runes State
  let sessions = $state([]);
  let activeSessionId = $state(null);
  let activeSession = $state(null);
  let isLoading = $state(false);
  let isGenerating = $state(false);

  // 1. Fetch all Socratic sessions from the backend
  async function fetchSessions() {
    try {
      const res = await fetch(`${API_BASE}/sessions`);
      if (res.ok) {
        sessions = await res.json();
      } else {
        console.error('セッションリストの読み込みに失敗しました');
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    }
  }

  // 2. Fetch details for a specific session
  async function loadSessionDetails(sessionId) {
    try {
      const res = await fetch(`${API_BASE}/session/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        activeSession = data;
        activeSessionId = sessionId;
        localStorage.setItem('socrates_active_id', sessionId);
      } else {
        toastStore.show('セッションの詳細を取得できませんでした。', 'error');
        activeSessionId = null;
        activeSession = null;
        localStorage.removeItem('socrates_active_id');
      }
    } catch (err) {
      console.error('セッション詳細の読み込みエラー:', err);
      toastStore.show('ソクラテス・サーバーへの接続中にネットワークエラーが発生しました。', 'error');
    }
  }

  // 3. Initialize a new session
  async function handleInitSession(topic) {
    isLoading = true;
    try {
      const res = await fetch(`${API_BASE}/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toastStore.show('ソクラテス対話が初期化されました！', 'success');
        activeSessionId = data.sessionId;
        
        // Refresh session list
        await fetchSessions();
        // Load details immediately
        await loadSessionDetails(data.sessionId);
      } else {
        toastStore.show(data.error || 'セッションを開始できませんでした。', 'error');
      }
    } catch (err) {
      console.error('セッション開始エラー:', err);
      toastStore.show('バックエンド・サーバーへの接続に失敗しました。', 'error');
    } finally {
      isLoading = false;
    }
  }

  // 4. Handle sending a student message
  async function handleSendMessage(messageText) {
    if (!activeSessionId) return;
    
    isGenerating = true;
    
    // Optimistic UI: Append message locally first for premium feel
    const optimisticMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };
    
    if (activeSession) {
      activeSession.messages = [...activeSession.messages, optimisticMessage];
    }

    try {
      const res = await fetch(`${API_BASE}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSessionId,
          message: messageText
        })
      });

      const data = await res.json();

      if (res.ok) {
        // Update fully synchronized history
        if (activeSession) {
          activeSession.messages = data.messages;
        }
        // Refresh list to update relative timestamps/last messages
        await fetchSessions();
      } else {
        toastStore.show(data.error || '回答の送信に失敗しました。', 'error');
        // Rollback optimistic message on error
        if (activeSession) {
          activeSession.messages = activeSession.messages.filter(m => m !== optimisticMessage);
        }
      }
    } catch (err) {
      console.error('メッセージ送信エラー:', err);
      toastStore.show('サーバ接続が中断されました。', 'error');
      // Rollback optimistic message
      if (activeSession) {
        activeSession.messages = activeSession.messages.filter(m => m !== optimisticMessage);
      }
    } finally {
      isGenerating = false;
    }
  }

  // 5. Handle deleting a past session
  async function handleDeleteSession(sessionId) {
    try {
      const res = await fetch(`${API_BASE}/session/${sessionId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toastStore.show('セッションが履歴から削除されました。', 'success');
        
        // If we deleted the active one, clear active state
        if (activeSessionId === sessionId) {
          activeSessionId = null;
          activeSession = null;
          localStorage.removeItem('socrates_active_id');
        }
        
        // Reload list
        await fetchSessions();
      } else {
        toastStore.show('セッションの削除に失敗しました。', 'error');
      }
    } catch (err) {
      console.error('セッション削除エラー:', err);
      toastStore.show('セッション削除中にネットワークエラーが発生しました。', 'error');
    }
  }

  // 6. Action to return to setup form (New Chat)
  function handleNewChat() {
    activeSessionId = null;
    activeSession = null;
    localStorage.removeItem('socrates_active_id');
  }

  // Lifecycles: Load active state on page startup
  onMount(async () => {
    // Initial fetch of sessions list
    await fetchSessions();
    
    // Check if we have a persisted active session ID
    const persistedId = localStorage.getItem('socrates_active_id');
    if (persistedId) {
      // Confirm it still exists in our fetched sessions list
      const exists = sessions.some(s => s.sessionId === persistedId);
      if (exists) {
        await loadSessionDetails(persistedId);
      } else {
        localStorage.removeItem('socrates_active_id');
      }
    }
  });
</script>

<!-- Main Shell Layout -->
<main class="w-screen h-screen flex bg-obsidian-950 overflow-hidden relative font-sans">
  
  <!-- Ambient Gradient Accents for ChatGPT Obsidian Aesthetics -->
  <div class="absolute top-0 left-72 w-[600px] h-[600px] rounded-full bg-socratic-violet/5 blur-[120px] pointer-events-none"></div>
  <div class="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-socratic-cyan/5 blur-[100px] pointer-events-none"></div>

  <!-- Svelte Floating Toast Alarms -->
  <Toast />

  <!-- Sidebar component (Left aligned) -->
  <Sidebar
    sessions={sessions}
    activeSessionId={activeSessionId}
    onSelectSession={loadSessionDetails}
    onNewChat={handleNewChat}
    onDeleteSession={handleDeleteSession}
  />

  <!-- Main Socratic workspace -->
  <div class="flex-1 h-full flex flex-col min-w-0 bg-gradient-to-b from-obsidian-900 to-obsidian-950">
    {#if activeSessionId && activeSession}
      
      <!-- Socratic Chat Mode -->
      <ChatArea
        messages={activeSession.messages}
        topic={activeSession.topic}
        isGenerating={isGenerating}
      />
      
      <!-- Interactive Inputs -->
      <ControlBar
        onSubmit={handleSendMessage}
        disabled={isGenerating}
      />
      
    {:else}
      
      <!-- Onboarding Setup Form Mode -->
      <div class="flex-1 flex overflow-y-auto p-6 scrollbar-thin">
        <SetupForm
          onSubmit={handleInitSession}
          isLoading={isLoading}
        />
      </div>
      
    {/if}
  </div>

</main>
