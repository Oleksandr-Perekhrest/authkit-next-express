// outsource dependencies
import { Router } from "express";
import { updateProfileSchema } from "@authkit/shared";

// local dependencies
import { noStore } from "../../middleware/no-store";
import { updateMe, deleteMe } from "./users.controller";
import { validateBody } from "../../middleware/validate";
import { requireAuth } from "../../middleware/require-auth";

export const usersRouter = Router();

usersRouter.use(noStore);

usersRouter.patch(
    "/me",
    requireAuth,
    validateBody(updateProfileSchema),
    updateMe,
);
usersRouter.delete("/me", requireAuth, deleteMe);
