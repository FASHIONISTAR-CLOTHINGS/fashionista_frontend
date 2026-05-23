const DEFAULT_BACKEND_ROOT = "http://127.0.0.1:8001";

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getClientBackendRootUrl(): string {
  return stripTrailingSlash(
    process.env.NEXT_PUBLIC_BACKEND_URL ?? DEFAULT_BACKEND_ROOT,
  );
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
