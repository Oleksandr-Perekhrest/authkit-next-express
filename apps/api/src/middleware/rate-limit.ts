// outsource dependencies
import { rateLimit, type Options } from "express-rate-limit";

// local dependencies
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
    limit: 10,
    skipSuccessfulRequests: true,
});

export const registerLimiter = rateLimit({
    ...baseOptions,
    windowMs: 60 * 60 * 1000,
    limit: 5,
});
