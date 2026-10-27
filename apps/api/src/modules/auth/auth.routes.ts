// outsource dependencies
import { Router } from "express";
import { registerSchema } from "@authkit/shared";

// local dependencies
import { register } from "./auth.controller";
import { validateBody } from "../../middleware/validate";

export const authRouter = Router();

authRouter.post("/register", validateBody(registerSchema), register);
