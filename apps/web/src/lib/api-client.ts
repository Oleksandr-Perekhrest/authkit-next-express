// outsource dependencies
import "client-only";

export class ApiError extends Error {
    readonly status: number;
    readonly code: string;
    readonly details?: unknown;

    constructor(
        status: number,
        code: string,
        message: string,
        details?: unknown,
    ) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

type ErrorBody = { code?: string; message?: string; details?: unknown };

const SKIP_REFRESH_PATHS = new Set([
    "/auth/login",
    "/auth/logout",
    "/auth/refresh",
    "/auth/register",
]);

let inflightRefresh: Promise<void> | null = null;

async function parseApiError(res: Response): Promise<ApiError> {
    const body = await res.json().catch(() => ({}));
    const { code, message, details } = (body?.error ?? {}) as ErrorBody;
    return new ApiError(
        res.status,
        code ?? "UNKNOWN",
        message ?? res.statusText,
        details,
    );
}

async function runRefresh(): Promise<void> {
    const res = await fetch("/api/auth/refresh", { method: "POST" });
    if (res.ok || res.status === 409) return;
    throw await parseApiError(res);
}

function singleFlightRefresh(): Promise<void> {
    if (!inflightRefresh) {
        inflightRefresh = runRefresh().finally(() => {
            inflightRefresh = null;
        });
    }
    return inflightRefresh;
}

function buildHeaders(options?: RequestInit): Headers {
    const headers = new Headers(options?.headers);
    if (options?.body !== undefined) {
        headers.set("Content-Type", "application/json");
    }
    return headers;
}

function fetchWithHeaders(
    url: string,
    options?: RequestInit,
): Promise<Response> {
    return fetch(url, { ...options, headers: buildHeaders(options) });
}

async function readOk<T>(res: Response): Promise<T> {
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
}

export async function apiFetch<T>(
    path: string,
    options?: RequestInit,
): Promise<T> {
    const url = `/api${path}`;
    const res = await fetchWithHeaders(url, options);

    if (res.ok) return readOk<T>(res);
    if (res.status !== 401 || SKIP_REFRESH_PATHS.has(path))
        throw await parseApiError(res);

    const originalError = await parseApiError(res);

    try {
        await singleFlightRefresh();
    } catch (err) {
        if (err instanceof ApiError && err.status === 401) throw originalError;
        throw err;
    }

    const retryRes = await fetchWithHeaders(url, options);
    if (retryRes.ok) return readOk<T>(retryRes);
    throw await parseApiError(retryRes);
}
