// outsource dependencies
import { randomUUID } from "node:crypto";
import type { LoginInput, RegisterInput } from "@authkit/shared";

// local dependencies
import { prisma } from "../../db/prisma";
import { AppError } from "../../lib/app-error";
import { hashPassword, verifyPassword } from "../../lib/password";
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
