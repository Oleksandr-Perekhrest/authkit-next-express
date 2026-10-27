// outsource dependencies
import { z, ZodError } from "zod";
import type { ErrorResponse } from "@authkit/shared";
import type { Response, ErrorRequestHandler } from "express";

// local dependencies
import { AppError } from "../lib/app-error";
import { Prisma } from "../generated/prisma/client";

const send = (res: Response, status: number, error: ErrorResponse["error"]) => {
    res.status(status).json({ error } satisfies ErrorResponse);
};

const bodyErrorType = (err: unknown) =>
    typeof err === "object" && err !== null && "type" in err
        ? err.type
        : undefined;

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof AppError) {
        return send(res, err.status, {
            code: err.code,
            message: err.message,
            details: err.details,
        });
    }

    if (err instanceof ZodError) {
        return send(res, 400, {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: z.flattenError(err),
        });
    }

    if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
    ) {
        return send(res, 409, {
            code: "CONFLICT",
            message: "Resource already exists",
        });
    }

    const bodyError = bodyErrorType(err);

    if (bodyError === "entity.parse.failed") {
        return send(res, 400, {
            code: "INVALID_JSON",
            message: "Request body is not valid JSON",
        });
    }

    if (bodyError === "entity.too.large") {
        return send(res, 413, {
            code: "PAYLOAD_TOO_LARGE",
            message: "Request body is too large",
        });
    }

    console.error(err);
    return send(res, 500, {
        code: "INTERNAL_ERROR",
        message: "Something went wrong",
    });
};
