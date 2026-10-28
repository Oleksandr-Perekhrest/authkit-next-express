// outsource dependencies
import cors from "cors";
import helmet from "helmet";
import express from "express";
import cookieParser from "cookie-parser";

// local dependencies
import { env } from "./config/env";
import { notFound } from "./middleware/not-found";
import { authRouter } from "./modules/auth/auth.routes";
import { errorHandler } from "./middleware/error-handler";
import { usersRouter } from "./modules/users/users.routes";
import { healthRouter } from "./modules/health/health.routes";

export function createApp() {
    const app = express();

    if (env.TRUST_PROXY > 0) {
        app.set("trust proxy", env.TRUST_PROXY);
    }

    app.use(helmet());
    if (env.CORS_ORIGIN) {
        app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
    }
    app.use(express.json({ limit: "100kb" }));
    app.use(cookieParser());

    app.use("/health", healthRouter);

    app.use("/auth", authRouter);
    app.use("/users", usersRouter);

    app.use(notFound);
    app.use(errorHandler);

    return app;
}
