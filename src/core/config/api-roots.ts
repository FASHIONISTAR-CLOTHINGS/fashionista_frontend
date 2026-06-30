const DEFAULT_BACKEND_ROOT = "http://127.0.0.1:8001";

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function getLocalBrowserBackendOverride(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const hostname = window.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return DEFAULT_BACKEND_ROOT;
  }

  return null;
}

export function getClientBackendRootUrl(): string {
  return stripTrailingSlash(
    getLocalBrowserBackendOverride() ??
      process.env.NEXT_PUBLIC_BACKEND_URL ??
      DEFAULT_BACKEND_ROOT,
  );
}

export function getServerBackendRootUrl(): string {
  console.log("Fashionista: ", process.env.BACKEND_INTERNAL_URL);
  return stripTrailingSlash(
    process.env.BACKEND_INTERNAL_URL ??
      process.env.NEXT_PUBLIC_BACKEND_URL ??
      DEFAULT_BACKEND_ROOT,
  );
}

export function getSyncApiBaseUrl(): string {
  return `${getClientBackendRootUrl()}/api`;
}

export function getAsyncApiBaseUrl(): string {
  return `${getClientBackendRootUrl()}/api/v1/ninja`;
}

export function getServerAsyncApiBaseUrl(): string {
  return `${getServerBackendRootUrl()}/api/v1/ninja`;
}

export function getAdminSyncApiBaseUrl(): string {
  return `${getClientBackendRootUrl()}/api/v1/admin_backend`;
}

export function getAdminAsyncApiBaseUrl(): string {
  return `${getClientBackendRootUrl()}/api/v1/admin_backend`;
}
