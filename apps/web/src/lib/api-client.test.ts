// outsource dependencies
import { vi, it, expect, describe, afterEach } from "vitest";

// local dependencies
import { apiFetch } from "@/lib/api-client";

vi.mock("./request-tracker", () => ({
    trackRequest: () => () => {},
}));

function makeOkResponse(body: unknown = {}): Response {
    return new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}

function makeErrorResponse(
    status: number,
    code: string,
    message: string,
): Response {
    return new Response(JSON.stringify({ error: { code, message } }), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

afterEach(() => vi.unstubAllGlobals());

describe("apiFetch", () => {
    it("passes through a successful response without calling refresh", async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(makeOkResponse({ result: "ok" }));
        vi.stubGlobal("fetch", fetchMock);

        const result = await apiFetch<{ result: string }>("/test");

        expect(result).toEqual({ result: "ok" });
        expect(fetchMock).toHaveBeenCalledOnce();
        expect(fetchMock).toHaveBeenCalledWith("/api/test", expect.anything());
    });

    it("on 401 calls refresh once then retries and returns the retry response", async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(
                makeErrorResponse(401, "UNAUTHORIZED", "Unauthorized"),
            )
            .mockResolvedValueOnce(makeOkResponse())
            .mockResolvedValueOnce(makeOkResponse({ retried: true }));
        vi.stubGlobal("fetch", fetchMock);

        const result = await apiFetch<{ retried: boolean }>("/test");

        expect(result).toEqual({ retried: true });
        expect(fetchMock).toHaveBeenCalledTimes(3);
        expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/auth/refresh", {
            method: "POST",
        });
    });

    it("single-flight: two concurrent 401s trigger exactly one refresh, and both requests succeed after it", async () => {
        let resolveRefresh!: (r: Response) => void;
        const pendingRefresh = new Promise<Response>(
            (resolve) => (resolveRefresh = resolve),
        );

        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(
                makeErrorResponse(401, "UNAUTHORIZED", "Unauthorized"),
            )
            .mockResolvedValueOnce(
                makeErrorResponse(401, "UNAUTHORIZED", "Unauthorized"),
            )
            .mockImplementationOnce(() => pendingRefresh)
            .mockResolvedValueOnce(makeOkResponse({ req: 1 }))
            .mockResolvedValueOnce(makeOkResponse({ req: 2 }));
        vi.stubGlobal("fetch", fetchMock);

        const p1 = apiFetch<{ req: number }>("/test");
        const p2 = apiFetch<{ req: number }>("/test");

        // Drain the microtask queue so both requests are blocked on the pending refresh
        await new Promise<void>((resolve) => setImmediate(resolve));

        // Only 3 calls so far: 2 initial + 1 refresh — refresh is still pending
        expect(fetchMock).toHaveBeenCalledTimes(3);
        expect(fetchMock).toHaveBeenNthCalledWith(3, "/api/auth/refresh", {
            method: "POST",
        });

        resolveRefresh(makeOkResponse());

        const [r1, r2] = await Promise.all([p1, p2]);

        expect(r1).toEqual({ req: 1 });
        expect(r2).toEqual({ req: 2 });
        // 2 initial + 1 refresh + 2 retries — still only one refresh call
        expect(fetchMock).toHaveBeenCalledTimes(5);
    });

    it("throws the original 401 error when refresh itself returns 401", async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(
                makeErrorResponse(401, "UNAUTHORIZED", "session expired"),
            )
            .mockResolvedValueOnce(
                makeErrorResponse(401, "UNAUTHORIZED", "refresh rejected"),
            );
        vi.stubGlobal("fetch", fetchMock);

        await expect(apiFetch("/test")).rejects.toMatchObject({
            status: 401,
            message: "session expired",
        });
    });

    it("throws the refresh error (not the original 401) when refresh fails with a non-401 — a server error during refresh must not be misread as an expired session", async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(
                makeErrorResponse(401, "UNAUTHORIZED", "original"),
            )
            .mockResolvedValueOnce(
                makeErrorResponse(500, "INTERNAL_ERROR", "server down"),
            );
        vi.stubGlobal("fetch", fetchMock);

        await expect(apiFetch("/test")).rejects.toMatchObject({
            status: 500,
            code: "INTERNAL_ERROR",
            message: "server down",
        });
    });

    it("rejects both concurrent requests when refresh fails, with no retry and no second refresh call", async () => {
        let resolveRefresh!: (r: Response) => void;
        const pendingRefresh = new Promise<Response>(
            (resolve) => (resolveRefresh = resolve),
        );

        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(
                makeErrorResponse(401, "UNAUTHORIZED", "Unauthorized"),
            )
            .mockResolvedValueOnce(
                makeErrorResponse(401, "UNAUTHORIZED", "Unauthorized"),
            )
            .mockImplementationOnce(() => pendingRefresh);
        vi.stubGlobal("fetch", fetchMock);

        const p1 = apiFetch("/test");
        const p2 = apiFetch("/test");

        await new Promise<void>((resolve) => setImmediate(resolve));
        expect(fetchMock).toHaveBeenCalledTimes(3);

        resolveRefresh(makeErrorResponse(500, "INTERNAL_ERROR", "server down"));

        const results = await Promise.allSettled([p1, p2]);

        expect(results[0]?.status).toBe("rejected");
        expect(results[1]?.status).toBe("rejected");
        // No retries attempted
        expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it("starts a fresh refresh for a subsequent request after the previous refresh failed", async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(
                makeErrorResponse(401, "UNAUTHORIZED", "first"),
            )
            .mockResolvedValueOnce(
                makeErrorResponse(500, "INTERNAL_ERROR", "down"),
            )
            .mockResolvedValueOnce(
                makeErrorResponse(401, "UNAUTHORIZED", "second"),
            )
            .mockResolvedValueOnce(makeOkResponse())
            .mockResolvedValueOnce(makeOkResponse({ done: true }));
        vi.stubGlobal("fetch", fetchMock);

        await expect(apiFetch("/test")).rejects.toMatchObject({ status: 500 });

        const result = await apiFetch<{ done: boolean }>("/test");
        expect(result).toEqual({ done: true });

        const refreshCalls = fetchMock.mock.calls.filter(
            ([url]) => url === "/api/auth/refresh",
        );
        expect(refreshCalls).toHaveLength(2);
    });

    it("does not call refresh for non-401 error responses", async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(
                makeErrorResponse(403, "FORBIDDEN", "Forbidden"),
            );
        vi.stubGlobal("fetch", fetchMock);

        await expect(apiFetch("/test")).rejects.toMatchObject({ status: 403 });
        expect(fetchMock).toHaveBeenCalledOnce();
    });

    it("does not call refresh when the path is in the skip list (e.g. /auth/refresh)", async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(
                makeErrorResponse(401, "UNAUTHORIZED", "Unauthorized"),
            );
        vi.stubGlobal("fetch", fetchMock);

        await expect(apiFetch("/auth/refresh")).rejects.toMatchObject({
            status: 401,
        });
        expect(fetchMock).toHaveBeenCalledOnce();
    });
});
