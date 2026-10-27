// outsource dependencies
import express from "express";

// local dependencies
import { notFound } from "./middleware/not-found";
import { errorHandler } from "./middleware/error-handler";
import { healthRouter } from "./modules/health/health.routes";

export function createApp() {
  const app = express();

  app.use("/health", healthRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
