/**
 * Shared state for token refresh to avoid multiple concurrent refresh calls
 * across different API clients (Sync vs Async vs Admin).
 */

export let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

export function setRefreshing(value: boolean) {
  isRefreshing = value;
}

export function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

export function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}
