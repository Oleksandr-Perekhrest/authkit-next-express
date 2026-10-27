// outsource dependencies
import type { RequestHandler } from "express";
import type { RegisterInput } from "@authkit/shared";

// local dependencies
import { setAuthCookies } from "./auth.cookies";
import { createSession, registerUser } from "./auth.service";

export const register: RequestHandler = async (req, res) => {
    const user = await registerUser(req.body as RegisterInput);
    const session = await createSession(user.id);

    setAuthCookies(res, session);
    res.status(201).json({ user });
};
