// outsource dependencies
import { z } from "zod";
import type { RequestHandler } from "express";
import { GOOGLE_AUTH_ERRORS, GOOGLE_AUTH_SUCCESS } from "@authkit/shared";
import { decodeIdToken, generateState, generateCodeVerifier } from "arctic";
import type {
    LoginInput,
    UserResponse,
    AuthToastCode,
    RegisterInput,
} from "@authkit/shared";

// local dependencies
import { google } from "../../lib/google";
import { AppError } from "../../lib/app-error";
import { toPublicUser } from "../users/users.service";
import { getAuthUserId } from "../../middleware/require-auth";
import {
    loginUser,
    endSession,
    registerUser,
    createSession,
    rotateSession,
    endAllSessions,
    getCurrentUser,
    findOrCreateGoogleUser,
} from "./auth.service";
import {
    REFRESH_COOKIE,
    setAuthCookies,
    clearAuthCookies,
    GOOGLE_STATE_COOKIE,
    setGoogleOAuthCookies,
    GOOGLE_VERIFIER_COOKIE,
    clearGoogleOAuthCookies,
} from "./auth.cookies";

const googleClaimsSchema = z.object({
    sub: z.string(),
    email: z.string(),
    email_verified: z.boolean(),
    name: z.string().optional(),
});

const withToast = (path: string, code: AuthToastCode): string =>
    `${path}?${new URLSearchParams({ toast: code })}`;

export const register: RequestHandler = async (req, res) => {
    const user = await registerUser(req.body as RegisterInput);
    const session = await createSession(user.id);

    setAuthCookies(res, session);
    res.status(201).json({ user: toPublicUser(user) } satisfies UserResponse);
};

export const login: RequestHandler = async (req, res) => {
    const user = await loginUser(req.body as LoginInput);
    const session = await createSession(user.id);

    setAuthCookies(res, session);
    res.json({ user: toPublicUser(user) } satisfies UserResponse);
};

export const me: RequestHandler = async (req, res) => {
    const userId = getAuthUserId(req);
    const user = await getCurrentUser(userId);
    res.json({ user: toPublicUser(user) } satisfies UserResponse);
};

export const logout: RequestHandler = async (req, res) => {
    const token = req.cookies[REFRESH_COOKIE] as string | undefined;

    if (token) {
        await endSession(token);
    }

    clearAuthCookies(res);
    res.sendStatus(204);
};

export const logoutAll: RequestHandler = async (req, res) => {
    const userId = getAuthUserId(req);

    await endAllSessions(userId);
    clearAuthCookies(res);
    res.sendStatus(204);
};

export const googleSignIn: RequestHandler = async (_req, res) => {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const url = google.createAuthorizationURL(state, codeVerifier, [
        "openid",
        "email",
        "profile",
    ]);
    url.searchParams.set("prompt", "select_account");

    setGoogleOAuthCookies(res, state, codeVerifier);
    res.redirect(302, url.toString());
};

export const googleCallback: RequestHandler = async (req, res) => {
    const { code, state, error } = req.query;
    const storedState = req.cookies[GOOGLE_STATE_COOKIE] as string | undefined;
    const codeVerifier = req.cookies[GOOGLE_VERIFIER_COOKIE] as
        string | undefined;

    clearGoogleOAuthCookies(res);

    if (error) {
        return res.redirect(
            302,
            withToast("/login", GOOGLE_AUTH_ERRORS.cancelled),
        );
    }

    if (
        typeof code !== "string" ||
        typeof state !== "string" ||
        !storedState ||
        !codeVerifier ||
        state !== storedState
    ) {
        return res.redirect(
            302,
            withToast("/login", GOOGLE_AUTH_ERRORS.invalid_state),
        );
    }

    try {
        const tokens = await google.validateAuthorizationCode(
            code,
            codeVerifier,
        );
        const claims = googleClaimsSchema.parse(
            decodeIdToken(tokens.idToken()),
        );

        if (!claims.email_verified) {
            return res.redirect(
                302,
                withToast("/login", GOOGLE_AUTH_ERRORS.email_unverified),
            );
        }

        const { user, created } = await findOrCreateGoogleUser({
            sub: claims.sub,
            email: claims.email,
            name: claims.name,
        });
        const session = await createSession(user.id);

        setAuthCookies(res, session);
        return res.redirect(
            302,
            withToast(
                "/profile",
                created
                    ? GOOGLE_AUTH_SUCCESS.created
                    : GOOGLE_AUTH_SUCCESS.login,
            ),
        );
    } catch (err) {
        if (
            err instanceof AppError &&
            err.code === GOOGLE_AUTH_ERRORS.account_exists
        ) {
            return res.redirect(
                302,
                withToast("/login", GOOGLE_AUTH_ERRORS.account_exists),
            );
        }
        console.error("Google OAuth callback error", err);
        return res.redirect(
            302,
            withToast("/login", GOOGLE_AUTH_ERRORS.failed),
        );
    }
};

export const refresh: RequestHandler = async (req, res) => {
    const token = req.cookies[REFRESH_COOKIE] as string | undefined;

    if (!token) {
        throw new AppError(401, "UNAUTHENTICATED", "Missing refresh token");
    }

    try {
        const session = await rotateSession(token);
        setAuthCookies(res, session);
        res.sendStatus(204);
    } catch (err) {
        if (err instanceof AppError && err.status === 401) {
            clearAuthCookies(res);
        }
        throw err;
    }
};
