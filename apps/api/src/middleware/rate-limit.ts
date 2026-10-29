// outsource dependencies
import { rateLimit, type Options } from "express-rate-limit";

// local dependencies
import { env } from "../config/env";
import { AppError } from "../lib/app-error";

const baseOptions: Partial<Options> = {
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (_req, _res, next) => {
        next(
            new AppError(
                429,
                "RATE_LIMITED",
                "Too many attempts, please try again later",
            ),
        );
    },
};

export const loginLimiter = rateLimit({
    ...baseOptions,
    windowMs: 15 * 60 * 1000,
    limit: env.LOGIN_RATE_LIMIT,
    skipSuccessfulRequests: true,
});

export const registerLimiter = rateLimit({
    ...baseOptions,
    windowMs: 60 * 60 * 1000,
    limit: env.REGISTER_RATE_LIMIT,
});
