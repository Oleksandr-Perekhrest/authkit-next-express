// outsource dependencies
import { Router } from "express";

// local dependencies
import { getHealth } from "./health.controller";

export const healthRouter = Router();

healthRouter.get("/", getHealth);
