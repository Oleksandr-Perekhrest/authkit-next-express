// outsource dependencies
import { SignJWT, jwtVerify } from "jose";
import { createHash, randomBytes } from "node:crypto";

// local dependencies
import { env } from "../config/env";

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;
// Parallel refreshes from several tabs can present an already-rotated token within this window.
export const REFRESH_REUSE_LEEWAY_SECONDS = 10;

const accessSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);

export const signAccessToken = (userId: string): Promise<string> =>
    new SignJWT()
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(userId)
        .setIssuedAt()
        .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
        .sign(accessSecret);

export const verifyAccessToken = async (token: string): Promise<{ userId: string }> => {
    const { payload } = await jwtVerify(token, accessSecret, { algorithms: ["HS256"] });
    if (!payload.sub) throw new Error("Missing sub claim");
    return { userId: payload.sub };
};

export const hashRefreshToken = (token: string): string =>
    createHash("sha256").update(token).digest("hex");

export const generateRefreshToken = () => {
    const token = randomBytes(32).toString("base64url");

    return { token, tokenHash: hashRefreshToken(token) };
};
