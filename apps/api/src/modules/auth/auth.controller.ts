// outsource dependencies
import type { RequestHandler } from "express";
import { generateState, generateCodeVerifier } from "arctic";
import type { LoginInput, UserResponse, RegisterInput } from "@authkit/shared";

// local dependencies
import { google } from "../../lib/google";
import { AppError } from "../../lib/app-error";
import { toPublicUser } from "../users/users.service";
import { getAuthUserId } from "../../middleware/require-auth";
import {
    REFRESH_COOKIE,
    setAuthCookies,
    clearAuthCookies,
    setGoogleOAuthCookies,
} from "./auth.cookies";
import {
    loginUser,
    endSession,
    registerUser,
    createSession,
    rotateSession,
    endAllSessions,
    getCurrentUser,
} from "./auth.service";

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
