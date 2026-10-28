// outsource dependencies
import { Router } from "express";
import { loginSchema, registerSchema } from "@authkit/shared";

// local dependencies
import { noStore } from "../../middleware/no-store";
import { validateBody } from "../../middleware/validate";
import { requireAuth } from "../../middleware/require-auth";
import { loginLimiter, registerLimiter } from "../../middleware/rate-limit";
import {
    me,
    login,
    logout,
    refresh,
    register,
    logoutAll,
    googleSignIn,
} from "./auth.controller";

export const authRouter = Router();

authRouter.use(noStore);

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
authRouter.get("/google", googleSignIn);
