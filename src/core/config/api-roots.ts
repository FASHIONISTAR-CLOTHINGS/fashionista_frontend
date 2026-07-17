const DEFAULT_BACKEND_ROOT = "https://fashionistar-fashionistar-api-v1.hf.space";

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function getLocalBrowserBackendOverride(): string | null {
  return null;
}

export function getClientBackendRootUrl(): string {
  if (typeof window !== "undefined") {
    return "";
  }
  return stripTrailingSlash(
    getLocalBrowserBackendOverride() ??
      process.env.NEXT_PUBLIC_BACKEND_URL ??
      DEFAULT_BACKEND_ROOT,
  );
}

export function getClientWsRootUrl(): string {
  const root =
    process.env.NEXT_PUBLIC_BACKEND_URL || DEFAULT_BACKEND_ROOT;
  return stripTrailingSlash(root);
}

export function getServerBackendRootUrl(): string {
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

export function getClientWsBaseUrl(): string {
  const root = getClientWsRootUrl();
  const wsRoot = root.replace(/^http/, "ws");
  return `${wsRoot}/ws`;
}
