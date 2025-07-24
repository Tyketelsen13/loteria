export async function requestNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  return false;
}

export function showNotification(title: string, options?: NotificationOptions) {
  if (typeof window !== "undefined" && Notification.permission === "granted") {
    new Notification(title, options);
  }
}
