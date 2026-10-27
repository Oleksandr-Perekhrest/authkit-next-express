// outsource dependencies
import type { ZodType } from "zod";
import type { RequestHandler } from "express";

export const validateBody =
    (schema: ZodType): RequestHandler =>
        (req, _res, next) => {
            req.body = schema.parse(req.body);
            next();
        };
