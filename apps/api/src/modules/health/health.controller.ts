// outsource dependencies
import type { RequestHandler } from "express";
import type { HealthResponse } from "@authkit/shared";

// local dependencies
import { prisma } from "../../db/prisma";

export const getHealth: RequestHandler = async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok" } satisfies HealthResponse);
};
