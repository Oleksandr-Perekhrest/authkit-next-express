// outsource dependencies
import type { Request, RequestHandler } from "express";

// local dependencies
import { AppError } from "../lib/app-error";
import { verifyAccessToken } from "../lib/tokens";
import { ACCESS_COOKIE } from "../modules/auth/auth.cookies";

export const getAuthUserId = (req: Request): string => {
    if (!req.user?.id) {
        throw new AppError(401, "UNAUTHENTICATED", "Authentication required");
    }
    return req.user.id;
};

export const requireAuth: RequestHandler = async (req, _res, next) => {
    const token = req.cookies[ACCESS_COOKIE] as string | undefined;

    if (!token) {
        throw new AppError(401, "UNAUTHENTICATED", "Authentication required");
    }

    let userId: string;

    try {
        ({ userId } = await verifyAccessToken(token));
    } catch {
        throw new AppError(401, "UNAUTHENTICATED", "Invalid or expired token");
    }

    req.user = { id: userId };
    next();
};
