import { authApi } from "@/features/auth/api";
import { notificationsApi } from "@/features/notifications/api";

// pushManager.subscribe() wants the VAPID public key as a Uint8Array, but the
// server hands it over base64url-encoded — this is the standard conversion.
function urlBase64ToUint8Array(base64Url: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0))).buffer;
}

export function isPushSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

export async function getPushSubscriptionState(): Promise<boolean> {
  if (!isPushSupported()) return false;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return Boolean(subscription);
}

export async function subscribeToPush(): Promise<void> {
  if (!isPushSupported()) throw new Error("Push notifications aren't supported on this device");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Notification permission was not granted");

  const { publicKey } = await notificationsApi.getVapidPublicKey();
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  const json = subscription.toJSON();
  await authApi.subscribeToPush({
    endpoint: json.endpoint!,
    keys: { p256dh: json.keys!.p256dh!, auth: json.keys!.auth! },
  });
}

export async function unsubscribeFromPush(): Promise<void> {
  if (!isPushSupported()) return;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;
  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  await authApi.unsubscribeFromPush(endpoint);
}
