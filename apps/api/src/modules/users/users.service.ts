// outsource dependencies
import type { PublicUser } from "@authkit/shared";

// local dependencies
import { prisma } from "../../db/prisma";
import { AppError } from "../../lib/app-error";
import { Prisma } from "../../generated/prisma/client";

export const publicUserSelect = {
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

export const updateUser = async (
    userId: string,
    name: string | null,
): Promise<PublicUserRow> => {
    try {
        return await prisma.user.update({
            where: { id: userId },
            data: { name },
            select: publicUserSelect,
        });
    } catch (err) {
        if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2025"
        ) {
            throw new AppError(
                401,
                "UNAUTHENTICATED",
                "User account no longer exists",
            );
        }
        throw err;
    }
};

export const deleteUser = async (userId: string): Promise<void> => {
    await prisma.user.deleteMany({ where: { id: userId } });
};
