// outsource dependencies
import type { RequestHandler } from "express";
import type { UserResponse, UpdateProfileInput } from "@authkit/shared";

// local dependencies
import { clearAuthCookies } from "../auth/auth.cookies";
import { getAuthUserId } from "../../middleware/require-auth";
import { deleteUser, updateUser, toPublicUser } from "./users.service";

export const updateMe: RequestHandler = async (req, res) => {
    const userId = getAuthUserId(req);
    const { name } = req.body as UpdateProfileInput;
    const user = await updateUser(userId, name);
    res.json({ user: toPublicUser(user) } satisfies UserResponse);
};

export const deleteMe: RequestHandler = async (req, res) => {
    const userId = getAuthUserId(req);
    await deleteUser(userId);
    clearAuthCookies(res);
    res.sendStatus(204);
};
