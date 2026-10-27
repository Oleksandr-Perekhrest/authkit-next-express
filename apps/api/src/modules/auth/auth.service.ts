// outsource dependencies
import { randomUUID } from "node:crypto";
import type { LoginInput, RegisterInput } from "@authkit/shared";

// local dependencies
import { prisma } from "../../db/prisma";
import { AppError } from "../../lib/app-error";
import type { Prisma } from "../../generated/prisma/client";
import { hashPassword, verifyPassword } from "../../lib/password";
import {
    signAccessToken,
    hashRefreshToken,
    generateRefreshToken,
    REFRESH_TOKEN_TTL_SECONDS,
} from "../../lib/tokens";

const publicUserSelect = {
    id: true,
    email: true,
    name: true,
    createdAt: true,
} as const;

// Checked when the user is missing, so every failed login takes the same time
const dummyHash = hashPassword("dummy-password-for-timing");

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

export const loginUser = async ({ email, password }: LoginInput) => {
    const user = await prisma.user.findUnique({
        where: { email },
        select: { ...publicUserSelect, passwordHash: true },
    });

    const isValid = await verifyPassword(
        user?.passwordHash ?? (await dummyHash),
        password,
    );

    if (!user?.passwordHash || !isValid) {
        throw new AppError(
            401,
            "INVALID_CREDENTIALS",
            "Invalid email or password",
        );
    }

    const { passwordHash, ...publicUser } = user;

    return publicUser;
};

export const getCurrentUser = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: publicUserSelect,
    });

    if (!user) {
        throw new AppError(401, "UNAUTHENTICATED", "User account no longer exists");
    }

    return user;
};

const issueSession = async (
    tx: Prisma.TransactionClient,
    userId: string,
    familyId: string,
): Promise<Session> => {
    const { token, tokenHash } = generateRefreshToken();

    await tx.refreshToken.create({
        data: {
            userId,
            tokenHash,
            familyId,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
        },
    });

    const accessToken = await signAccessToken(userId);

    return { accessToken, refreshToken: token };
};

export const createSession = (userId: string): Promise<Session> =>
    prisma.$transaction((tx) => issueSession(tx, userId, randomUUID()));

export const rotateSession = async (refreshToken: string): Promise<Session> => {
    const tokenHash = hashRefreshToken(refreshToken);
    const now = new Date();

    const row = await prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!row || row.expiresAt <= now || row.revokedAt !== null) {
        throw new AppError(401, "UNAUTHENTICATED", "Refresh token is invalid or expired");
    }

    return prisma.$transaction(async (tx) => {
        const { count } = await tx.refreshToken.updateMany({
            where: { id: row.id, revokedAt: null },
            data: { revokedAt: now },
        });

        if (count !== 1) {
            throw new AppError(401, "UNAUTHENTICATED", "Refresh token already used");
        }

        return issueSession(tx, row.userId, row.familyId);
    });
};
