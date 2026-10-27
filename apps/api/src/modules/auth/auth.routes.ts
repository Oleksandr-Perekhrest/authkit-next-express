// outsource dependencies
import { Router } from "express";
import { registerSchema, loginSchema } from "@authkit/shared";

// local dependencies
import { register, login } from "./auth.controller";
import { validateBody } from "../../middleware/validate";

export const authRouter = Router();

authRouter.post("/register", validateBody(registerSchema), register);
authRouter.post("/login", validateBody(loginSchema), login);
