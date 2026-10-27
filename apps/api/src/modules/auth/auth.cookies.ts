// outsource dependencies
import type { CookieOptions, Response } from "express";

// local dependencies
import { env } from "../../config/env";
import type { Session } from "./auth.service";
import {
    ACCESS_TOKEN_TTL_SECONDS,
    REFRESH_TOKEN_TTL_SECONDS,
} from "../../lib/tokens";

export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";

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
