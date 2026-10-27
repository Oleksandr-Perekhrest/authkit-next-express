// outsource dependencies
import { Router } from "express";
import { registerSchema, loginSchema } from "@authkit/shared";

// local dependencies
import { register, login, me } from "./auth.controller";
import { validateBody } from "../../middleware/validate";
import { requireAuth } from "../../middleware/require-auth";
import { loginLimiter, registerLimiter } from "../../middleware/rate-limit";

export const authRouter = Router();

authRouter.post(
    "/register",
    registerLimiter,
    validateBody(registerSchema),
    register,
);
authRouter.post("/login", loginLimiter, validateBody(loginSchema), login);
authRouter.get("/me", requireAuth, me);
