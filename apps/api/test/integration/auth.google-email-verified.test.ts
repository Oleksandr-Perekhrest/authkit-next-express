// outsource dependencies
import { Pool } from "pg";
import { it, expect, afterAll, describe, beforeEach } from "vitest";

// local dependencies
import { prisma } from "../../src/db/prisma";
import { closeDb, truncateAll } from "../helpers/db";
import { findOrCreateGoogleUser } from "../../src/modules/auth/auth.service";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

afterAll(async () => {
    await pool.end();
    await closeDb();
});

describe("findOrCreateGoogleUser — emailVerified", () => {
    beforeEach(async () => {
        await truncateAll();
    });

    const claims = {
        sub: "google-sub-123",
        email: "alice@example.com",
        name: "Alice",
    };

    it("sets emailVerified when creating a new Google user", async () => {
        const { user, created } = await findOrCreateGoogleUser(claims);

        expect(created).toBe(true);

        const { rows } = await pool.query<{ emailVerified: Date | null }>(
            'SELECT "emailVerified" FROM "User" WHERE id = $1',
            [user.id],
        );
        expect(rows[0]!.emailVerified).not.toBeNull();
    });

    it("does not overwrite emailVerified for a returning user who is already verified", async () => {
        const { user } = await findOrCreateGoogleUser(claims);

        // Set a fixed past date so any overwrite would produce a different value,
        // making the assertion unambiguous even if both sign-ins happen within 1 ms.
        const fixedDate = new Date("2020-01-01T00:00:00.000Z");
        await prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: fixedDate },
        });

        const { created } = await findOrCreateGoogleUser(claims);

        expect(created).toBe(false);

        const row = await prisma.user.findUniqueOrThrow({
            where: { id: user.id },
            select: { emailVerified: true },
        });
        expect(row.emailVerified?.toISOString()).toBe(
            "2020-01-01T00:00:00.000Z",
        );
    });

    it("sets emailVerified for a returning user whose field was null", async () => {
        await findOrCreateGoogleUser(claims);

        await pool.query(
            'UPDATE "User" SET "emailVerified" = NULL WHERE email = $1',
            [claims.email],
        );

        const { created } = await findOrCreateGoogleUser(claims);

        expect(created).toBe(false);

        const { rows } = await pool.query<{ emailVerified: Date | null }>(
            'SELECT "emailVerified" FROM "User" WHERE email = $1',
            [claims.email],
        );
        expect(rows[0]!.emailVerified).not.toBeNull();
    });
});
