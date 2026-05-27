export function requestPermission(): Promise<boolean> {
  if (!('Notification' in window)) return Promise.resolve(false);
  if (Notification.permission === 'granted') return Promise.resolve(true);
  if (Notification.permission === 'denied') return Promise.resolve(false);
  return Notification.requestPermission().then(p => p === 'granted');
}

export function scheduleNotification(title: string, body: string, at: number): number | null {
  const delay = at - Date.now();
  if (delay <= 0) return null;
  return window.setTimeout(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    new Notification(title, { body, icon: '/favicon.svg' });
  }, delay);
}

export function cancelNotification(id: number) {
  clearTimeout(id);
}
