// outsource dependencies
import type { RequestHandler } from "express";

// local dependencies
import { AppError } from "../lib/app-error";

export const notFound: RequestHandler = (req) => {
  throw new AppError(
    404,
    "NOT_FOUND",
    `Route ${req.method} ${req.path} not found`,
  );
};
