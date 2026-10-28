// outsource dependencies
import { randomUUID } from "node:crypto";
import type { PublicUser, LoginInput, RegisterInput } from "@authkit/shared";

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
    REFRESH_REUSE_LEEWAY_SECONDS,
} from "../../lib/tokens";

const publicUserSelect = {
    id: true,
    email: true,
    name: true,
    createdAt: true,
} as const;

type PublicUserRow = Prisma.UserGetPayload<{ select: typeof publicUserSelect }>;

export const toPublicUser = (user: PublicUserRow): PublicUser => ({
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
});

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
        throw new AppError(
            401,
            "UNAUTHENTICATED",
            "User account no longer exists",
        );
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

export const endSession = async (refreshToken: string): Promise<void> => {
    const tokenHash = hashRefreshToken(refreshToken);
    const row = await prisma.refreshToken.findUnique({
        where: { tokenHash },
        select: { familyId: true },
    });

    if (row) {
        await prisma.refreshToken.deleteMany({
            where: { familyId: row.familyId },
        });
    }
};

export const endAllSessions = async (userId: string): Promise<void> => {
    await prisma.refreshToken.deleteMany({ where: { userId } });
};

// Revoked rows are kept until they expire because reuse detection needs them.
export const deleteExpiredRefreshTokens = async (): Promise<number> => {
    const { count } = await prisma.refreshToken.deleteMany({
        where: { expiresAt: { lt: new Date() } },
    });
    return count;
};

export const rotateSession = async (refreshToken: string): Promise<Session> => {
    const tokenHash = hashRefreshToken(refreshToken);
    const now = new Date();

    const row = await prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!row || row.expiresAt <= now) {
        throw new AppError(
            401,
            "UNAUTHENTICATED",
            "Refresh token is invalid or expired",
        );
    }

    if (row.revokedAt !== null) {
        const activeCount = await prisma.refreshToken.count({
            where: {
                familyId: row.familyId,
                revokedAt: null,
                expiresAt: { gt: now },
            },
        });

        if (activeCount === 0) {
            throw new AppError(401, "UNAUTHENTICATED", "Session has ended");
        }

        const revokedAgeMs = now.getTime() - row.revokedAt.getTime();

        if (revokedAgeMs < REFRESH_REUSE_LEEWAY_SECONDS * 1000) {
            throw new AppError(
                409,
                "REFRESH_CONFLICT",
                "Refresh token already used",
            );
        }

        // Revoke the entire family outside a transaction so the write always commits.
        await prisma.refreshToken.updateMany({
            where: { familyId: row.familyId, revokedAt: null },
            data: { revokedAt: now },
        });
        console.warn("Refresh token reuse detected", {
            userId: row.userId,
            familyId: row.familyId,
        });
        throw new AppError(
            401,
            "UNAUTHENTICATED",
            "Refresh token reuse detected",
        );
    }

    return prisma.$transaction(async (tx) => {
        const { count } = await tx.refreshToken.updateMany({
            where: { id: row.id, revokedAt: null },
            data: { revokedAt: now },
        });

        if (count !== 1) {
            throw new AppError(
                409,
                "REFRESH_CONFLICT",
                "Refresh token already used",
            );
        }

        return issueSession(tx, row.userId, row.familyId);
    });
};
