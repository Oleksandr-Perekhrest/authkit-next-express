"use client";

// outsource dependencies
import type { ReactNode } from "react";
import type { UserResponse } from "@authkit/shared";
import { useState, useEffect, useContext, createContext } from "react";

// local dependencies
import { ApiError, apiFetch } from "@/lib/api-client";

type AuthStatus = "loading" | "authenticated" | "anonymous" | "error";

type AuthState =
    | { status: "loading" }
    | { status: "anonymous" }
    | { status: "error" }
    | { status: "authenticated"; user: UserResponse["user"] };

type AuthContextValue = {
    status: AuthStatus;
    user: UserResponse["user"] | null;
    setUser: (user: UserResponse["user"]) => void;
    reload: () => void;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}

type Props = {
    initialStatus: "loading" | "anonymous";
    children: ReactNode;
};

export default function AuthProvider({ initialStatus, children }: Props) {
    const [state, setState] = useState<AuthState>({ status: initialStatus });
    const [fetchKey, setFetchKey] = useState(() =>
        initialStatus === "loading" ? 1 : 0,
    );

    useEffect(() => {
        if (fetchKey === 0) return;
        let ignore = false;
        async function fetchMe() {
            try {
                const { user } = await apiFetch<UserResponse>("/auth/me");
                if (!ignore) setState({ status: "authenticated", user });
            } catch (err) {
                if (ignore) return;
                if (err instanceof ApiError && err.status === 401) {
                    setState({ status: "anonymous" });
                } else {
                    setState({ status: "error" });
                }
            }
        }
        void fetchMe();
        return () => {
            ignore = true;
        };
    }, [fetchKey]);

    function setUser(user: UserResponse["user"]) {
        setState({ status: "authenticated", user });
    }

    function reload() {
        setState({ status: "loading" });
        setFetchKey((k) => k + 1);
    }

    async function logout() {
        await apiFetch("/auth/logout", { method: "POST" });
        setState({ status: "anonymous" });
    }

    const user = state.status === "authenticated" ? state.user : null;

    return (
        <AuthContext.Provider
            value={{ status: state.status, user, setUser, reload, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}
