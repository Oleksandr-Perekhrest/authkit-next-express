// outsource dependencies
import express from "express";
import { healthResponseSchema } from "@authkit/shared";
// local dependencies
import { env } from "./config/env";
import { prisma } from "./db/prisma";

const app = express();

app.get("/health", async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json(healthResponseSchema.parse({ status: "ok" }));
});

app.listen(env.PORT, () => {
  console.log(`api listening on http://localhost:${env.PORT}`);
});
