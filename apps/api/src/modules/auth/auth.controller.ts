// outsource dependencies
import type { RequestHandler } from "express";
import type { RegisterInput, LoginInput } from "@authkit/shared";

// local dependencies
import { AppError } from "../../lib/app-error";
import { getAuthUserId } from "../../middleware/require-auth";
import { REFRESH_COOKIE, setAuthCookies, clearAuthCookies } from "./auth.cookies";
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
    res.status(201).json({ user });
};

export const login: RequestHandler = async (req, res) => {
    const user = await loginUser(req.body as LoginInput);
    const session = await createSession(user.id);

    setAuthCookies(res, session);
    res.json({ user });
};

export const me: RequestHandler = async (req, res) => {
    const userId = getAuthUserId(req);
    const user = await getCurrentUser(userId);
    res.json({ user });
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
