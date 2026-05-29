// Global Toast State using modern Svelte 5 reactive arrays
let toasts = $state([]);

export const toastStore = {
  get list() {
    return toasts;
  },
  
  show(message, type = 'warning', duration = 4500) {
    const id = Math.random().toString(36).substring(2, 9);
    
    // Add to state
    toasts.push({ id, message, type, isLeaving: false });
    
    // Animate departure before removing
    setTimeout(() => {
      this.dismiss(id);
    }, duration);
  },
  
  dismiss(id) {
    const idx = toasts.findIndex(t => t.id === id);
    if (idx !== -1) {
      toasts[idx].isLeaving = true;
      
      // Delay removal to allow slide-out animation to play
      setTimeout(() => {
        const index = toasts.findIndex(t => t.id === id);
        if (index !== -1) {
          toasts.splice(index, 1);
        }
      }, 300);
    }
  }
};
