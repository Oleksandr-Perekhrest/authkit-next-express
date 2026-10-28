// outsource dependencies
import type { Response, CookieOptions } from "express";

// local dependencies
import { env } from "../../config/env";
import type { Session } from "./auth.service";
import {
    ACCESS_TOKEN_TTL_SECONDS,
    REFRESH_TOKEN_TTL_SECONDS,
} from "../../lib/tokens";

export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";
export const GOOGLE_STATE_COOKIE = "google_oauth_state";
export const GOOGLE_VERIFIER_COOKIE = "google_oauth_code_verifier";

const GOOGLE_OAUTH_TTL_SECONDS = 60 * 10;

const baseOptions: CookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
};

export const setAuthCookies = (res: Response, session: Session) => {
    res.cookie(ACCESS_COOKIE, session.accessToken, {
        ...baseOptions,
        maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000,
    });
    res.cookie(REFRESH_COOKIE, session.refreshToken, {
        ...baseOptions,
        maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
    });
};

export const clearAuthCookies = (res: Response) => {
    res.clearCookie(ACCESS_COOKIE, baseOptions);
    res.clearCookie(REFRESH_COOKIE, baseOptions);
};

export const setGoogleOAuthCookies = (
    res: Response,
    state: string,
    codeVerifier: string,
) => {
    const options: CookieOptions = {
        ...baseOptions,
        maxAge: GOOGLE_OAUTH_TTL_SECONDS * 1000,
    };
    res.cookie(GOOGLE_STATE_COOKIE, state, options);
    res.cookie(GOOGLE_VERIFIER_COOKIE, codeVerifier, options);
};

export const clearGoogleOAuthCookies = (res: Response) => {
    res.clearCookie(GOOGLE_STATE_COOKIE, baseOptions);
    res.clearCookie(GOOGLE_VERIFIER_COOKIE, baseOptions);
};
