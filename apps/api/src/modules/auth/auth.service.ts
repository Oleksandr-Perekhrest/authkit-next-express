// outsource dependencies
import { randomUUID } from "node:crypto";
import type { RegisterInput } from "@authkit/shared";

// local dependencies
import { prisma } from "../../db/prisma";
import { AppError } from "../../lib/app-error";
import { hashPassword } from "../../lib/password";
import {
    signAccessToken,
    generateRefreshToken,
    REFRESH_TOKEN_TTL_SECONDS,
} from "../../lib/tokens";

const publicUserSelect = {
    id: true,
    email: true,
    name: true,
    createdAt: true,
} as const;

export type Session = { accessToken: string; refreshToken: string };

export const registerUser = async ({
    email,
    password,
    name,
}: RegisterInput) => {
    const existing = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
    });

    if (existing) {
        throw new AppError(409, "EMAIL_TAKEN", "Email is already registered");
    }

    const passwordHash = await hashPassword(password);

    return prisma.user.create({
        data: { email, name, passwordHash },
        select: publicUserSelect,
    });
};

export const createSession = async (userId: string): Promise<Session> => {
    const { token, tokenHash } = generateRefreshToken();

    await prisma.refreshToken.create({
        data: {
            userId,
            tokenHash,
            familyId: randomUUID(),
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
        },
    });

    const accessToken = await signAccessToken(userId);

    return { accessToken, refreshToken: token };
};
