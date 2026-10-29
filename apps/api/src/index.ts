// local dependencies
import { createApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./db/prisma";
import { startRefreshTokenCleanup } from "./jobs/cleanup-refresh-tokens";

const app = createApp();
const server = app.listen(env.PORT, "0.0.0.0", () => {
    console.log(`api listening on port ${env.PORT}`);
    startRefreshTokenCleanup();
});

let shuttingDown = false;

async function shutdown(signal: string) {
    if (shuttingDown) return;
    shuttingDown = true;

    console.log(`${signal} received, shutting down`);

    // Exit forcefully if clean shutdown stalls; unref keeps the timer from blocking the event loop
    const timer = setTimeout(() => {
        console.error("shutdown timed out, forcing exit");
        process.exit(1);
    }, 10_000);
    timer.unref();

    // Stop accepting new connections; Node 19+ also closes idle keep-alive sockets here
    server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
    });
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
