// outsource dependencies
import { Router } from "express";
import { registerSchema, loginSchema } from "@authkit/shared";

// local dependencies
import { validateBody } from "../../middleware/validate";
import { requireAuth } from "../../middleware/require-auth";
import { loginLimiter, registerLimiter } from "../../middleware/rate-limit";
import {
    register,
    login,
    me,
    refresh,
    logout,
    logoutAll,
} from "./auth.controller";

export const authRouter = Router();

authRouter.post(
    "/register",
    registerLimiter,
    validateBody(registerSchema),
    register,
);
authRouter.post("/login", loginLimiter, validateBody(loginSchema), login);
authRouter.get("/me", requireAuth, me);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);
authRouter.post("/logout-all", requireAuth, logoutAll);
